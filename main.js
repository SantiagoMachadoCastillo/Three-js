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




// CONFIGURACIÓN
const columnas = 3;
const filas = 3;
const capas = 2;

const espacio = 1.4;

// GRUPO
const grupo = new THREE.Group();

// CREAR LOS 18 CUBOS
for (let z = 0; z < capas; z++) {
  for (let y = 0; y < filas; y++) {
    for (let x = 0; x < columnas; x++) {

      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(
          Math.random(),
          Math.random(),
          Math.random()
        )
      });

      const cube = new THREE.Mesh(geometry, material);

      cube.position.x = (x - 1) * espacio;
      cube.position.y = (y - 1) * espacio;
      cube.position.z = (z - 0.5) * espacio;

      grupo.add(cube); 

    }
  }   
}

scene.add(grupo);
// white spotlight shining from the side, modulated by a texture
const pointLight = new THREE.PointLight(  );
pointLight.color.setHSL(0.0, 1.0, 0.75);
pointLight.intensity = 20;
pointLight.distance = 10;
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
  pointLight.position.x = Math.sin( time / 1000 ) * 2;
  controls.update();


  //cube.rotation.x = time / 2000;
  //cube.rotation.y = time / 1000;

  renderer.render( scene, camera );

}