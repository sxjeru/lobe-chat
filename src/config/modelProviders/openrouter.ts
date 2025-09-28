import { ModelProviderCard } from '@/types/llm';

// ref :https://openrouter.ai/docs#models
const OpenRouter: ModelProviderCard = {
  chatModels: [
    {
      contextWindowTokens: 2_000_000,
      description:
        '根据上下文长度、主题和复杂性，你的请求将发送到 Llama 3 405B Instruct、Claude 3.5 Sonnet 或 GPT-4o 等模型。',
      displayName: 'Auto Router',
      id: 'openrouter/auto',
      type: 'chat',
    },
    {
      contextWindowTokens: 128_000,
      description:
        'o1-mini是一款针对编程、数学和科学应用场景而设计的快速、经济高效的推理模型。该模型具有128K上下文和2023年10月的知识截止日期。',
      displayName: 'OpenAI o1-mini',
      id: 'openai/o1-mini',
      maxOutput: 65_536,
      releasedAt: '2024-09-12',
    },
    {
      contextWindowTokens: 200_000,
      description:
        'o1是OpenAI新的推理模型，支持图文输入并输出文本，适用于需要广泛通用知识的复杂任务。该模型具有200K上下文和2023年10月的知识截止日期。',
      displayName: 'OpenAI o1',
      id: 'openai/o1',
      maxOutput: 100_000,
      releasedAt: '2024-12-17',
      vision: true,
    },
    {
      contextWindowTokens: 128_000,
      description:
        'o1是OpenAI新的推理模型，适用于需要广泛通用知识的复杂任务。该模型具有128K上下文和2023年10月的知识截止日期。',
      displayName: 'OpenAI o1-preview',
      id: 'openai/o1-preview',
      maxOutput: 32_768,
      releasedAt: '2024-09-12',
    },
    {
      contextWindowTokens: 128_000,
      description:
        'GPT-4o mini是OpenAI在GPT-4 Omni之后推出的最新模型，支持图文输入并输出文本。作为他们最先进的小型模型，它比其他近期的前沿模型便宜很多，并且比GPT-3.5 Turbo便宜超过60%。它保持了最先进的智能，同时具有显著的性价比。GPT-4o mini在MMLU测试中获得了 82% 的得分，目前在聊天偏好上排名高于 GPT-4。',
      displayName: 'GPT-4o mini',
      functionCall: true,
      id: 'openai/gpt-4o-mini',
      maxOutput: 16_385,
      vision: true,
    },
    {
      contextWindowTokens: 128_000,
      description:
        'ChatGPT-4o 是一款动态模型，实时更新以保持当前最新版本。它结合了强大的语言理解与生成能力，适合于大规模应用场景，包括客户服务、教育和技术支持。',
      displayName: 'GPT-4o',
      functionCall: true,
      id: 'openai/gpt-4o',
      vision: true,
    },
    {
      contextWindowTokens: 200_000,
      description:
        'Claude 3 Haiku 是 Anthropic 的最快且最紧凑的模型，旨在实现近乎即时的响应。它具有快速且准确的定向性能。',
      displayName: 'Claude 3 Haiku',
      functionCall: true,
      id: 'anthropic/claude-3-haiku',
      maxOutput: 4096,
      releasedAt: '2024-03-07',
      vision: true,
    },
    {
      contextWindowTokens: 200_000,
      description:
        'Claude 3.5 Haiku 是 Anthropic 最快的下一代模型。与 Claude 3 Haiku 相比，Claude 3.5 Haiku 在各项技能上都有所提升，并在许多智力基准测试中超越了上一代最大的模型 Claude 3 Opus。',
      displayName: 'Claude 3.5 Haiku',
      functionCall: true,
      id: 'anthropic/claude-3.5-haiku',
      maxOutput: 8192,
      releasedAt: '2024-11-05',
    },
    {
      contextWindowTokens: 200_000,
      description:
        'Claude 3.5 Sonnet 提供了超越 Opus 的能力和比 Sonnet 更快的速度，同时保持与 Sonnet 相同的价格。Sonnet 特别擅长编程、数据科学、视觉处理、代理任务。',
      displayName: 'Claude 3.5 Sonnet',
      functionCall: true,
      id: 'anthropic/claude-3.5-sonnet',
      maxOutput: 8192,
      releasedAt: '2024-06-20',
      vision: true,
    },
    {
      contextWindowTokens: 200_000,
      description:
        'Claude 3 Opus 是 Anthropic 用于处理高度复杂任务的最强大模型。它在性能、智能、流畅性和理解力方面表现卓越。',
      displayName: 'Claude 3 Opus',
      functionCall: true,
      id: 'anthropic/claude-3-opus',
      maxOutput: 4096,
      releasedAt: '2024-02-29',
      vision: true,
    },
    {
      contextWindowTokens: 1_048_576 + 8192,
      description:
        'Gemini 2.0 Flash 提供下一代功能和改进，包括卓越的速度、原生工具使用、多模态生成和1M令牌上下文窗口。',
      displayName: 'Gemini 2.0 Flash',
      functionCall: true,
      id: 'google/gemini-2.0-flash-001',
      maxOutput: 8192,
      releasedAt: '2025-02-05',
      vision: true,
    },
    {
      contextWindowTokens: 128_000,
      description:
        '融合通用与代码能力的全新开源模型, 不仅保留了原有 Chat 模型的通用对话能力和 Coder 模型的强大代码处理能力，还更好地对齐了人类偏好。此外，DeepSeek-V2.5 在写作任务、指令跟随等多个方面也实现了大幅提升。',
      displayName: 'DeepSeek V2.5',
      functionCall: true,
      id: 'deepseek/deepseek-chat',
      releasedAt: '2024-09-05',
    },
    {
      contextWindowTokens: 163_840,
      description: 'DeepSeek-R1',
      displayName: 'DeepSeek R1',
      id: 'deepseek/deepseek-r1',
      releasedAt: '2025-01-20',
    },
    {
      contextWindowTokens: 163_840,
      description: 'DeepSeek-R1',
      displayName: 'DeepSeek R1 (Free)',
      id: 'deepseek/deepseek-r1:free',
      releasedAt: '2025-01-20',
    },
    {
      contextWindowTokens: 131_072,
      description:
        'LLaMA 3.2 旨在处理结合视觉和文本数据的任务。它在图像描述和视觉问答等任务中表现出色，跨越了语言生成和视觉推理之间的鸿沟。',
      displayName: 'Llama 3.2 11B Vision',
      id: 'meta-llama/llama-3.2-11b-vision-instruct',
      vision: true,
    },
    {
      contextWindowTokens: 131_072,
      description:
        'LLaMA 3.2 旨在处理结合视觉和文本数据的任务。它在图像描述和视觉问答等任务中表现出色，跨越了语言生成和视觉推理之间的鸿沟。',
      displayName: 'Llama 3.2 90B Vision',
      id: 'meta-llama/llama-3.2-90b-vision-instruct',
      vision: true,
    },
    {
      contextWindowTokens: 32_768,
      description:
        'Llama 3.3 是 Llama 系列最先进的多语言开源大型语言模型，以极低成本体验媲美 405B 模型的性能。基于 Transformer 结构，并通过监督微调（SFT）和人类反馈强化学习（RLHF）提升有用性和安全性。其指令调优版本专为多语言对话优化，在多项行业基准上表现优于众多开源和封闭聊天模型。知识截止日期为 2023 年 12 月',
      displayName: 'Llama 3.3 70B Instruct',
      functionCall: true,
      id: 'meta-llama/llama-3.3-70b-instruct',
    },
    {
      contextWindowTokens: 32_768,
      description:
        'Llama 3.3 是 Llama 系列最先进的多语言开源大型语言模型，以极低成本体验媲美 405B 模型的性能。基于 Transformer 结构，并通过监督微调（SFT）和人类反馈强化学习（RLHF）提升有用性和安全性。其指令调优版本专为多语言对话优化，在多项行业基准上表现优于众多开源和封闭聊天模型。知识截止日期为 2023 年 12 月',
      displayName: 'Llama 3.3 70B Instruct (Free)',
      functionCall: true,
      id: 'meta-llama/llama-3.3-70b-instruct:free',
    },
    {
      contextWindowTokens: 8192,
      description: 'Gemma 2 是Google轻量化的开源文本模型系列。',
      displayName: 'Gemma 2 9B (Free)',
      id: 'google/gemma-2-9b-it:free',
    },
  ],
  checkModel: 'google/gemma-2-9b-it:free',
  description:
    'OpenRouter 是一个提供多种前沿大模型接口的服务平台，支持 OpenAI、Anthropic、LLaMA 及更多，适合多样化的开发和应用需求。用户可根据自身需求灵活选择最优的模型和价格，助力AI体验的提升。',
  id: 'openrouter',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://openrouter.ai/models',
  name: 'OpenRouter',
  settings: {
    // OpenRouter don't support browser request
    // https://github.com/lobehub/lobe-chat/issues/5900
    disableBrowserRequest: true,
    proxyUrl: {
      placeholder: 'https://openrouter.ai/api/v1',
    },
    sdkType: 'openai',
    searchMode: 'params',
    showModelFetcher: true,
  },
  url: 'https://openrouter.ai',
};

export default OpenRouter;
