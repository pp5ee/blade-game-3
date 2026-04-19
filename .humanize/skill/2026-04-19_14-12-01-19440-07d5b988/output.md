**Key Gaps Noticed**
- `js/npc.js:21` only compares total blades, ignoring color advantage.
- `js/npc.js:6` NPCs have no awareness of blades or other NPCs; they only react to the player.
- `js/npc.js:58` uses simple state flip with no hysteresis, causing potential thrashing near thresholds.
- `js/npc.js:86` movement snaps to new directions with no prediction, smoothing, or edge avoidance.
- `js/game.js:138` does not pass `blades` or config to NPCs, so they can’t prioritize collections.

**Recommendations**

1) **Strategic Decision-Making**
- Use combat power, not counts. Replace total blade comparisons with weighted combat power using `colorAdvantage` (game config). Example: compute `npcPower = this.getCombatPower(colorAdvantage)` and compare to player’s.
- Add a small FSM with hysteresis and a cooldown:
  - States: `foraging` (seek blades), `chasing` (significant advantage), `skirmishing` (slight edge), `fleeing` (disadvantage), `wandering` (no clear target).
  - Enter/exit thresholds with margins (e.g., advantage enter at 1.4×, exit at 1.2×) to avoid flapping.
  - Short “reconsider” cooldown (e.g., 500–750ms) separate from the main decision interval.
- Expectation-based decisions:
  - Compute “time-to-contact” with player (relative speed and distance) and adjust behavior when a losing fight is imminent even if far.
  - Consider expected blade gain: prefer contests you can win quickly over chasing far-away player.
- Prioritize goals by score:
  - Blade score (value × proximity × safety), Chase score (advantage × proximity), Flee urgency (inverse advantage × proximity).
  - Pick the highest scoring goal each decision tick.

2) **Movement Patterns**
- Steering behaviors with smoothing:
  - Maintain `desiredVx/Vy` and apply acceleration towards it: `vx += (desiredVx - vx) * accelFactor`.
  - Clamp turn rate to reduce jitter; limit change in heading per update.
- Predictive pursuit and evasion:
  - Pursuit: aim at `playerPos + playerVel * leadTime` (leadTime ~ distance / (speed*2)).
  - Evasion: flee from predicted position instead of current.
- Circling/skirmish movement:
  - When advantage is slight (skirmishing), approach and then circle around the player (tangential velocity) to maintain favorable distance while probing for openings.
- Smoother wandering:
  - Replace hard random direction changes with noise-based drift (Perlin or simple jitter) for more natural wandering.
- Edge-aware avoidance:
  - When fleeing near boundaries, bias motion along the wall to avoid getting trapped.

3) **Combat Avoidance Logic**
- Danger assessment with prediction:
  - If `timeToContact < T` and `advantage < threshold`, switch to flee preemptively.
- Safe-distance maintenance:
  - In `fleeing`, keep a standoff radius; once beyond it, transition to `foraging` instead of re-engaging immediately.
- Cooldowns and memory:
  - Post-escape cooldown before re-evaluating combat to prevent oscillation.
- Boundary-aware escape:
  - If fleeing vector points outside bounds, project along the wall tangential direction with a small perpendicular component away from player.

4) **Blade Collection Prioritization**
- Pass blades to NPCs to “forage” intelligently.
  - Update `js/game.js:138` to call `npc.update(delta, player, blades, config, worldW, worldH)`.
- Scoring function (run every 300–500ms, not every frame):
  - Value: weight red > yellow > blue (use the same `colorAdvantage` weights).
  - Proximity: inverse of distance with a cap.
  - Safety: discount if player can arrive sooner (compare `Tnpc` vs `Tplayer`; penalize if `Tplayer < Tnpc - margin`).
  - Cluster bonus: add small bonus for nearby blades within a small radius.
  - Choose top-K nearest blades first to limit cost (e.g., K=5–8).
- If holding very few blades, favor safe, close blades; if strong, contest high-value blades even if closer to player.

5) **Pathfinding Considerations**
- Current map has no obstacles; keep it cheap:
  - Use steering + target-seeking; no global pathfinding needed for now.
- Prepare for obstacles without killing performance:
  - Introduce a coarse uniform grid (e.g., 20×15) as a nav mesh.
  - Run A* rarely (on major target change) to compute a waypoint list; follow with steering (“arrive” at waypoints).
  - Share the grid across NPCs and re-use paths when targets are similar.
  - For local avoidance, add simple separation/repulsion from nearby NPCs and walls—O(N) within a small radius, not global.

**Targeted Code Adjustments**

- Use combat power in decisions
  - `js/npc.js:61` and `js/npc.js:113` currently rely on `getTotalBlades()`. Replace with `getCombatPower(colorAdvantage)`, and pass `colorAdvantage` into `NPC.update(...)`.

- Pass world context into NPCs
  - `js/game.js:138`: change to `npc.update(this.deltaTime, this.player, this.blades, this.config, this.config.worldWidth, this.config.worldHeight)`.
  - Update `NPC.update` signature accordingly and store `this.colorAdvantage` from `config`.

- Add goal selection and hysteresis
  - Add `this.nextReconsiderTime`, `this.stateEnterThresholds`, `this.stateExitThresholds`.
  - Implement `selectGoal(player, blades)` that returns `{type: 'chase'|'flee'|'forage'|'wander', target}` using the scoring rules above.
  - Only allow state changes when past `nextReconsiderTime` and when the appropriate margin thresholds are met.

- Blade targeting
  - Add `findBestBlade(blades, player)` performing:
    - Early exit if `blades.length === 0`.
    - Evaluate up to K nearest blades by squared distance.
    - Score using `valueWeight[color] / (1 + d) * safetyFactor * (1 + clusterBonus)`.
    - Cache chosen target for a short period; re-evaluate every 300–500ms.

- Steering and predictive movement
  - Replace direct `vx/vy` set in `chaseTarget` and `fleeFromTarget` with:
    - Compute desired direction to predicted player position or blade.
    - `desiredV = dir * maxSpeed` then lerp/acccelerate towards it.
  - In `wander`, replace direction jumps with small angle noise per tick.

- Performance safeguards
  - Keep heavy decisions (blade scan/path updates) at throttled intervals.
  - Use squared distances where possible; only normalize vectors once per behavior step.
  - Limit per-NPC blade evaluations to top K nearest.
  - Reuse temporary arrays/objects to reduce GC pressure.

**Example Scoring Snippets (pseudocode)**
- Advantage ratio:
  - `adv = npcPower / (playerPower + 1e-3)`
- Time to target:
  - `Tnpc = dist(npc, blade) / (npcSpeed + 1e-3)`
  - `Tplayer = dist(player, blade) / (playerSpeed + 1e-3)`
- Blade score:
  - `value = colorAdvantage[color]`
  - `proximity = 1 / (1 + dist)`
  - `safety = clamp((Tnpc - Tplayer + margin) / margin, 0, 1)` or `safety = (Tnpc < Tplayer - margin) ? 1 : 0.2`
  - `cluster = 1 + min(numNearbyBlades * 0.1, 0.3)`
  - `score = value * proximity * safety * cluster`

**Minimal, High-Impact Changes First**
- Replace total blade comparisons with combat power and add hysteresis thresholds.
- Pass `blades` and `config` into `NPC.update` and implement a simple blade target selection with throttling.
- Add predictive pursuit/evasion and velocity smoothing.
- Add edge-aware fleeing and standoff distance.

If you want, I can implement the minimal set above: switch to combat power, pass blades/config, add a simple `foraging` state with top-K blade targeting, and introduce velocity smoothing and predictive chase/flee—kept lightweight and performant.
