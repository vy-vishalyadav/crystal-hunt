// Simple particle burst system for collection/damage effects

import * as THREE from 'three';

class ParticleBurst {
  constructor(scene, position, color, count = 15) {
    this.particles = [];
    this.scene = scene;
    this.lifetime = 1;
    this.age = 0;
    this.alive = true;

    const geometry = new THREE.SphereGeometry(0.08, 4, 4);

    for (let i = 0; i < count; i++) {
      const material = new THREE.MeshBasicMaterial({ color, transparent: true });
      const particle = new THREE.Mesh(geometry, material);
      particle.position.copy(position);

      // Random burst velocity
      particle.userData.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        Math.random() * 6 + 2,
        (Math.random() - 0.5) * 8
      );

      scene.add(particle);
      this.particles.push(particle);
    }
  }

  update(deltaTime) {
    if (!this.alive) return;

    this.age += deltaTime;
    if (this.age >= this.lifetime) { this.destroy(); return; }

    const progress = this.age / this.lifetime;

    for (const p of this.particles) {
      p.position.x += p.userData.velocity.x * deltaTime;
      p.position.y += p.userData.velocity.y * deltaTime;
      p.position.z += p.userData.velocity.z * deltaTime;
      p.userData.velocity.y -= 15 * deltaTime; // gravity

      p.material.opacity = 1 - progress;
      const scale = 1 - progress * 0.8;
      p.scale.set(scale, scale, scale);
    }
  }

  destroy() {
    this.alive = false;
    for (const p of this.particles) {
      this.scene.remove(p);
      p.geometry.dispose();
      p.material.dispose();
    }
    this.particles = [];
  }
}

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.bursts = [];
  }

  emit(position, color, count = 15) {
    this.bursts.push(new ParticleBurst(this.scene, position, color, count));
  }

  update(deltaTime) {
    for (const burst of this.bursts) burst.update(deltaTime);
    this.bursts = this.bursts.filter(b => b.alive);
  }
}
