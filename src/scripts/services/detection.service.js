import { DETECTION_CONFIG } from '../config.js';
import { isWebGPUSupported, logError, validateModelMetadata } from '../utils/index.js';

class DetectionService {
  constructor() {
    this.model = null;
    this.labels = [];
    this.config = DETECTION_CONFIG;
    this.performanceStats = {
      operations: 0,
      totalTime: 0,
      averageTime: 0,
    };
  }

  isLoaded() {
    return !!this.model;
  }

  // TODO [Basic] Muat model dan metadata secara bersamaan, lalu simpan ke instance
  // TODO [Advance] Implementasikan strategi Backend Adaptive
  async loadModel(onProgress) {
    try {
      // Backend Adaptive (BINTANG 5)
      const backend = isWebGPUSupported() ? 'webgpu' : 'webgl';
      await tf.setBackend(backend);
      await tf.ready();
      console.log(`[Detection] Backend terpilih: ${backend}`);

      // Muat metadata dan model bersamaan
      const [metadata, model] = await Promise.all([
        fetch(this.config.metadataPath).then((r) => r.json()),
        tf.loadLayersModel(this.config.modelPath, onProgress ? { onProgress } : {}),
      ]);

      if (!validateModelMetadata(metadata)) {
        throw new Error('Metadata tidak valid: array label tidak ditemukan');
      }

      this.labels = metadata.labels;
      this.model = model;

      console.log('[Detection] Model berhasil dimuat. Label:', this.labels);
      return {
        success: true,
        labels: this.labels,
        modelName: metadata.modelName || 'Unknown',
        version: metadata.version || '1.0.0',
        backend,
      };
    } catch (error) {
      logError('Gagal memuat model deteksi', error);
      throw new Error(`Gagal memuat model: ${error.message}`);
    }
  }

  // TODO [Basic] Lakukan prediksi pada elemen gambar yang diberikan dan kembalikan hasilnya
  async predict(imageElement) {
    if (!this.model) throw new Error('Model belum dimuat');

    const startTime = performance.now();

    // tf.tidy untuk manajemen memori (BINTANG 5)
    const result = tf.tidy(() => {
      const tensor = tf.browser
        .fromPixels(imageElement)
        .resizeBilinear(this.config.inputSize)
        .div(255.0)
        .expandDims(0);

      const predictions = this.model.predict(tensor);
      const values = predictions.dataSync();

      const maxIndex = values.indexOf(Math.max(...values));

      return {
        className: this.labels[maxIndex] || 'Unknown',
        confidence: Math.round(values[maxIndex] * 100),
        isValid: values[maxIndex] > 0.5,
        allProbabilities: Array.from(values).map((v, i) => ({
          label: this.labels[i],
          probability: Math.round(v * 100),
        })),
      };
    });

    const endTime = performance.now();
    this.performanceStats.operations++;
    this.performanceStats.totalTime += endTime - startTime;
    this.performanceStats.averageTime =
      this.performanceStats.totalTime / this.performanceStats.operations;

    return result;
  }

  dispose() {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    this.labels = [];
  }
}

export default DetectionService;