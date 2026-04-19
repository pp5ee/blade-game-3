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

        // Find and score nearest blades
        const scoredBlades = this.findAndScoreNearestBlades(blades, player, 5);

        if (scoredBlades.length === 0) {
            this.targetBlade = null;
            return;
        }

        // Choose best blade based on strategic considerations
        this.targetBlade = this.chooseBestBlade(scoredBlades, player);
    }

    findAndScoreNearestBlades(blades, player, maxBlades) {
        // Get all blades within range and calculate their distances
        const bladesInRange = blades.map(blade => {
            const dx = blade.x - this.x;
            const dy = blade.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return { blade, distance };
        }).filter(blade => blade.distance <= 300);

        // Sort by distance and take nearest ones
        bladesInRange.sort((a, b) => a.distance - b.distance);
        const nearestBlades = bladesInRange.slice(0, maxBlades);

        // Score each blade
        return nearestBlades.map(item => {
            const score = this.calculateBladeScore(item.blade, item.distance, player);
            return { ...item, score };
        });
    }

    calculateBladeScore(blade, distance, player) {
        let score = 0;

        // Base value based on color advantage
        const colorValue = this.colorAdvantage ? this.colorAdvantage[blade.color] || 1 : 1;
        score += colorValue * 30;

        // Proximity factor (closer is better)
        const proximity = 1 / (1 + distance / 50);
        score += proximity * 40;

        // Strategic color preference based on current inventory
        if (this.blades.red < 2 && blade.color === 'red') {
            score += 25; // High priority for red blades when we have few
        } else if (this.blades.yellow < 3 && blade.color === 'yellow') {
            score += 15; // Medium priority for yellow blades
        } else if (this.blades.blue < 5 && blade.color === 'blue') {
            score += 10; // Lower priority for blue blades
        }

        // Safety consideration (avoid blades that player is closer to)
        const playerDx = blade.x - player.x;
        const playerDy = blade.y - player.y;
        const playerDistance = Math.sqrt(playerDx * playerDx + playerDy * playerDy);
        const npcTime = distance / (this.speed + 0.001);
        const playerTime = playerDistance / (player.speed + 0.001);

        if (npcTime < playerTime - 0.5) {
            score += 20; // Safe - NPC can get there first
        } else if (npcTime > playerTime + 0.5) {
            score -= 15; // Dangerous - player likely to get there first
        }

        // Avoid blades that would lead NPC into player's path
        const angleToBlade = Math.atan2(blade.y - this.y, blade.x - this.x);
        const angleToPlayer = Math.atan2(player.y - this.y, player.x - this.x);
        const angleDiff = Math.abs(angleToBlade - angleToPlayer);

        if (angleDiff < Math.PI / 6 && playerDistance < 150) { // 30 degrees and player is close
            score -= 10; // Reduce score for blades that lead toward player
        }

        return score;
    }

    chooseBestBlade(scoredBlades, player) {
        // Sort by score (highest first)
        scoredBlades.sort((a, b) => b.score - a.score);

        // If multiple blades have similar scores, consider additional factors
        if (scoredBlades.length > 1) {
            const topScore = scoredBlades[0].score;
            const similarBlades = scoredBlades.filter(blade =>
                blade.score >= topScore * 0.8 // Within 20% of top score
            );

            if (similarBlades.length > 1) {
                // Among similar-scoring blades, prefer the one farthest from player
                similarBlades.sort((a, b) => {
                    const playerDistA = Math.sqrt(
                        Math.pow(a.blade.x - player.x, 2) +
                        Math.pow(a.blade.y - player.y, 2)
                    );
                    const playerDistB = Math.sqrt(
                        Math.pow(b.blade.x - player.x, 2) +
                        Math.pow(b.blade.y - player.y, 2)
                    );
                    return playerDistB - playerDistA; // Descending order (farthest first)
                });
                return similarBlades[0].blade;
            }
        }

        return scoredBlades[0].blade;
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