# Blade Battle Web Game Implementation Plan

## Goal Description
Create a single-player web game where players control a character that collects colored blades (red, yellow, blue), engages in strategic combat with NPC enemies, and uses color-based advantages to survive and dominate. The game features real-time movement, blade collection mechanics, and tactical decision-making based on blade counts and color hierarchy.

## Acceptance Criteria

Following TDD philosophy, each criterion includes positive and negative tests for deterministic verification.

- AC-1: Character movement system
  - Positive Tests (expected to PASS):
    - Player character responds to arrow key inputs with smooth movement
    - Character moves within defined game boundaries without clipping
    - Movement speed remains consistent across different browser environments
  - Negative Tests (expected to FAIL):
    - Character moves through solid obstacles or game boundaries
    - Input lag exceeds 100ms on modern browsers
    - Movement becomes erratic when multiple keys are pressed simultaneously

- AC-2: Blade collection mechanics
  - Positive Tests (expected to PASS):
    - Character collects blades by moving over them
    - Blade count increases correctly for each collected blade
    - Collected blades are removed from the game world
    - Different blade colors are tracked separately in inventory
  - Negative Tests (expected to FAIL):
    - Blades can be collected from any distance without proximity
    - Blade count decreases when collecting blades
    - Blades remain visible after collection

- AC-3: Color-based combat system
  - Positive Tests (expected to PASS):
    - Red blades provide combat advantage over yellow and blue blades
    - Combat calculations use blade count and color hierarchy
    - Defeated enemies drop their collected blades
    - Combat outcomes are deterministic based on blade quantities and colors
  - Negative Tests (expected to FAIL):
    - Combat results are random rather than calculated
    - Color advantages are ignored in combat resolution
    - Defeated enemies retain their blades

- AC-4: NPC enemy behavior
  - Positive Tests (expected to PASS):
    - NPCs move autonomously and collect blades
    - NPCs engage in combat when encountering the player
    - NPCs avoid combat when outnumbered by player
    - NPCs demonstrate strategic movement patterns
  - Negative Tests (expected to FAIL):
    - NPCs remain stationary or move randomly without purpose
    - NPCs engage in combat regardless of blade count disadvantage
    - NPCs ignore blade collection opportunities

- AC-5: Game state management
  - Positive Tests (expected to PASS):
    - Game maintains consistent state during gameplay
    - Player defeat results in game over screen
    - Blade counts persist correctly during combat
    - Game can be restarted after game over
  - Negative Tests (expected to FAIL):
    - Game state becomes corrupted during combat
    - Blade counts reset unexpectedly
    - Game over condition fails to trigger

- AC-6: UI and visual presentation
  - Positive Tests (expected to PASS):
    - Game renders smoothly at 30+ FPS
    - Blade colors are clearly distinguishable
    - Character and NPC sprites are visible and distinct
    - Game interface provides clear feedback on blade counts
  - Negative Tests (expected to FAIL):
    - Visual elements overlap or obscure gameplay
    - Performance drops below 20 FPS with 5+ entities
    - Color differentiation is unclear

## Path Boundaries

Path boundaries define the acceptable range of implementation quality and choices.

### Upper Bound (Maximum Acceptable Scope)
The implementation includes a complete blade battle game with polished visuals, smooth 60 FPS performance, advanced NPC AI with pathfinding, multiple game levels with progressive difficulty, comprehensive sound effects and animations, responsive touch controls for mobile devices, and a sophisticated color-based combat system with visual feedback for all interactions.

### Lower Bound (Minimum Acceptable Scope)
The implementation includes functional character movement, basic blade collection mechanics, a working combat system with color hierarchy (red > yellow > blue), simple NPC movement toward the player, blade drop mechanics from defeated enemies, and a basic game over condition. The game runs at 30+ FPS with clear visual differentiation between game elements.

### Allowed Choices
- Can use: Vanilla JavaScript with Canvas API, HTML5 game development patterns, modular architecture with separate game logic and rendering layers, requestAnimationFrame for game loop, object pooling for performance optimization
- Cannot use: External game engines (Phaser, PixiJS), server-side components, WebGL for rendering (Canvas 2D only), third-party physics libraries

> **Note on Deterministic Designs**: The draft specifies a deterministic color hierarchy where red blades are most powerful, with combat calculations based on blade counts and color advantages. This fixed design requires specific implementation choices to maintain game balance and consistency.

## Feasibility Hints and Suggestions

> **Note**: This section is for reference and understanding only. These are conceptual suggestions, not prescriptive requirements.

### Conceptual Approach
```javascript
// Core game architecture pseudocode
class BladeBattleGame {
  constructor() {
    this.player = new PlayerCharacter();
    this.npcs = [];
    this.blades = [];
    this.gameState = 'playing';
  }
  
  gameLoop() {
    // Update game state
    this.updatePlayerMovement();
    this.updateNPCBehavior();
    this.checkCollisions();
    
    // Render frame
    this.renderGameWorld();
    
    // Continue loop
    requestAnimationFrame(() => this.gameLoop());
  }
  
  combatResolution(attacker, defender) {
    // Color hierarchy: Red > Yellow > Blue
    const colorAdvantage = this.calculateColorAdvantage(attacker, defender);
    const bladeCountRatio = attacker.bladeCount / defender.bladeCount;
    
    // Combat formula: advantage + count ratio determines outcome
    return colorAdvantage * bladeCountRatio > COMBAT_THRESHOLD;
  }
}
```

### Relevant References
- `index.html` - Main game entry point with canvas setup
- `js/game.js` - Core game loop and state management
- `js/player.js` - Player character movement and controls
- `js/npc.js` - NPC AI and behavior patterns
- `js/blade.js` - Blade collection and combat mechanics
- `css/game.css` - Visual styling and layout
- `assets/` - Sprite images and visual references

## Dependencies and Sequence

### Milestones
1. **Milestone 1: Core Game Foundation**
   - Phase A: Basic HTML structure and canvas setup
   - Phase B: Player character movement system
   - Phase C: Blade spawning and collection mechanics

2. **Milestone 2: Combat System Implementation**
   - Step 1: Color hierarchy and combat calculations
   - Step 2: NPC enemy spawning and basic AI
   - Step 3: Combat resolution and blade drop mechanics

3. **Milestone 3: Game Polish and Completion**
   - Step 1: UI styling and visual feedback
   - Step 2: Game state management and win/lose conditions
   - Step 3: Performance optimization and testing

**Dependency Chain:**
- Player movement (M1-B) depends on canvas setup (M1-A)
- Combat system (M2) depends on blade collection (M1-C)
- Game polish (M3) depends on functional combat (M2)
- NPC AI (M2-B) depends on player movement system (M1-B)

## Task Breakdown

Each task must include exactly one routing tag:
- `coding`: implemented by Claude
- `analyze`: executed via Codex (`/humanize:ask-codex`)

| Task ID | Description | Target AC | Tag (`coding`/`analyze`) | Depends On |
|---------|-------------|-----------|----------------------------|------------|
| task1 | Create basic HTML structure and canvas setup | AC-6 | coding | - |
| task2 | Implement player character movement system | AC-1 | coding | task1 |
| task3 | Design and implement blade spawning mechanics | AC-2 | coding | task1 |
| task4 | Create blade collection and inventory system | AC-2 | coding | task2, task3 |
| task5 | Implement color hierarchy and combat calculations | AC-3 | coding | task4 |
| task6 | Design NPC enemy AI and movement patterns | AC-4 | analyze | task2 |
| task7 | Implement NPC spawning and behavior system | AC-4 | coding | task5, task6 |
| task8 | Create combat resolution and blade drop mechanics | AC-3 | coding | task5, task7 |
| task9 | Develop game state management and win/lose conditions | AC-5 | coding | task8 |
| task10 | Implement UI styling and visual feedback system | AC-6 | coding | task9 |
| task11 | Create README documentation and project structure | - | coding | task10 |
| task12 | Performance optimization and final testing | AC-6 | coding | task11 |

## Claude-Codex Deliberation

### Agreements
- Game should use vanilla JavaScript with Canvas API for maximum control and lightweight implementation
- Color hierarchy should follow linear power scale: Red > Yellow > Blue
- Combat system should be deterministic based on blade counts and color advantages
- NPC AI should include basic strategic decision-making for combat avoidance

### Resolved Disagreements
- **Framework choice**: Codex suggested considering game engines like Phaser, but Claude argued for vanilla JS given the project's learning focus and simplicity requirements. Resolution: Use vanilla JavaScript with Canvas.
- **Movement style**: Codex proposed grid-based movement for simplicity, but Claude advocated for free movement to match the real-time action feel described in the draft. Resolution: Implement free movement with collision detection.

### Convergence Status
- Final Status: `converged`

## Pending User Decisions

- DEC-1: Combat formula complexity
  - Claude Position: Simple linear formula (color advantage × blade count ratio > threshold)
  - Codex Position: More sophisticated formula with additional factors (distance, movement speed)
  - Tradeoff Summary: Simple formula is easier to implement and balance; complex formula provides more strategic depth but increases development complexity
  - Decision Status: `PENDING`

- DEC-2: Game progression and win conditions
  - Claude Position: Single survival mode with increasing difficulty waves
  - Codex Position: Multiple levels with specific objectives and boss encounters
  - Tradeoff Summary: Survival mode is simpler to implement; level-based progression provides more structured gameplay but requires more content creation
  - Decision Status: `PENDING`

## Implementation Notes

### Code Style Requirements
- Implementation code and comments must NOT contain plan-specific terminology such as "AC-", "Milestone", "Step", "Phase", or similar workflow markers
- These terms are for plan documentation only, not for the resulting codebase
- Use descriptive, domain-appropriate naming in code instead
- Follow JavaScript best practices with proper variable naming, function organization, and code comments

### Technical Decisions Made
- **Color Hierarchy**: Red > Yellow > Blue (linear power scale)
- **Combat Formula**: Color advantage multiplier × blade count ratio > combat threshold
- **Movement System**: Free movement with collision detection using Canvas API
- **NPC Behavior**: Basic AI with movement toward player and combat avoidance when outnumbered
- **Performance Target**: 30+ FPS with 5+ NPCs on modern browsers
- **Asset Approach**: Simple geometric shapes for blades and characters (can be enhanced later with sprites)

### Default Values for Unspecified Details
- **Combat Threshold**: 1.2 (20% advantage required to win combat)
- **Blade Spawn Rate**: 1 blade every 3 seconds
- **NPC Spawn Rate**: 1 NPC every 10 seconds
- **Game World Size**: 800×600 pixels
- **Movement Speed**: 5 pixels per frame (at 60 FPS)
- **Color Advantage Multipliers**: Red=1.5, Yellow=1.2, Blue=1.0

## Output File Convention

This template is used to produce the main output file (e.g., `plan.md`).

### Translated Language Variant

When `alternative_plan_language` resolves to a supported language name through merged config loading, a translated variant of the output file is also written after the main file. Humanize loads config from merged layers in this order: default config, optional user config, then optional project config; `alternative_plan_language` may be set at any of those layers. The variant filename is constructed by inserting `_<code>` (the ISO 639-1 code from the built-in mapping table) immediately before the file extension:

- `plan.md` becomes `plan_<code>.md` (e.g. `plan_zh.md` for Chinese, `plan_ko.md` for Korean)
- `docs/my-plan.md` becomes `docs/my-plan_<code>.md`
- `output` (no extension) becomes `output_<code>`

The translated variant file contains a full translation of the main plan file's current content in the configured language. All identifiers (`AC-*`, task IDs, file paths, API names, command flags) remain unchanged, as they are language-neutral.

When `alternative_plan_language` is empty, absent, set to `"English"`, or set to an unsupported language, no translated variant is written. Humanize does not auto-create `.humanize/config.json` when no project config file is present.

--- Original Design Draft Start ---

# Requirement

我想做一个转刀刀网页游戏，人物可以移动捡刀，然后捡到就变多，可以相互击杀，击杀后掉落对应数量的刀，这个刀也可以被捡起来，取决于刀刀数量也可以自由移动，避免交战，这个是单机页面游戏，其他的都是npc，刀分为3种红黄蓝，拼杀需要拼数量和颜色（不同等级的话有个计算公式扣除刀），红色最厉害，UI风格参考 图片 @blade.jpeg(uploads/blade.jpeg)

**AI Understanding:**
I can see you're planning a blade battle web game with some interesting mechanics! Based on your description, here's what I understand:
**Game Concept Summary:**
- Single-player web game where you control a character that collects blades
- Three blade types: Red (most powerful), Yellow, Blue with a color-based combat system
- Character movement to collect blades, which increases your blade count
- NPC enemies that can be defeated in combat
- Defeated enemies drop their blades, which can be collected
- Strategic movement to avoid combat when outnumbered
- Color-based combat formula where different blade types have advantage/disadvantage relationships
**Key Mechanics:**
- Blade collection and combat system
- Color hierarchy (Red > ? > ? - need to clarify the order)
- Combat calculation based on blade count and color advantage
- Movement and avoidance mechanics
**Technical Requirements:**
- Single-page web game (HTML/CSS/JavaScript)
- NPC AI for enemy behavior
- Real-time movement and combat
**One clarifying question:** Could you specify the exact color hierarchy and combat formula? For example, is it Red > Blue > Yellow > Red (rock-paper-scissors style), or is Red simply the strongest with the others being equal?
Once you confirm these details, I'll be ready to help you create the implementation plan. Type "start" or "proceed" when you're ready to begin development!

---

## Implementation Notes

- For any unspecified details (combat formulas, game balance, UI layout, tech choices, etc.), make reasonable decisions yourself and document them in the plan. Do NOT ask the user for clarification — proceed with sensible defaults.
- If referenced image files exist in the workspace, treat them as visual style references.

## Standard Deliverables (mandatory for every project)

- **README.md** — must be included at the project root with: project title & description, prerequisites, installation steps, usage examples with code snippets, configuration options, and project structure overview.
- **Git commits** — use conventional commit prefix `feat:` for all commits.

--- Original Design Draft End ---
