const APP_CONFIG = {
  detectionConfidenceThreshold: 70,
  analyzingDelay: 2000,
  factsGenerationDelay: 2000,
  detectionRetryInterval: 100,
};

const UI_CONFIG = {
  animationDuration: 300,
  fadeAnimation: "fadeIn 0.5s ease-out forwards",
  confidenceThresholds: {
    excellent: 90,
    good: 80,
  },
  factsCardOpacity: {
    loading: 0.6,
    normal: 1.0,
  },
};

const DETECTION_CONFIG = {
  modelPath: '/model/model.json',
  metadataPath: '/model/metadata.json',
  inputSize: [224, 224],
};

const CAMERA_CONFIG = {
  width: 640,
  height: 480,
  defaultFPS: 30,
  minFPS: 15,
  maxFPS: 60,
  stepFPS: 15,
  mobileWidth: 480,
  mobileHeight: 640,
};

const FUNFACT_CONFIG = {
  modelName: 'Xenova/LaMini-Flan-T5-77M',
  cdnUrl: 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2',
  dtype: 'q4',
  generationParams: {
    max_new_tokens: 80,
    temperature: 0.8,
    do_sample: true,
    top_p: 0.9,
  },
  maxThemeLength: 30,
  promptTemplates: {
    normal: 'Write exactly one short sentence about the health benefit, nutrition, or interesting fact of {vegetable} vegetable. Do not mention any other vegetable. Only write about {vegetable}.',
    funny: 'Write exactly one funny short sentence about the health benefit or fun fact of {vegetable} vegetable. Make it silly. Do not mention any other vegetable. Only write about {vegetable}.',
    professional: 'Write exactly one professional short sentence about the nutrition, vitamin content, or health benefit of {vegetable} vegetable. Do not mention any other vegetable. Only write about {vegetable}.',
    casual: 'Write exactly one casual short sentence about why {vegetable} vegetable is good for health. Do not mention any other vegetable. Only write about {vegetable}.',
  },
};

export {
  APP_CONFIG,
  UI_CONFIG,
  DETECTION_CONFIG,
  CAMERA_CONFIG,
  FUNFACT_CONFIG,
};