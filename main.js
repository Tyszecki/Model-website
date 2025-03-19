import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

// Tworzenie sceny, kamery i renderera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

// Dodanie renderera do strony
document.getElementById('scene-container').appendChild(renderer.domElement);

// Dodanie światła
const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(10, 10, 10);
scene.add(light);

// Tworzenie loadera dla pliku .obj
const loader = new OBJLoader();

// Załadowanie pliku .obj (upewnij się, że ścieżka do pliku jest poprawna)
loader.load('path/to/your/dron.obj', (object) => {
  // Dodanie obiektu do sceny
  scene.add(object);
  object.scale.set(0.5, 0.5, 0.5); // Zmiana skali obiektu, jeśli jest potrzebna
  object.position.set(0, -1, 0); // Przesunięcie obiektu, jeśli to konieczne
});

// Ustawienie pozycji kamery
camera.position.z = 5;

// Funkcja animacji
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
