import { ToolNameResolver } from '@lobechat/context-engine';
import { pluginPrompts, skillsPrompts } from '@lobechat/prompts';
import { Center, Flexbox, Tooltip } from '@lobehub/ui';
import { TokenTag } from '@lobehub/ui/chat';
import { cssVar } from 'antd-style';
import numeral from 'numeral';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { shallow } from 'zustand/shallow';

import { createAgentToolsEngine } from '@/helpers/toolEngineering';
import { useModelContextWindowTokens } from '@/hooks/useModelContextWindowTokens';
import { useModelSupportToolUse } from '@/hooks/useModelSupportToolUse';
import { useTokenCount } from '@/hooks/useTokenCount';
import { createSkillEngine } from '@/services/chat/mecha/skillEngineering';
import { useAgentStore } from '@/store/agent';
import { agentByIdSelectors, chatConfigByIdSelectors } from '@/store/agent/selectors';
import { aiModelSelectors, aiProviderSelectors, useAiInfraStore } from '@/store/aiInfra';
import { useChatStore } from '@/store/chat';
import { topicSelectors } from '@/store/chat/selectors';
import { useToolStore } from '@/store/tool';
import { pluginHelpers } from '@/store/tool/helpers';
import { useUserStore } from '@/store/user';
import { settingsSelectors, userGeneralSettingsSelectors } from '@/store/user/selectors';

import { useAgentId } from '../../hooks/useAgentId';
import { useChatInputStore } from '../../store';
import ActionPopover from '../components/ActionPopover';
import TokenProgress from './TokenProgress';

const toolNameResolver = new ToolNameResolver();

interface TokenTagProps {
  total: string;
}
const Token = memo<TokenTagProps>(({ total: messageString }) => {
  const { t } = useTranslation(['chat', 'components']);

  const input = useChatInputStore((s) => s.markdownContent);
  const historySummary = useChatStore(
    (s) => topicSelectors.currentActiveTopicSummary(s)?.content || '',
  );

  const agentId = useAgentId();
  const [systemRole, model, provider] = useAgentStore((s) => {
    return [
      agentByIdSelectors.getAgentSystemRoleById(agentId)(s),
      agentByIdSelectors.getAgentModelById(agentId)(s),
      agentByIdSelectors.getAgentModelProviderById(agentId)(s),
    ];
  });

  const maxTokens = useModelContextWindowTokens(model, provider);
  const [isDevMode, globalMemoryEnabled] = useUserStore(
    (s) => [userGeneralSettingsSelectors.config(s).isDevMode, settingsSelectors.memoryEnabled(s)],
    shallow,
  );

  // Tool usage token
  const canUseTool = useModelSupportToolUse(model, provider);
  const [pluginIds, skillActivateMode] = useAgentStore((s) => [
    agentByIdSelectors.getAgentPluginsById(agentId)(s),
    chatConfigByIdSelectors.getSkillActivateModeById(agentId)(s),
  ]);
  const agentToolsConfigSignal = useAgentStore(
    (s) => [
      chatConfigByIdSelectors.isEnableSearchById(agentId)(s),
      chatConfigByIdSelectors.getUseModelBuiltinSearchById(agentId)(s),
      chatConfigByIdSelectors.getRuntimeModeById(agentId)(s),
      chatConfigByIdSelectors.isMemoryToolEnabledById(agentId)(s),
      agentByIdSelectors.getAgentKnowledgeBasesById(agentId)(s),
    ],
    shallow,
  );
  const aiInfraSearchSignal = useAiInfraStore(
    (s) => [
      aiProviderSelectors.isProviderHasBuiltinSearch(provider)(s),
      aiModelSelectors.isModelHasBuiltinSearch(model, provider)(s),
      aiModelSelectors.isModelBuiltinSearchInternal(model, provider)(s),
    ],
    shallow,
  );
  const isManualMode = skillActivateMode === 'manual';
  const toolSkillStoreSignal = useToolStore(
    (s) => [
      s.installedPlugins,
      s.builtinTools,
      s.servers,
      s.lobehubSkillServers,
      s.builtinSkills,
      s.agentSkills,
    ],
    shallow,
  );

  const toolsString = useMemo(() => {
    void agentToolsConfigSignal;
    void aiInfraSearchSignal;
    void globalMemoryEnabled;
    void toolSkillStoreSignal;

    const toolsEngine = createAgentToolsEngine({ model, provider });
    const skillEngine = createSkillEngine();

    const { tools, enabledManifests } = toolsEngine.generateToolsDetailed({
      model,
      provider,
      skipDefaultTools: isManualMode,
      toolIds: pluginIds,
    });

    const enabledSkills = isManualMode
      ? skillEngine.getEnabledSkills(pluginIds)
      : skillEngine.getAllSkills();
    const skillContextPrompt = enabledSkills.length > 0 ? skillsPrompts(enabledSkills) : '';

    const schemaNumber = tools?.map((i) => JSON.stringify(i)).join('') || '';

    // Generate plugin system roles from enabledManifests
    const toolsSystemRole =
      enabledManifests.length > 0
        ? pluginPrompts({
            tools: enabledManifests.map((manifest) => ({
              apis: manifest.api.map((api) => ({
                desc: api.description,
                name: toolNameResolver.generate(manifest.identifier, api.name, manifest.type),
              })),
              identifier: manifest.identifier,
              name: pluginHelpers.getPluginTitle(manifest.meta) || manifest.identifier,
              systemRole: manifest.systemRole,
            })),
          })
        : '';

    return skillContextPrompt + toolsSystemRole + schemaNumber;
  }, [
    agentToolsConfigSignal,
    aiInfraSearchSignal,
    globalMemoryEnabled,
    isManualMode,
    model,
    pluginIds,
    provider,
    toolSkillStoreSignal,
  ]);

  const toolsToken = useTokenCount(canUseTool ? toolsString : '');

  // Chat usage token
  const inputTokenCount = useTokenCount(input);
  const chatsToken = useTokenCount(messageString) + inputTokenCount;

  // SystemRole token
  const systemRoleToken = useTokenCount(systemRole);
  const historySummaryToken = useTokenCount(historySummary);

  // Total token
  const totalToken = systemRoleToken + historySummaryToken + toolsToken + chatsToken;

  if (!isDevMode && maxTokens > 0 && totalToken / maxTokens <= 0.5) return null;

  const content = (
    <Flexbox gap={12} style={{ minWidth: 200 }}>
      <Flexbox horizontal align={'center'} gap={4} justify={'space-between'} width={'100%'}>
        <div style={{ color: cssVar.colorTextDescription }}>{t('tokenDetails.title')}</div>
        <Tooltip
          styles={{ root: { maxWidth: 'unset', pointerEvents: 'none' } }}
          title={t('ModelSelect.featureTag.tokens', {
            ns: 'components',
            tokens: numeral(maxTokens).format('0,0'),
          })}
        >
          <Center
            height={20}
            paddingInline={4}
            style={{
              background: cssVar.colorFillTertiary,
              borderRadius: 4,
              color: cssVar.colorTextSecondary,
              fontFamily: cssVar.fontFamilyCode,
              fontSize: 11,
            }}
          >
            TOKEN
          </Center>
        </Tooltip>
      </Flexbox>
      {isDevMode && (
        <TokenProgress
          showIcon
          data={[
            {
              color: cssVar.magenta,
              id: 'systemRole',
              title: t('tokenDetails.systemRole'),
              value: systemRoleToken,
            },
            {
              color: cssVar.geekblue,
              id: 'tools',
              title: t('tokenDetails.tools'),
              value: toolsToken,
            },
            {
              color: cssVar.orange,
              id: 'historySummary',
              title: t('tokenDetails.historySummary'),
              value: historySummaryToken,
            },
            {
              color: cssVar.gold,
              id: 'chats',
              title: t('tokenDetails.chats'),
              value: chatsToken,
            },
          ]}
        />
      )}
      <TokenProgress
        showIcon={isDevMode}
        showTotal={t('tokenDetails.total')}
        data={[
          {
            color: cssVar.colorSuccess,
            id: 'used',
            title: t('tokenDetails.used'),
            value: totalToken,
          },
          {
            color: cssVar.colorFill,
            id: 'rest',
            title: t('tokenDetails.rest'),
            value: maxTokens - totalToken,
          },
        ]}
      />
    </Flexbox>
  );

  return (
    <ActionPopover content={content}>
      <TokenTag
        maxValue={maxTokens}
        mode={'used'}
        value={totalToken}
        text={{
          overload: t('tokenTag.overload'),
          remained: t('tokenTag.remained'),
          used: t('tokenTag.used'),
        }}
      />
    </ActionPopover>
  );
});

export default Token;
