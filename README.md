# Blade Battle - Web Game

A single-player web game where players control a character that collects colored blades, engages in strategic combat with NPC enemies, and uses color-based advantages to survive and dominate.

## Features

- **Real-time Movement**: Smooth character control using arrow keys or WASD
- **Blade Collection System**: Collect red, yellow, and blue blades to increase your power
- **Color-Based Combat**: Red blades are strongest, followed by yellow, then blue
- **Advanced NPC AI**: Enemies with strategic behavior patterns (chasing, fleeing, foraging)
- **Tactical Decision-Making**: Combat outcomes based on blade counts and color hierarchy
- **Polished UI**: Responsive design with clear visual feedback
- **Game State Management**: Restart functionality and consistent game state

## Game Mechanics

### Blade Collection
- Move your character over blades to collect them
- Each blade color is tracked separately in your inventory
- Red blades provide the most combat power
- Yellow blades provide moderate combat power  
- Blue blades provide basic combat power

### Combat System
- Combat is triggered when entities collide
- Combat power is calculated as: `(Red × 1.5) + (Yellow × 1.2) + (Blue × 1.0)`
- The attacker wins if their power exceeds the defender's power by 20% (threshold: 1.2)
- Defeated enemies drop all their collected blades

### NPC Behavior
NPCs demonstrate intelligent behavior with four states:
- **Chasing**: When NPC has significant combat advantage
- **Fleeing**: When NPC is at a disadvantage  
- **Foraging**: When NPC focuses on blade collection
- **Wandering**: When no immediate threats or opportunities exist

## Installation

### Prerequisites
- Modern web browser with JavaScript enabled
- Local web server for development (optional)

### Quick Start
1. Clone or download the project files
2. Open `index.html` in your web browser
3. Start playing immediately - no installation required!

### Development Setup
For local development, you can use a simple web server:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## Controls

- **Arrow Keys** or **WASD**: Move your character
- **Game automatically handles** all other interactions (combat, blade collection)

## Game Interface

### Main Game Screen
- **Canvas Area**: Central gameplay area (800×600 pixels)
- **Blade Counts**: Real-time display of collected blades (red/yellow/blue)
- **Enemy Counter**: Current number of active NPC enemies
- **Game Controls**: Instructions for movement and gameplay

### Game Over Screen
- Displayed when player is defeated
- Shows restart button to begin a new game

## Technical Architecture

### File Structure
```
├── index.html          # Main game entry point
├── css/
│   └── game.css        # Game styling and responsive design
├── js/
│   ├── game.js         # Core game loop and state management
│   ├── player.js       # Player character and movement system
│   ├── blade.js        # Blade entities and rendering
│   └── npc.js          # NPC AI and behavior patterns
└── uploads/
    └── blade.jpeg      # Visual reference (optional)
```

### Core Classes

#### PlayerCharacter (`js/player.js`)
- Handles player movement and input
- Manages blade inventory
- Provides combat power calculations

#### BladeBattleGame (`js/game.js`)
- Main game controller and loop manager
- Handles entity spawning and collision detection
- Manages game state and transitions

#### NPC (`js/npc.js`)
- Implements sophisticated AI with state machines
- Handles strategic decision-making
- Manages movement patterns and combat avoidance

#### Blade (`js/blade.js`)
- Renders blade entities with pulsing animations
- Handles blade-specific visual effects

## Game Configuration

The game includes configurable parameters in `js/game.js`:

```javascript
this.config = {
    worldWidth: 800,           // Game world width
    worldHeight: 600,          // Game world height
    bladeSpawnRate: 3000,      // Blade spawn interval (ms)
    npcSpawnRate: 10000,       // NPC spawn interval (ms)
    maxNPCs: 5,                // Maximum concurrent NPCs
    combatThreshold: 1.2,      // Combat advantage threshold
    colorAdvantage: {
        red: 1.5,              // Red blade multiplier
        yellow: 1.2,           // Yellow blade multiplier
        blue: 1.0              // Blue blade multiplier
    }
};
```

## Performance Considerations

- Uses `requestAnimationFrame` for smooth 60FPS rendering
- Implements object pooling for entity management
- Optimized collision detection with distance checks
- Efficient AI decision-making with timing intervals

## Browser Compatibility

- **Chrome 60+**: Full support
- **Firefox 55+**: Full support  
- **Safari 11+**: Full support
- **Edge 79+**: Full support

## Development Notes

### Code Style
- Vanilla JavaScript with ES6+ features
- Modular class-based architecture
- Consistent naming conventions
- Comprehensive code comments

### Testing Strategy

#### Manual Acceptance Criteria Validation Checklist

**AC-1: Character Movement System**
- [ ] **Positive Test**: Use arrow keys or WASD to move character - movement should be smooth
- [ ] **Positive Test**: Character should not move outside game boundaries (800×600 canvas)
- [ ] **Positive Test**: Movement speed should remain consistent when switching directions
- [ ] **Negative Test**: Character should not clip through boundaries or obstacles
- [ ] **Negative Test**: Input should not have noticeable lag (>100ms)

**AC-2: Blade Collection Mechanics**
- [ ] **Positive Test**: Move character over blades to collect them - blade count should increase
- [ ] **Positive Test**: Different blade colors (red/yellow/blue) should be tracked separately
- [ ] **Positive Test**: Collected blades should disappear from the game world
- [ ] **Negative Test**: Blades should not be collectible from a distance (requires proximity)
- [ ] **Negative Test**: Blade count should not decrease when collecting blades

**AC-3: Color-Based Combat System**
- [ ] **Positive Test**: Red blades should provide advantage over yellow and blue (red=1.5, yellow=1.2, blue=1.0)
- [ ] **Positive Test**: Combat outcomes should be deterministic based on blade quantities and colors
- [ ] **Positive Test**: Defeated enemies should drop their collected blades as collectible items
- [ ] **Negative Test**: Combat results should not be random - consistent with power calculations
- [ ] **Negative Test**: Color advantages should not be ignored in combat resolution

**AC-4: NPC Enemy Behavior**
- [ ] **Positive Test**: NPCs should move autonomously and collect blades
- [ ] **Positive Test**: NPCs should engage in combat when encountering player (chasing state)
- [ ] **Positive Test**: NPCs should avoid combat when outnumbered by player (fleeing state)
- [ ] **Positive Test**: NPCs should demonstrate strategic movement patterns (foraging, wandering)
- [ ] **Negative Test**: NPCs should not remain stationary or move randomly without purpose

**AC-5: Game State Management**
- [ ] **Positive Test**: Game should maintain consistent state during gameplay
- [ ] **Positive Test**: Player defeat should result in game over screen
- [ ] **Positive Test**: Blade counts should persist correctly during combat
- [ ] **Positive Test**: Game should be restartable after game over
- [ ] **Negative Test**: Game state should not become corrupted during combat

**AC-6: UI and Visual Presentation**
- [ ] **Positive Test**: Game should render smoothly at 30+ FPS (check FPS counter)
- [ ] **Positive Test**: Blade colors should be clearly distinguishable (red/yellow/blue)
- [ ] **Positive Test**: Character and NPC sprites should be visible and distinct
- [ ] **Positive Test**: Game interface should provide clear feedback on blade counts
- [ ] **Negative Test**: Performance should not drop below 20 FPS with 5+ entities

#### Performance Testing
- Monitor FPS counter during gameplay with multiple NPCs and blade drops
- Test with maximum entity counts (5 NPCs + 20+ blades)
- Verify object pooling reduces garbage collection during heavy drop events

#### Cross-Browser Compatibility
- Test in Chrome, Firefox, Safari, and Edge
- Verify consistent movement and rendering across browsers
- Check responsive design on different screen sizes

### Future Enhancements
Potential areas for future development:
- Additional blade types and effects
- Multi-level progression system
- Sound effects and music
- Mobile touch controls
- Leaderboard and scoring system

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## Acknowledgments

Built with vanilla JavaScript and HTML5 Canvas API for optimal performance and compatibility.