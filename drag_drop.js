import * as THREE from 'three'; // Core Three.js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';


let USERID = 0

async function fetchUserData(userId) {
    try {
        const response = await fetch(`http://localhost:4000/api/levels/${userId}`);
        USERID = userId
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

async function updateWorkerAssignment(workerId, currentJob) {
    try {
        const response = await fetch(`http://localhost:4000/api/workers/${USERID}/${workerId}`, {
            method: 'PUT', // Use PUT for updating
            headers: {
                'Content-Type': 'application/json', // Specify JSON content
            },
            body: JSON.stringify({ current_job: currentJob }), // Send the current job in the body
        });

        if (!response.ok) {
            throw new Error("Failed to update worker assignment");
        }

        const updatedWorker = await response.json();
        console.log("Worker assignment updated successfully:", updatedWorker);
        return updatedWorker;
    } catch (error) {
        console.error("Error updating worker assignment:", error);
        return null;
    }
}


async function fetchUserWorkerData(userId) {
    try {
        const response = await fetch(`http://localhost:4000/api/levels/workers/${userId}`);
        USERID = userId
        if (!response.ok) {
            throw new Error("Failed to fetch level data");
        }

        const workerData = await response.json();
        //console.log("Fetched level data:", levelData);
        return workerData;
    } catch (error) {
        console.error("Error fetching user worker data:", error);
        return null;
    }
}

window.handleUserLogin = async function () {
    const userId = document.getElementById('userIdInput').value.trim();
    if (!userId) {
        alert("Please enter a valid User ID.");
        return;
    }

    const levelData = await fetchUserData(userId);
    const workerData = await fetchUserWorkerData(userId);
    if (levelData) {
        document.getElementById('loginScene').style.display = 'none';
        document.getElementById('gameScene').style.display = 'block';
        createScene(levelData, workerData);
    } else {
        alert("User ID not found. Please try again.");
    }
};

export function createScene(levelData, workerData) {
    // Instantiate a loader
    const loader = new GLTFLoader();

    // Optional: Provide a DRACOLoader instance to decode compressed mesh data
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/public/scene.gltf');
    loader.setDRACOLoader(dracoLoader);


    // 🌎 Setup Three.js Scene
    let scene = new THREE.Scene();
    let camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 100);
    camera.position.set(0, 20, 0); // Top-down view
    camera.lookAt(0, 0, 0);

    let renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth - 150, window.innerHeight);
    document.getElementById("gameScene").appendChild(renderer.domElement);

    // 🖱️ Orbit Controls (Allow panning)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableRotate = false;
    controls.enableZoom = true;

    // 🔲 Create Floor Grid
    //let gridHelper = new THREE.GridHelper(20, 20);
    //scene.add(gridHelper);
    const textureLoader1 = new THREE.TextureLoader();
    const groundTexture = textureLoader1.load('./bookmap2.jpg'); // Replace with the path to your JPG file
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(1, 1); // Adjust the repeat values if needed

    // Create a plane for the ground
    const groundMaterial = new THREE.MeshStandardMaterial({ map: groundTexture });
    const groundGeometry = new THREE.PlaneGeometry(50, 50); // Adjust size as needed
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2; // Rotate to make it horizontal
    ground.position.y = 0; // Position it at ground level
    scene.add(ground);

    // Load a glTF resource
    // loader.load('/scene.gltf',
    // 	// called when the resource is loaded
    // 	function ( gltf ) {

    // 		scene.add( gltf.scene );
    //         gltf.scene.position.set(0, 0, 10); // Adjust position if needed
    //         gltf.scene.scale.set(0.01, 0.01, 0.01); // Adjust scale if needed
    //         //console.log("GLTF loaded successfully:", gltf);
    //         //rotate
    //         gltf.scene.rotation.z = Math.PI/2; // Rotate the model 180 degrees around the Y-axis
    //         gltf.scene.rotation.y = -90 * Math.PI / 180; // Rotate the model 90 degrees around the Y-axis


    // 	},
    // 	// called while loading is progressing
    // 	function ( xhr ) {

    // 		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

    // 	},
    // 	// called when loading has errors
    // 	function ( error ) {

    // 		console.log( 'An error happened' );

    // 	}
    // );

    // ✅ Drop Zone Setup
    function createDropZone(x, z, color) {
        let dropZoneGeometry = new THREE.PlaneGeometry(8, 6.5);
        let dropZoneMaterial = new THREE.MeshBasicMaterial({ color: color, opacity: 0.5, transparent: true });
        let dropZone = new THREE.Mesh(dropZoneGeometry, dropZoneMaterial);
        dropZone.rotation.x = -Math.PI / 2;
        dropZone.position.set(x, 0.01, z);
        scene.add(dropZone);
        return dropZone;
    }

    let dropZoneLeft = createDropZone(3, -15, 0xff0000);
    let dropZoneMiddle = createDropZone(7, 5, 0x00ff00);
    let dropZoneRight = createDropZone(10, -8, 0x0000ff);

    let objects = [];
    const textureLoader = new THREE.TextureLoader();
    function createTextLabel(text, position) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const size = 256;
        canvas.width = size;
        canvas.height = size;

        ctx.fillStyle = "white";
        ctx.font = "bold 48px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, size / 2, size / 2);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture, transparent: true });

        const sprite = new THREE.Sprite(material);
        sprite.scale.set(2, 1, 1);
        sprite.position.copy(position).add(new THREE.Vector3(0, 1.5, 0)); // Offset above the cube

        return sprite;
    }



    async function drawGreenSquares(userId, workerData) {
        console.log(workerData); // Debugging

        if (workerData) {
            let i = 0;

            for (const worker of workerData) {
                let texture = textureLoader.load(`/${worker.image ?? "miner_1.jpg"}`);

                // Create cube
                let cube = new THREE.Mesh(
                    new THREE.BoxGeometry(2, 2, 2),
                    new THREE.MeshBasicMaterial({ map: texture })
                );

                // Correct position calculations
                let posX = (i % 5) * 2 - 5;
                let posZ = Math.floor(i / 5) * 2 - 5;
                cube.position.set(posX, 0.5, posZ);
                cube.userData.id = `${worker.workerId}`;

                scene.add(cube);
                objects.push(cube);

                // Create text label and attach to cube
                //let label = createTextLabel(`Cube ${i + 1}`);
                //label.position.set(0, 1.5, 0); // Position relative to cube
                //cube.add(label); // Attach label to cube
                // Usage in drawGreenSquares:
                const label = createTextLabel(`Cube ${i + 1}`, cube.position);
                scene.add(label);


                i++; // Move this to the end of the loop
            }

            setupDragControls();
        } else {
            console.error("workerData.workers is not an array or is undefined");
        }
    }






    function getDropZoneCategory(cube) {
        let zones = [
            { name: "mine", zone: dropZoneLeft },
            { name: "farm", zone: dropZoneMiddle },
            { name: "wood", zone: dropZoneRight }
        ];
        for (let zone of zones) {
            let bounds = {
                minX: zone.zone.position.x - 2.5,
                maxX: zone.zone.position.x + 2.5,
                minZ: zone.zone.position.z - 2.5,
                maxZ: zone.zone.position.z + 2.5
            };
            if (
                cube.position.x >= bounds.minX &&
                cube.position.x <= bounds.maxX &&
                cube.position.z >= bounds.minZ &&
                cube.position.z <= bounds.maxZ
            ) {
                return zone.name;
            }
        }
        return null;
    }

    function setupDragControls() {
        const dragControls = new DragControls(objects, camera, renderer.domElement);

        dragControls.addEventListener("dragstart", (event) => {
            // Prevent dragging text labels
            if (event.object instanceof THREE.Sprite) return;

            controls.enabled = false;
        });

        dragControls.addEventListener("dragend", (event) => {
            controls.enabled = true;
            let cube = event.object;

            // Ensure it's not a text label
            if (cube instanceof THREE.Sprite) return;

            let dropZoneCategory = getDropZoneCategory(cube);
            if (dropZoneCategory) {
                console.log(`✅ Cube ${cube.userData.id} dropped in ${dropZoneCategory} zone`);
                updateWorkerAssignment(cube.userData.id, dropZoneCategory);
                scene.remove(cube);
            }
        });
    }


    scene.add(new THREE.AmbientLight(0xffffff, 2));
    drawGreenSquares(levelData.userId, workerData);

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener("resize", () => {
        renderer.setSize(window.innerWidth - 150, window.innerHeight);
    });
}



