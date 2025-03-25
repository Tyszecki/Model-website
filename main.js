import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Inicjalizacja sceny
const sceneContainer = document.getElementById('scene-container');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight);
renderer.setClearColor(0xf0f0f0);
sceneContainer.appendChild(renderer.domElement);

const scene = new THREE.Scene();

// Kamera
const camera = new THREE.PerspectiveCamera(45, sceneContainer.clientWidth / sceneContainer.clientHeight, 0.1, 1000);
camera.position.set(0, 10, 20);

// Zmienne do śledzenia kursora
const mouse = new THREE.Vector2();
const targetPosition = new THREE.Vector3();
let isMouseMoving = false;

// Płaszczyzna jako podłoże
const planeGeometry = new THREE.PlaneGeometry(100, 100);
const planeMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xdddddd,
    side: THREE.DoubleSide
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
scene.add(plane);

// Oświetlenie
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Model drona
const loader = new GLTFLoader();
loader.load('public/millennium_falcon/dron.glb', (gltf) => {
    const model = gltf.scene;
    model.scale.set(5, 5, 5);
    model.position.y = 5;
    scene.add(model);
    document.getElementById('progress-container').style.display = 'none';
});

// Obsługa ruchu myszy
window.addEventListener('mousemove', (event) => {
    // Normalizacja pozycji myszy (-1 do 1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    isMouseMoving = true;
});

function animate() {
    requestAnimationFrame(animate);
    
    // Płynne śledzenie kursora
    if (isMouseMoving) {
        // Oblicz docelową pozycję kamery
        targetPosition.x = mouse.x * 10;
        targetPosition.z = mouse.y * 10 + 20; // Zachowaj podstawową odległość
        targetPosition.y = 10 - Math.abs(mouse.y) * 5; // Zmień wysokość w zależności od Y
        
        // Płynna interpolacja
        camera.position.lerp(targetPosition, 0.1);
        camera.lookAt(0, 5, 0); // Patrz na środek sceny (na wysokości drona)
    }
    
    renderer.render(scene, camera);
}

// Responsywność
window.addEventListener('resize', () => {
    camera.aspect = sceneContainer.clientWidth / sceneContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight);
});

animate();
