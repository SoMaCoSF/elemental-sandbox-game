export class HUD {
  constructor() {
    this.scoreEl = document.getElementById('score');
    this.waveEl = document.getElementById('wave');
    this.healthEl = document.getElementById('health');
    this.killsEl = document.getElementById('kills');
    this.messageEl = document.getElementById('message');
    this.slots = Array.from(document.querySelectorAll('.ability-slot'));
    this._msgTimer = 0;
  }

  update({ score, wave, health, kills, selected, cooldowns }) {
    if (this.scoreEl) this.scoreEl.textContent = score;
    if (this.waveEl) this.waveEl.textContent = wave;
    if (this.healthEl) this.healthEl.textContent = health;
    if (this.killsEl) this.killsEl.textContent = kills;
    this.slots.forEach((slot, i) => {
      slot.classList.toggle('active', i === selected);
      let cd = slot.querySelector('.cd');
      if (cooldowns && cooldowns[i] > 0) {
        if (!cd) {
          cd = document.createElement('div');
          cd.className = 'cd';
          slot.appendChild(cd);
        }
        cd.textContent = cooldowns[i].toFixed(1);
      } else if (cd) cd.remove();
    });
  }

  showMessage(text, duration = 2) {
    if (!this.messageEl) return;
    this.messageEl.textContent = text;
    this.messageEl.classList.add('show');
    clearTimeout(this._msgTimer);
    if (duration < 100) {
      this._msgTimer = setTimeout(() => this.messageEl.classList.remove('show'), duration * 1000);
    }
  }
}
