// Three.js 3D Background - Enhanced with subtle additional shapes
let scene, camera, renderer, particles, shapeGroup;

function initThreeJS() {
    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.0025); // Slightly stronger fog for depth
    
    // Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 100;
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ 
        canvas: document.getElementById('bg-canvas'), 
        alpha: true,
        antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0a0a0a, 0);
    
    // === PARTICLE SYSTEM (enhanced subtlety) ===
    const particlesCount = 150; // Even fewer for maximum subtlety
    const positions = new Float32Array(particlesCount * 3);
    const sizes = new Float32Array(particlesCount);
    const colors = new Float32Array(particlesCount * 3); // For color variation
    
    for (let i = 0; i < particlesCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 120; // Tighter spread
        positions[i * 3 + 1] = (Math.random() - 0.5) * 120;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 120;
        
        sizes[i] = Math.random() * 1 + 0.3; // Smaller size range
        
        // Subtle color variation: mostly blue/purple with slight randomness
        colors[i * 3] = 0.4 + Math.random() * 0.2; // Red
        colors[i * 3 + 1] = 0.3 + Math.random() * 0.2; // Green
        colors[i * 3 + 2] = 0.6 + Math.random() * 0.2; // Blue
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    // Particle material with vertex colors
    const particleMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            fogColor: { value: new THREE.Color(0x0a0a0a) },
            fogNear: { value: 10 },
            fogFar: { value: 80 }
        },
        vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            varying float vSize;
            void main() {
                vColor = color;
                vSize = size;
                vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
                gl_PointSize = size * ( 300.0 / -mvPosition.z );
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            varying float vSize;
            uniform float time;
            uniform vec3 fogColor;
            uniform float fogNear;
            uniform float fogFar;
            void main() {
                float dist = gl_PointCoord.distanceTo( vec2(0.5) );
                float alpha = smoothstep( 0.5, 0.0, dist ) * (1.0 - smoothstep( 0.0, 0.1, dist )) * 0.3; // Very subtle
                
                // Color with gentle pulse
                vec3 color = vColor * (0.8 + 0.2 * sin(time * 0.5));
                
                // Fog
                float fogFactor = smoothstep( fogNear, fogFar, gl_FragCoord.z );
                color = mix( color, fogColor, fogFactor );
                
                gl_FragColor = vec4( color, alpha );
            }
        `,
        transparent: true,
        depthWrite: false
    });
    
    particles = new THREE.Points(geometry, particleMaterial);
    scene.add(particles);
    
    // === ADDITIONAL 3D SHAPES (subtle glowing forms) ===
    shapeGroup = new THREE.Group();
    scene.add(shapeGroup);
    
    // Shape material: emissive with transparency
    const shapeMaterial = new THREE.MeshStandardMaterial({
        emissive: 0x6a11cb,
        emissiveIntensity: 0.3,
        color: 0x2575fc,
        transparent: true,
        opacity: 0.15,
        metalness: 0.8,
        roughness: 0.2
    });
    
    // Create a few different shapes
    const shapes = [
        { geometry: new THREE.TetrahedronGeometry(3, 0), y: 20 },
        { geometry: new THREE.BoxGeometry(4, 4, 4), y: -20 },
        { geometry: new THREE.IcosahedronGeometry(2.5, 0), y: 40 },
        { geometry: new THREE.OctahedronGeometry(3, 0), y: -40 },
        { geometry: new THREE.TorusKnotGeometry(2, 0.5, 64, 16), y: 0 }
    ];
    
    shapes.forEach(shape => {
        const mesh = new THREE.Mesh(shape.geometry.clone(), shapeMaterial.clone());
        mesh.position.y = shape.y;
        mesh.position.x = (Math.random() - 0.5) * 80;
        mesh.position.z = (Math.random() - 0.5) * 80;
        mesh.userData.rotationSpeed = {
            x: (Math.random() - 0.5) * 0.002,
            y: (Math.random() - 0.5) * 0.002,
            z: (Math.random() - 0.5) * 0.002
        };
        mesh.userData.bobOffset = Math.random() * Math.PI * 2;
        // Store original Y for bobbing
        mesh.userData.originalY = mesh.position.y;
        shapeGroup.add(mesh);
    });
    
    // === LIGHTING (enhanced) ===
    const ambientLight = new THREE.AmbientLight(0x404040, 1.8);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 3, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Add a subtle rim light
    const rimLight = new THREE.DirectionalLight(0x6a11cb, 0.5);
    rimLight.position.set(-5, -3, -5);
    scene.add(rimLight);
    
    // Animation loop
    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        
        time += 0.006; // Slower overall time
        
        // Update particle system
        particleMaterial.uniforms.time.value = time;
        
        // Rotate particles very slowly
        particles.rotation.y += 0.0001;
        particles.rotation.x += 0.00005;
        
        // Animate additional shapes
        shapeGroup.children.forEach((mesh, index) => {
            // Rotation
            mesh.rotation.x += mesh.userData.rotationSpeed.x;
            mesh.rotation.y += mesh.userData.rotationSpeed.y;
            mesh.rotation.z += mesh.userData.rotationSpeed.z;
            
            // Gentle bobbing motion
            const bobOffset = mesh.userData.bobOffset + time * 0.2;
            mesh.position.y = mesh.userData.originalY + Math.sin(bobOffset) * 0.5;
            
            // Slow drift
            mesh.position.x += Math.sin(time * 0.1 + index) * 0.02;
            mesh.position.z += Math.cos(time * 0.1 + index) * 0.02;
        });
        
        // Gentle light animation
        directionalLight.position.x = Math.sin(time * 0.2) * 10;
        directionalLight.position.z = Math.cos(time * 0.2) * 10;
        rimLight.position.x = -Math.sin(time * 0.2) * 10;
        rimLight.position.z = -Math.cos(time * 0.2) * 10;
        
        renderer.render(scene, camera);
    }
    animate();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Initialize Three.js when page loads
document.addEventListener('DOMContentLoaded', initThreeJS);

// Smooth scrolling for navigation links (unchanged)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Form submission handling (unchanged)
document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = this.name.value.trim();
    const email = this.email.value.trim();
    const message = this.message.value.trim();
    
    if (name === '' || email === '' || message === '') {
        alert('Please fill in all fields');
        return;
    }
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    alert('Thank you for your message! I will get back to you soon.');
    this.reset();
});

// Animation on scroll (unchanged)
function animateOnScroll() {
    const elements = document.querySelectorAll('.fade-in-up');
    elements.forEach(el => {
        const elementTop = el.getBoundingClientRect().top;
        const elementBottom = el.getBoundingClientRect().bottom;
        const windowHeight = window.innerHeight;
        
        if (elementTop < windowHeight * 0.8 && elementBottom > 0) {
            el.classList.add('animate');
        }
    });
}

window.addEventListener('load', animateOnScroll);
window.addEventListener('scroll', animateOnScroll);

// Add animation classes with delay (unchanged)
document.addEventListener('DOMContentLoaded', () => {
    const skillElements = document.querySelectorAll('.skill');
    skillElements.forEach((el, index) => {
        el.classList.add('fade-in-up');
        el.classList.add(`delay-${Math.floor(index / 4)}`);
    });
    
    const projectElements = document.querySelectorAll('.project-card');
    projectElements.forEach((el, index) => {
        el.classList.add('fade-in-up');
        el.classList.add(`delay-${Math.floor(index / 2)}`);
    });
    
    const aboutText = document.querySelector('#about p');
    if (aboutText) {
        aboutText.classList.add('fade-in-up');
        aboutText.classList.add('delay-1');
    });
});
