import * as THREE from 'three';

export class Coin {
  constructor(position) {
    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 20, 20),
      new THREE.MeshStandardMaterial({ 
        color: 0xffff00, 
        emissive: 0xffff00, 
        emissiveIntensity: 1.2 
      })
    );
    this.mesh.position.set(position.x, 0.8, position.z);
  }

  addToScene(scene) {
    scene.add(this.mesh);
  }
}