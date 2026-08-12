import { App } from './core/App.js';

const canvas = document.getElementById('viewport');

async function boot() {
  try {
    const app = new App(canvas);
    await app.init();
    window.app = app;
    console.log('[Elemental Sandbox Game] ready');
  } catch (err) {
    console.error('[boot] failed', err);
    const msg = document.getElementById('message');
    if (msg) {
      msg.textContent = 'Failed to start — check console';
      msg.classList.add('show');
    }
  }
}

boot();
