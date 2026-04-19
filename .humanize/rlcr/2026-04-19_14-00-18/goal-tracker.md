# Goal Tracker

<!--
This file tracks the ultimate goal, acceptance criteria, and plan evolution.
It prevents goal drift by maintaining a persistent anchor across all rounds.

RULES:
- IMMUTABLE SECTION: Do not modify after initialization
- MUTABLE SECTION: Update each round, but document all changes
- Every task must be in one of: Active, Completed, or Deferred
- Deferred items require explicit justification
-->

## IMMUTABLE SECTION
<!-- Do not modify after initialization -->

### Ultimate Goal
Create a single-player web game where players control a character that collects colored blades (red, yellow, blue), engages in strategic combat with NPC enemies, and uses color-based advantages to survive and dominate. The game features real-time movement, blade collection mechanics, and tactical decision-making based on blade counts and color hierarchy.

## Acceptance Criteria

### Acceptance Criteria
<!-- Each criterion must be independently verifiable -->

Following TDD philosophy, each criterion includes positive and negative tests for deterministic verification.

- **AC-1: Character movement system**
  - Positive Tests (expected to PASS):
    - Player character responds to arrow key inputs with smooth movement
    - Character moves within defined game boundaries without clipping
    - Movement speed remains consistent across different browser environments
  - Negative Tests (expected to FAIL):
    - Character moves through solid obstacles or game boundaries
    - Input lag exceeds 100ms on modern browsers
    - Movement becomes erratic when multiple keys are pressed simultaneously

- **AC-2: Blade collection mechanics**
  - Positive Tests (expected to PASS):
    - Character collects blades by moving over them
    - Blade count increases correctly for each collected blade
    - Collected blades are removed from the game world
    - Different blade colors are tracked separately in inventory
  - Negative Tests (expected to FAIL):
    - Blades can be collected from any distance without proximity
    - Blade count decreases when collecting blades
    - Blades remain visible after collection

- **AC-3: Color-based combat system**
  - Positive Tests (expected to PASS):
    - Red blades provide combat advantage over yellow and blue blades
    - Combat calculations use blade count and color hierarchy
    - Defeated enemies drop their collected blades
    - Combat outcomes are deterministic based on blade quantities and colors
  - Negative Tests (expected to FAIL):
    - Combat results are random rather than calculated
    - Color advantages are ignored in combat resolution
    - Defeated enemies retain their blades

- **AC-4: NPC enemy behavior**
  - Positive Tests (expected to PASS):
    - NPCs move autonomously and collect blades
    - NPCs engage in combat when encountering the player
    - NPCs avoid combat when outnumbered by player
    - NPCs demonstrate strategic movement patterns
  - Negative Tests (expected to FAIL):
    - NPCs remain stationary or move randomly without purpose
    - NPCs engage in combat regardless of blade count disadvantage
    - NPCs ignore blade collection opportunities

- **AC-5: Game state management**
  - Positive Tests (expected to PASS):
    - Game maintains consistent state during gameplay
    - Player defeat results in game over screen
    - Blade counts persist correctly during combat
    - Game can be restarted after game over
  - Negative Tests (expected to FAIL):
    - Game state becomes corrupted during combat
    - Blade counts reset unexpectedly
    - Game over condition fails to trigger

- **AC-6: UI and visual presentation**
  - Positive Tests (expected to PASS):
    - Game renders smoothly at 30+ FPS
    - Blade colors are clearly distinguishable
    - Character and NPC sprites are visible and distinct
    - Game interface provides clear feedback on blade counts
  - Negative Tests (expected to FAIL):
    - Visual elements overlap or obscure gameplay
    - Performance drops below 20 FPS with 5+ entities
    - Color differentiation is unclear

---

## MUTABLE SECTION
<!-- Update each round with justification for changes -->

### Plan Version: 1 (Updated: Round 0)

#### Plan Evolution Log
<!-- Document any changes to the plan with justification -->
| Round | Change | Reason | Impact on AC |
|-------|--------|--------|--------------|
| 0 | Initial plan | - | - |

#### Active Tasks
<!-- Map each task to its target Acceptance Criterion and routing tag -->
| Task | Target AC | Status | Tag | Owner | Notes |
|------|-----------|--------|-----|-------|-------|
| task1: Create basic HTML structure and canvas setup | AC-6 | pending | coding | claude | - |
| task2: Implement player character movement system | AC-1 | pending | coding | claude | - |
| task3: Design and implement blade spawning mechanics | AC-2 | pending | coding | claude | - |
| task4: Create blade collection and inventory system | AC-2 | pending | coding | claude | - |
| task5: Implement color hierarchy and combat calculations | AC-3 | pending | coding | claude | - |
| task6: Design NPC enemy AI and movement patterns | AC-4 | pending | analyze | codex | - |
| task7: Implement NPC spawning and behavior system | AC-4 | pending | coding | claude | - |
| task8: Create combat resolution and blade drop mechanics | AC-3 | pending | coding | claude | - |
| task9: Develop game state management and win/lose conditions | AC-5 | pending | coding | claude | - |
| task10: Implement UI styling and visual feedback system | AC-6 | pending | coding | claude | - |
| task11: Create README documentation and project structure | - | pending | coding | claude | - |
| task12: Performance optimization and final testing | AC-6 | pending | coding | claude | - |

### Completed and Verified
<!-- Only move tasks here after Codex verification -->
| AC | Task | Completed Round | Verified Round | Evidence |
|----|------|-----------------|----------------|----------|

### Explicitly Deferred
<!-- Items here require strong justification -->
| Task | Original AC | Deferred Since | Justification | When to Reconsider |
|------|-------------|----------------|---------------|-------------------|

### Open Issues
<!-- Issues discovered during implementation -->
| Issue | Discovered Round | Blocking AC | Resolution Path |
|-------|-----------------|-------------|-----------------|
