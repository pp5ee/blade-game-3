class BladeBattleGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Game state
        this.gameState = 'playing';
        this.lastTime = 0;
        this.deltaTime = 0;

        // Game entities
        this.player = null;
        this.npcs = [];
        this.blades = [];

        // Game configuration
        this.config = {
            worldWidth: 800,
            worldHeight: 600,
            bladeSpawnRate: 3000, // 3 seconds
            npcSpawnRate: 10000,  // 10 seconds
            maxNPCs: 5,
            combatThreshold: 1.2,
            colorAdvantage: {
                red: 1.5,
                yellow: 1.2,
                blue: 1.0
            }
        };

        // Spawn timers
        this.lastBladeSpawn = 0;
        this.lastNPCSpawn = 0;

        this.init();
    }

    init() {
        // Initialize player
        this.player = new PlayerCharacter(
            this.config.worldWidth / 2,
            this.config.worldHeight / 2,
            20,
            '#e94560'
        );

        // Spawn initial blades
        this.spawnInitialBlades();

        // Start game loop
        this.gameLoop();

        // Set up spawn intervals
        this.setupSpawnTimers();

        // Set up UI updates
        this.setupUIUpdates();
    }

    spawnInitialBlades() {
        // Spawn 10 initial blades
        for (let i = 0; i < 10; i++) {
            this.spawnBlade();
        }
    }

    spawnBlade() {
        const colors = ['red', 'yellow', 'blue'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        const blade = new Blade(
            Math.random() * (this.config.worldWidth - 40) + 20,
            Math.random() * (this.config.worldHeight - 40) + 20,
            10,
            color
        );

        this.blades.push(blade);
    }

    spawnNPC() {
        if (this.npcs.length >= this.config.maxNPCs) return;

        const npc = new NPC(
            Math.random() * (this.config.worldWidth - 40) + 20,
            Math.random() * (this.config.worldHeight - 40) + 20,
            20,
            '#6c757d'
        );

        this.npcs.push(npc);
        this.updateUI();
    }

    setupSpawnTimers() {
        setInterval(() => {
            if (this.gameState === 'playing') {
                this.spawnBlade();
            }
        }, this.config.bladeSpawnRate);

        setInterval(() => {
            if (this.gameState === 'playing' && this.npcs.length < this.config.maxNPCs) {
                this.spawnNPC();
            }
        }, this.config.npcSpawnRate);
    }

    setupUIUpdates() {
        setInterval(() => {
            this.updateUI();
        }, 100);
    }

    updateUI() {
        document.getElementById('red-blades').textContent = this.player.blades.red;
        document.getElementById('yellow-blades').textContent = this.player.blades.yellow;
        document.getElementById('blue-blades').textContent = this.player.blades.blue;
        document.getElementById('enemy-count').textContent = this.npcs.length;
    }

    gameLoop(currentTime = 0) {
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        if (this.gameState === 'playing') {
            this.update();
            this.render();
        }

        requestAnimationFrame((time) => this.gameLoop(time));
    }

    update() {
        // Update blades (animations)
        for (const blade of this.blades) {
            blade.update(this.deltaTime);
        }

        // Update player
        this.player.update(this.deltaTime, this.config.worldWidth, this.config.worldHeight);

        // Update NPCs
        this.npcs.forEach((npc, index) => {
            npc.update(this.deltaTime, this.player, this.blades, this.config, this.config.worldWidth, this.config.worldHeight);

            // Check NPC-player collisions for combat
            if (this.checkCollision(this.player, npc)) {
                this.handleCombat(this.player, npc, index);
            }
        });

        // Check blade collection (safe iteration using reverse loop)
        for (let i = this.blades.length - 1; i >= 0; i--) {
            const blade = this.blades[i];
            let bladeCollected = false;

            // Check player-blade collision
            if (this.checkCollision(this.player, blade)) {
                this.player.collectBlade(blade.color);
                bladeCollected = true;
                this.updateUI();
            }

            // Check NPC-blade collision (only if blade not already collected by player)
            if (!bladeCollected) {
                for (const npc of this.npcs) {
                    if (this.checkCollision(npc, blade)) {
                        npc.collectBlade(blade.color);
                        bladeCollected = true;
                        break; // NPC can collect the blade
                    }
                }
            }

            // Remove collected blade
            if (bladeCollected) {
                this.blades.splice(i, 1);
            }
        }
    }

    checkCollision(entity1, entity2) {
        const dx = entity1.x - entity2.x;
        const dy = entity1.y - entity2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance < (entity1.radius + entity2.radius);
    }

    handleCombat(entityA, entityB, defenderIndex) {
        const powerA = this.calculateCombatPower(entityA);
        const powerB = this.calculateCombatPower(entityB);

        // Determine winner based on combat power
        if (powerA > powerB * this.config.combatThreshold) {
            // EntityA wins
            this.resolveCombatVictory(entityA, entityB, defenderIndex);
        } else if (powerB > powerA * this.config.combatThreshold) {
            // EntityB wins
            this.resolveCombatVictory(entityB, entityA, defenderIndex);
        }
        // If neither has significant advantage, no combat outcome
    }

    resolveCombatVictory(winner, loser, loserIndex) {
        // Drop loser's blades at their position
        this.dropBladesAt(loser.x, loser.y, loser.blades);

        if (loser === this.player) {
            // Player was defeated
            this.gameOver();
        } else {
            // NPC was defeated
            this.npcs.splice(loserIndex, 1);
            this.updateUI();
        }

        // Reset winner's blades if they were the player (for balance)
        if (winner === this.player) {
            // Player keeps their blades but doesn't get loser's blades directly
            // Blades are dropped and must be collected
        }
    }

    dropBladesAt(x, y, bladeCounts) {
        // Drop blades as individual collectible items
        for (const color in bladeCounts) {
            const count = bladeCounts[color];
            for (let i = 0; i < count; i++) {
                // Create a small spread around the drop position
                const spread = 30;
                const dropX = x + (Math.random() * spread - spread / 2);
                const dropY = y + (Math.random() * spread - spread / 2);

                const blade = new Blade(
                    dropX,
                    dropY,
                    8, // Smaller radius for dropped blades
                    color
                );
                this.blades.push(blade);
            }
        }
    }

    calculateCombatPower(entity) {
        const basePower = entity.blades.red * this.config.colorAdvantage.red +
                         entity.blades.yellow * this.config.colorAdvantage.yellow +
                         entity.blades.blue * this.config.colorAdvantage.blue;

        return basePower;
    }

    gameOver() {
        this.gameState = 'gameOver';
        document.getElementById('game-over').classList.remove('hidden');

        // Set up restart button
        document.getElementById('restart-btn').onclick = () => {
            this.restart();
        };
    }

    restart() {
        // Reset game state
        this.gameState = 'playing';
        this.npcs = [];
        this.blades = [];

        // Reinitialize player
        this.player = new PlayerCharacter(
            this.config.worldWidth / 2,
            this.config.worldHeight / 2,
            20,
            '#e94560'
        );

        // Spawn initial blades
        this.spawnInitialBlades();

        // Hide game over screen
        document.getElementById('game-over').classList.add('hidden');

        // Update UI
        this.updateUI();
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#0f3460';
        this.ctx.fillRect(0, 0, this.config.worldWidth, this.config.worldHeight);

        // Render blades
        this.blades.forEach(blade => {
            blade.render(this.ctx);
        });

        // Render NPCs
        this.npcs.forEach(npc => {
            npc.render(this.ctx);
        });

        // Render player
        this.player.render(this.ctx);

        // Render blade counts on entities
        this.renderEntityStats(this.player);
        this.npcs.forEach(npc => {
            this.renderEntityStats(npc);
        });
    }

    renderEntityStats(entity) {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';

        const totalBlades = entity.blades.red + entity.blades.yellow + entity.blades.blue;
        this.ctx.fillText(
            `${totalBlades}`,
            entity.x,
            entity.y - entity.radius - 10
        );
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new BladeBattleGame();
});