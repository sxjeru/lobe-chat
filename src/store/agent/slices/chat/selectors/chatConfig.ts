import { contextCachingModels, thinkingWithToolClaudeModels } from '@/const/models';
import { DEFAULT_AGENT_CHAT_CONFIG, DEFAULT_AGENT_SEARCH_FC_MODEL } from '@/const/settings';
import { AgentStoreState } from '@/store/agent/initialState';
import { getAiInfraStoreState } from '@/store/aiInfra';
import { aiModelSelectors } from '@/store/aiInfra/selectors';
import { LobeAgentChatConfig } from '@/types/agent';

import { currentAgentConfig } from './agent';

export const currentAgentChatConfig = (s: AgentStoreState): LobeAgentChatConfig =>
  currentAgentConfig(s).chatConfig || {};

const agentSearchMode = (s: AgentStoreState) => {
  // 只从模型 settings 读取
  const config = currentAgentConfig(s);
  const aiInfraState = getAiInfraStoreState();

  // 确保 model 和 provider 都存在
  if (config.model && config.provider) {
    const modelCard = aiModelSelectors.getEnabledModelById(
      config.model,
      config.provider,
    )(aiInfraState);

    // 返回模型 settings 中的配置，如果没有则返回默认值 'off'
    return modelCard?.settings?.searchMode ?? 'off';
  }

  return 'off';
};

const isAgentEnableSearch = (s: AgentStoreState) => agentSearchMode(s) !== 'off';

const useModelBuiltinSearch = (s: AgentStoreState) => {
  // 只从模型 settings 读取
  const config = currentAgentConfig(s);
  const aiInfraState = getAiInfraStoreState();

  // 确保 model 和 provider 都存在
  if (config.model && config.provider) {
    const modelCard = aiModelSelectors.getEnabledModelById(
      config.model,
      config.provider,
    )(aiInfraState);

    // 返回模型 settings 中的配置
    return modelCard?.settings?.useModelBuiltinSearch;
  }

  return undefined;
};

const searchFCModel = (s: AgentStoreState) =>
  currentAgentChatConfig(s).searchFCModel || DEFAULT_AGENT_SEARCH_FC_MODEL;

const enableHistoryCount = (s: AgentStoreState) => {
  const config = currentAgentConfig(s);
  const chatConfig = currentAgentChatConfig(s);

  // 如果开启了上下文缓存，且当前模型类型匹配，则不开启历史记录
  const enableContextCaching = !chatConfig.disableContextCaching;

  if (enableContextCaching && contextCachingModels.has(config.model)) return false;

  // 当开启搜索时，针对 claude 3.7 sonnet 模型不开启历史记录
  const enableSearch = isAgentEnableSearch(s);

  if (enableSearch && thinkingWithToolClaudeModels.has(config.model)) return false;

  return chatConfig.enableHistoryCount;
};

const historyCount = (s: AgentStoreState): number => {
  const chatConfig = currentAgentChatConfig(s);

  return chatConfig.historyCount ?? (DEFAULT_AGENT_CHAT_CONFIG.historyCount as number); // historyCount 为 0 即不携带历史消息
};

const displayMode = (s: AgentStoreState) => {
  const chatConfig = currentAgentChatConfig(s);

  return chatConfig.displayMode || 'chat';
};

const enableHistoryDivider =
  (historyLength: number, currentIndex: number) => (s: AgentStoreState) => {
    const config = currentAgentChatConfig(s);

    return (
      enableHistoryCount(s) &&
      historyLength > (config.historyCount ?? 0) &&
      config.historyCount === historyLength - currentIndex
    );
  };

export const agentChatConfigSelectors = {
  agentSearchMode,
  currentChatConfig: currentAgentChatConfig,
  displayMode,
  enableHistoryCount,
  enableHistoryDivider,
  historyCount,
  isAgentEnableSearch,
  searchFCModel,
  useModelBuiltinSearch,
};
