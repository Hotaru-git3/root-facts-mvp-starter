import '../styles/styles.css';
import App from './pages/app.js';

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('main-content');
  const app = new App({ container });

  await app.renderPage();
  app.registerServiceWorker();

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});