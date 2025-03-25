import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Inicjalizacja sceny
const sceneContainer = document.getElementById('scene-container');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight);
renderer.setClearColor(0x000000);
renderer.shadowMap.enabled = true;
sceneContainer.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, sceneContainer.clientWidth / sceneContainer.clientHeight, 0.1, 1000);
camera.position.set(10, 10, 10);

// Kontrola kamery
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 5;
controls.maxDistance = 50;

// Dodanie płaszczyzny z logo
const textureLoader = new THREE.TextureLoader();
textureLoader.load('public/logo_shad_bckg.png', (texture) => {
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    
    const planeGeometry = new THREE.PlaneGeometry(50, 50);
    const planeMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide
    });
    
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -30; // Głębokość -30 jednostek
    plane.receiveShadow = true;
    
    // Upewnij się, że płaszczyzna jest renderowana
    plane.renderOrder = -1; 
    scene.add(plane);
    
    console.log('Płaszczyzna z logo dodana na pozycji Y:', plane.position.y);
});

// Oświetlenie
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
    
    // Skalowanie i pozycjonowanie modelu
    model.scale.set(5, 5, 5);
    model.position.y = 5;
    model.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
        }
    });
    
    scene.add(model);
    document.getElementById('progress-container').style.display = 'none';
    
    // Debugowanie pozycji
    console.log('Model na pozycji Y:', model.position.y);
    console.log('Rozpiętość sceny:', {
        minY: -30, // Pozycja płaszczyzny
        maxY: 15   // Pozycja modelu + światła
    });
}, undefined, (error) => {
    console.error('Błąd ładowania modelu:', error);
});

// Funkcja renderująca
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Obsługa zmiany rozmiaru
window.addEventListener('resize', () => {
    camera.aspect = sceneContainer.clientWidth / sceneContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight);
});

animate();
