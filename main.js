// Use the browser-ready ES module build of three.js from a CDN
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { GUI } from 'https://cdn.jsdelivr.net/npm/dat.gui@0.7.9/build/dat.gui.module.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x007FFF);
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
// Habilitar sombras
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls( camera, renderer.domElement );
const cameraOffset = new THREE.Vector3(
0,
4,
8
);
const loader = new THREE.TextureLoader();
const fbxLoader = new FBXLoader();
const gui = new GUI();
const carMaterials = [];
const carBaseColor = 0x000000;

function createCarMaterial( color = carBaseColor ) {
  return new THREE.MeshStandardMaterial({
    color,
    transparent: false,
    opacity: 1,
    depthWrite: true
  });
}

// OBJETO CONTROLADO: el modelo FBX ocupa la posición del cubo
const cube = new THREE.Group();
cube.position.set(13, 0.25, 17);
cube.rotation.y = Math.PI / 2 + Math.PI;
scene.add(cube);

fbxLoader.load(
  'car.fbx',
  (object) => {
    object.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (Array.isArray(child.material)) {
          child.material = child.material.map(() => {
            const material = createCarMaterial();
            carMaterials.push(material);
            return material;
          });
        } else {
          const material = createCarMaterial();
          carMaterials.push(material);
          child.material = material;
        }
      }
    });

    object.updateMatrixWorld(true);

    const boundingBox = new THREE.Box3().setFromObject(object);
    const size = new THREE.Vector3();
    boundingBox.getSize(size);

    const maxDimension = Math.max(size.x, size.y, size.z) || 1;
    const targetSize = 0.5;
    const scale = targetSize / maxDimension;

    object.scale.setScalar(scale);
    cube.add(object);

    carMaterials.forEach((material, index) => {
      const colorControl = { color: `#${material.color.getHexString()}` };

      gui.addColor(colorControl, 'color')
        .name(`material ${index + 1}`)
        .onChange((value) => {
          material.color.set(value);
        });
    });

    cube.userData.carMaterials = carMaterials;
    cube.userData.setColor = ( color ) => {
      carMaterials.forEach((material) => material.color.set(color));
    };

    window.setCarColor = cube.userData.setColor;
  },
  undefined,
  (error) => {
    console.error('No se pudo cargar car.fbx', error);
  }
);

// BASE DE CUBOS
// ==========================

const mapWidth = 80;
const mapHeight = 45;
const blocksWidth = 0;
const blocksHeight = 0;

for(let x = 0; x < blocksWidth; x++) {
  for(let z = 0; z < blocksHeight; z++) {

        const block = new THREE.Mesh(
            new THREE.BoxGeometry(2,2,2),
            new THREE.MeshStandardMaterial({
                color: 0x6b8e23
            })
        );

        block.position.set(
            x - mapWidth / 2 + 0.5,
            -1,
            z - mapHeight / 2 + 0.5
        );

        block.receiveShadow = true;

        scene.add(block);
    }
}

// ==========================
// IMAGEN DEL CIRCUITO
// ==========================

const trackTexture = loader.load('pista carrera.jpg');

const trackPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(mapWidth, mapHeight),
    new THREE.MeshStandardMaterial({
        map: trackTexture
    })
);

trackPlane.rotation.x = -Math.PI / 2;
trackPlane.position.y = 0.01;
trackPlane.receiveShadow = true;

scene.add(trackPlane);

// Controles de movimiento por teclado (flechas + WASD)
const movement = { forward: false, back: false, left: false, right: false };
const moveSpeed = 5; // unidades por segundo (valor máximo)
const turnAngle = THREE.MathUtils.degToRad(120); // rad/s (120° por segundo)
let _prevTime = 0;

// Estado dinámico y coeficientes de fricción
let speed = 0; // unidades por segundo
const maxSpeed = moveSpeed;
const accelForce = 8; // unidades por segundo^2
const brakeForce = 20; // unidades por segundo^2
const frictionAccel = 0.2; // reduce la aceleración (0..1)
const frictionBrake = 0.6; // aumenta la efectividad del frenado (0..1)
const frictionTurn = 0.3; // reduce la capacidad de giro (0..1)
const rollingFriction = 4.5; // desaceleración por rodamiento cuando no hay input
const minTurnSpeedToSteer = 0.05; // evita girar en parado

function handleKey( event, isDown ) {
  switch ( event.key ) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      movement.forward = isDown;
      event.preventDefault();
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      movement.back = isDown;
      event.preventDefault();
      break;
    case 'ArrowLeft':
    case 'a':
    case 'A':
      movement.left = isDown;
      event.preventDefault();
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      movement.right = isDown;
      event.preventDefault();
      break;
  }
}

window.addEventListener('keydown', (e) => handleKey(e, true));
window.addEventListener('keyup', (e) => handleKey(e, false));
const ambientLight = new THREE.AmbientLight(
0xffffff,
1.2
);

scene.add(ambientLight);

const sun = new THREE.DirectionalLight(
0xffffff,
2
);

sun.position.set(50, 80, 50);

sun.castShadow = true;

sun.shadow.mapSize.width = 4096;
sun.shadow.mapSize.height = 4096;

scene.add(sun);


camera.position.z = 5;
camera.position.y = 5;

renderer.setAnimationLoop( animate );

function animate( time ) {

  // calcular delta de tiempo
  if ( _prevTime === 0 ) _prevTime = time;
  const delta = ( time - _prevTime ) / 1000;
  _prevTime = time;

  controls.update();

  // movimiento hacia donde mira el cubo (con rozamiento y fricción)
  // speed: unidades/segundo, se integra y luego se aplica como desplazamiento
  if ( movement.forward ) {
    speed += accelForce * (1 - frictionAccel) * delta;
  }

  if ( movement.back ) {
    if ( speed > 0 ) {
      // frenar cuando vamos hacia delante
      speed = Math.max(0, speed - brakeForce * (1 + frictionBrake) * delta);
    } else {
      // acelerar en reversa
      speed -= accelForce * (1 - frictionAccel) * delta;
    }
  }

  // rodamiento: perder velocidad cuando no hay input
  if ( !movement.forward && !movement.back ) {
    if ( speed > 0 ) speed = Math.max(0, speed - rollingFriction * delta);
    else speed = Math.min(0, speed + rollingFriction * delta);
  }

  // limitar velocidad
  speed = THREE.MathUtils.clamp(speed, -maxSpeed, maxSpeed);

  // giro con fricción (más fricción = menos giro)
  const turnMultiplier = 1 - frictionTurn;
  if ( Math.abs(speed) > minTurnSpeedToSteer ) {
    if ( movement.left ) cube.rotation.y += turnAngle * turnMultiplier * delta;
    if ( movement.right ) cube.rotation.y -= turnAngle * turnMultiplier * delta;
  }

  // aplicar desplazamiento final (translateZ toma unidades, así que multiplicamos por delta)
  cube.translateZ( speed * delta );

  const desiredCameraPosition =
    cameraOffset.clone()
    .applyQuaternion(cube.quaternion)
    .add(cube.position);

// camera.position.lerp(
//     desiredCameraPosition,
//     0.08
// );

// camera.lookAt(
//     cube.position.x,
//     cube.position.y + 0.5,
//     cube.position.z
// ); 



  //cube.rotation.x = time / 2000;
  //cube.rotation.y = time / 1000;

  renderer.render( scene, camera );

}