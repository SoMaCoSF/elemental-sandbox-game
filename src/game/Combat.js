export class Combat {
  constructor(app) {
    this.app = app;
    app.abilities.onHit = (projectile, pos) => this.handleAbilityHit(projectile, pos);
  }
  handleAbilityHit(p, pos) {
    const targets = this.app.targets.getLiving();
    const dmg = p.def.damage;
    if (p.type === 'line') {
      const halfW = p.def.width * 0.55;
      for (const t of targets) {
        if (p.hitTargets.has(t.id)) continue;
        if (t.position.distanceTo(pos) < halfW + t.radius) {
          p.hitTargets.add(t.id);
          const kb = pos.clone().sub(p.origin).setY(0).normalize().multiplyScalar(2.5);
          t.position.add(kb);
          if (t.takeDamage(dmg)) this.app.onKill();
        }
      }
    } else {
      for (const t of targets) {
        if (p.hitTargets.has(t.id)) continue;
        if (t.position.distanceTo(p.center) < p.radius + t.radius) {
          p.hitTargets.add(t.id);
          const kb = t.position.clone().sub(p.center).setY(0);
          if (kb.lengthSq() > 0.01) kb.normalize().multiplyScalar(3);
          t.position.add(kb);
          if (t.takeDamage(dmg)) this.app.onKill();
        }
      }
    }
  }
  update(dt) {
    const attacks = this.app.targets.update(dt, this.app.player.position);
    for (const a of attacks) {
      this.app.player.takeDamage(a.damage);
      if (!this.app.player.alive) { this.app.onPlayerDeath(); break; }
    }
    const input = this.app.input;
    for (const def of this.app.abilities.abilityList) {
      if (input.wasPressed(def.key)) this.app.abilities.selectByKey(def.key);
    }
    if (input.mouse.clicked) {
      this.app.aim.setPointer(input.mouse.x, input.mouse.y);
      this.app.aim.update(this.app.player.position);
      this.app.aim.tryFire();
    }
    this.app.aim.setPointer(input.mouse.x, input.mouse.y);
  }
}
