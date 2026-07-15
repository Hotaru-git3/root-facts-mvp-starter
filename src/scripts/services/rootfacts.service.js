import { FUNFACT_CONFIG } from '../config.js';
import { logError, createDelay, isWebGPUSupported } from '../utils/index.js';

class RootFactsService {
  constructor() {
    this.generator = null;
    this.isModelLoaded = false;
    this.isGenerating = false;
    this.config = FUNFACT_CONFIG;
    this.currentBackend = null;
    this.currentTone = 'normal';
  }

  // TODO [Basic] Periksa apakah model sudah dimuat dan siap digunakan
  isReady() {
    return this.isModelLoaded && !this.isGenerating;
  }

  // TODO [Advance] Konfigurasi tone fakta yang dihasilkan
  setTone(tone) {
    const validTones = Object.keys(this.config.promptTemplates);
    if (validTones.includes(tone)) {
      this.currentTone = tone;
    }
  }

  // TODO [Basic] Muat model dan inisialisasi pipeline text2text-generation
  // TODO [Advance] Implementasikan strategi Backend Adaptive
  async loadModel(onProgress) {
    try {
      console.log('[RootFacts] Memuat model generatif...');

      const { pipeline } = await import(/* webpackIgnore: true */ this.config.cdnUrl);

      // Backend Adaptive (BINTANG 5)
      const device = isWebGPUSupported() ? 'webgpu' : 'wasm';
      this.currentBackend = device;
      console.log(`[RootFacts] Backend terpilih: ${device}`);

      this.generator = await pipeline('text2text-generation', this.config.modelName, {
        dtype: this.config.dtype,
        device,
        progress_callback: onProgress || undefined,
      });

      this.isModelLoaded = true;
      console.log('[RootFacts] Model generatif siap!');
      return { success: true, model: this.config.modelName, backend: device };
    } catch (error) {
      logError('Gagal memuat model generative AI', error);
      throw new Error(`Gagal memuat model generasi konten: ${error.message}`);
    }
  }

  // TODO [Basic] Lakukan prediksi pada elemen gambar yang diberikan dan kembalikan hasilnya
  // TODO [Basic] Tambahkan validasi untuk maksimum panjang input dan pembersihan input terhadap karakter khusus untuk mengatasi prompt injection
  // TODO [Skilled] Konfigurasikan parameter generasi berdasarkan kebutuhan
  // TODO [Advance] Implemenasikan parameter tone untuk mengatur nada fakta yang dihasilkan
  async generateFacts(vegetable, tone = 'normal') {
    if (!this.isReady()) throw new Error('Model belum siap');
    if (this.isGenerating) throw new Error('Sedang menghasilkan fakta');

    this.isGenerating = true;

    try {
      const MAX_LENGTH = this.config.maxThemeLength;
      if (!vegetable || vegetable.length > MAX_LENGTH) {
        throw new Error(`Nama sayuran harus 1-${MAX_LENGTH} karakter`);
      }

      const sanitized = vegetable
        .replace(/[|]{2,}/g, '')
        .replace(/[#=]{2,}/g, '')
        .replace(/(--|\+\+|``)/g, '')
        .replace(/\n/g, ' ')
        .trim();

      if (!sanitized) throw new Error('Nama sayuran tidak valid');

      const template = this.config.promptTemplates[tone] || this.config.promptTemplates.normal;
      const prompt = template.replace('{vegetable}', sanitized);

      console.log('[RootFacts] Prompt:', prompt);

      await createDelay(100);

      const result = await this.generator(prompt, this.config.generationParams);
      const generatedText = result[0].generated_text;

      // Validasi: pastiin hasil mengandung nama sayuran
      if (!generatedText.toLowerCase().includes(sanitized.toLowerCase())) {
        console.log('[RootFacts] Hasil tidak relevan, retry...');
        const retryPrompt = `IMPORTANT: Write ONLY about ${sanitized} vegetable. Do NOT mention any other vegetable. Give one fun fact.`;
        const retryResult = await this.generator(retryPrompt, this.config.generationParams);
        const retryText = retryResult[0].generated_text;

        return {
          funFact: retryText,
          vegetable: sanitized,
          tone,
          timestamp: new Date().toISOString(),
        };
      }

      return {
        funFact: generatedText,
        vegetable: sanitized,
        tone,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logError('Gagal menghasilkan fakta', error);
      throw error;
    } finally {
      this.isGenerating = false;
    }
  }

  dispose() {
    if (this.generator) {
      this.generator = null;
    }
    this.isModelLoaded = false;
  }
}

export default RootFactsService;