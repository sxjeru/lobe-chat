import { describe, expect, it } from 'vitest';

import { mergeArrayById } from './merge';

describe('mergeArrayById', () => {
  it('should merge data', () => {
    const data = mergeArrayById(
      [
        {
          contextWindowTokens: 128_000,
          description:
            'o1-mini是一款针对编程、数学和科学应用场景而设计的快速、经济高效的推理模型。该模型具有128K上下文和2023年10月的知识截止日期。',
          displayName: 'OpenAI o1-mini',
          enabled: true,
          id: 'o1-mini',
          maxOutput: 65_536,
          pricing: {
            input: 3,
            output: 12,
          },
          releasedAt: '2024-09-12',
          type: 'chat',
        },
      ],
      [{ id: 'o1-mini', displayName: 'OpenAI o1-mini ABC', type: 'chat' }],
    );

    expect(data).toEqual([
      {
        contextWindowTokens: 128_000,
        description:
          'o1-mini是一款针对编程、数学和科学应用场景而设计的快速、经济高效的推理模型。该模型具有128K上下文和2023年10月的知识截止日期。',
        displayName: 'OpenAI o1-mini ABC',
        enabled: true,
        id: 'o1-mini',
        maxOutput: 65_536,
        pricing: {
          input: 3,
          output: 12,
        },
        releasedAt: '2024-09-12',
        type: 'chat',
      },
    ]);
  });

  it('should merge data with objects', () => {
    const data = mergeArrayById(
      [
        {
          contextWindowTokens: 128_000,
          description:
            'o1-mini是一款针对编程、数学和科学应用场景而设计的快速、经济高效的推理模型。该模型具有128K上下文和2023年10月的知识截止日期。',
          displayName: 'OpenAI o1-mini',
          enabled: true,
          id: 'o3-mini',
          abilities: {
            functionCall: true,
          },
          maxOutput: 65_536,
          pricing: {
            input: 3,
            output: 12,
          },
          releasedAt: '2024-09-12',
          type: 'chat',
        },
      ],
      [
        {
          id: 'o3-mini',
          contextWindowTokens: null,
          displayName: 'OpenAI o1-mini ABC',
          type: 'chat',
          abilities: {},
          enabled: false,
        },
      ],
    );

    expect(data).toEqual([
      {
        contextWindowTokens: 128_000,
        description:
          'o1-mini是一款针对编程、数学和科学应用场景而设计的快速、经济高效的推理模型。该模型具有128K上下文和2023年10月的知识截止日期。',
        displayName: 'OpenAI o1-mini ABC',
        enabled: false,
        id: 'o3-mini',
        maxOutput: 65_536,
        pricing: {
          input: 3,
          output: 12,
        },
        abilities: {
          functionCall: true,
        },
        releasedAt: '2024-09-12',
        type: 'chat',
      },
    ]);
  });

  describe('empty array handling', () => {
    it('should return empty array when both inputs are empty', () => {
      const result = mergeArrayById([], []);
      expect(result).toEqual([]);
    });

    it('should return all default items when user items is empty', () => {
      const defaultItems = [
        { id: '1', name: 'Default 1', value: 100 },
        { id: '2', name: 'Default 2', value: 200 },
      ];

      const result = mergeArrayById(defaultItems, []);
      expect(result).toEqual(defaultItems);
    });

    it('should return all user items when default items is empty', () => {
      const userItems = [
        { id: '1', name: 'User 1', value: 300 },
        { id: '2', name: 'User 2', value: 400 },
      ];

      const result = mergeArrayById([], userItems);
      expect(result).toEqual(userItems);
    });
  });

  describe('ID matching scenarios', () => {
    it('should handle user items with IDs not in default items', () => {
      const defaultItems = [{ id: '1', name: 'Default 1', value: 100 }];
      const userItems = [
        { id: '1', name: 'User 1', value: 200 },
        { id: '2', name: 'User 2', value: 300 }, // New ID
      ];

      const result = mergeArrayById(defaultItems, userItems);
      expect(result).toHaveLength(2);
      expect(result).toContainEqual({ id: '1', name: 'User 1', value: 200 });
      expect(result).toContainEqual({ id: '2', name: 'User 2', value: 300 });
    });

    it('should merge multiple items correctly and preserve default order', () => {
      const defaultItems = [
        { id: '1', name: 'Default 1', value: 100, meta: { key: 'value' } },
        { id: '2', name: 'Default 2', value: 200, meta: { key: 'value' } },
      ];

      const userItems = [
        { id: '2', name: 'User 2', value: 300 },
        { id: '1', name: 'User 1', value: 400 },
      ];

      const result = mergeArrayById(defaultItems, userItems);

      expect(result).toHaveLength(2);
      // Verify order follows defaultItems (1, 2), not userItems (2, 1)
      expect(result).toEqual([
        {
          id: '1',
          name: 'User 1',
          value: 400,
          meta: { key: 'value' },
        },
        {
          id: '2',
          name: 'User 2',
          value: 300,
          meta: { key: 'value' },
        },
      ]);
    });
  });

  describe('special value handling', () => {
    it('should handle undefined values by keeping default values', () => {
      const defaultItems = [{ id: '1', name: 'Default', value: 100, meta: { key: 'value' } }];

      const userItems = [{ id: '1', name: undefined, value: 200, meta: undefined }];

      const result = mergeArrayById(defaultItems, userItems as any);

      expect(result).toEqual([{ id: '1', name: 'Default', value: 200, meta: { key: 'value' } }]);
    });

    it('should handle nested objects correctly', () => {
      const defaultItems = [
        {
          id: '1',
          config: {
            deep: {
              value: 100,
              keep: true,
            },
            surface: 'default',
          },
        },
      ];

      const userItems = [
        {
          id: '1',
          config: {
            deep: {
              value: 200,
            },
            surface: 'changed',
          },
        },
      ];

      const result = mergeArrayById(defaultItems, userItems);

      expect(result[0].config).toEqual({
        deep: {
          value: 200,
          keep: true,
        },
        surface: 'changed',
      });
    });
  });

  describe('edge cases', () => {
    it('should handle objects missing id property', () => {
      const defaultItems = [{ id: '1', name: 'Default' }];

      const userItems = [{ name: 'Invalid' }];

      expect(mergeArrayById(defaultItems, userItems as any)).toEqual([
        { id: '1', name: 'Default' },
        { name: 'Invalid' },
      ]);
    });

    it('should preserve the source objects (no mutation)', () => {
      const defaultItems = [{ id: '1', name: 'Default', meta: { key: 'value' } }];
      const userItems = [{ id: '1', name: 'User' }];

      const defaultItemsClone = JSON.parse(JSON.stringify(defaultItems));
      const userItemsClone = JSON.parse(JSON.stringify(userItems));

      mergeArrayById(defaultItems, userItems);

      expect(defaultItems).toEqual(defaultItemsClone);
      expect(userItems).toEqual(userItemsClone);
    });

    it('should handle duplicate IDs in user items by using the last occurrence', () => {
      const defaultItems = [{ id: '1', name: 'Default', value: 100 }];
      const userItems = [
        { id: '1', name: 'User 1', value: 200 },
        { id: '1', name: 'User 2', value: 300 }, // Duplicate ID
      ];

      const result = mergeArrayById(defaultItems, userItems);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: '1',
        name: 'User 2',
        value: 300,
      });
    });
  });

  it('should merge data with not empty objects', () => {
    const data = mergeArrayById(
      [
        {
          abilities: {
            reasoning: true,
            functionCalling: true,
          },
          config: {
            deploymentName: 'o1',
          },
          contextWindowTokens: 200000,
          description:
            'o1是OpenAI新的推理模型，支持图文输入并输出文本，适用于需要广泛通用知识的复杂任务。该模型具有200K上下文和2023年10月的知识截止日期。',
          displayName: 'OpenAI o1',
          enabled: true,
          id: 'o1',
          maxOutput: 100000,
          pricing: {
            input: 15,
            output: 60,
          },
          releasedAt: '2024-12-17',
          type: 'chat',
          source: 'builtin',
        },
      ],
      [
        {
          abilities: {
            reasoning: true,
          },
          config: {
            deploymentName: 'ddd',
          },
          contextWindowTokens: 200000,
          description:
            'o1是OpenAI新的推理模型，支持图文输入并输出文本，适用于需要广泛通用知识的复杂任务。该模型具有200K上下文和2023年10月的知识截止日期。',
          displayName: 'OpenAI o1',
          enabled: true,
          id: 'o1',
          maxOutput: 100000,
          releasedAt: '2024-12-17',
          type: 'chat',
        },
      ],
    );

    expect(data).toEqual([
      {
        abilities: {
          functionCalling: true,
          reasoning: true,
        },
        config: {
          deploymentName: 'ddd',
        },
        contextWindowTokens: 200000,
        description:
          'o1是OpenAI新的推理模型，支持图文输入并输出文本，适用于需要广泛通用知识的复杂任务。该模型具有200K上下文和2023年10月的知识截止日期。',
        displayName: 'OpenAI o1',
        enabled: true,
        id: 'o1',
        pricing: {
          input: 15,
          output: 60,
        },
        source: 'builtin',
        maxOutput: 100000,
        releasedAt: '2024-12-17',
        type: 'chat',
      },
    ]);
  });

  describe('ordering', () => {
    const idList = (items: Array<{ id?: string }>) => items.map((item) => item.id);

    it('keeps default order when user enables a model (no sort field)', () => {
      const defaultItems = [
        { id: 'alpha', name: 'A' },
        { id: 'beta', name: 'B' },
        { id: 'gamma', name: 'C' },
      ];
      const userItems = [{ id: 'beta', enabled: true, name: 'B' }];

      const result = mergeArrayById(defaultItems, userItems);

      expect(idList(result)).toEqual(['alpha', 'beta', 'gamma']);
      expect(result[1]).toMatchObject({ id: 'beta', enabled: true });
    });

    it('treats sort: null as no custom sort (DB returns null for unsorted models)', () => {
      const defaultItems = [
        { id: 'gpt-4o', displayName: 'GPT-4o', enabled: true, source: 'builtin' },
        { id: 'gpt-4o-mini', displayName: 'GPT-4o mini', enabled: true, source: 'builtin' },
        { id: 'o1', displayName: 'o1', enabled: false, source: 'builtin' },
        { id: 'o1-mini', displayName: 'o1-mini', enabled: false, source: 'builtin' },
        { id: 'o3-mini', displayName: 'o3-mini', enabled: true, source: 'builtin' },
      ];

      // User enables o1 and o1-mini — DB creates records with sort=null
      const userItems = [
        { id: 'o1', enabled: true, sort: null, source: 'builtin' },
        { id: 'o1-mini', enabled: true, sort: null, source: 'builtin' },
      ] as any[];

      const result = mergeArrayById(defaultItems, userItems);

      // o1 and o1-mini should stay in positions 3 and 4, not jump to front
      expect(idList(result)).toEqual(['gpt-4o', 'gpt-4o-mini', 'o1', 'o1-mini', 'o3-mini']);
      expect(result[2]).toMatchObject({ id: 'o1', enabled: true });
      expect(result[3]).toMatchObject({ id: 'o1-mini', enabled: true });
    });

    it('places custom models at the end when no sort is provided', () => {
      const defaultItems = [
        { id: 'openai', name: 'OpenAI' },
        { id: 'anthropic', name: 'Anthropic' },
      ];
      const userItems = [{ id: 'custom-model', name: 'My Model' }];

      const result = mergeArrayById(defaultItems, userItems);

      expect(idList(result)).toEqual(['openai', 'anthropic', 'custom-model']);
    });

    it('respects user sort values when present', () => {
      const defaultItems = [
        { id: 'openai', name: 'OpenAI', meta: { provider: 'openai', tags: ['official'] } },
        { id: 'anthropic', name: 'Anthropic' },
        { id: 'google', name: 'Google' },
      ];
      const userItems = [
        { id: 'google', sort: 0 },
        { id: 'openai', sort: 1, meta: { description: 'customized' } },
      ] as any[];

      const result = mergeArrayById(defaultItems, userItems);

      // anthropic (unsorted, defaultIndex=1) → forward neighbor google (defaultIndex=2, sort=0) → insert before google
      expect(idList(result)).toEqual(['anthropic', 'google', 'openai']);
      expect(result[2].meta).toEqual({
        provider: 'openai',
        tags: ['official'],
        description: 'customized',
      });
    });

    it('inserts newly enabled models at correct position with existing sort', () => {
      const defaultItems = [{ id: 'alpha' }, { id: 'beta' }, { id: 'gamma' }, { id: 'delta' }];
      const userItems = [
        { id: 'alpha', sort: 0 },
        { id: 'delta', sort: 1 },
      ] as any[];

      const result = mergeArrayById(defaultItems, userItems);

      expect(idList(result)).toEqual(['alpha', 'beta', 'gamma', 'delta']);
    });

    it('handles all user items having sort values with new default model', () => {
      const defaultItems = [{ id: 'alpha' }, { id: 'new-model' }, { id: 'beta' }, { id: 'gamma' }];
      const userItems = [
        { id: 'gamma', sort: 0 },
        { id: 'alpha', sort: 1 },
        { id: 'beta', sort: 2 },
      ] as any[];

      const result = mergeArrayById(defaultItems, userItems);

      // new-model (defaultIndex=1) → forward find beta (defaultIndex=2, sort=2) → insert before beta
      expect(idList(result)).toEqual(['gamma', 'alpha', 'new-model', 'beta']);
    });

    it('handles multiple models with the same sort value', () => {
      const defaultItems = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
      const userItems = [
        { id: 'c', sort: 0 },
        { id: 'a', sort: 0 },
        { id: 'b', sort: 0 },
      ] as any[];

      const result = mergeArrayById(defaultItems, userItems);

      // Same sort → break tie by defaultIndex: a(0), b(1), c(2)
      expect(idList(result)).toEqual(['a', 'b', 'c']);
    });

    it('handles custom model with sort value among defaults', () => {
      const defaultItems = [{ id: 'alpha' }, { id: 'beta' }];
      const userItems = [
        { id: 'alpha', sort: 0 },
        { id: 'custom', sort: 1 },
        { id: 'beta', sort: 2 },
      ] as any[];

      const result = mergeArrayById(defaultItems, userItems);

      expect(idList(result)).toEqual(['alpha', 'custom', 'beta']);
    });

    it('comprehensive: custom sort with newly enabled models', () => {
      const defaultItems = [
        { id: 'gpt-4' },
        { id: 'gpt-3.5' },
        { id: 'claude-3' },
        { id: 'claude-2' },
        { id: 'gemini-pro' },
      ];
      const userItems = [
        { id: 'claude-3', sort: 0 },
        { id: 'gpt-4', sort: 1 },
        { id: 'gemini-pro', sort: 2 },
      ] as any[];

      const result = mergeArrayById(defaultItems, userItems);

      // gpt-3.5 (defaultIndex=1): forward → claude-3 (defaultIndex=2, sort=0) → insert at 0
      // claude-2 (defaultIndex=3): forward → gemini-pro (defaultIndex=4, sort=2) → insert at 2
      expect(idList(result)).toEqual(['gpt-3.5', 'claude-3', 'gpt-4', 'claude-2', 'gemini-pro']);
    });
  });
});
