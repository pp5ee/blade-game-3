class Blade {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;

        // Animation properties
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.05;
        this.baseRadius = radius;
    }

    update(deltaTime) {
        // Update pulse animation
        this.pulsePhase += this.pulseSpeed * (deltaTime / 16.67);
        this.radius = this.baseRadius + Math.sin(this.pulsePhase) * 2;
    }

    render(ctx) {
        // Get color based on blade type
        const colorMap = {
            red: '#e94560',
            yellow: '#ffd166',
            blue: '#70d6ff'
        };

        const bladeColor = colorMap[this.color] || '#ffffff';

        // Draw blade
        ctx.fillStyle = bladeColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw blade outline
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw blade shape (simple triangle-like shape)
        this.drawBladeShape(ctx, bladeColor);
    }

    drawBladeShape(ctx, color) {
        const angle = Math.PI / 4; // 45 degrees
        const length = this.radius * 0.8;

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        // Draw 4 blade "spikes"
        for (let i = 0; i < 4; i++) {
            const spikeAngle = angle + (i * Math.PI / 2);
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(
                this.x + Math.cos(spikeAngle) * length,
                this.y + Math.sin(spikeAngle) * length
            );
        }

        ctx.stroke();
    }

    // Check if this blade collides with another entity
    checkCollision(entity) {
        const dx = this.x - entity.x;
        const dy = this.y - entity.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance < (this.radius + entity.radius);
    }
}