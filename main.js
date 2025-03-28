import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Inicjalizacja renderera
const sceneContainer = document.getElementById('scene-container');
const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    powerPreference: "high-performance"
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight);
renderer.setClearColor(0x000000);
renderer.shadowMap.enabled = true;
sceneContainer.appendChild(renderer.domElement);

const scene = new THREE.Scene();

// Kamera
const camera = new THREE.PerspectiveCamera(
    45, 
    sceneContainer.clientWidth / sceneContainer.clientHeight, 
    0.1, 
    1000
);
camera.position.set(0, 10, 30);
camera.lookAt(0, 5, 0);

// Płaszczyzna podłogi Z ZACHOWANIEM PROPORCJI LOGO
const textureLoader = new THREE.TextureLoader();
textureLoader.load('public/logo_shad_bckg.png', (texture) => {
    // Oblicz proporcje tekstury
    const imageAspect = texture.image.width / texture.image.height;
    const planeWidth = 5;
    const planeHeight = planeWidth / imageAspect;
    
    const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
    const planeMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
        metalness: 0.3,
        roughness: 0.7
    });
    
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = 0;
    plane.receiveShadow = true;
    scene.add(plane);
}, undefined, (error) => {
    console.error('Błąd ładowania tekstury:', error);
});

// Oświetlenie (bez zmian)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Ładowanie modelu (bez zmian)
const loader = new GLTFLoader();
loader.load('public/millennium_falcon/dron.glb', (gltf) => {
    const model = gltf.scene;
    model.scale.set(5, 5, 5);
    model.position.y = 5;
    
    model.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    
    scene.add(model);
    document.getElementById('progress-container').style.display = 'none';
}, (xhr) => {
    const percent = Math.round((xhr.loaded / xhr.total) * 100);
    document.getElementById('progress').textContent = `Ładowanie modelu... ${percent}%`;
}, (error) => {
    console.error('Błąd ładowania modelu:', error);
});

// Kontrola kamery (bez zmian)
let isDragging = false;
let previousPosition = { x: 0, y: 0 };

// Obsługa myszy (PC) (bez zmian)
sceneContainer.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
        isDragging = true;
        previousPosition = { x: e.clientX, y: e.clientY };
    }
});

window.addEventListener('mouseup', () => isDragging = false);

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const delta = {
        x: e.clientX - previousPosition.x,
        y: e.clientY - previousPosition.y
    };
    camera.position.x -= delta.x * 0.05;
    camera.position.y += delta.y * 0.05;
    camera.lookAt(0, 5, 0);
    previousPosition = { x: e.clientX, y: e.clientY };
});

// Zoom scroll (PC) (bez zmian)
sceneContainer.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY * 0.01;
    
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    camera.position.add(direction.multiplyScalar(zoomFactor));
}, { passive: false });

// Obsługa touch (mobile) (bez zmian)
let touchStartDistance = 0;

sceneContainer.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
        isDragging = true;
        previousPosition = { 
            x: e.touches[0].clientX, 
            y: e.touches[0].clientY 
        };
    } else if (e.touches.length === 2) {
        touchStartDistance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
    }
}, { passive: false });

window.addEventListener('touchend', () => {
    isDragging = false;
    touchStartDistance = 0;
});

sceneContainer.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1 && isDragging) {
        const delta = {
            x: e.touches[0].clientX - previousPosition.x,
            y: e.touches[0].clientY - previousPosition.y
        };
        camera.position.x -= delta.x * 0.05;
        camera.position.y += delta.y * 0.05;
        camera.lookAt(0, 5, 0);
        previousPosition = { 
            x: e.touches[0].clientX, 
            y: e.touches[0].clientY 
        };
    } else if (e.touches.length === 2) {
        const currentDistance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
        const zoomFactor = (touchStartDistance - currentDistance) * 0.2;
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        camera.position.add(direction.multiplyScalar(zoomFactor));
        touchStartDistance = currentDistance;
    }
}, { passive: false });

// Responsywność (bez zmian)
window.addEventListener('resize', () => {
    camera.aspect = sceneContainer.clientWidth / sceneContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight);
});

// Animacja (bez zmian)
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
