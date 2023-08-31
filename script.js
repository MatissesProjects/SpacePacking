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

// Create a mesh for the bin
const binGeometry = new THREE.BoxGeometry(binWidth, binHeight, binDepth);
const binMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
const bin = new THREE.Mesh(binGeometry, binMaterial);

// Add bin to the scene
scene.add(bin);

// Camera position
camera.position.z = 20;

// Last added item
let lastAddedItem = null;

// Render loop
let angle = 0; // initialize angle

function animate() {
  requestAnimationFrame(animate);

  // Animate the camera
  angle += 0.01;
  camera.position.x = 20 * Math.sin(angle);
  camera.position.z = 20 * Math.cos(angle);
  camera.lookAt(0, 0, 0); // Look at the center of the scene

  renderer.render(scene, camera);
}

animate();

// Initialize empty spaces in the bin
let emptySpaces = [
  {
    x: 0, y: 0, z: 0,
    width: binWidth, height: binHeight, depth: binDepth
  }
];

// Function to add an item
function addItem() {
  const width = parseFloat(document.getElementById('width').value);
  const height = parseFloat(document.getElementById('height').value);
  const depth = parseFloat(document.getElementById('depth').value);

  // Generate a random color
  const randomColor = new THREE.Color(Math.random(), Math.random(), Math.random());

  // Sort emptySpaces by y, then x, then z
  emptySpaces.sort((a, b) => a.y - b.y || a.x - b.x || a.z - b.z);

  // Try to find a suitable empty space for the item, including possible rotations
  let bestFitIndex = -1;
  let bestFit = null;
  for (let i = 0; i < emptySpaces.length; i++) {
    const space = emptySpaces[i];
    if (space.width >= width && space.height >= height && space.depth >= depth) {
      bestFit = {
        space,
        rotated: false,
      };
      bestFitIndex = i;
      break;
    } else if (space.width >= depth && space.height >= height && space.depth >= width) {
      bestFit = {
        space,
        rotated: true,
      };
      bestFitIndex = i;
      break;
    }
  }

  if (bestFit === null) {
    alert("No space left for this item!");
    return;
  }

  const { space, rotated } = bestFit;
  const actualWidth = rotated ? depth : width;
  const actualDepth = rotated ? width : depth;

  // Create a new item and place it in the space
  const itemGeometry = new THREE.BoxGeometry(actualWidth, height, actualDepth);
  const itemMaterial = new THREE.MeshBasicMaterial({ color: randomColor });
  const item = new THREE.Mesh(itemGeometry, itemMaterial);
  item.position.set(
    space.x + actualWidth / 2,
    space.y + height / 2,
    space.z + actualDepth / 2
  );

  // Add item to the scene
  scene.add(item);

  // Remove the space that was filled
  emptySpaces.splice(bestFitIndex, 1);

  // Create new empty spaces around the newly placed item
  if (space.x + actualWidth < binWidth) {
    emptySpaces.push({
      x: space.x + actualWidth,
      y: space.y,
      z: space.z,
      width: binWidth - (space.x + actualWidth),
      height: height,
      depth: actualDepth
    });
  }
  if (space.y + height < binHeight) {
    emptySpaces.push({
      x: space.x,
      y: space.y + height,
      z: space.z,
      width: actualWidth,
      height: binHeight - (space.y + height),
      depth: actualDepth
    });
  }
  if (space.z + actualDepth < binDepth) {
    emptySpaces.push({
      x: space.x,
      y: space.y,
      z: space.z + actualDepth,
      width: actualWidth,
      height: height,
      depth: binDepth - (space.z + actualDepth)
    });
  }
}


// Attach event listener
document.addEventListener('DOMContentLoaded', (event) => {
  document.getElementById('addItemButton').addEventListener('click', addItem);
});
