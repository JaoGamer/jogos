import * as THREE from 'three';
const canvas = document.getElementById("canvas")
canvas.style = "position: fixed; top: 0; left: 0; outline: none;"

var width = 480
var height = 270

var leftX = 0
var leftY = 0
var rightX = 0
var rightY = 0

var player1Vel = new THREE.Vector3(0,0,0)
var player2Vel = new THREE.Vector3(0,0,0)

var velocity = new THREE.Vector3(0,0,0)

const gravity = 0.003

var choice = [-1, 1]
var pausa = true

const scene = new THREE.Scene();
scene.background = new THREE.CubeTextureLoader() 	.setPath( 'textures/' ) 	.load( [ 				'1.jpg', 				'1.jpg', 				'1.jpg', 				'1.jpg', 				'1.jpg', 				'1.jpg' 			] );
const camera = new THREE.PerspectiveCamera( 75, width/height, 0.1, 100 );

const renderer = new THREE.WebGLRenderer({canvas});
renderer.setSize( width, height )

const geometry = new THREE.IcosahedronGeometry( 1, 5);
const texture = new THREE.TextureLoader().load( "fone.jpeg" );
const campo = new  THREE.TextureLoader().load( "campo.jpeg" );
const bolaTexture = new  THREE.TextureLoader().load( "bola.jpg" );
const playerTexture = new  THREE.TextureLoader().load( "player.jpg" );
const material = new THREE.MeshBasicMaterial( { 
    map: texture
} );

const sphere = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial( {map: playerTexture} ));
scene.add(sphere)
sphere.position.set(-5,0,0)

const player2 = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial( {map: playerTexture} ));
scene.add(player2)
player2.position.set(5,0,0)

const bolaGeometry = new THREE.IcosahedronGeometry( 0.5, 5);
const bola = new THREE.Mesh(bolaGeometry,new THREE.MeshBasicMaterial( {map: bolaTexture} ));
scene.add(bola)

const sombraGeometry = new THREE.CircleGeometry( 0.5, 32 ); 
const sombraMaterial = new THREE.MeshBasicMaterial( { color: 0x000000 } ); 
sombraMaterial.transparent = true
sombraMaterial.opacity= 0.5
const circle = new THREE.Mesh( sombraGeometry, sombraMaterial ); 
scene.add( circle );
circle.rotation.x = -Math.PI/2
circle.position.y = -0.9

const planeGeometry = new THREE.PlaneGeometry( 20, 10 );
const plane = new THREE.Mesh( planeGeometry,new THREE.MeshBasicMaterial( {map: campo} )); 
scene.add( plane );
plane.rotation.x = -Math.PI/2
plane.position.set(0,-1,0)

camera.position.set(0,8,8)

bola.position.set(0,3,0)
function fullscreen(){ canvas.requestFullScreen()}
function ajeita(){
    width = window.innerWidth
    height = window.innerHeight
    camera.aspect = width/height
    camera.updateProjectionMatrix()
    renderer.setSize( width, height );
}
function toca(e){
    if(pausa){
        pausa = false
        velocity.set(0.09 + Math.random()/1000,0.042+Math.random()/1000,0)
        velocity.x *= choice[Math.floor(Math.random()*2)]
    }
    for(var i = 0; i<e.touches.length;i++){
        if(e.touches[i].clientX < width/8 && e.touches[i].clientY < height /8) bola.position.set(0,8,0)
        if(e.touches[i].clientX < width/2){
            leftX = e.touches[i].clientX
            leftY = e.touches[i].clientY
        }
        else{
            rightX = e.touches[i].clientX
            rightY = e.touches[i].clientY
        }
    }
}

function arrasta(e){
    const touch = e.changedTouches
    for(var i = 0; i < touch.length; i++){
        if(touch[i].clientX < width/2) player1Vel.set( (touch[i].clientX-leftX),0, (touch[i].clientY-leftY)).normalize()
        else player2Vel.set( (touch[i].clientX-rightX),0, (touch[i].clientY-rightY)).normalize()
  }
}

function tocou(e){
    const touch = e.changedTouches
        for(var i = 0; i < touch.length; i++){
        if(touch[i].clientX < width/2) player1Vel.set(0,0,0)
            else player2Vel.set(0,0,0)
            
    }
}
function animate() {
    requestAnimationFrame( animate );
    
    camera.lookAt(bola.position)
    camera.position.x += (bola.position.x-camera.position.x)/10
    
    var hold = new THREE.Vector3(player1Vel.x, player1Vel.y, player1Vel.z)
    sphere.position.add(hold.multiplyScalar(0.15))
    if(player1Vel.length() != 0)sphere.rotation.y = Math.atan2(player1Vel.z, -player1Vel.x)
    
    hold = new THREE.Vector3(player2Vel.x, player2Vel.y, player2Vel.z)
    player2.position.add(hold.multiplyScalar(0.15))
    if(player2Vel.length() != 0)player2.rotation.y = Math.atan2(player2Vel.z, -player2Vel.x)
    
    velocity.y -= gravity
    if(pausa) velocity.set(0,0,0)
    bola.position.add(velocity)
    bola.rotation.set(velocity.x, velocity.y, velocity.z)
    
    circle.position.x = bola.position.x
    circle.position.z = bola.position.z
    circle.scale.set(1-(bola.position.y+1)/20,1-(bola.position.y+1)/20,1)
    
    var distancia = new THREE.Vector3(0,0,0).subVectors(bola.position, sphere.position)
    if(distancia.length()<=1.5) velocity = distancia.normalize().multiplyScalar(0.2)
    
    var distancia = new THREE.Vector3(0,0,0).subVectors(bola.position, player2.position)
    if(distancia.length()<=1.5) velocity = distancia.normalize().multiplyScalar(0.2)
    
    //colisao com a rede
    //if(bola.position.x >= -0.5 && bola.position.x <= 0.5)
    var b = 2* bola.position.y
    var c = bola.position.y**2-0.5**2-bola.position.x**2
    var delta = b**2 -4*c
    
    if(delta >= 1 && delta <= 2) {
        var y = (b - Math.sqrt(delta))/ 2
        if(y <= 1 && y >= -1){
            var distancia = new THREE.Vector3(0,0,0).subVectors(bola.position, new THREE.Vector3(0, y, 0))
            velocity = distancia.normalize().multiplyScalar(0.2)
            console.log(y)
        }
    }
    //colisao chao
    
    if(bola.position.y-0.5 <= -1) {velocity.reflect(new THREE.Vector3(0,1,0)); bola.position.y = -0.5}
    if(bola.position.x-0.5 <= -10 || bola.position.x+0.5 >= 10 ) velocity.x = -velocity.x
    if(bola.position.z-0.5 <= -5 || bola.position.z+0.5 >= 5) velocity.z = -velocity.z
    
    renderer.render( scene, camera );

}

canvas.addEventListener("touchstart", toca)
canvas.addEventListener("touchmove", arrasta)
canvas.addEventListener("touchend", tocou)
animate();