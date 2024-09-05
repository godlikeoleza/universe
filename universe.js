const canvas = document.getElementById('universeCanvas');
const ctx = canvas.getContext('2d');
const infoDiv = document.getElementById('info');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const G = 0.0005; // Gravitational constant
const COSMIC_EXPANSION_RATE = 0.0000005; // Expansion rate
const DARK_MATTER_INFLUENCE = 0.0005; // Dark matter influence

const stages = [
    { name: 'Quark', color: 'white', size: 2, fusionThreshold: 1000, fusionProbability: 0.001 },
    { name: 'Proton/Neutron', color: 'lightblue', size: 4, fusionThreshold: 2000, fusionProbability: 0.0008 },
    { name: 'Atom', color: 'blue', size: 6, fusionThreshold: 3000, fusionProbability: 0.0006 },
    { name: 'Gas Cloud', color: 'purple', size: 10, fusionThreshold: 4000, fusionProbability: 0.0004 },
    { name: 'Star', color: 'yellow', size: 20, fusionThreshold: 5000, fusionProbability: 0.0002 },
    { name: 'Supernova', color: 'red', size: 30, fusionThreshold: 6000, fusionProbability: 0.0001 },
    { name: 'Planetary Nebula', color: 'pink', size: 40, fusionThreshold: 7000, fusionProbability: 0.00008 },
    { name: 'Planet', color: 'green', size: 15, fusionThreshold: 8000, fusionProbability: 0.00006 },
    { name: 'Complex Molecule', color: 'cyan', size: 8, fusionThreshold: 9000, fusionProbability: 0.00004 },
    { name: 'Organic Compound', color: 'orange', size: 10, fusionThreshold: 10000, fusionProbability: 0.00002 },
    { name: 'Amino Acid', color: 'magenta', size: 12, fusionThreshold: 11000, fusionProbability: 0.00001 },
    { name: 'Protein', color: 'lime', size: 14, fusionThreshold: 12000, fusionProbability: 0.000005 },
    { name: 'Simple Cell', color: 'aqua', size: 16, fusionThreshold: Infinity, fusionProbability: 0 }
];

class Particle {
    constructor(x, y, stage = 0) {
        this.x = x;
        this.y = y;
        this.stage = stage;
        this.vx = (Math.random() - 0.5) * 0.2; // Initial velocity
        this.vy = (Math.random() - 0.5) * 0.2; // Initial velocity
        this.mass = stages[stage].size * 10;
        this.energy = this.mass * 10;
        this.temperature = 300;
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
        
        // Apply velocity with a speed limit
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const maxSpeed = 1;
        if (speed > maxSpeed) {
            this.vx = (this.vx / speed) * maxSpeed;
            this.vy = (this.vy / speed) * maxSpeed;
        }
        
        this.x += this.vx;
        this.y += this.vy;
        
        // Cosmic expansion
        this.x += (this.x - canvas.width / 2) * COSMIC_EXPANSION_RATE;
        this.y += (this.y - canvas.height / 2) * COSMIC_EXPANSION_RATE;
        
        // Wrap around edges
        this.x = (this.x + canvas.width) % canvas.width;
        this.y = (this.y + canvas.height) % canvas.height;
        
        // Reduced energy and temperature loss
        this.energy *= 0.99999;
        this.temperature *= 0.99999;
        
        // Adjusted particle decay
        if (this.energy < 1 && this.stage > 0) {
            this.stage--;
            this.energy = this.mass * 5;
            this.temperature += 50;
        }

        // Adjusted nuclear fusion
        if (this.temperature > stages[this.stage].fusionThreshold && 
            Math.random() < stages[this.stage].fusionProbability && 
            this.stage < stages.length - 1) {
            this.stage++;
            this.mass = stages[this.stage].size * 10;
            this.energy += this.mass * 15; // Further reduced energy release from fusion
            this.temperature *= 1.1; // Further reduced temperature increase from fusion
        }
    }

    collide(other) {
        if (this.stage === other.stage && this.stage < stages.length - 1 && Math.random() < stages[this.stage].fusionProbability * 10) {
            // Combine particles and evolve
            this.stage++;
            this.mass = stages[this.stage].size * 10;
            this.energy = (this.energy + other.energy) * 1.02; // Further reduced energy boost on evolution
            this.temperature = (this.temperature + other.temperature) * 1.02; // Further reduced temperature boost on evolution
            this.vx = (this.vx + other.vx) / 2;
            this.vy = (this.vy + other.vy) / 2;
            particles.splice(particles.indexOf(other), 1);
        } else {
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
}

let particles = [];

function init() {
    for (let i = 0; i < 200; i++) { // Initial particle count
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
