import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

async function fetchUserData(userId) {
    try {
        const response = await fetch(`http://localhost:4000/api/levels/${userId}`);

        if (!response.ok) {
            throw new Error("Failed to fetch level data");
        }

        const levelData = await response.json();
        //console.log("Fetched level data:", levelData);
        return levelData;
    } catch (error) {
        console.error("Error fetching user level data:", error);
        return null;
    }
}

async function giveUserTokens() {
    let userId = 104864925838491648;
    try {
        // Call the API to increase the user's tokens
        const response = await fetch(`http://localhost:4000/api/levels/tokens/104864925838491648`, {
            method: 'GET', // Since your route is using GET
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Check if the response is successful
        if (!response.ok) {
            throw new Error('Failed to update tokens');
        }

        // Parse the JSON response
        const updatedData = await response.json();
        console.log('Updated token data:', updatedData);

        // Return the updated data to be used elsewhere if needed
        return updatedData;
    } catch (error) {
        console.error('Error updating user tokens:', error);
        return null;
    }
}


window.handleUserLogin = async function () {
    const userId = document.getElementById('userIdInput').value.trim();
    console.log("User ID:", userId);

    if (!userId) {
        alert("Please enter a valid User ID.");
        return;
    }

    console.log("Fetching data for User ID:", userId);
    const levelData = await fetchUserData(userId);

    if (levelData) {
        document.getElementById('loginScene').style.display = 'none';
        document.getElementById('gameScene').style.display = 'block';
        createScene(levelData);
    } else {
        alert("User ID not found. Please try again.");
    }
};



function createTextTexture(text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 256;

    // Set text properties
    context.fillStyle = 'white';
    context.font = '30px Arial';
    context.fillText(text, 50, 100);

    // Create texture
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}


let scene, camera, renderer, cube;

// Movement variables
const speed = 0.01;
const movement = { left: false, right: false, up: false, down: false };

export async function createScene(levelData) {

    // Scene setup
    scene = new THREE.Scene();

    // Camera setup
    camera = new THREE.PerspectiveCamera(110, window.innerWidth / window.innerHeight, 0.5, 8000);
    camera.position.set(0, 5, 0);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);



    //const levelData = await fetchUserData();

    // Default text if no data found
    let displayText = "User Data Not Found";

    if (levelData) {
        displayText = `User: ${levelData.token}`;
    }

    // Create a plane (ground)
    const textTexture = createTextTexture(displayText);

    const planeGeometry = new THREE.PlaneGeometry(10, 10);
    const planeMaterial = new THREE.MeshBasicMaterial({ map: textTexture, transparent: true });
    //const tokenText = new THREE.TextGeometry('text', parameters);
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2; // Rotate to be flat
    scene.add(plane);

    // Create a cube (player)
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.y = 0.5; // Raise it slightly above the plane
    scene.add(cube);

    // Event listeners for movement
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    animate();
}

// Handle key press
function onKeyDown(event) {
    switch (event.key) {
        case 'ArrowLeft':
        case 'a':
            movement.left = true;
            break;
        case 'ArrowRight':
        case 'd':
            movement.right = true;
            break;
        case 'ArrowUp':
        case 'w':
            movement.up = true;
            break;
        case 'ArrowDown':
        case 's':
            movement.down = true;
            break;
        case 't':
            giveUserTokens()
            console.log("gave user tokens")
            break;
    }
}

// Handle key release
function onKeyUp(event) {
    switch (event.key) {
        case 'ArrowLeft':
        case 'a':
            movement.left = false;
            break;
        case 'ArrowRight':
        case 'd':
            movement.right = false;
            break;
        case 'ArrowUp':
        case 'w':
            movement.up = false;
            break;
        case 'ArrowDown':
        case 's':
            movement.down = false;
            break;
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Move cube based on key press
    if (movement.left) cube.position.x -= speed;
    if (movement.right) cube.position.x += speed;
    if (movement.up) cube.position.z -= speed;
    if (movement.down) cube.position.z += speed;

    renderer.render(scene, camera);
}


