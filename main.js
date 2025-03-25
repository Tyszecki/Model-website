import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Inicjalizacja sceny
const sceneContainer = document.getElementById('scene-container');
const renderer = new THREE.WebGLRenderer({ 
    antialias: true
});
renderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight);
renderer.setClearColor(0x000000);
renderer.shadowMap.enabled = true;
sceneContainer.appendChild(renderer.domElement);

const scene = new THREE.Scene();

// Kamera
const camera = new THREE.PerspectiveCamera(45, sceneContainer.clientWidth / sceneContainer.clientHeight, 0.1, 1000);
camera.position.set(0, 10, 30);

// Kontrola kamery
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
const zoomSpeed = 0.02;
let zoomLevel = 30;
const minZoom = 10;
const maxZoom = 50;

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
        opacity: 0.9 // Lekko przezroczysta dla lepszego efektu podświetlenia
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = 0;
    plane.receiveShadow = true;
    scene.add(plane);

    // Podświetlenie od dołu płaszczyzny
    const underLight = new THREE.PointLight(0xffffff, 1, 10);
    underLight.position.set(0, -2, 0); // 2 jednostki pod płaszczyzną
    underLight.castShadow = true;
    scene.add(underLight);

    // Dodatkowe miękkie światło rozproszone od dołu
    const underAmbient = new THREE.AmbientLight(0x404040);
    underAmbient.position.set(0, -5, 0);
    scene.add(underAmbient);

    console.log('Pomniejszona płaszczyzna z logo i podświetleniem została dodana');
}, undefined, (error) => {
    console.error('Błąd ładowania tekstury:', error);
});

// Oświetlenie główne
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

// Pozostała część kodu (obsługa myszy, zoom, animacja itd.) pozostaje bez zmian
// ... [tu wklej pozostałą część poprzedniego kodu] ...

animate();
