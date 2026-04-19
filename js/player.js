class PlayerCharacter {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;

        // Movement properties
        this.speed = 5;
        this.vx = 0;
        this.vy = 0;

        // Blade inventory
        this.blades = {
            red: 0,
            yellow: 0,
            blue: 0
        };

        // Input handling
        this.keys = {};
        this.eventListeners = [];
        this.setupControls();
    }

    setupControls() {
        const keydownHandler = (e) => {
            this.keys[e.key] = true;
        };

        const keyupHandler = (e) => {
            this.keys[e.key] = false;
        };

        document.addEventListener('keydown', keydownHandler);
        document.addEventListener('keyup', keyupHandler);

        // Store references for cleanup
        this.eventListeners.push({ type: 'keydown', handler: keydownHandler });
        this.eventListeners.push({ type: 'keyup', handler: keyupHandler });
    }

    dispose() {
        // Remove all event listeners
        this.eventListeners.forEach(({ type, handler }) => {
            document.removeEventListener(type, handler);
        });
        this.eventListeners = [];
    }

    update(deltaTime, worldWidth, worldHeight) {
        this.handleInput();
        this.applyMovement(deltaTime);
        this.constrainToWorld(worldWidth, worldHeight);
    }

    handleInput() {
        // Reset velocity
        this.vx = 0;
        this.vy = 0;

        // Arrow key controls
        if (this.keys['ArrowUp'] || this.keys['w']) {
            this.vy = -this.speed;
        }
        if (this.keys['ArrowDown'] || this.keys['s']) {
            this.vy = this.speed;
        }
        if (this.keys['ArrowLeft'] || this.keys['a']) {
            this.vx = -this.speed;
        }
        if (this.keys['ArrowRight'] || this.keys['d']) {
            this.vx = this.speed;
        }

        // Normalize diagonal movement
        if (this.vx !== 0 && this.vy !== 0) {
            this.vx *= 0.707; // 1/sqrt(2)
            this.vy *= 0.707;
        }
    }

    applyMovement(deltaTime) {
        // Convert deltaTime from milliseconds to seconds for consistent movement
        const timeFactor = deltaTime / 16.67; // Normalize to 60fps

        this.x += this.vx * timeFactor;
        this.y += this.vy * timeFactor;
    }

    constrainToWorld(worldWidth, worldHeight) {
        // Keep player within game boundaries
        this.x = Math.max(this.radius, Math.min(worldWidth - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(worldHeight - this.radius, this.y));
    }

    collectBlade(color) {
        if (this.blades.hasOwnProperty(color)) {
            this.blades[color]++;
        }
    }

    collectBlades(bladeCounts) {
        for (const color in bladeCounts) {
            if (this.blades.hasOwnProperty(color)) {
                this.blades[color] += bladeCounts[color];
            }
        }
    }

    render(ctx) {
        // Draw player character
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw player outline
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw direction indicator
        this.drawDirectionIndicator(ctx);
    }

    drawDirectionIndicator(ctx) {
        // Only draw direction indicator when moving
        if (this.vx === 0 && this.vy === 0) {
            return;
        }

        // Calculate direction based on velocity
        const angle = Math.atan2(this.vy, this.vx);
        const indicatorLength = this.radius * 0.8;

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(
            this.x + Math.cos(angle) * indicatorLength,
            this.y + Math.sin(angle) * indicatorLength
        );
        ctx.stroke();
    }

    getTotalBlades() {
        return this.blades.red + this.blades.yellow + this.blades.blue;
    }

    getCombatPower(colorAdvantage) {
        return this.blades.red * colorAdvantage.red +
               this.blades.yellow * colorAdvantage.yellow +
               this.blades.blue * colorAdvantage.blue;
    }
}