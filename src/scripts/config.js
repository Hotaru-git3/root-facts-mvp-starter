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
    max_new_tokens: 150,
    temperature: 0.8,
    do_sample: true,
    top_p: 0.9,
  },
  maxThemeLength: 30,
  promptTemplates: {
    normal: 'Write exactly one short, informative, and interesting fun fact about {vegetable} vegetable. Only write about {vegetable}, do not mention any other vegetable. Answer in one or two sentences.',
    funny: 'Write exactly one funny and silly fun fact about {vegetable} vegetable that will make people laugh. Only write about {vegetable}, do not mention any other vegetable. Answer in one or two sentences.',
    professional: 'Write exactly one scientifically accurate and professional fun fact about {vegetable} vegetable. Only write about {vegetable}, do not mention any other vegetable. Answer in one or two sentences.',
    casual: 'Write exactly one cool and casual fun fact about {vegetable} vegetable like you are talking to a friend. Only write about {vegetable}, do not mention any other vegetable. Answer in one or two sentences.',
  },
};

export {
  APP_CONFIG,
  UI_CONFIG,
  DETECTION_CONFIG,
  CAMERA_CONFIG,
  FUNFACT_CONFIG,
};