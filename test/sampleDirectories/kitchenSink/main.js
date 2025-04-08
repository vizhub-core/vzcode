import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Configuration object for tweakable parameters
const config = {
  sphere: {
    radius: 0.4,
    segments: 32,
    spacing: 1.2,
  },
  cube: {
    size: 4, // number of spheres per side
    offset: 1.5, // centering offset
  },
  camera: {
    minDistance: 5,
    maxDistance: 30,
    initialZ: 7,
  },
};

// Set up the scene, camera, and renderer
const container = document.getElementById('container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000005);
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
const renderer = new THREE.WebGLRenderer({
  antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// Simple lighting setup
const light = new THREE.DirectionalLight(0xffffff, 3);
light.position.set(1, 1, 1);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Create cube of spheres
function createSphereCube() {
  const sphereGroup = new THREE.Group();
  const sphereGeometry = new THREE.SphereGeometry(
    config.sphere.radius,
    config.sphere.segments,
    config.sphere.segments,
  );

  for (let x = 0; x < config.cube.size; x++) {
    for (let y = 0; y < config.cube.size; y++) {
      for (let z = 0; z < config.cube.size; z++) {
        const material = new THREE.MeshPhongMaterial({
          color: new THREE.Color().setHSL(
            (x + y + z) / (config.cube.size * 3),
            1.0,
            0.5,
          ),
        });

        const sphere = new THREE.Mesh(
          sphereGeometry,
          material,
        );
        sphere.position.set(
          (x - config.cube.offset) * config.sphere.spacing,
          (y - config.cube.offset) * config.sphere.spacing,
          (z - config.cube.offset) * config.sphere.spacing,
        );
        sphereGroup.add(sphere);
      }
    }
  }

  return sphereGroup;
}

const sphereCube = createSphereCube();
scene.add(sphereCube);

// Add orbit controls
const controls = new OrbitControls(
  camera,
  renderer.domElement,
);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = config.camera.minDistance;
controls.maxDistance = config.camera.maxDistance;

// Position camera
camera.position.z = config.camera.initialZ;

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  sphereCube.rotation.x += 0.001;
  sphereCube.rotation.y += 0.002;
  renderer.render(scene, camera);
}

animate();
