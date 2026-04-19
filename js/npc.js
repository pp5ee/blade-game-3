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
        this.desiredVx = 0;
        this.desiredVy = 0;
        this.acceleration = 0.2;

        // Blade inventory
        this.blades = {
            red: 0,
            yellow: 0,
            blue: 0
        };

        // AI behavior
        this.target = null;
        this.targetBlade = null;
        this.state = 'foraging'; // foraging, chasing, fleeing, wandering
        this.lastDecisionTime = 0;
        this.decisionInterval = 1000; // Make decisions every second
        this.lastBladeScanTime = 0;
        this.bladeScanInterval = 500; // Scan for blades every 500ms

        // Hysteresis thresholds
        this.stateEnterThresholds = {
            chasing: 1.4,    // Enter chase at 40% advantage
            fleeing: 0.7,   // Enter flee at 30% disadvantage
            foraging: 0.9   // Enter forage when slightly disadvantaged
        };
        this.stateExitThresholds = {
            chasing: 1.2,    // Exit chase at 20% advantage
            fleeing: 0.9,   // Exit flee at 10% disadvantage
            foraging: 1.1   // Exit forage when slightly advantaged
        };

        // Movement pattern
        this.wanderDirection = Math.random() * Math.PI * 2;
        this.wanderChangeTime = 0;
        this.wanderChangeInterval = 2000; // Change direction every 2 seconds

        // Color advantage (will be set from game config)
        this.colorAdvantage = null;
    }

    update(deltaTime, player, blades, config, worldWidth, worldHeight) {
        // Set color advantage from config if not set
        if (!this.colorAdvantage && config) {
            this.colorAdvantage = config.colorAdvantage;
        }

        this.scanForBlades(blades, player);
        this.makeDecision(player);
        this.executeBehavior(deltaTime, player);
        this.applyMovement(deltaTime);
        this.constrainToWorld(worldWidth, worldHeight);
    }

    scanForBlades(blades, player) {
        const currentTime = Date.now();

        // Only scan for blades at intervals
        if (currentTime - this.lastBladeScanTime < this.bladeScanInterval || !blades) {
            return;
        }

        this.lastBladeScanTime = currentTime;

        // Find best blade to target (up to 5 nearest blades)
        let bestBlade = null;
        let bestScore = -Infinity;
        let bladesChecked = 0;

        for (const blade of blades) {
            if (bladesChecked >= 5) break; // Limit to 5 nearest for performance

            const dx = blade.x - this.x;
            const dy = blade.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Skip if too far
            if (distance > 300) continue;

            bladesChecked++;

            // Calculate blade score
            const value = this.colorAdvantage ? this.colorAdvantage[blade.color] || 1 : 1;
            const proximity = 1 / (1 + distance / 50);

            // Safety factor (compare NPC vs player time to reach blade)
            const npcTime = distance / (this.speed + 0.001);
            const playerDx = blade.x - player.x;
            const playerDy = blade.y - player.y;
            const playerDistance = Math.sqrt(playerDx * playerDx + playerDy * playerDy);
            const playerTime = playerDistance / (player.speed + 0.001);
            const safety = npcTime < playerTime - 0.5 ? 1 : 0.3;

            const score = value * proximity * safety;

            if (score > bestScore) {
                bestScore = score;
                bestBlade = blade;
            }
        }

        this.targetBlade = bestBlade;
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

        // Calculate combat power using color advantage
        const playerPower = this.colorAdvantage ? player.getCombatPower(this.colorAdvantage) : player.getTotalBlades();
        const npcPower = this.colorAdvantage ? this.getCombatPower(this.colorAdvantage) : this.getTotalBlades();
        const advantageRatio = npcPower / (playerPower + 0.001);

        // Hysteresis-based decision making
        let newState = this.state;

        if (distance < 200) { // Close to player
            if (advantageRatio > this.stateEnterThresholds.chasing &&
                (this.state !== 'chasing' || advantageRatio > this.stateExitThresholds.chasing)) {
                newState = 'chasing';
            } else if (advantageRatio < this.stateEnterThresholds.fleeing &&
                      (this.state !== 'fleeing' || advantageRatio < this.stateExitThresholds.fleeing)) {
                newState = 'fleeing';
            } else if (advantageRatio < this.stateEnterThresholds.foraging &&
                      (this.state !== 'foraging' || advantageRatio < this.stateExitThresholds.foraging)) {
                newState = 'foraging';
            } else {
                newState = 'foraging';
            }
        } else {
            // Far from player - prioritize blade collection
            newState = this.targetBlade ? 'foraging' : 'wandering';
        }

        // Update state and target
        this.state = newState;
        this.target = newState === 'chasing' || newState === 'fleeing' ? player : null;
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
            case 'foraging':
                if (this.targetBlade) {
                    this.seekTarget(this.targetBlade);
                } else {
                    this.wander(deltaTime, currentTime);
                }
                break;
            case 'wandering':
                this.wander(deltaTime, currentTime);
                break;
        }

        // Apply velocity smoothing
        this.smoothMovement(deltaTime);
    }

    chaseTarget(target) {
        // Predictive pursuit: aim at target's predicted position
        const leadTime = 0.5; // 0.5 seconds lead time
        const predictedX = target.x + (target.vx || 0) * leadTime;
        const predictedY = target.y + (target.vy || 0) * leadTime;

        const dx = predictedX - this.x;
        const dy = predictedY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            this.desiredVx = (dx / distance) * this.speed;
            this.desiredVy = (dy / distance) * this.speed;
        }
    }

    fleeFromTarget(target) {
        // Predictive evasion: flee from target's predicted position
        const leadTime = 0.3; // 0.3 seconds lead time
        const predictedX = target.x + (target.vx || 0) * leadTime;
        const predictedY = target.y + (target.vy || 0) * leadTime;

        const dx = predictedX - this.x;
        const dy = predictedY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            this.desiredVx = (-dx / distance) * this.speed;
            this.desiredVy = (-dy / distance) * this.speed;
        }
    }

    seekTarget(target) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            this.desiredVx = (dx / distance) * this.speed;
            this.desiredVy = (dy / distance) * this.speed;
        }
    }

    wander(deltaTime, currentTime) {
        // Smooth wandering with gradual direction changes
        if (currentTime - this.wanderChangeTime > this.wanderChangeInterval) {
            const newDirection = Math.random() * Math.PI * 2;
            // Smooth transition between directions
            const angleDiff = newDirection - this.wanderDirection;
            const shortestAngle = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
            this.wanderDirection += shortestAngle * 0.1; // Gradual turn
            this.wanderChangeTime = currentTime;
        }

        // Add some noise to wandering for more natural movement
        const noise = (Math.random() - 0.5) * 0.2;
        this.desiredVx = Math.cos(this.wanderDirection + noise) * this.speed * 0.5;
        this.desiredVy = Math.sin(this.wanderDirection + noise) * this.speed * 0.5;
    }

    smoothMovement(deltaTime) {
        // Smooth velocity transitions using acceleration
        const timeFactor = deltaTime / 16.67; // Normalize to 60fps

        this.vx += (this.desiredVx - this.vx) * this.acceleration * timeFactor;
        this.vy += (this.desiredVy - this.vy) * this.acceleration * timeFactor;

        // Clamp velocity to maximum speed
        const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (currentSpeed > this.speed) {
            this.vx = (this.vx / currentSpeed) * this.speed;
            this.vy = (this.vy / currentSpeed) * this.speed;
        }
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