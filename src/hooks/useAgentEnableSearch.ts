import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { aiModelSelectors, useAiInfraStore } from '@/store/aiInfra';

export const useAgentEnableSearch = () => {
  const [model, provider] = useAgentStore((s) => [
    agentSelectors.currentAgentModel(s),
    agentSelectors.currentAgentModelProvider(s),
  ]);
  const activeProvider = useAiInfraStore((s) => s.activeAiProvider);
  const enabledModel = useAiInfraStore(aiModelSelectors.getEnabledModelById(model, provider));
  const fallbackModel = useAiInfraStore(aiModelSelectors.getAiModelById(model));
  // aiProviderModelList 中的条目属于当前 activeProvider，因此当 activeProvider 与 agent 的 provider 相同且没有 enabledModel 时使用 fallback
  const modelCard = enabledModel || (activeProvider === provider ? fallbackModel : undefined);
  const agentSearchMode = (modelCard?.settings?.searchMode ?? 'off') as 'off' | 'auto';

  // selector 只在 enabled 模型中查找，补一个 fallback 逻辑
  const searchImpl =
    useAiInfraStore(aiModelSelectors.modelBuiltinSearchImpl(model, provider)) ??
    fallbackModel?.settings?.searchImpl;

  // 只要是内置的搜索实现，一定可以联网搜索
  if (searchImpl === 'internal') return true;

  // 如果是关闭状态，一定不能联网搜索
  return agentSearchMode !== 'off';
};
