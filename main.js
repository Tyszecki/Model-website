import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Pobierz kontener sceny
const sceneContainer = document.getElementById('scene-container');
if (!sceneContainer) {
  console.error('Kontener sceny (#scene-container) nie został znaleziony!');
} else {
  console.log('Kontener sceny został znaleziony.');
}

// Utwórz renderer i podłącz go do kontenera
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight);
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
sceneContainer.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, sceneContainer.clientWidth / sceneContainer.clientHeight, 1, 1000);
camera.position.set(10, 10, 10);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 1;
controls.maxDistance = Infinity;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI;
controls.autoRotate = false;
controls.target = new THREE.Vector3(0, 1, 0);
controls.update();

// Dodaj płaszczyznę z teksturą logo (znacznie niżej)
const textureLoader = new THREE.TextureLoader();
textureLoader.load('images/logo_shad_bckg.png', function(texture) {
    const planeGeometry = new THREE.PlaneGeometry(30, 30); // Nieco większa płaszczyzna
    const planeMaterial = new THREE.MeshStandardMaterial({ 
        map: texture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
        roughness: 0.7,
        metalness: 0.1
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -20; // Bardzo nisko - jak w logo Batmana
    plane.receiveShadow = true;
    scene.add(plane);
});

const spotLight = new THREE.SpotLight(0xffffff, 3000, 100, 0.22, 1);
spotLight.position.set(0, 25, 0);
spotLight.castShadow = true;
spotLight.shadow.bias = -0.0001;
scene.add(spotLight);

const bottomLight = new THREE.SpotLight(0xffffff, 1000, 100, 0.22, 1);
bottomLight.position.set(0, -10, 0);
bottomLight.castShadow = true;
scene.add(bottomLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const loader = new GLTFLoader();
loader.setPath('public/millennium_falcon/');
loader.load('dron.glb', (gltf) => {
  console.log('Model załadowany pomyślnie!');

  const model = gltf.scene;
  model.position.set(0, 0, 0);
  model.rotation.set(0, 0, 0);
  model.scale.set(1, 1, 1);

  const bbox = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  bbox.getSize(size);
  console.log('Rozmiar modelu przed skalowaniem:', size);

  const targetSize = 2;
  const maxDimension = Math.max(size.x, size.y, size.z);
  const scale = (targetSize / maxDimension) * 5;
  model.scale.set(scale, scale, scale);

  bbox.setFromObject(model);
  bbox.getSize(size);
  console.log('Nowy rozmiar modelu:', size);

  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      child.material = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        side: THREE.DoubleSide
      });
    }
  });

  model.position.set(0, 2.0, -1);
  scene.add(model);

  console.log('Model:', model);
  console.log('Pozycja modelu:', model.position);
  console.log('Skala modelu:', model.scale);

  document.getElementById('progress-container').style.display = 'none';
}, (xhr) => {
  console.log(`Postęp ładowania: ${(xhr.loaded / xhr.total * 100).toFixed(2)}%`);
}, (error) => {
  console.error('Błąd podczas ładowania modelu:', error);
});

window.addEventListener('resize', () => {
  camera.aspect = sceneContainer.clientWidth / sceneContainer.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
