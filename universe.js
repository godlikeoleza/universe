const canvas = document.getElementById('universeCanvas');
const ctx = canvas.getContext('2d');
const infoDiv = document.getElementById('info');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const G = 0.1; // Gravitational constant
const COSMIC_EXPANSION_RATE = 0.0001;
const DARK_MATTER_INFLUENCE = 0.05;

const stages = [
    { name: 'Quark', color: 'white', size: 2, fusionThreshold: 1000 },
    { name: 'Proton/Neutron', color: 'lightblue', size: 4, fusionThreshold: 2000 },
    { name: 'Atom', color: 'blue', size: 6, fusionThreshold: 3000 },
    { name: 'Gas Cloud', color: 'purple', size: 10, fusionThreshold: 5000 },
    { name: 'Star', color: 'yellow', size: 20, fusionThreshold: 10000 },
    { name: 'Supernova', color: 'red', size: 30, fusionThreshold: Infinity },
    { name: 'Planetary Nebula', color: 'pink', size: 40, fusionThreshold: Infinity },
    { name: 'Planet', color: 'green', size: 15, fusionThreshold: Infinity },
    { name: 'Complex Molecule', color: 'cyan', size: 8, fusionThreshold: Infinity },
    { name: 'Organic Compound', color: 'orange', size: 10, fusionThreshold: Infinity },
    { name: 'Amino Acid', color: 'magenta', size: 12, fusionThreshold: Infinity },
    { name: 'Protein', color: 'lime', size: 14, fusionThreshold: Infinity },
    { name: 'Simple Cell', color: 'aqua', size: 16, fusionThreshold: Infinity }
];

class Particle {
    constructor(x, y, stage = 0) {
        this.x = x;
        this.y = y;
        this.stage = stage;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.mass = stages[stage].size * 10;
        this.energy = this.mass * 10;
        this.temperature = 100; // Initial temperature
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, stages[this.stage].size, 0, Math.PI * 2);
        ctx.fillStyle = stages[this.stage].color;
        ctx.fill();

        // Temperature visualization
        const hue = Math.min(360, this.temperature / 10);
        ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.3)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, stages[this.stage].size * 1.2, 0, Math.PI * 2);
        ctx.fill();
    }

    update(particles) {
        let fx = 0, fy = 0;
        for (let particle of particles) {
            if (particle === this) continue;
            
            let dx = particle.x - this.x;
            let dy = particle.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                // Gravitational force
                let force = (G * this.mass * particle.mass) / (distance * distance);
                fx += force * dx / distance;
                fy += force * dy / distance;
                
                // Collision and fusion
                if (distance < stages[this.stage].size + stages[particle.stage].size) {
                    this.collide(particle);
                }
            }
        }
        
        // Dark matter influence
        fx += DARK_MATTER_INFLUENCE * (Math.random() - 0.5);
        fy += DARK_MATTER_INFLUENCE * (Math.random() - 0.5);
        
        // Update velocity based on force
        this.vx += fx / this.mass;
        this.vy += fy / this.mass;
        
        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;
        
        // Cosmic expansion
        this.x += (this.x - canvas.width / 2) * COSMIC_EXPANSION_RATE;
        this.y += (this.y - canvas.height / 2) * COSMIC_EXPANSION_RATE;
        
        // Wrap around edges
        this.x = (this.x + canvas.width) % canvas.width;
        this.y = (this.y + canvas.height) % canvas.height;
        
        // Energy loss and temperature change
        this.energy *= 0.999;
        this.temperature *= 0.999;
        
        // Particle decay
        if (this.energy < 5 && this.stage > 0) {
            this.stage--;
            this.energy = this.mass * 10;
            this.temperature += 100; // Temperature increase on decay
        }

        // Nuclear fusion
        if (this.temperature > stages[this.stage].fusionThreshold && this.stage < stages.length - 1) {
            this.stage++;
            this.mass = stages[this.stage].size * 10;
            this.energy += this.mass * 100; // Energy release from fusion
            this.temperature *= 2; // Temperature increase from fusion
        }
    }

    collide(other) {
        // Elastic collision
        let vCollision = {x: other.x - this.x, y: other.y - this.y};
        let distance = Math.sqrt(vCollision.x**2 + vCollision.y**2);
        let vCollisionNorm = {x: vCollision.x / distance, y: vCollision.y / distance};
        let vRelativeVelocity = {x: this.vx - other.vx, y: this.vy - other.vy};
        let speed = vRelativeVelocity.x * vCollisionNorm.x + vRelativeVelocity.y * vCollisionNorm.y;
        if (speed < 0) return;
        let impulse = 2 * speed / (this.mass + other.mass);
        this.vx -= impulse * other.mass * vCollisionNorm.x;
        this.vy -= impulse * other.mass * vCollisionNorm.y;
        other.vx += impulse * this.mass * vCollisionNorm.x;
        other.vy += impulse * this.mass * vCollisionNorm.y;

        // Temperature exchange
        let avgTemp = (this.temperature + other.temperature) / 2;
        this.temperature = other.temperature = avgTemp;

        // Energy transfer
        let totalEnergy = this.energy + other.energy;
        this.energy = other.energy = totalEnergy / 2;
    }
}

let particles = [];

function init() {
    for (let i = 0; i < 100; i++) {
        particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height));
    }
}

function animate() {
    requestAnimationFrame(animate);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let particle of particles) {
        particle.update(particles);
        particle.draw();
    }

    updateInfo();
}

function updateInfo() {
    let counts = stages.map(() => 0);
    let totalEnergy = 0;
    let averageTemperature = 0;
    
    for (let particle of particles) {
        counts[particle.stage]++;
        totalEnergy += particle.energy;
        averageTemperature += particle.temperature;
    }
    
    averageTemperature /= particles.length;
    
    let info = stages.map((stage, index) => 
        `${stage.name}: ${counts[index]}`
    ).join('<br>');
    
    info += `<br><br>Total Energy: ${totalEnergy.toFixed(2)}`;
    info += `<br>Average Temperature: ${averageTemperature.toFixed(2)}`;
    
    infoDiv.innerHTML = info;
}

init();
animate();

canvas.addEventListener('click', (event) => {
    particles.push(new Particle(event.clientX, event.clientY));
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
