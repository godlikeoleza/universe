const canvas = document.getElementById('universeCanvas');
const ctx = canvas.getContext('2d');
const infoDiv = document.getElementById('info');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

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
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, stages[this.stage].size, 0, Math.PI * 2);
        ctx.fillStyle = stages[this.stage].color;
        ctx.fill();
    }

    update(particles) {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        for (let particle of particles) {
            if (particle === this) continue;
            
            let dx = particle.x - this.x;
            let dy = particle.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < stages[this.stage].size + stages[particle.stage].size) {
                this.collide(particle);
            }
        }
    }

    collide(other) {
        if (this.stage === other.stage && this.stage < stages.length - 1) {
            this.stage++;
            particles.splice(particles.indexOf(other), 1);
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