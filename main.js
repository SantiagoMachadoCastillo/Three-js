// Use the browser-ready ES module build of three.js from a CDN
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x007FFF);
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
// Habilitar sombras
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild( renderer.domElement );
const cameraOffset = new THREE.Vector3(
0,
4,
8
);
const loader = new THREE.TextureLoader();

const geometry = new THREE.BoxGeometry( 0.5, 0.5, 0.5 );




// CONFIGURACIÓN: un único cubo centrado (material estrictamente verde)
const material = new THREE.MeshStandardMaterial({
  color: 0x00ff00
});

const cube = new THREE.Mesh(geometry, material);
cube.position.set(13, 0.25, 17);
cube.rotation.y = Math.PI/2; // girar 180° para que mire hacia el inicio
cube.castShadow = true; // el cubo proyecta sombras
scene.add(cube);

// BASE DE CUBOS
// ==========================

const mapWidth = 80;
const mapHeight = 45;

for(let x = 0; x < mapWidth; x++) {
    for(let z = 0; z < mapHeight; z++) {

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
const movement = { forward: false, back: false };
const moveSpeed = 5; // unidades por segundo
const turnAngle = 2 * Math.PI / 180; // 2° en radianes
let _prevTime = 0;

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
      if ( isDown ) {
        cube.rotation.y += turnAngle;
      }
      event.preventDefault();
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      if ( isDown ) {
        cube.rotation.y -= turnAngle;
      }
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

  // movimiento hacia donde mira el cubo (eje local Z)
  const velocity = moveSpeed * delta;
  if ( movement.forward ) cube.translateZ( -velocity );
  if ( movement.back ) cube.translateZ( velocity );

  const desiredCameraPosition =
    cameraOffset.clone()
    .applyQuaternion(cube.quaternion)
    .add(cube.position);

camera.position.lerp(
    desiredCameraPosition,
    0.08
);

camera.lookAt(
    cube.position.x,
    cube.position.y + 0.5,
    cube.position.z
); 



  //cube.rotation.x = time / 2000;
  //cube.rotation.y = time / 1000;

  renderer.render( scene, camera );

}