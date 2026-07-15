import { CAMERA_CONFIG } from '../config.js';
import { isMobileDevice, logError } from '../utils/index.js';

class CameraService {
  constructor() {
    this.stream = null;
    this.video = null;
    this.canvas = null;
    this.config = CAMERA_CONFIG;
    this.currentFPS = this.config.defaultFPS;
    this.isCameraActive = false;
  }

  // TODO [Basic] inisiasi elemen video dan canvas
  initializeElements(videoId, canvasId) {
    this.video = document.getElementById(videoId);
    this.canvas = document.getElementById(canvasId);
    if (this.canvas) {
      this.canvas.width = this.config.width;
      this.canvas.height = this.config.height;
    }
  }

  // TODO [Basic] Tambahkan konfigurasi kamera untuk mendapatkan daftar perangkat input video
  // TODO [Basic] Dapatkan constraints kamera berdasarkan konfigurasi dan kamera yang dipilih
  async loadCameras(cameraSelect) {
    try {
      // Minta izin kamera dulu biar label perangkat keluar
      await navigator.mediaDevices.getUserMedia({ video: true });
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter((d) => d.kind === 'videoinput');

      if (!cameraSelect) return cameras;

      cameraSelect.innerHTML = '';
      if (cameras.length === 0) {
        cameraSelect.innerHTML = '<option>Tidak ada kamera</option>';
        return [];
      }

      const isMobile = isMobileDevice();
      cameras.forEach((cam, index) => {
        const option = document.createElement('option');
        option.value = cam.deviceId;

        if (
          cam.label.toLowerCase().includes('front') ||
          cam.label.toLowerCase().includes('depan')
        ) {
          option.textContent = `Depan (${cam.label || `Kamera ${index + 1}`})`;
          if (!isMobile) option.selected = true;
        } else if (
          cam.label.toLowerCase().includes('back') ||
          cam.label.toLowerCase().includes('belakang') ||
          cam.label.toLowerCase().includes('environment')
        ) {
          option.textContent = `Belakang (${cam.label || `Kamera ${index + 1}`})`;
          if (isMobile) option.selected = true;
        } else {
          option.textContent = cam.label || `Kamera ${index + 1}`;
          if (index === 0) option.selected = true;
        }
        cameraSelect.appendChild(option);
      });

      return cameras;
    } catch (error) {
      logError('Gagal memuat kamera', error);
      throw error;
    }
  }

  // TODO [Basic] Memulai kamera dengan perangkat yang dipilih dan menampilkan pada elemen video
  async startCamera(videoId, canvasId, cameraSelect) {
    try {
      this.initializeElements(videoId, canvasId);

      const isMobile = isMobileDevice();
      const selectedDeviceId = cameraSelect?.value;

      const constraints = {
        video: {
          width: { ideal: isMobile ? this.config.mobileWidth : this.config.width },
          height: { ideal: isMobile ? this.config.mobileHeight : this.config.height },
          facingMode: isMobile ? 'environment' : 'user',
          frameRate: { ideal: this.currentFPS },
        },
      };

      if (selectedDeviceId && selectedDeviceId !== 'default' && selectedDeviceId !== 'front') {
        constraints.video.deviceId = { exact: selectedDeviceId };
      } else if (selectedDeviceId === 'front') {
        constraints.video.facingMode = 'user';
      }

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.video.srcObject = this.stream;
      await this.video.play();

      this.isCameraActive = true;
      return this.stream;
    } catch (error) {
      this.isCameraActive = false;
      logError('Gagal memulai kamera', error);
      throw error;
    }
  }

  // TODO [Basic] Menghentikan siaran kamera dan membersihkan sumber daya
  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.video) {
      this.video.srcObject = null;
    }
    this.isCameraActive = false;
  }

  captureFrame() {
    if (!this.canvas || !this.video || !this.isCameraActive) return null;

    const ctx = this.canvas.getContext('2d');
    this.canvas.width = this.video.videoWidth || this.config.width;
    this.canvas.height = this.video.videoHeight || this.config.height;
    ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    return this.canvas;
  }

  // TODO [Skilled] Implementasikan metode untuk mengatur FPS kamera
  setFPS(fps) {
    this.currentFPS = Math.max(this.config.minFPS, Math.min(this.config.maxFPS, fps));
  }

  // TODO [Basic] Periksa apakah kamera sedang aktif
  isActive() {
    return this.isCameraActive && this.stream !== null;
  }

  isReady() {
    return this.isActive() && this.video && !this.video.paused;
  }
}

export default CameraService;