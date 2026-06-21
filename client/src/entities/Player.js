import * as THREE from 'three';
import { SCENE_CONFIG } from '../config/scene.js';

export class Player {
  constructor(id, username, color, isLocal = false) {
    this.id = id;
    this.username = username;
    this.isLocal = isLocal;
    this.hp = 100;
    this.score = 0;

    this.mesh = this._createMesh(color);
    this.label = this._createLabel(username);
    this.mesh.add(this.label);
  }

  _createMesh(color) {
    const geometry = new THREE.ConeGeometry(0.7, 2, 3);
    const material = new THREE.MeshStandardMaterial({ 
      color: color || 0x00ffcc,
      emissive: color || 0x00ffcc,
      emissiveIntensity: 0.6
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = 1;
    return mesh;
  }

  _createLabel(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width/2, canvas.height/2);

    const texture = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }));
    sprite.scale.set(4, 1, 1);
    sprite.position.y = 3;
    return sprite;
  }

  updatePosition(position, rotation) {
    this.mesh.position.set(position.x, 1, position.z);
    if (rotation) this.mesh.rotation.y = rotation.y || 0;
  }

  addToScene(scene) {
    scene.add(this.mesh);
  }
}