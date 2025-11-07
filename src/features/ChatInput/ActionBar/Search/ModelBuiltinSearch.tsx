import { Exa, Google } from '@lobehub/icons';
import { Icon } from '@lobehub/ui';
import { Switch } from 'antd';
import { Search } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { aiModelSelectors, useAiInfraStore } from '@/store/aiInfra';

interface SearchEngineIconProps {
  icon?: string;
}

const SearchEngineIcon = ({ icon }: SearchEngineIconProps) => {
  switch (icon) {
    case 'google': {
      return <Google.Avatar size={20} />;
    }

    case 'exa': {
      return <Exa.Avatar size={20} />;
    }

    default: {
      return <Icon icon={Search} size={14} />;
    }
  }
};

const ModelBuiltinSearch = memo(() => {
  const { t } = useTranslation('chat');
  const [model, provider] = useAgentStore((s) => [
    agentSelectors.currentAgentModel(s),
    agentSelectors.currentAgentModelProvider(s),
  ]);

  const [isLoading, setLoading] = useState(false);
  const activeProvider = useAiInfraStore((s) => s.activeAiProvider);
  const enabledModel = useAiInfraStore(aiModelSelectors.getEnabledModelById(model, provider));
  const fallbackModel = useAiInfraStore(aiModelSelectors.getAiModelById(model));
  const modelCard = enabledModel || (activeProvider === provider ? fallbackModel : undefined);
  const checked = !!modelCard?.settings?.useModelBuiltinSearch;
  const updateAiModelSettings = useAiInfraStore((s) => s.updateAiModelSettings);

  return (
    <Flexbox
      align={'center'}
      horizontal
      justify={'space-between'}
      onClick={async () => {
        setLoading(true);
        // 只更新模型的 settings
        await updateAiModelSettings(model, provider, { useModelBuiltinSearch: !checked });
        setLoading(false);
      }}
      padding={'8px 12px'}
      style={{ cursor: 'pointer', userSelect: 'none' }}
    >
      <Flexbox align={'center'} gap={8} horizontal>
        <SearchEngineIcon icon={modelCard?.settings?.searchProvider} />
        {t('search.mode.useModelBuiltin')}
      </Flexbox>
      <Switch checked={checked} loading={isLoading} size={'small'} />
    </Flexbox>
  );
});
export default ModelBuiltinSearch;
