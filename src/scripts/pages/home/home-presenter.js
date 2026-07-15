import CameraService from '../../services/camera.service.js';
import DetectionService from '../../services/detection.service.js';
import RootFactsService from '../../services/rootfacts.service.js';
import { APP_CONFIG } from '../../config.js';
import { isValidDetection, logError, createDelay, getCameraErrorMessage } from '../../utils/index.js';

class HomePresenter {
  constructor(view) {
    this.view = view;
    this.view.setPresenter(this);

    this.cameraService = new CameraService();
    this.detectionService = new DetectionService();
    this.factsService = new RootFactsService();

    this.isRunning = false;
    this.currentLoopId = 0;
  }

  async init() {
    try {
      this.view.showStatus('Memuat model AI...');
      this.view.disableToggleButton();

      // Load daftar kamera
      await this.cameraService.loadCameras(this.view.elements.cameraSelect);

      // Load model deteksi (Computer Vision)
      await this.detectionService.loadModel((progress) => {
        if (progress < 1) {
          this.view.showStatus(`Mengunduh model... ${Math.round(progress * 100)}%`);
        }
      });

      // Load model generative (RootFacts)
      this.view.showStatus('Menyiapkan AI Fakta...');
      await this.factsService.loadModel();

      this.view.showStatus('Siap! Arahkan kamera ke sayuran.');
      this.view.enableToggleButton();
      this.view.showIdleState();
    } catch (error) {
      logError('Gagal inisialisasi', error);
      this.view.showStatus('Gagal memuat model. Refresh halaman.');
      this.view.enableToggleButton();
    }
  }

  handleToggleCamera() {
    if (this.isRunning) {
      this.stopAll();
      this.view.showIdleState();
      this.view.showStatus('Kamera berhenti');
    } else {
      this.startCameraAndDetection();
    }
  }

  handleFPSChange(fps) {
    this.cameraService.setFPS(fps);
  }

  handleToneChange(tone) {
    this.factsService.setTone(tone);
  }

  async startCameraAndDetection() {
    try {
      this.view.showStatus('Menyalakan kamera...');
      this.view.showScanningState();

      await this.cameraService.startCamera(
        'media-video',
        'media-canvas',
        this.view.elements.cameraSelect,
      );

      this.isRunning = true;
      this.detectionStartTime = Date.now(); // Catat waktu mulai
      const loopId = ++this.currentLoopId;
      this.view.showStatus('Mendeteksi...');
      this.detectionLoop(loopId);
    } catch (error) {
      const msg = getCameraErrorMessage(error);
      this.view.showStatus(msg);
      this.stopAll();
      this.view.showIdleState();
    }
}

  async detectionLoop(loopId) {
    if (!this.isRunning || this.currentLoopId !== loopId) return;

    try {
      const canvas = this.cameraService.captureFrame();
      if (!canvas) {
        if (this.isRunning) requestAnimationFrame(() => this.detectionLoop(loopId));
        return;
      }

      const result = await this.detectionService.predict(canvas);
      this.view.updatePrediction(result.className, result.confidence);

      // Hanya validasi setelah kamera nyala minimal 3 detik
      if (this.detectionStartTime && Date.now() - this.detectionStartTime > 3000) {
        if (isValidDetection(result)) {
          this.stopAll();
          await this.showResultAndFacts(result);
          return;
        }
      }
    } catch (error) {
      logError('Loop deteksi error', error);
    }

    if (this.isRunning) requestAnimationFrame(() => this.detectionLoop(loopId));
}

  stopAll() {
    this.isRunning = false;
    this.cameraService.stopCamera();
  }

  async showResultAndFacts(detectionResult) {
    this.view.showLoadingState();
    this.view.showStatus('Menganalisis...');
    await createDelay(APP_CONFIG.analyzingDelay);

    this.view.showResultState();
    this.view.updatePrediction(detectionResult.className, detectionResult.confidence);
    this.view.showFunFactLoading();

    try {
      const tone = this.view.getSelectedTone();
      const factData = await this.factsService.generateFacts(detectionResult.className, tone);
      this.view.showFunFact(factData.funFact);
      this.view.showStatus('Selesai!');
    } catch (error) {
      this.view.showFunFact('Maaf, gagal menghasilkan fakta. Silakan coba lagi.');
      this.view.showStatus('Gagal menghasilkan fakta');
    }
  }
}

export default HomePresenter;