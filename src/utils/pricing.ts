import { Pricing, PricingUnit, PricingUnitName } from '@/types/aiModel';

/**
 * Internal helper to extract the displayed unit rate from a pricing unit by strategy
 * - fixed → rate
 * - tiered → tiers[0].rate
 * - lookup → first price value
 */
const getRateFromUnit = (unit: PricingUnit): number | undefined => {
  switch (unit.strategy) {
    case 'fixed': {
      return unit.rate;
    }
    case 'tiered': {
      return unit.tiers?.[0]?.rate;
    }
    case 'lookup': {
      const prices = Object.values(unit.lookup?.prices || {});
      return prices[0];
    }
    default: {
      return undefined;
    }
  }
};

/**
 * Get unit rate by unit name, used to deduplicate logic across helpers
 */
export const getUnitRateByName = (
  pricing?: Pricing,
  unitName?: PricingUnitName,
): number | undefined => {
  if (!pricing?.units || !unitName) return undefined;
  const unit = pricing.units.find((u) => u.name === unitName);
  if (!unit) return undefined;
  return getRateFromUnit(unit);
};

/**
 * Get text input unit rate from pricing
 * - fixed → rate
 * - tiered → tiers[0].rate
 * - lookup → Object.values(lookup.prices)[0]
 */
export function getTextInputUnitRate(pricing?: Pricing): number | undefined {
  return getUnitRateByName(pricing, 'textInput');
}

/**
 * Get text output unit rate from pricing
 */
export function getTextOutputUnitRate(pricing?: Pricing): number | undefined {
  return getUnitRateByName(pricing, 'textOutput');
}

/**
 * Get audio input unit rate from pricing
 */
export function getAudioInputUnitRate(pricing?: Pricing): number | undefined {
  return getUnitRateByName(pricing, 'audioInput');
}

/**
 * Get audio output unit rate from pricing
 */
export function getAudioOutputUnitRate(pricing?: Pricing): number | undefined {
  return getUnitRateByName(pricing, 'audioOutput');
}

/**
 * Get cached text input unit rate from pricing
 */
export function getCachedTextInputUnitRate(pricing?: Pricing): number | undefined {
  return getUnitRateByName(pricing, 'textInput_cacheRead');
}

/**
 * Get write cache input unit rate from pricing (TextInputCacheWrite)
 */
export function getWriteCacheInputUnitRate(pricing?: Pricing): number | undefined {
  return getUnitRateByName(pricing, 'textInput_cacheWrite');
}

/**
 * Get cached audio input unit rate from pricing
 */
export function getCachedAudioInputUnitRate(pricing?: Pricing): number | undefined {
  return getUnitRateByName(pricing, 'audioInput_cacheRead');
}

/**
 * Calculate the total cost for a given usage amount using tiered pricing
 * @param unit - The pricing unit configuration
 * @param amount - The usage amount (e.g., number of tokens)
 * @returns The total cost based on the tiered pricing structure
 */
export function calculateTieredCost(unit: PricingUnit, amount: number): number {
  if (amount <= 0) return 0;

  switch (unit.strategy) {
    case 'fixed': {
      return amount * unit.rate;
    }
    case 'tiered': {
      let totalCost = 0;
      let remainingAmount = amount;
      let previousLimit = 0;

      for (const tier of unit.tiers) {
        if (remainingAmount <= 0) break;

        const tierLimit = tier.upTo === 'infinity' ? Infinity : tier.upTo;
        const tierCapacity = tierLimit - previousLimit;
        const amountInThisTier = Math.min(remainingAmount, tierCapacity);
        
        totalCost += amountInThisTier * tier.rate;
        remainingAmount -= amountInThisTier;
        previousLimit = tierLimit === Infinity ? previousLimit : tierLimit;

        if (tier.upTo === 'infinity') break;
      }

      return totalCost;
    }
    case 'lookup': {
      // For lookup pricing, we can't calculate without knowing the lookup parameters
      // Return 0 or throw an error - this would need additional context
      return 0;
    }
    default: {
      return 0;
    }
  }
}

/**
 * Calculate the total cost for a pricing unit by name and amount
 * @param pricing - The pricing configuration
 * @param unitName - The name of the pricing unit
 * @param amount - The usage amount
 * @returns The total cost based on the pricing strategy
 */
export function calculateCostByUnitName(
  pricing?: Pricing,
  unitName?: PricingUnitName,
  amount?: number,
): number {
  if (!pricing?.units || !unitName || !amount || amount <= 0) return 0;
  
  const unit = pricing.units.find((u) => u.name === unitName);
  if (!unit) return 0;
  
  return calculateTieredCost(unit, amount);
}

/**
 * Calculate text input cost based on token amount
 */
export function calculateTextInputCost(pricing?: Pricing, tokens?: number): number {
  return calculateCostByUnitName(pricing, 'textInput', tokens);
}

/**
 * Calculate text output cost based on token amount
 */
export function calculateTextOutputCost(pricing?: Pricing, tokens?: number): number {
  return calculateCostByUnitName(pricing, 'textOutput', tokens);
}

/**
 * Calculate audio input cost based on usage amount
 */
export function calculateAudioInputCost(pricing?: Pricing, amount?: number): number {
  return calculateCostByUnitName(pricing, 'audioInput', amount);
}

/**
 * Calculate audio output cost based on usage amount
 */
export function calculateAudioOutputCost(pricing?: Pricing, amount?: number): number {
  return calculateCostByUnitName(pricing, 'audioOutput', amount);
}

/**
 * Calculate cached text input cost based on token amount
 */
export function calculateCachedTextInputCost(pricing?: Pricing, tokens?: number): number {
  return calculateCostByUnitName(pricing, 'textInput_cacheRead', tokens);
}

/**
 * Calculate write cache input cost based on token amount
 */
export function calculateWriteCacheInputCost(pricing?: Pricing, tokens?: number): number {
  return calculateCostByUnitName(pricing, 'textInput_cacheWrite', tokens);
}

/**
 * Calculate cached audio input cost based on usage amount
 */
export function calculateCachedAudioInputCost(pricing?: Pricing, amount?: number): number {
  return calculateCostByUnitName(pricing, 'audioInput_cacheRead', amount);
}
