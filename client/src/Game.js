import * as THREE from 'three';
import { SCENE_CONFIG } from './config/scene.js';
import { InputManager } from './InputManager.js';
import { NetworkManager } from './NetworkManager.js';
import { Arena } from './entities/Arena.js';
import { Player } from './entities/Player.js';
import { Coin } from './entities/Coin.js';
import { Obstacle } from './entities/Obstacle.js';
import { ChatUI } from './entities/ChatUI.js';

export class Game {
  constructor() {
    this.clock = new THREE.Clock();
    this.players = new Map();
    this.coins = new Map();
    this.obstacles = new Map();
    this.localPlayerId = null;
    this.cameraAngle = Math.PI / 4;
    this.cameraDistance = 22;
    this.cameraHeight = 16;

    this._initThree();
    this._initManagers();
    this._initEntities();
    this._setupNetworkCallbacks();
    this._setupCameraControls();
  }

  _initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a001f);
    this.scene.fog = new THREE.Fog(0x0a001f, 35, 80);

    this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    document.getElementById('game-container').appendChild(this.renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0x8877ff, 1.2);
    dirLight.position.set(20, 30, 15);
    dirLight.castShadow = true;
    this.scene.add(dirLight);

    window.addEventListener('resize', () => this._onWindowResize());
  }

  _setupCameraControls() {
    const canvas = this.renderer.domElement;
    canvas.addEventListener('click', () => canvas.requestPointerLock());

    window.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement === canvas) {
        this.cameraAngle -= e.movementX * 0.0035;
      }
    });
  }

  _initManagers() {
    this.input = new InputManager();
    this.network = new NetworkManager();
    this.chatUI = new ChatUI(this.network, this.input);
  }

  _initEntities() {
    this.arena = new Arena();
    this.arena.addToScene(this.scene);
  }

  _setupNetworkCallbacks() {
    this.network.callbacks.onRoomJoined = (data) => {
      this.localPlayerId = this.network.socket.id;
      const localData = data.players.find(p => p.id === this.localPlayerId);

      document.getElementById('username').textContent = `👤 ${localData.username}`;
      document.getElementById('loading').style.display = 'none';

      const localPlayer = new Player(localData.id, localData.username, 0x00ffff, true);
      localPlayer.addToScene(this.scene);
      this.players.set(localData.id, localPlayer);
    };

    this.network.callbacks.onPlayerMoved = (data) => {
      const player = this.players.get(data.id);
      if (player) player.updatePosition(data.position, data.rotation);
    };
  }

  start(userData) {
    this.network.connect(userData);
    this._animate();
  }

  _animate() {
    requestAnimationFrame(() => this._animate());
    const delta = this.clock.getDelta();
    const localPlayer = this.players.get(this.localPlayerId);

    if (localPlayer) {
      // Движение
      let moved = false;
      const speed = SCENE_CONFIG.playerSpeed || 0.25;
      let pos = localPlayer.mesh.position.clone();

      if (this.input.isKeyDown('KeyW') || this.input.isKeyDown('ArrowUp')) { pos.z -= speed; moved = true; }
      if (this.input.isKeyDown('KeyS') || this.input.isKeyDown('ArrowDown')) { pos.z += speed; moved = true; }
      if (this.input.isKeyDown('KeyA') || this.input.isKeyDown('ArrowLeft')) { pos.x -= speed; moved = true; }
      if (this.input.isKeyDown('KeyD') || this.input.isKeyDown('ArrowRight')) { pos.x += speed; moved = true; }

      const half = SCENE_CONFIG.arenaSize / 2 - 2;
      pos.x = Math.max(-half, Math.min(half, pos.x));
      pos.z = Math.max(-half, Math.min(half, pos.z));

      if (moved) {
        const rotationY = Math.atan2(pos.x - localPlayer.mesh.position.x, pos.z - localPlayer.mesh.position.z);
        localPlayer.updatePosition(pos, { y: rotationY });
        this.network.sendMove(pos, { y: rotationY });
      }

      // Камера
      const p = localPlayer.mesh.position;
      this.camera.position.x = p.x + Math.sin(this.cameraAngle) * this.cameraDistance;
      this.camera.position.z = p.z + Math.cos(this.cameraAngle) * this.cameraDistance;
      this.camera.position.y = p.y + this.cameraHeight;
      this.camera.lookAt(p.x, p.y + 2, p.z);
    }

    this.renderer.render(this.scene, this.camera);
  }

  _onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}