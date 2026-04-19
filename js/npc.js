class NPC {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;

        // Movement properties
        this.speed = 3;
        this.vx = 0;
        this.vy = 0;

        // Blade inventory
        this.blades = {
            red: 0,
            yellow: 0,
            blue: 0
        };

        // AI behavior
        this.target = null;
        this.state = 'wandering'; // wandering, chasing, fleeing
        this.lastDecisionTime = 0;
        this.decisionInterval = 1000; // Make decisions every second

        // Movement pattern
        this.wanderDirection = Math.random() * Math.PI * 2;
        this.wanderChangeTime = 0;
        this.wanderChangeInterval = 2000; // Change direction every 2 seconds
    }

    update(deltaTime, player, worldWidth, worldHeight) {
        this.makeDecision(player);
        this.executeBehavior(deltaTime, player);
        this.applyMovement(deltaTime);
        this.constrainToWorld(worldWidth, worldHeight);
    }

    makeDecision(player) {
        const currentTime = Date.now();

        // Only make decisions at intervals
        if (currentTime - this.lastDecisionTime < this.decisionInterval) {
            return;
        }

        this.lastDecisionTime = currentTime;

        // Calculate distance to player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Calculate combat power comparison
        const playerPower = player.getTotalBlades();
        const npcPower = this.getTotalBlades();

        // Decision logic
        if (distance < 150) { // Close to player
            if (npcPower > playerPower * 1.5) {
                // NPC has significant advantage - chase player
                this.state = 'chasing';
                this.target = player;
            } else if (playerPower > npcPower * 1.2) {
                // Player has advantage - flee
                this.state = 'fleeing';
                this.target = player;
            } else {
                // Similar power - wander
                this.state = 'wandering';
                this.target = null;
            }
        } else {
            // Far from player - wander
            this.state = 'wandering';
            this.target = null;
        }
    }

    executeBehavior(deltaTime, player) {
        const currentTime = Date.now();

        switch (this.state) {
            case 'chasing':
                this.chaseTarget(player);
                break;
            case 'fleeing':
                this.fleeFromTarget(player);
                break;
            case 'wandering':
                this.wander(deltaTime, currentTime);
                break;
        }
    }

    chaseTarget(target) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            this.vx = (dx / distance) * this.speed;
            this.vy = (dy / distance) * this.speed;
        }
    }

    fleeFromTarget(target) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            this.vx = (-dx / distance) * this.speed;
            this.vy = (-dy / distance) * this.speed;
        }
    }

    wander(deltaTime, currentTime) {
        // Change wander direction periodically
        if (currentTime - this.wanderChangeTime > this.wanderChangeInterval) {
            this.wanderDirection = Math.random() * Math.PI * 2;
            this.wanderChangeTime = currentTime;
        }

        this.vx = Math.cos(this.wanderDirection) * this.speed * 0.5;
        this.vy = Math.sin(this.wanderDirection) * this.speed * 0.5;
    }

    applyMovement(deltaTime) {
        // Convert deltaTime from milliseconds to seconds for consistent movement
        const timeFactor = deltaTime / 16.67; // Normalize to 60fps

        this.x += this.vx * timeFactor;
        this.y += this.vy * timeFactor;
    }

    constrainToWorld(worldWidth, worldHeight) {
        // Keep NPC within game boundaries
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
        // Draw NPC character
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw NPC outline based on state
        switch (this.state) {
            case 'chasing':
                ctx.strokeStyle = '#e94560'; // Red for aggressive
                break;
            case 'fleeing':
                ctx.strokeStyle = '#70d6ff'; // Blue for fleeing
                break;
            default:
                ctx.strokeStyle = '#6c757d'; // Gray for neutral
        }

        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw state indicator
        this.drawStateIndicator(ctx);
    }

    drawStateIndicator(ctx) {
        // Draw small indicator above NPC
        const indicatorSize = 4;

        switch (this.state) {
            case 'chasing':
                ctx.fillStyle = '#e94560';
                ctx.fillRect(this.x - indicatorSize, this.y - this.radius - 8, indicatorSize * 2, indicatorSize);
                break;
            case 'fleeing':
                ctx.fillStyle = '#70d6ff';
                ctx.beginPath();
                ctx.moveTo(this.x, this.y - this.radius - 8);
                ctx.lineTo(this.x - indicatorSize, this.y - this.radius - 8 + indicatorSize * 2);
                ctx.lineTo(this.x + indicatorSize, this.y - this.radius - 8 + indicatorSize * 2);
                ctx.closePath();
                ctx.fill();
                break;
        }
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