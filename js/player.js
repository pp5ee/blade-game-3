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
        const handleKey = (e, isDown) => {
            this.keys[e.key] = isDown;
        };

        const keydownHandler = (e) => handleKey(e, true);
        const keyupHandler = (e) => handleKey(e, false);

        document.addEventListener('keydown', keydownHandler);
        document.addEventListener('keyup', keyupHandler);

        this.eventListeners.push(
            { type: 'keydown', handler: keydownHandler },
            { type: 'keyup', handler: keyupHandler }
        );
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
        this.vx = this.vy = 0;

        const keyMap = {
            'ArrowUp': () => this.vy = -this.speed,
            'w': () => this.vy = -this.speed,
            'ArrowDown': () => this.vy = this.speed,
            's': () => this.vy = this.speed,
            'ArrowLeft': () => this.vx = -this.speed,
            'a': () => this.vx = -this.speed,
            'ArrowRight': () => this.vx = this.speed,
            'd': () => this.vx = this.speed
        };

        for (const key in keyMap) {
            if (this.keys[key]) keyMap[key]();
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
        if (this.vx === 0 && this.vy === 0) return;

        const angle = Math.atan2(this.vy, this.vx);
        const length = this.radius * 0.8;

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + Math.cos(angle) * length, this.y + Math.sin(angle) * length);
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