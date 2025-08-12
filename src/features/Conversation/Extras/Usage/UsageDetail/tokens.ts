import { LobeDefaultAiModelListItem } from '@/types/aiModel';
import { ModelTokensUsage } from '@/types/message';
import { 
  getAudioInputUnitRate, 
  getAudioOutputUnitRate,
  calculateTextInputCost,
  calculateTextOutputCost,
  calculateAudioInputCost,
  calculateAudioOutputCost,
  calculateCachedTextInputCost,
  calculateWriteCacheInputCost,
} from '@/utils/pricing';

import { getPrice } from './pricing';

const calcCredit = (token: number, pricing?: number) => {
  if (!pricing) return '-';

  return parseInt((token * pricing).toFixed(0));
};

// Enhanced calculation function that uses tiered pricing when available
const calcCreditTiered = (
  tokens: number, 
  modelCard?: LobeDefaultAiModelListItem, 
  unitName?: 'textInput' | 'textOutput' | 'textInput_cacheRead' | 'textInput_cacheWrite'
) => {
  if (!modelCard?.pricing || !unitName) return '-';
  
  let cost = 0;
  switch (unitName) {
    case 'textInput':
      cost = calculateTextInputCost(modelCard.pricing, tokens);
      break;
    case 'textOutput':
      cost = calculateTextOutputCost(modelCard.pricing, tokens);
      break;
    case 'textInput_cacheRead':
      cost = calculateCachedTextInputCost(modelCard.pricing, tokens);
      break;
    case 'textInput_cacheWrite':
      cost = calculateWriteCacheInputCost(modelCard.pricing, tokens);
      break;
    default:
      return '-';
  }
  
  return parseInt(cost.toFixed(0));
};

export const getDetailsToken = (
  usage: ModelTokensUsage,
  modelCard?: LobeDefaultAiModelListItem,
) => {
  const inputTextTokens = usage.inputTextTokens || (usage as any).inputTokens || 0;
  const totalInputTokens = usage.totalInputTokens || (usage as any).inputTokens || 0;

  const totalOutputTokens = usage.totalOutputTokens || (usage as any).outputTokens || 0;

  const outputReasoningTokens = usage.outputReasoningTokens || (usage as any).reasoningTokens || 0;

  const outputTextTokens = usage.outputTextTokens
    ? usage.outputTextTokens
    : totalOutputTokens - outputReasoningTokens - (usage.outputAudioTokens || 0);

  const inputWriteCacheTokens = usage.inputWriteCacheTokens || 0;
  const inputCacheTokens = usage.inputCachedTokens || (usage as any).cachedTokens || 0;

  const inputCacheMissTokens = usage?.inputCacheMissTokens
    ? usage?.inputCacheMissTokens
    : totalInputTokens - (inputCacheTokens || 0);

  // Pricing
  const formatPrice = getPrice(modelCard?.pricing || { units: [] });

  const inputCacheMissCredit = (
    !!inputCacheMissTokens ? calcCreditTiered(inputCacheMissTokens, modelCard, 'textInput') : 0
  ) as number;

  const inputCachedCredit = (
    !!inputCacheTokens ? calcCreditTiered(inputCacheTokens, modelCard, 'textInput_cacheRead') : 0
  ) as number;

  const inputWriteCachedCredit = !!inputWriteCacheTokens
    ? (calcCreditTiered(inputWriteCacheTokens, modelCard, 'textInput_cacheWrite') as number)
    : 0;

  const totalOutputCredit = (
    !!totalOutputTokens ? calcCreditTiered(totalOutputTokens, modelCard, 'textOutput') : 0
  ) as number;
  const totalInputCredit = (
    !!totalInputTokens ? calcCreditTiered(totalInputTokens, modelCard, 'textInput') : 0
  ) as number;

  const totalCredit =
    inputCacheMissCredit + inputCachedCredit + inputWriteCachedCredit + totalOutputCredit;

  return {
    inputAudio: !!usage.inputAudioTokens
      ? {
          credit: parseInt(calculateAudioInputCost(modelCard?.pricing, usage.inputAudioTokens).toFixed(0)),
          token: usage.inputAudioTokens,
        }
      : undefined,
    inputCacheMiss: !!inputCacheMissTokens
      ? { credit: inputCacheMissCredit, token: inputCacheMissTokens }
      : undefined,
    inputCached: !!inputCacheTokens
      ? { credit: inputCachedCredit, token: inputCacheTokens }
      : undefined,
    inputCachedWrite: !!inputWriteCacheTokens
      ? { credit: inputWriteCachedCredit, token: inputWriteCacheTokens }
      : undefined,
    inputCitation: !!usage.inputCitationTokens
      ? {
          credit: calcCreditTiered(usage.inputCitationTokens, modelCard, 'textInput'),
          token: usage.inputCitationTokens,
        }
      : undefined,
    inputText: !!inputTextTokens
      ? {
          credit: calcCreditTiered(inputTextTokens, modelCard, 'textInput'),
          token: inputTextTokens,
        }
      : undefined,

    outputAudio: !!usage.outputAudioTokens
      ? {
          credit: parseInt(calculateAudioOutputCost(modelCard?.pricing, usage.outputAudioTokens).toFixed(0)),
          id: 'outputAudio',
          token: usage.outputAudioTokens,
        }
      : undefined,
    outputReasoning: !!outputReasoningTokens
      ? {
          credit: calcCreditTiered(outputReasoningTokens, modelCard, 'textOutput'),
          token: outputReasoningTokens,
        }
      : undefined,
    outputText: !!outputTextTokens
      ? {
          credit: calcCreditTiered(outputTextTokens, modelCard, 'textOutput'),
          token: outputTextTokens,
        }
      : undefined,

    totalInput: !!totalInputTokens
      ? { credit: totalInputCredit, token: totalInputTokens }
      : undefined,
    totalOutput: !!totalOutputTokens
      ? { credit: totalOutputCredit, token: totalOutputTokens }
      : undefined,
    totalTokens: !!usage.totalTokens
      ? { credit: totalCredit, token: usage.totalTokens }
      : undefined,
  };
};
