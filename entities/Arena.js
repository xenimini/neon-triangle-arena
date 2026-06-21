import * as THREE from 'three';
import { SCENE_CONFIG } from '../config/scene.js';

export class Arena {
  constructor() {
    this.group = new THREE.Group();
    this._createFloor();
  }

  _createFloor() {
    const geometry = new THREE.PlaneGeometry(SCENE_CONFIG.arenaSize, SCENE_CONFIG.arenaSize);
    const material = new THREE.MeshStandardMaterial({ color: 0x1a0033 });
    const floor = new THREE.Mesh(geometry, material);
    floor.rotation.x = -Math.PI / 2;
    this.group.add(floor);
  }

  addToScene(scene) {
    scene.add(this.group);
  }
}