import { GlobeOffIcon } from '@lobehub/ui/icons';
import { useTheme } from 'antd-style';
import { Globe } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { isDeprecatedEdition } from '@/const/version';
import { useAgentEnableSearch } from '@/hooks/useAgentEnableSearch';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { aiModelSelectors, useAiInfraStore } from '@/store/aiInfra';

import Action from '../components/Action';
import Controls from './Controls';

const Search = memo(() => {
  const { t } = useTranslation('chat');
  const [isLoading, model, provider] = useAgentStore((s) => [
    agentSelectors.isAgentConfigLoading(s),
    agentSelectors.currentAgentModel(s),
    agentSelectors.currentAgentModelProvider(s),
  ]);
  const activeProvider = useAiInfraStore((s) => s.activeAiProvider);
  const enabledModel = useAiInfraStore(aiModelSelectors.getEnabledModelById(model, provider));
  const fallbackModel = useAiInfraStore(aiModelSelectors.getAiModelById(model));
  const modelCard = enabledModel || (activeProvider === provider ? fallbackModel : undefined);
  const mode = (modelCard?.settings?.searchMode ?? 'off') as 'off' | 'auto';
  const updateAiModelSettings = useAiInfraStore((s) => s.updateAiModelSettings);
  const isAgentEnableSearch = useAgentEnableSearch();
  const theme = useTheme();
  const isMobile = useIsMobile();

  if (isDeprecatedEdition) return null;
  if (isLoading) return <Action disabled icon={GlobeOffIcon} />;

  return (
    <Action
      color={isAgentEnableSearch ? theme.colorInfo : undefined}
      icon={isAgentEnableSearch ? Globe : GlobeOffIcon}
      onClick={
        isMobile
          ? undefined
          : async (e) => {
              e?.preventDefault?.();
              e?.stopPropagation?.();
              const next = mode === 'off' ? 'auto' : 'off';
              await updateAiModelSettings(model, provider, { searchMode: next });
            }
      }
      popover={{
        content: <Controls />,
        maxWidth: 320,
        minWidth: 320,
        placement: 'topLeft',
        styles: {
          body: {
            padding: 4,
          },
        },
        trigger: isMobile ? ['click'] : ['hover'],
      }}
      showTooltip={false}
      title={t('search.title')}
    />
  );
});

Search.displayName = 'Search';

export default Search;
