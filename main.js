import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(10, 10, 10); // Dostosuj pozycję kamery

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 5;
controls.maxDistance = 20;
controls.minPolarAngle = 0; // Pełny obrót wokół osi Y (od dołu)
controls.maxPolarAngle = Math.PI; // Pełny obrót wokół osi Y (od góry)
controls.autoRotate = false;
controls.target = new THREE.Vector3(0, 1, 0);
controls.update();

const spotLight = new THREE.SpotLight(0xffffff, 3000, 100, 0.22, 1);
spotLight.position.set(0, 25, 0);
spotLight.castShadow = true;
spotLight.shadow.bias = -0.0001;
scene.add(spotLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Dodaj światło otoczenia
scene.add(ambientLight);

const loader = new GLTFLoader();
loader.setPath('public/millennium_falcon/');
loader.load('dron.glb', (gltf) => {
  console.log('Model załadowany pomyślnie!');

  const model = gltf.scene;

  // Zresetuj transformacje modelu (na wszelki wypadek)
  model.position.set(0, 0, 0);
  model.rotation.set(0, 0, 0);
  model.scale.set(1, 1, 1);

  // Debugowanie: Wyświetl rozmiar modelu
  const bbox = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  bbox.getSize(size);
  console.log('Rozmiar modelu przed skalowaniem:', size);

  // Wymuś skalowanie modelu
  const targetSize = 2; // Docelowy rozmiar (np. 2 jednostki)
  const maxDimension = Math.max(size.x, size.y, size.z);
  const scale = (targetSize / maxDimension) * 5; // Powiększ 5-krotnie
  model.scale.set(scale, scale, scale);

  // Debugowanie: Wyświetl nowy rozmiar modelu
  bbox.setFromObject(model);
  bbox.getSize(size);
  console.log('Nowy rozmiar modelu:', size);

  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      child.material = new THREE.MeshStandardMaterial({ color: 0xffffff }); // Tymczasowy materiał
    }
  });

  model.position.set(0, 1.05, -1); // Ustaw pozycję modelu
  scene.add(model);

  console.log('Model:', model); // Debugowanie: model
  console.log('Pozycja modelu:', model.position); // Debugowanie: pozycja modelu
  console.log('Skala modelu:', model.scale); // Debugowanie: skala modelu

  document.getElementById('progress-container').style.display = 'none';
}, (xhr) => {
  console.log(`Postęp ładowania: ${(xhr.loaded / xhr.total * 100).toFixed(2)}%`);
}, (error) => {
  console.error('Błąd podczas ładowania modelu:', error);
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
