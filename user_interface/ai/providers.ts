import { groq } from "@ai-sdk/groq";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";

const languageModels = {
  'bling-phi-3-gguf': 'Bling Phi 3',
  'tinyllama': 'TinyLlama',
};


export type modelID = keyof typeof languageModels;

export const MODELS = Object.keys(languageModels);

export const defaultModel: modelID =
  "bling-phi-3-gguf";
