import HomePage from './home/home-page.js';
import HomePresenter from './home/home-presenter.js';

class App {
  #container = null;
  #presenter = null;

  constructor({ container }) {
    this.#container = container;
  }

  async renderPage() {
    const page = new HomePage();
    this.#container.innerHTML = await page.render();
    await page.afterRender();

    // Init Presenter setelah View siap
    this.#presenter = new HomePresenter(page);
    await this.#presenter.init();
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(reg => console.log('SW terdaftar:', reg))
        .catch(err => console.log('SW gagal:', err));
    }
  }
}

export default App;