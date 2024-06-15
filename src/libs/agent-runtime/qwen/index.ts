import OpenAI from 'openai';

import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeQwenAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  chatCompletion: {
    handlePayload: (payload) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { temperature, messages, ...restPayload } = payload;
      const top_p = payload.top_p;
      const model = payload.model;

      if (Array.isArray(messages)) {
        messages = messages.map(message => {
          if (!Array.isArray(message.content)) {
            return {
              ...message,
              content: {
                text: message.content,
                type: 'text'
              }
            };
          }
          return message;
        });
      }
      
      return model.includes('-vl-') ? {
        ...restPayload,
        messages,
        stream: restPayload.stream ?? true,
        top_p: top_p && top_p >= 1 ? 0.9999 : top_p,
      } as OpenAI.ChatCompletionCreateParamsStreaming : {
        ...payload,
        stream: payload.stream ?? true,
        top_p: top_p && top_p >= 1 ? 0.9999 : top_p,
      } as OpenAI.ChatCompletionCreateParamsStreaming;
    },
  },
  constructorOptions: {
    defaultHeaders: {
      'Content-Type': 'application/json',
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_QWEN_CHAT_COMPLETION === '1',
  },

  provider: ModelProvider.Qwen,
});
