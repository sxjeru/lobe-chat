import { describe, expect, it } from 'vitest';

import { Pricing, TieredPricingUnit, FixedPricingUnit } from '@/types/aiModel';

import {
  calculateAudioInputCost,
  calculateAudioOutputCost,
  calculateCachedAudioInputCost,
  calculateCachedTextInputCost,
  calculateCostByUnitName,
  calculateTextInputCost,
  calculateTextOutputCost,
  calculateTieredCost,
  calculateWriteCacheInputCost,
  getAudioInputUnitRate,
  getAudioOutputUnitRate,
  getCachedAudioInputUnitRate,
  getCachedTextInputUnitRate,
  getTextInputUnitRate,
  getTextOutputUnitRate,
  getUnitRateByName,
  getWriteCacheInputUnitRate,
} from './pricing';

describe('pricing utilities (new)', () => {
  describe('getUnitRateByName', () => {
    it('returns undefined when pricing or unitName is missing', () => {
      expect(getUnitRateByName()).toBeUndefined();
      const p = { units: [] } as Pricing;
      expect(getUnitRateByName(p)).toBeUndefined();
    });

    it('returns undefined when unit not found', () => {
      const pricing: Pricing = {
        units: [{ name: 'textOutput', strategy: 'fixed', unit: 'millionTokens', rate: 0.002 }],
      };
      expect(getUnitRateByName(pricing, 'textInput')).toBeUndefined();
    });

    it('handles fixed strategy', () => {
      const pricing: Pricing = {
        units: [{ name: 'textInput', strategy: 'fixed', unit: 'millionTokens', rate: 0.001 }],
      };
      expect(getUnitRateByName(pricing, 'textInput')).toBe(0.001);
    });

    it('handles tiered strategy (first tier)', () => {
      const pricing: Pricing = {
        units: [
          {
            name: 'audioInput',
            strategy: 'tiered',
            unit: 'second',
            tiers: [
              { rate: 0.01, upTo: 3600 },
              { rate: 0.008, upTo: 'infinity' },
            ],
          },
        ],
      };
      expect(getUnitRateByName(pricing, 'audioInput')).toBe(0.01);
    });

    it('returns undefined when tiered.tiers is absent or empty', () => {
      const noTiers: Pricing = {
        units: [
          { name: 'textInput', strategy: 'tiered', unit: 'millionTokens', tiers: undefined as any },
        ],
      };
      const emptyTiers: Pricing = {
        units: [{ name: 'textInput', strategy: 'tiered', unit: 'millionTokens', tiers: [] }],
      };
      expect(getUnitRateByName(noTiers, 'textInput')).toBeUndefined();
      expect(getUnitRateByName(emptyTiers, 'textInput')).toBeUndefined();
    });

    it('handles lookup strategy (first price value)', () => {
      const pricing: Pricing = {
        units: [
          {
            name: 'textInput',
            strategy: 'lookup',
            unit: 'millionTokens',
            lookup: {
              pricingParams: ['model'],
              prices: { a: 0.001, b: 0.03 },
            },
          },
        ],
      };
      expect(getUnitRateByName(pricing, 'textInput')).toBe(0.001);
    });

    it('returns undefined when lookup missing or has no prices', () => {
      const missingLookup: Pricing = {
        units: [
          {
            name: 'textInput',
            strategy: 'lookup',
            unit: 'millionTokens',
            lookup: undefined as any,
          },
        ],
      } as any;
      const emptyPrices: Pricing = {
        units: [
          {
            name: 'textInput',
            strategy: 'lookup',
            unit: 'millionTokens',
            lookup: { pricingParams: ['model'], prices: {} },
          },
        ],
      };
      expect(getUnitRateByName(missingLookup, 'textInput')).toBeUndefined();
      expect(getUnitRateByName(emptyPrices, 'textInput')).toBeUndefined();
    });

    it('works with multiple units', () => {
      const pricing: Pricing = {
        units: [
          { name: 'textInput', strategy: 'fixed', unit: 'millionTokens', rate: 0.001 },
          { name: 'textOutput', strategy: 'fixed', unit: 'millionTokens', rate: 0.002 },
          {
            name: 'audioInput',
            strategy: 'tiered',
            unit: 'second',
            tiers: [
              { rate: 0.01, upTo: 3600 },
              { rate: 0.008, upTo: 'infinity' },
            ],
          },
        ],
      };
      expect(getUnitRateByName(pricing, 'textInput')).toBe(0.001);
      expect(getUnitRateByName(pricing, 'textOutput')).toBe(0.002);
      expect(getUnitRateByName(pricing, 'audioInput')).toBe(0.01);
    });
  });

  describe('wrapper helpers', () => {
    it('return the same values as getUnitRateByName for each unit', () => {
      const pricing: Pricing = {
        units: [
          { name: 'textInput', strategy: 'fixed', unit: 'millionTokens', rate: 0.001 },
          { name: 'textOutput', strategy: 'fixed', unit: 'millionTokens', rate: 0.002 },
          {
            name: 'audioInput',
            strategy: 'tiered',
            unit: 'second',
            tiers: [
              { rate: 0.01, upTo: 3600 },
              { rate: 0.008, upTo: 'infinity' },
            ],
          },
          { name: 'audioOutput', strategy: 'fixed', unit: 'second', rate: 0.015 },
          { name: 'textInput_cacheRead', strategy: 'fixed', unit: 'millionTokens', rate: 0.0005 },
          {
            name: 'textInput_cacheWrite',
            strategy: 'lookup',
            unit: 'millionTokens',
            lookup: { pricingParams: ['ttl'], prices: { '5': 0.2, '60': 0.6 } },
          },
          { name: 'audioInput_cacheRead', strategy: 'fixed', unit: 'second', rate: 0.005 },
        ],
      };

      expect(getTextInputUnitRate(pricing)).toBe(getUnitRateByName(pricing, 'textInput'));
      expect(getTextOutputUnitRate(pricing)).toBe(getUnitRateByName(pricing, 'textOutput'));
      expect(getAudioInputUnitRate(pricing)).toBe(getUnitRateByName(pricing, 'audioInput'));
      expect(getAudioOutputUnitRate(pricing)).toBe(getUnitRateByName(pricing, 'audioOutput'));
      expect(getCachedTextInputUnitRate(pricing)).toBe(
        getUnitRateByName(pricing, 'textInput_cacheRead'),
      );
      expect(getWriteCacheInputUnitRate(pricing)).toBe(
        getUnitRateByName(pricing, 'textInput_cacheWrite'),
      );
      expect(getCachedAudioInputUnitRate(pricing)).toBe(
        getUnitRateByName(pricing, 'audioInput_cacheRead'),
      );

      // also validate expected concrete values for clarity
      expect(getTextInputUnitRate(pricing)).toBe(0.001);
      expect(getTextOutputUnitRate(pricing)).toBe(0.002);
      expect(getAudioInputUnitRate(pricing)).toBe(0.01);
      expect(getAudioOutputUnitRate(pricing)).toBe(0.015);
      expect(getCachedTextInputUnitRate(pricing)).toBe(0.0005);
      expect(getWriteCacheInputUnitRate(pricing)).toBe(0.2);
      expect(getCachedAudioInputUnitRate(pricing)).toBe(0.005);
    });
  });

  describe('calculateTieredCost', () => {
    it('returns 0 for zero or negative amounts', () => {
      const unit: FixedPricingUnit = {
        name: 'textInput',
        strategy: 'fixed',
        unit: 'millionTokens',
        rate: 0.001,
      };

      expect(calculateTieredCost(unit, 0)).toBe(0);
      expect(calculateTieredCost(unit, -10)).toBe(0);
    });

    it('handles fixed pricing strategy', () => {
      const unit: FixedPricingUnit = {
        name: 'textInput',
        strategy: 'fixed',
        unit: 'millionTokens',
        rate: 0.001,
      };

      expect(calculateTieredCost(unit, 1000)).toBe(1);
      expect(calculateTieredCost(unit, 500)).toBe(0.5);
    });

    it('handles tiered pricing strategy with single tier', () => {
      const unit: TieredPricingUnit = {
        name: 'textInput',
        strategy: 'tiered',
        unit: 'millionTokens',
        tiers: [{ rate: 0.001, upTo: 'infinity' }],
      };

      expect(calculateTieredCost(unit, 1000)).toBe(1);
      expect(calculateTieredCost(unit, 2000)).toBe(2);
    });

    it('handles tiered pricing strategy with multiple tiers', () => {
      const unit: TieredPricingUnit = {
        name: 'textInput',
        strategy: 'tiered',
        unit: 'millionTokens',
        tiers: [
          { rate: 0.01, upTo: 1000 }, // First 1000 tokens at $0.01 per token
          { rate: 0.005, upTo: 5000 }, // Next 4000 tokens at $0.005 per token  
          { rate: 0.002, upTo: 'infinity' }, // Remaining tokens at $0.002 per token
        ],
      };

      // 500 tokens - all in first tier: 500 * 0.01 = 5
      expect(calculateTieredCost(unit, 500)).toBe(5);

      // 1500 tokens - 1000 in first tier + 500 in second tier: 1000 * 0.01 + 500 * 0.005 = 12.5
      expect(calculateTieredCost(unit, 1500)).toBe(12.5);

      // 6000 tokens - 1000 in first + 4000 in second + 1000 in third: 1000 * 0.01 + 4000 * 0.005 + 1000 * 0.002 = 32
      expect(calculateTieredCost(unit, 6000)).toBe(32);

      // 10000 tokens - all tiers: 1000 * 0.01 + 4000 * 0.005 + 5000 * 0.002 = 40
      expect(calculateTieredCost(unit, 10000)).toBe(40);
    });

    it('handles lookup pricing strategy', () => {
      const unit = {
        name: 'textInput',
        strategy: 'lookup',
        unit: 'millionTokens',
        lookup: { pricingParams: ['model'], prices: { 'gpt-4': 0.03, 'gpt-3.5': 0.002 } },
      } as any;

      // Lookup strategy returns 0 as we need additional context
      expect(calculateTieredCost(unit, 1000)).toBe(0);
    });

    it('handles tiered pricing with exact tier boundaries', () => {
      const unit: TieredPricingUnit = {
        name: 'audioInput',
        strategy: 'tiered',
        unit: 'second',
        tiers: [
          { rate: 0.01, upTo: 3600 }, // First hour at $0.01 per second
          { rate: 0.008, upTo: 'infinity' }, // After first hour at $0.008 per second
        ],
      };

      // Exactly 3600 seconds: 3600 * 0.01 = 36
      expect(calculateTieredCost(unit, 3600)).toBe(36);

      // 3601 seconds: 3600 * 0.01 + 1 * 0.008 = 36.008
      expect(calculateTieredCost(unit, 3601)).toBe(36.008);
    });
  });

  describe('calculateCostByUnitName', () => {
    const pricing: Pricing = {
      units: [
        { name: 'textInput', strategy: 'fixed', unit: 'millionTokens', rate: 0.001 },
        {
          name: 'textOutput',
          strategy: 'tiered',
          unit: 'millionTokens',
          tiers: [
            { rate: 0.002, upTo: 1000 },
            { rate: 0.001, upTo: 'infinity' },
          ],
        },
      ],
    };

    it('returns 0 when parameters are missing or invalid', () => {
      expect(calculateCostByUnitName()).toBe(0);
      expect(calculateCostByUnitName(pricing)).toBe(0);
      expect(calculateCostByUnitName(pricing, 'textInput')).toBe(0);
      expect(calculateCostByUnitName(pricing, 'textInput', 0)).toBe(0);
      expect(calculateCostByUnitName(pricing, 'textInput', -10)).toBe(0);
    });

    it('returns 0 when unit is not found', () => {
      expect(calculateCostByUnitName(pricing, 'nonexistent' as any, 1000)).toBe(0);
    });

    it('calculates cost for fixed pricing unit', () => {
      expect(calculateCostByUnitName(pricing, 'textInput', 1000)).toBe(1);
    });

    it('calculates cost for tiered pricing unit', () => {
      // 500 tokens in first tier: 500 * 0.002 = 1
      expect(calculateCostByUnitName(pricing, 'textOutput', 500)).toBe(1);
      
      // 1500 tokens across tiers: 1000 * 0.002 + 500 * 0.001 = 2.5
      expect(calculateCostByUnitName(pricing, 'textOutput', 1500)).toBe(2.5);
    });
  });

  describe('cost calculation helper functions', () => {
    const pricing: Pricing = {
      units: [
        { name: 'textInput', strategy: 'fixed', unit: 'millionTokens', rate: 0.001 },
        { name: 'textOutput', strategy: 'fixed', unit: 'millionTokens', rate: 0.002 },
        {
          name: 'audioInput',
          strategy: 'tiered',
          unit: 'second',
          tiers: [
            { rate: 0.01, upTo: 3600 },
            { rate: 0.008, upTo: 'infinity' },
          ],
        },
        { name: 'audioOutput', strategy: 'fixed', unit: 'second', rate: 0.015 },
        { name: 'textInput_cacheRead', strategy: 'fixed', unit: 'millionTokens', rate: 0.0005 },
        { name: 'textInput_cacheWrite', strategy: 'fixed', unit: 'millionTokens', rate: 0.003 },
        { name: 'audioInput_cacheRead', strategy: 'fixed', unit: 'second', rate: 0.005 },
      ],
    };

    it('calculateTextInputCost works correctly', () => {
      expect(calculateTextInputCost(pricing, 1000)).toBe(1);
      expect(calculateTextInputCost(pricing, 500)).toBe(0.5);
      expect(calculateTextInputCost()).toBe(0);
    });

    it('calculateTextOutputCost works correctly', () => {
      expect(calculateTextOutputCost(pricing, 1000)).toBe(2);
      expect(calculateTextOutputCost(pricing, 500)).toBe(1);
      expect(calculateTextOutputCost()).toBe(0);
    });

    it('calculateAudioInputCost works correctly with tiered pricing', () => {
      // 1800 seconds in first tier: 1800 * 0.01 = 18
      expect(calculateAudioInputCost(pricing, 1800)).toBe(18);
      
      // 4000 seconds: 3600 * 0.01 + 400 * 0.008 = 39.2
      expect(calculateAudioInputCost(pricing, 4000)).toBe(39.2);
      
      expect(calculateAudioInputCost()).toBe(0);
    });

    it('calculateAudioOutputCost works correctly', () => {
      expect(calculateAudioOutputCost(pricing, 100)).toBe(1.5);
      expect(calculateAudioOutputCost()).toBe(0);
    });

    it('calculateCachedTextInputCost works correctly', () => {
      expect(calculateCachedTextInputCost(pricing, 1000)).toBe(0.5);
      expect(calculateCachedTextInputCost()).toBe(0);
    });

    it('calculateWriteCacheInputCost works correctly', () => {
      expect(calculateWriteCacheInputCost(pricing, 1000)).toBe(3);
      expect(calculateWriteCacheInputCost()).toBe(0);
    });

    it('calculateCachedAudioInputCost works correctly', () => {
      expect(calculateCachedAudioInputCost(pricing, 100)).toBe(0.5);
      expect(calculateCachedAudioInputCost()).toBe(0);
    });
  });
});
