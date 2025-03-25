import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Inicjalizacja sceny
const sceneContainer = document.getElementById('scene-container');
const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    powerPreference: "high-performance"
});
renderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight);
renderer.setClearColor(0x000000);
renderer.shadowMap.enabled = true;
sceneContainer.appendChild(renderer.domElement);

const scene = new THREE.Scene();

// Kamera
const camera = new THREE.PerspectiveCamera(45, sceneContainer.clientWidth / sceneContainer.clientHeight, 0.1, 1000);
camera.position.set(0, 5, 20);

// Kontrola kamery
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let zoomLevel = 20;
const minZoom = 5;
const maxZoom = 50;

// Płaszczyzna podłogi z logo
const textureLoader = new THREE.TextureLoader();
textureLoader.load('public/logo_shad_bckg.png', (texture) => {
    const floorGeometry = new THREE.PlaneGeometry(30, 30);
    const floorMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        opacity: 0.8,
        metalness: 0.3,
        roughness: 0.7
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0.1;
    floor.receiveShadow = true;
    scene.add(floor);
});

// Oświetlenie
const ambientLight = new THREE.AmbientLight(0x00ff88, 0.3); // Subtelna zieleń
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Ładowanie modelu
const loader = new GLTFLoader();
loader.load('public/millennium_falcon/dron.glb', (gltf) => {
    const model = gltf.scene;
    model.scale.set(5, 5, 5);
    model.position.y = 5;
    
    // Lekka zielona poświata
    model.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.material.emissive = new THREE.Color(0x003300);
            child.material.emissiveIntensity = 0.1;
        }
    });
    
    scene.add(model);
    document.getElementById('progress-container').style.display = 'none';
});

// Obsługa myszy
sceneContainer.addEventListener('mousedown', (e) => {
    if (e.button === 0) { // Tylko LPM
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    }
});

window.addEventListener('mouseup', () => {
    isDragging = false;
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
    };
    
    camera.position.x -= deltaMove.x * 0.01;
    camera.position.y += deltaMove.y * 0.01;
    camera.lookAt(0, 3, 0);
    
    previousMousePosition = { x: e.clientX, y: e.clientY };
});

// Przybliżanie scroll-em
sceneContainer.addEventListener('wheel', (e) => {
    e.preventDefault();
    zoomLevel -= e.deltaY * 0.05;
    zoomLevel = Math.min(Math.max(zoomLevel, minZoom), maxZoom);
    
    const direction = camera.position.clone().normalize();
    camera.position.copy(direction.multiplyScalar(zoomLevel));
});

// Animacja
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Responsywność
window.addEventListener('resize', () => {
    camera.aspect = sceneContainer.clientWidth / sceneContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight);
});

animate();
