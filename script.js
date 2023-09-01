// Import Three.js
import * as THREE from 'https://threejs.org/build/three.module.js';

// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(800, 600);
document.getElementById('3d-container').appendChild(renderer.domElement);

// Initialize bin dimensions
const binWidth = 10, binHeight = 10, binDepth = 10;

// Create walls for the bin
const binMaterial = new THREE.MeshBasicMaterial({ 
  color: 0x00ff00, 
  wireframe: false,
  opacity: 0.5,
  transparent: true,
  side: THREE.DoubleSide });
const walls = ['left', 'right', 'bottom', 'top', 'back'];

walls.forEach(wall => {
  let geometry;
  switch (wall) {
    case 'left': geometry = new THREE.PlaneGeometry(binDepth, binHeight); break;
    case 'right': geometry = new THREE.PlaneGeometry(binDepth, binHeight); break;
    case 'bottom': geometry = new THREE.PlaneGeometry(binWidth, binDepth); break;
    case 'top': geometry = new THREE.PlaneGeometry(binWidth, binDepth); break;
    case 'back': geometry = new THREE.PlaneGeometry(binWidth, binHeight); break;
  }
  const mesh = new THREE.Mesh(geometry, binMaterial);
  switch (wall) {
    case 'left': mesh.position.set(0, binHeight / 2, binDepth / 2); mesh.rotation.y = Math.PI / 2; break;
    case 'right': mesh.position.set(binWidth, binHeight / 2, binDepth / 2); mesh.rotation.y = -Math.PI / 2; break;
    case 'bottom': mesh.position.set(binWidth / 2, 0, binDepth / 2); mesh.rotation.x = Math.PI / 2; break;
    case 'top': mesh.position.set(binWidth / 2, binHeight, binDepth / 2); mesh.rotation.x = -Math.PI / 2; break;
    case 'back': mesh.position.set(binWidth / 2, binHeight / 2, 0); break;
  }
  scene.add(mesh);
});

// Camera position
camera.position.z = 20;

// Initialize empty spaces in the bin
let emptySpaces = [
  {
    x: 0, y: 0, z: 0,
    width: binWidth, height: binHeight, depth: binDepth
  }
];

// Render loop
let speed = 0.01; // Default speed value
let angle = 0; // Initialize angle

document.getElementById('speedSlider').addEventListener('input', function(e) {
  const sliderValue = e.target.value;
  speed = sliderValue / 5000; // Adjust the divisor for your own speed scaling
});

function animate() {
  requestAnimationFrame(animate);

  // Animate the camera
  angle += speed; // Here we use the speed variable instead of a fixed value
  camera.position.x = 20 * Math.sin(angle);
  camera.position.z = 20 * Math.cos(angle);
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
}

animate();

// Function to add an item
function addItem() {
  const width = parseFloat(document.getElementById('width').value);
  const height = parseFloat(document.getElementById('height').value);
  const depth = parseFloat(document.getElementById('depth').value);

  // Generate a random color
  const randomColor = new THREE.Color(Math.random(), Math.random(), Math.random());

  // Sort emptySpaces by y, then x, then z
  emptySpaces.sort((a, b) => a.y - b.y || a.x - b.x || a.z - b.z);

  // Try to find a suitable empty space for the item
  let bestFitIndex = -1;
  let bestFit = null;
  for (let i = 0; i < emptySpaces.length; i++) {
    const space = emptySpaces[i];
    if (space.width >= width && space.height >= height && space.depth >= depth) {
      bestFitIndex = i;
      bestFit = space;
      break;
    }
  }

  if (bestFit === null) {
    alert("No space left for this item!");
    return;
  }

  // Create a new item and place it in the space
  const epsilon = 0.01; // Small value to prevent Z-fighting
  const actualWidth = width;
  const actualDepth = depth;
  const itemGeometry = new THREE.BoxGeometry(actualWidth - epsilon, height - epsilon, actualDepth - epsilon);
  const itemMaterial = new THREE.MeshBasicMaterial({ color: randomColor });
  const item = new THREE.Mesh(itemGeometry, itemMaterial);
  item.position.set(
    bestFit.x + actualWidth / 2,
    bestFit.y + height / 2,
    bestFit.z + actualDepth / 2
  );

  // Add item to the scene
  scene.add(item);

  // Update the empty spaces
  emptySpaces.splice(bestFitIndex, 1);

  // Add new empty spaces
  if (bestFit.x + width < binWidth) {
    emptySpaces.push({
      x: bestFit.x + width,
      y: bestFit.y,
      z: bestFit.z,
      width: binWidth - (bestFit.x + width),
      height: height,
      depth: depth
    });
  }

  if (bestFit.y + height < binHeight) {
    emptySpaces.push({
      x: bestFit.x,
      y: bestFit.y + height,
      z: bestFit.z,
      width: width,
      height: binHeight - (bestFit.y + height),
      depth: depth
    });
  }

  if (bestFit.z + depth < binDepth) {
    emptySpaces.push({
      x: bestFit.x,
      y: bestFit.y,
      z: bestFit.z + depth,
      width: width,
      height: height,
      depth: binDepth - (bestFit.z + depth)
    });
  }
}

// Attach event listener
document.addEventListener('DOMContentLoaded', (event) => {
  document.getElementById('addItemButton').addEventListener('click', addItem);
});
