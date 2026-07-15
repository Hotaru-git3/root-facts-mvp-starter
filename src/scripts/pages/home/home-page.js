import {
  generateCameraSection,
  generateInfoPanel,
  generateFooter,
} from '../../templates.js';
import { getConfidenceTextClass, getConfidenceCardClass, showElement, hideElement, setElementText, addFadeInAnimation } from '../../utils/index.js';
import { UI_CONFIG } from '../../config.js';

export default class HomePage {
  #presenter = null;

  constructor() {
    this.elements = {};
  }

  // Dipanggil Presenter buat nyimpen referensi
  setPresenter(presenter) {
    this.#presenter = presenter;
  }

  async render() {
    return `
      <main class="main-content">
        ${generateCameraSection()}
        ${generateInfoPanel()}
      </main>
      ${generateFooter()}
    `;
  }

  async afterRender() {
    // Ambil semua elemen DOM
    this.elements = {
      video: document.getElementById('media-video'),
      canvas: document.getElementById('media-canvas'),
      btnToggle: document.getElementById('btn-toggle'),
      cameraSelect: document.getElementById('camera-select'),
      fpsSlider: document.getElementById('fps-slider'),
      fpsLabel: document.getElementById('fps-label'),
      toneSelect: document.getElementById('tone-select'),
      statusDot: document.getElementById('status-dot'),
      statusText: document.getElementById('status-text'),
      stateIdle: document.getElementById('state-idle'),
      stateLoading: document.getElementById('state-loading'),
      stateResult: document.getElementById('state-result'),
      detectedName: document.getElementById('detected-name'),
      detectedConfidence: document.getElementById('detected-confidence'),
      confidenceFill: document.getElementById('confidence-fill'),
      funFactText: document.getElementById('fun-fact-text'),
      funFactLoading: document.getElementById('fun-fact-loading'),
      funFactContent: document.getElementById('fun-fact-content'),
      btnCopy: document.getElementById('btn-copy'),
      cameraOverlay: document.getElementById('camera-overlay'),
      cameraPlaceholder: document.getElementById('camera-placeholder'),
    };

    // Bind event listeners
    this.#bindEvents();
  }

  #bindEvents() {
    // Tombol Mulai/Stop Scan
    this.elements.btnToggle?.addEventListener('click', () => {
      if (this.#presenter) this.#presenter.handleToggleCamera();
    });

    // Tombol Copy
    this.elements.btnCopy?.addEventListener('click', () => {
      this.#handleCopy();
    });

    // Slider FPS
    this.elements.fpsSlider?.addEventListener('input', (e) => {
      const fps = parseInt(e.target.value);
      this.elements.fpsLabel.textContent = `${fps} FPS`;
      if (this.#presenter) this.#presenter.handleFPSChange(fps);
    });

    // Dropdown Tone
    this.elements.toneSelect?.addEventListener('change', (e) => {
      if (this.#presenter) this.#presenter.handleToneChange(e.target.value);
    });
  }

  async #handleCopy() {
    const text = this.elements.funFactText?.textContent;
    if (!text || text.includes('akan muncul')) return;

    try {
      await navigator.clipboard.writeText(text);
      this.elements.btnCopy.innerHTML = '<i data-lucide="check" width="18" height="18"></i>';
      setTimeout(() => {
        this.elements.btnCopy.innerHTML = '<i data-lucide="copy" width="18" height="18"></i>';
      }, 2000);
    } catch (err) {
      console.error('Gagal menyalin:', err);
    }
  }

  // ========== UI UPDATE METHODS (Dipanggil Presenter) ==========

  showStatus(message) {
    setElementText(this.elements.statusText, message);
  }

  showScanningState() {
    hideElement(this.elements.stateIdle);
    hideElement(this.elements.stateLoading);
    hideElement(this.elements.stateResult);
    hideElement(this.elements.cameraPlaceholder);
    showElement(this.elements.cameraOverlay);
  }

  showIdleState() {
    showElement(this.elements.stateIdle);
    hideElement(this.elements.stateLoading);
    hideElement(this.elements.stateResult);
  }

  showLoadingState() {
    hideElement(this.elements.stateIdle);
    showElement(this.elements.stateLoading);
    hideElement(this.elements.stateResult);
  }

  showResultState() {
    hideElement(this.elements.stateIdle);
    hideElement(this.elements.stateLoading);
    showElement(this.elements.stateResult);
    addFadeInAnimation(this.elements.stateResult);
  }

  updatePrediction(label, confidence) {
    setElementText(this.elements.detectedName, label);
    setElementText(this.elements.detectedConfidence, `${confidence}%`);
    this.elements.confidenceFill.style.width = `${confidence}%`;

    // Warna confidence bar
    const { excellent, good } = UI_CONFIG.confidenceThresholds;
    if (confidence >= excellent) {
      this.elements.confidenceFill.style.backgroundColor = '#10b981';
    } else if (confidence >= good) {
      this.elements.confidenceFill.style.backgroundColor = '#f59e0b';
    } else {
      this.elements.confidenceFill.style.backgroundColor = '#ef4444';
    }
  }

  showFunFactLoading() {
    hideElement(this.elements.funFactContent);
    showElement(this.elements.funFactLoading);
  }

  showFunFact(text) {
    hideElement(this.elements.funFactLoading);
    showElement(this.elements.funFactContent);
    setElementText(this.elements.funFactText, text);
  }

  getSelectedTone() {
    return this.elements.toneSelect?.value || 'normal';
  }

  disableToggleButton() {
    if (this.elements.btnToggle) this.elements.btnToggle.disabled = true;
  }

  enableToggleButton() {
    if (this.elements.btnToggle) this.elements.btnToggle.disabled = false;
  }
}