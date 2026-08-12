export class Combat {
  constructor(app) {
    this.app = app;
    app.abilities.onHit = (projectile) => this.handleAbilityHit(projectile);
  }

  handleAbilityHit(p) {
    const targets = this.app.targets.getLiving();
    const dmg = p.def.damage;
    if (p.type === 'line') {
      const start = p.origin;
      const end = p.origin.clone().addScaledVector(p.direction, p.length);
      const width = p.def.width;
      for (const t of targets) {
        if (this._pointToSegmentDist(t.position, start, end) < (width * 0.5 + t.radius)) {
          const killed = t.takeDamage(dmg);
          if (killed) this.app.onKill();
        }
      }
    } else {
      for (const t of targets) {
        const dist = t.position.distanceTo(p.center);
        if (dist < p.radius + t.radius) {
          const killed = t.takeDamage(dmg);
          if (killed) this.app.onKill();
        }
      }
    }
  }

  update(dt) {
    const attacks = this.app.targets.update(dt, this.app.player.position);
    for (const a of attacks) {
      this.app.player.takeDamage(a.damage);
      if (!this.app.player.alive) {
        this.app.onPlayerDeath();
        break;
      }
    }
    const input = this.app.input;
    for (const def of this.app.abilities.abilityList) {
      if (input.wasPressed(def.key)) this.app.abilities.selectByKey(def.key);
    }
    if (input.mouse.justDown || input.wasPressed('KeyC')) this.app.aim.tryFire();
    this.app.aim.setPointer(input.mouse.x, input.mouse.y);
  }

  _pointToSegmentDist(point, a, b) {
    const ab = b.clone().sub(a);
    const t = Math.max(0, Math.min(1, point.clone().sub(a).dot(ab) / ab.lengthSq()));
    const closest = a.clone().addScaledVector(ab, t);
    return point.distanceTo(closest);
  }
}
