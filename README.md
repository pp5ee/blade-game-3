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
- Manual testing against acceptance criteria
- Performance testing with multiple entities
- Cross-browser compatibility testing
- Responsive design validation

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