import * as THREE from 'three';

export class Obstacle {
  constructor(position) {
    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 1.5, 1.5),
      new THREE.MeshStandardMaterial({ 
        color: 0xff0066, 
        emissive: 0xff0044 
      })
    );
    this.mesh.position.set(position.x, 0.75, position.z);
  }

  addToScene(scene) {
    scene.add(this.mesh);
  }
}