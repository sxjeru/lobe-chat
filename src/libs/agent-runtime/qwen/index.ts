import OpenAI from 'openai';

import { ModelProvider, UserMessageContentPart } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeQwenAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  chatCompletion: {
    handlePayload: (payload) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { temperature, messages, ...restPayload } = payload;
      const top_p = payload.top_p;
      const model = payload.model;
      const isVision = model.includes('vl');
      let newMessages = messages;

      if (Array.isArray(messages)) {
        newMessages = messages.map(message => {

          if (!Array.isArray(message.content)) {
            if (message.content === "") return null; // Content length must be greater than 0
            if (!isVision) return message; 
            return {
              ...message,
              content: [{
                text: message.content,
                type: 'text'
              } as UserMessageContentPart]
            };
          }
          return message;
        }).filter(message => message !== null);
      }
      
      return isVision ? {
        ...restPayload,
        messages: newMessages,
        stream: restPayload.stream ?? true,
        top_p: top_p && top_p >= 1 ? 0.9999 : top_p,
      } as OpenAI.ChatCompletionCreateParamsStreaming : {
        ...restPayload,
        messages: newMessages,
        stream: payload.stream ?? true,
        temperature,
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
