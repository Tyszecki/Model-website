import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Inicjalizacja sceny z optymalizacjami mobilnymi
const sceneContainer = document.getElementById('scene-container');
const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    powerPreference: 'high-performance', // Optymalizacja wydajności
    preserveDrawingBuffer: true // Dla kompatybilności z niektórymi urządzeniami
});

// Ustawienie pixel ratio odpowiedniego dla urządzenia
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Ograniczenie do max 2x
renderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight);
renderer.setClearColor(0x000000);
renderer.shadowMap.enabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace; // Lepsze kolory na mobilnych
sceneContainer.appendChild(renderer.domElement);

const scene = new THREE.Scene();

// Kamera z optymalizacjami
const camera = new THREE.PerspectiveCamera(
    45, 
    sceneContainer.clientWidth / sceneContainer.clientHeight, 
    0.1, 
    1000
);
camera.position.set(0, 10, 30);

// Kontrola kamery z obsługą touch
let isDragging = false;
let previousPosition = { x: 0, y: 0 };
const zoomSpeed = 0.02;
let zoomLevel = 30;
const minZoom = 10;
const maxZoom = 50;

// Funkcja wspólna dla touch/mouse
function handleStart(x, y) {
    isDragging = true;
    previousPosition = { x, y };
    sceneContainer.style.cursor = 'grabbing';
}

function handleEnd() {
    isDragging = false;
    sceneContainer.style.cursor = 'grab';
}

function handleMove(x, y) {
    if (!isDragging) return;
    
    const deltaMove = {
        x: x - previousPosition.x,
        y: y - previousPosition.y
    };
    
    camera.position.x -= deltaMove.x * 0.05;
    camera.position.y += deltaMove.y * 0.05;
    camera.lookAt(0, 5, 0);
    
    previousPosition = { x, y };
}

// Obsługa myszy (PC)
sceneContainer.addEventListener('mousedown', (e) => {
    if (e.button === 0) handleStart(e.clientX, e.clientY);
});

window.addEventListener('mouseup', handleEnd);
window.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));

// Obsługa touch (mobile)
sceneContainer.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
        handleStart(e.touches[0].clientX, e.touches[0].clientY);
        e.preventDefault(); // Zapobiega scrollowaniu strony
    }
}, { passive: false });

window.addEventListener('touchend', handleEnd);
window.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
        e.preventDefault();
    }
}, { passive: false });

// Zoom z obsługą pinch-to-zoom
let initialDistance = 0;
sceneContainer.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
        initialDistance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
    }
});

sceneContainer.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
        const currentDistance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
        
        const delta = initialDistance - currentDistance;
        zoomLevel += delta * 0.1;
        zoomLevel = Math.min(Math.max(zoomLevel, minZoom), maxZoom);
        
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        camera.position.add(direction.multiplyScalar(delta * 0.01));
        
        initialDistance = currentDistance;
        e.preventDefault();
    }
}, { passive: false });

// Płaszczyzna podłogi z logo (5x5 jednostek)
const textureLoader = new THREE.TextureLoader();
textureLoader.load('public/logo_shad_bckg.png', (texture) => {
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const planeGeometry = new THREE.PlaneGeometry(5, 5);
    const planeMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
        metalness: 0.3,
        roughness: 0.7,
        transparent: true,
        opacity: 0.9
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = 0;
    plane.receiveShadow = true;
    scene.add(plane);

    // Podświetlenie od dołu płaszczyzny
    const underLight = new THREE.PointLight(0xffffff, 1, 10);
    underLight.position.set(0, -2, 0);
    underLight.castShadow = true;
    underLight.shadow.mapSize.width = 512; // Mniejsze mapy cieni dla mobilnych
    underLight.shadow.mapSize.height = 512;
    scene.add(underLight);

    const underAmbient = new THREE.AmbientLight(0x404040);
    underAmbient.position.set(0, -5, 0);
    scene.add(underAmbient);
}, undefined, (error) => {
    console.error('Błąd ładowania tekstury:', error);
});

// Oświetlenie główne z optymalizacjami
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024; // Optymalizacja rozmiaru cieni
directionalLight.shadow.mapSize.height = 1024;
scene.add(directionalLight);

// Ładowanie modelu z progressem
const loader = new GLTFLoader();
loader.load('public/millennium_falcon/dron.glb', (gltf) => {
    const model = gltf.scene;
    model.scale.set(5, 5, 5);
    model.position.y = 5;
    
    model.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            // Optymalizacja materiałów
            if (child.material) {
                child.material.dithering = true; // Lepsze gradacje kolorów
            }
        }
    });
    
    scene.add(model);
    document.getElementById('progress-container').style.display = 'none';
}, (xhr) => {
    // Progress bar dla lepszego UX na mobilnych
    const percent = Math.round((xhr.loaded / xhr.total) * 100);
    document.getElementById('progress').textContent = `Ładowanie modelu... ${percent}%`;
}, (error) => {
    console.error('Błąd ładowania modelu:', error);
    document.getElementById('progress').textContent = 'Błąd ładowania modelu';
});

// Responsywność z throttlingiem
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        camera.aspect = sceneContainer.clientWidth / sceneContainer.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight);
    }, 100);
});

// Animacja
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();
