import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Inicjalizacja sceny (bez zmian)
const sceneContainer = document.getElementById('scene-container');
const renderer = new THREE.WebGLRenderer({ 
    antialias: true
});
renderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight);
renderer.setClearColor(0x000000);
renderer.shadowMap.enabled = true;
sceneContainer.appendChild(renderer.domElement);

const scene = new THREE.Scene();

// Kamera (bez zmian)
const camera = new THREE.PerspectiveCamera(45, sceneContainer.clientWidth / sceneContainer.clientHeight, 0.1, 1000);
camera.position.set(0, 10, 30);

// Kontrola kamery (bez zmian)
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

// Płaszczyzna podłogi (bez zmian)
const textureLoader = new THREE.TextureLoader();
textureLoader.load('public/logo_shad_bckg.png', (texture) => {
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const planeGeometry = new THREE.PlaneGeometry(5, 5);
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
}, undefined, (error) => {
    console.error('Błąd ładowania modelu:', error);
});

// Obsługa myszy (bez zmian)
sceneContainer.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
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
    camera.lookAt(0, 5, 0);
    
    previousMousePosition = { x: e.clientX, y: e.clientY };
});

// POPRAWIONA OBSŁUGA ZOOMU (TYLKO TE CZĘŚCI ZMIENIAMY):

// 1. Zoom scroll (PC) - większa czułość
sceneContainer.addEventListener('wheel', (e) => {
    e.preventDefault();
    
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    
    // Nowa implementacja zoomu - 3x bardziej czuła
    const zoomFactor = e.deltaY * 0.1; // Zwiększona czułość (było 0.02)
    
    // Płynny zoom z zachowaniem ograniczeń
    const minDistance = 5;
    const maxDistance = 50;
    const target = new THREE.Vector3(0, 5, 0);
    const currentDistance = camera.position.distanceTo(target);
    
    // Oblicz nową odległość
    let newDistance = currentDistance - zoomFactor;
    newDistance = Math.max(minDistance, Math.min(maxDistance, newDistance));
    
    // Ustaw nową pozycję kamery
    camera.position.sub(target).normalize().multiplyScalar(newDistance).add(target);
    camera.lookAt(target);
}, { passive: false });

// 2. Zoom na telefonie - większa czułość
let initialPinchDistance = 0;

sceneContainer.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
        initialPinchDistance = Math.hypot(
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
        
        // 5x większa czułość niż wcześniej
        const zoomFactor = (initialPinchDistance - currentDistance) * 0.1;
        
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        
        // Płynny zoom z ograniczeniami
        const minDistance = 5;
        const maxDistance = 50;
        const target = new THREE.Vector3(0, 5, 0);
        const currentCamDistance = camera.position.distanceTo(target);
        let newDistance = currentCamDistance - zoomFactor;
        newDistance = Math.max(minDistance, Math.min(maxDistance, newDistance));
        
        camera.position.sub(target).normalize().multiplyScalar(newDistance).add(target);
        camera.lookAt(target);
        
        initialPinchDistance = currentDistance;
        e.preventDefault();
    }
}, { passive: false });

// Reszta kodu bez zmian
window.addEventListener('resize', () => {
    camera.aspect = sceneContainer.clientWidth / sceneContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight);
});

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();
