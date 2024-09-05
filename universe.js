const canvas = document.getElementById('universeCanvas');
const ctx = canvas.getContext('2d');
const infoDiv = document.getElementById('info');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const G = 0.1; // Gravitational constant (adjusted for simulation)

const stages = [
    { name: 'Quark', color: 'white', size: 2 },
    { name: 'Proton/Neutron', color: 'lightblue', size: 4 },
    { name: 'Atom', color: 'blue', size: 6 },
    { name: 'Gas Cloud', color: 'purple', size: 10 },
    { name: 'Star', color: 'yellow', size: 20 },
    { name: 'Supernova', color: 'red', size: 30 },
    { name: 'Planetary Nebula', color: 'pink', size: 40 },
    { name: 'Planet', color: 'green', size: 15 },
    { name: 'Complex Molecule', color: 'cyan', size: 8 },
    { name: 'Organic Compound', color: 'orange', size: 10 },
    { name: 'Amino Acid', color: 'magenta', size: 12 },
    { name: 'Protein', color: 'lime', size: 14 },
    { name: 'Simple Cell', color: 'aqua', size: 16 }
];

class Particle {
    constructor(x, y, stage = 0) {
        this.x = x;
        this.y = y;
        this.stage = stage;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.mass = stages[stage].size * 10; // Mass proportional to size
        this.energy = this.mass * 10; // Initial energy
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, stages[this.stage].size, 0, Math.PI * 2);
        ctx.fillStyle = stages[this.stage].color;
        ctx.fill();

        // Add energy visualization
        ctx.fillStyle = `rgba(255, 255, 255, ${this.energy / (this.mass * 10)})`;
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
                
                // Collision
                if (distance < stages[this.stage].size + stages[particle.stage].size) {
                    this.collide(particle);
                }
            }
        }
        
        // Update velocity based on force
        this.vx += fx / this.mass;
        this.vy += fy / this.mass;
        
        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;
        
        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.vx *= -0.9;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -0.9;
        
        // Energy loss
        this.energy *= 0.999;
        
        // Particle decay
        if (this.energy < 5 && this.stage > 0) {
            this.stage--;
            this.energy = this.mass * 10;
        }
    }

    collide(other) {
        if (this.stage === other.stage && this.stage < stages.length - 1) {
            // Combine particles
            this.stage++;
            this.mass = stages[this.stage].size * 10;
            this.energy = this.mass * 10;
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
        }
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
    for (let particle of particles) {
        counts[particle.stage]++;
    }
    
    let info = stages.map((stage, index) => 
        `${stage.name}: ${counts[index]}`
    ).join('<br>');
    
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
