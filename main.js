// Use the browser-ready ES module build of three.js from a CDN
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x111111 );
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );
const controls = new OrbitControls( camera, renderer.domElement );

const geometry = new THREE.BoxGeometry( 1, 1, 1 );




// CONFIGURACIÓN: un único cubo centrado (material estrictamente verde)
const material = new THREE.MeshStandardMaterial({
  color: 0x00ff00
});

const cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 0, 0);
scene.add(cube);

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
// white spotlight shining from the side, modulated by a texture
const pointLight = new THREE.PointLight(  );
pointLight.color.setHSL(0.0, 1.0, 0.75);
pointLight.intensity = 50;
pointLight.distance = 50;
pointLight.angle = Math.PI / 8;
pointLight.position.set( 2, 3, 0 );
scene.add( pointLight );

const pointLightHelper = new THREE.PointLightHelper( pointLight );
scene.add( pointLightHelper );


const spotLight = new THREE.SpotLight(  );
spotLight.color.setHSL(0.0, 1.0, 0.75);
spotLight.intensity = 20;
spotLight.distance = 10;
spotLight.angle = Math.PI / 8;
spotLight.position.set( 2, 10, 0 );
scene.add( spotLight );

const spotLightHelper = new THREE.SpotLightHelper( spotLight );
scene.add( spotLightHelper );


camera.position.z = 5;
camera.position.y = 5;

function animate( time ) {


  pointLightHelper.update();
  spotLightHelper.update();
  // calcular delta de tiempo
  if ( _prevTime === 0 ) _prevTime = time;
  const delta = ( time - _prevTime ) / 1000;
  _prevTime = time;

  // movimiento hacia donde mira el cubo (eje local Z)
  const velocity = moveSpeed * delta;
  if ( movement.forward ) cube.translateZ( -velocity );
  if ( movement.back ) cube.translateZ( velocity );

  controls.update();


  //cube.rotation.x = time / 2000;
  //cube.rotation.y = time / 1000;

  renderer.render( scene, camera );

}