import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Inicjalizacja sceny
const sceneContainer = document.getElementById('scene-container');
const renderer = new THREE.WebGLRenderer({ 
    antialias: true
});
renderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight);
renderer.setClearColor(0x000000); // Czarne tło
renderer.shadowMap.enabled = true;
sceneContainer.appendChild(renderer.domElement);

const scene = new THREE.Scene();

// Kamera
const camera = new THREE.PerspectiveCamera(45, sceneContainer.clientWidth / sceneContainer.clientHeight, 0.1, 1000);
camera.position.set(0, 10, 30);

// Kontrola kamery
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
const zoomSpeed = 0.1;
let zoomLevel = 30;
const minZoom = 10;
const maxZoom = 50;

// Płaszczyzna podłogi z logo (TERAZ WIDOCZNA)
const textureLoader = new THREE.TextureLoader();
textureLoader.load('public/logo_shad_bckg.png', (texture) => {
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const planeGeometry = new THREE.PlaneGeometry(30, 30);
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
    console.log('Płaszczyzna z logo została dodana');
}, undefined, (error) => {
    console.error('Błąd ładowania tekstury:', error);
});

// Oświetlenie (BEZ ZIELONEJ POŚWIATY)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Ładowanie modelu
const loader = new GLTFLoader();
loader.load('public/millennium_falcon/dron.glb', (gltf) => {
    const model = gltf.scene;
    model.scale.set(5, 5, 5);
    model.position.y = 5;
    
    // USUNIĘTE: wszystkie efekty emisji i zielonej poświaty
    model.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    
    scene.add(model);
    document.getElementById('progress-container').style.display = 'none';
}, undefined, (error) => {
    console.error('Błąd ładowania modelu:', error);
});

// Obsługa myszy (TYLKO LPM)
sceneContainer.addEventListener('mousedown', (e) => {
    if (e.button === 0) { // Tylko lewy przycisk myszy
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
        sceneContainer.style.cursor = 'grabbing';
    }
});

window.addEventListener('mouseup', () => {
    isDragging = false;
    sceneContainer.style.cursor = 'grab';
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
    };
    
    camera.position.x -= deltaMove.x * 0.05;
    camera.position.y += deltaMove.y * 0.05;
    camera.lookAt(0, 5, 0); // Patrzymy na środek (na wysokości drona)
    
    previousMousePosition = { x: e.clientX, y: e.clientY };
});

// Przybliżanie scroll-em
sceneContainer.addEventListener('wheel', (e) => {
    e.preventDefault();
    zoomLevel -= e.deltaY * zoomSpeed;
    zoomLevel = Math.min(Math.max(zoomLevel, minZoom), maxZoom);
    
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    camera.position.add(direction.multiplyScalar(-e.deltaY * zoomSpeed));
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
