import * as THREE from 'three';
import { SCENE_CONFIG } from '../config/scene.js';

export class Arena {
  constructor() {
    this.group = new THREE.Group();
    this._createFloor();
    this._createBorders();
  }

  _createFloor() {
    const geo = new THREE.PlaneGeometry(SCENE_CONFIG.arenaSize, SCENE_CONFIG.arenaSize);
    const mat = new THREE.MeshStandardMaterial({ 
      color: 0x1a0033, 
      roughness: 0.95 
    });
    const floor = new THREE.Mesh(geo, mat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.group.add(floor);
  }

  _createBorders() {
    const borderMat = new THREE.MeshStandardMaterial({ 
      color: 0xff00ff, 
      emissive: 0xff00ff, 
      emissiveIntensity: 0.8 
    });
    const size = SCENE_CONFIG.arenaSize / 2;

    const borders = [
      { pos: [0, 0.75, size], rot: 0 },
      { pos: [0, 0.75, -size], rot: 0 },
      { pos: [size, 0.75, 0], rot: Math.PI/2 },
      { pos: [-size, 0.75, 0], rot: Math.PI/2 }
    ];

    borders.forEach(b => {
      const border = new THREE.Mesh(
        new THREE.BoxGeometry(SCENE_CONFIG.arenaSize + 4, 2, 2), 
        borderMat
      );
      border.position.set(...b.pos);
      border.rotation.y = b.rot;
      this.group.add(border);
    });
  }

  addToScene(scene) {
    scene.add(this.group);
  }
}