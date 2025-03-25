import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Inicjalizacja sceny
const sceneContainer = document.getElementById('scene-container');
const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    powerPreference: "high-performance"
});
renderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight);
renderer.setClearColor(0x000000); // Czarne tło
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
sceneContainer.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x00ff00, 0.002); // Zielona mgiełka

// Kamera
const camera = new THREE.PerspectiveCamera(45, sceneContainer.clientWidth / sceneContainer.clientHeight, 0.1, 1000);
camera.position.set(0, 5, 20);

// Kontrola ruchu kamery
const mouse = new THREE.Vector2();
const targetRotation = { x: 0, y: 0 };
const currentRotation = { x: 0, y: 0 };
const sensitivity = 0.005;
const radius = 20;

// Obsługa myszy
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    targetRotation.x = mouse.y * Math.PI * 0.25;
    targetRotation.y = mouse.x * Math.PI;
}

window.addEventListener('mousemove', onMouseMove, false);

// Efekt zielonej poświaty
const greenGlow = new THREE.AmbientLight(0x00ff88, 0.5);
scene.add(greenGlow);

const spotLight = new THREE.SpotLight(0x00ffaa, 2, 100, Math.PI/4, 1);
spotLight.position.set(0, 15, 10);
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
scene.add(spotLight);

// Płaszczyzna podłogi z zielonym odbiciem
const floorGeometry = new THREE.PlaneGeometry(100, 100);
const floorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x111111,
    metalness: 0.9,
    roughness: 0.1,
    envMapIntensity: 1
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Ładowanie modelu drona
const loader = new GLTFLoader();
loader.load('public/millennium_falcon/dron.glb', (gltf) => {
    const model = gltf.scene;
    model.scale.set(5, 5, 5);
    model.position.y = 3;
    model.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.material.emissive = new THREE.Color(0x003300);
            child.material.emissiveIntensity = 0.3;
        }
    });
    scene.add(model);
    document.getElementById('progress-container').style.display = 'none';
});

// Animacja
function animate() {
    requestAnimationFrame(animate);
    
    // Płynne śledzenie kursora
    currentRotation.x += (targetRotation.x - currentRotation.x) * 0.1;
    currentRotation.y += (targetRotation.y - currentRotation.y) * 0.1;
    
    camera.position.x = radius * Math.sin(currentRotation.y) * Math.cos(currentRotation.x);
    camera.position.y = radius * Math.sin(currentRotation.x);
    camera.position.z = radius * Math.cos(currentRotation.y) * Math.cos(currentRotation.x);
    
    camera.lookAt(0, 3, 0);
    
    renderer.render(scene, camera);
}

// Responsywność
window.addEventListener('resize', () => {
    camera.aspect = sceneContainer.clientWidth / sceneContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight);
});

animate();
