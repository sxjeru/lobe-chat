import { Popover, Select, Space, Switch, Tag, Typography, theme } from 'antd';
import type { ExtendParamsType } from 'model-bank';
import { memo, useMemo } from 'react';
import type { ReactNode } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import GPT5ReasoningEffortSlider from '@/features/ChatInput/ActionBar/Model/GPT5ReasoningEffortSlider';
import ReasoningEffortSlider from '@/features/ChatInput/ActionBar/Model/ReasoningEffortSlider';
import ReasoningTokenSlider from '@/features/ChatInput/ActionBar/Model/ReasoningTokenSlider';
import TextVerbositySlider from '@/features/ChatInput/ActionBar/Model/TextVerbositySlider';
import ThinkingBudgetSlider from '@/features/ChatInput/ActionBar/Model/ThinkingBudgetSlider';
import ThinkingSlider from '@/features/ChatInput/ActionBar/Model/ThinkingSlider';

type ExtendParamsOption = {
  hintKey: string;
  key: ExtendParamsType;
};

const EXTEND_PARAMS_OPTIONS: ExtendParamsOption[] = [
  {
    hintKey: 'providerModels.item.modelConfig.extendParams.options.disableContextCaching.hint',
    key: 'disableContextCaching',
  },
  {
    hintKey: 'providerModels.item.modelConfig.extendParams.options.enableReasoning.hint',
    key: 'enableReasoning',
  },
  {
    hintKey: 'providerModels.item.modelConfig.extendParams.options.reasoningBudgetToken.hint',
    key: 'reasoningBudgetToken',
  },
  {
    hintKey: 'providerModels.item.modelConfig.extendParams.options.reasoningEffort.hint',
    key: 'reasoningEffort',
  },
  {
    hintKey: 'providerModels.item.modelConfig.extendParams.options.gpt5ReasoningEffort.hint',
    key: 'gpt5ReasoningEffort',
  },
  {
    hintKey: 'providerModels.item.modelConfig.extendParams.options.textVerbosity.hint',
    key: 'textVerbosity',
  },
  {
    hintKey: 'providerModels.item.modelConfig.extendParams.options.thinking.hint',
    key: 'thinking',
  },
  {
    hintKey: 'providerModels.item.modelConfig.extendParams.options.thinkingBudget.hint',
    key: 'thinkingBudget',
  },
  {
    hintKey: 'providerModels.item.modelConfig.extendParams.options.urlContext.hint',
    key: 'urlContext',
  },
];

type PreviewMeta = {
  labelOverride?: string;
  labelSuffix?: string;
  previewWidth?: number;
  tag?: string;
};

const PREVIEW_META: Partial<Record<ExtendParamsType, PreviewMeta>> = {
  disableContextCaching: { labelSuffix: ' (Claude)', previewWidth: 400 },
  enableReasoning: { previewWidth: 300, tag: 'thinking.type' },
  gpt5ReasoningEffort: { previewWidth: 300, tag: 'reasoning_effort' },
  reasoningBudgetToken: { previewWidth: 350, tag: 'thinking.budget_tokens' },
  reasoningEffort: { previewWidth: 250, tag: 'reasoning_effort' },
  textVerbosity: { labelSuffix: ' (GPT-5)', previewWidth: 250, tag: 'text_verbosity' },
  thinking: { labelSuffix: ' (Doubao)', previewWidth: 300, tag: 'thinking.type' },
  thinkingBudget: { labelSuffix: ' (Gemini)', previewWidth: 500, tag: 'thinkingBudget' },
  urlContext: { labelSuffix: ' (Gemini)', previewWidth: 400, tag: 'urlContext' },
};

type ExtendParamsDefinition = {
  desc?: ReactNode;
  hint: string;
  key: ExtendParamsType;
  label: string;
  parameterTag?: string;
  preview?: ReactNode;
  previewWidth?: number;
};

interface ExtendParamsSelectProps {
  onChange?: (value: ExtendParamsType[] | undefined) => void;
  value?: ExtendParamsType[];
}

const PreviewContent = ({
  desc,
  hint,
  label,
  preview,
  previewFallback,
  parameterTag,
  previewWidth,
}: {
  desc?: ReactNode;
  hint: string;
  label: string;
  parameterTag?: string;
  preview?: ReactNode;
  previewFallback: string;
  previewWidth?: number;
}) => {
  const { token } = theme.useToken();
  const containerStyle = previewWidth
    ? { minWidth: previewWidth, width: previewWidth }
    : { minWidth: 240 };

  return (
    <Flexbox gap={12} style={containerStyle}>
      <Typography.Text style={{ whiteSpace: 'normal' }} type={'secondary'}>
        {hint}
      </Typography.Text>
      <Flexbox gap={12}>
        <Flexbox
          gap={8}
          style={{
            background: token.colorBgElevated,
            border: `1px solid ${token.colorBorderSecondary}`,
            borderRadius: 10,
            padding: 12,
            width: previewWidth,
          }}
        >
          <Flexbox align={'center'} gap={8} horizontal>
            <Typography.Text strong>{label}</Typography.Text>
            {parameterTag ? <Tag color={'cyan'}>{parameterTag}</Tag> : null}
          </Flexbox>
          {desc ? (
            <Typography.Text style={{ fontSize: 12, whiteSpace: 'normal' }} type={'secondary'}>
              {desc}
            </Typography.Text>
          ) : null}
          {preview ? (
            <div style={{ pointerEvents: 'none', width: '100%' }}>{preview}</div>
          ) : (
            <Typography.Text type={'secondary'}>{previewFallback}</Typography.Text>
          )}
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
};

const ExtendParamsSelect = memo<ExtendParamsSelectProps>(({ value, onChange }) => {
  const { t } = useTranslation('modelProvider');
  const { t: tChat } = useTranslation('chat');

  const previewControls = useMemo<Partial<Record<ExtendParamsType, ReactNode>>>(
    () => ({
      disableContextCaching: <Switch checked disabled />,
      enableReasoning: <Switch checked disabled />,
      gpt5ReasoningEffort: <GPT5ReasoningEffortSlider />,
      reasoningBudgetToken: <ReasoningTokenSlider defaultValue={1 * 1024} />,
      reasoningEffort: <ReasoningEffortSlider />,
      textVerbosity: <TextVerbositySlider />,
      thinking: <ThinkingSlider />,
      thinkingBudget: <ThinkingBudgetSlider defaultValue={2 * 1024} />,
      urlContext: <Switch checked disabled />,
    }),
    [],
  );

  const descOverrides: Partial<Record<ExtendParamsType, ReactNode>> = {
    disableContextCaching: (() => {
      const original = tChat('extendParams.disableContextCaching.desc', { defaultValue: '' });

      const sanitized = original.replace(/（<\d>.*?<\/\d>）/u, '');

      return (
        sanitized || (
          <Trans i18nKey={'extendParams.disableContextCaching.desc'} ns={'chat'}>
            单条对话生成成本最高可降低 90%，响应速度提升 4 倍。开启后将自动禁用历史消息数限制
          </Trans>
        )
      );
    })(),
    enableReasoning: (() => {
      const original = tChat('extendParams.enableReasoning.desc', { defaultValue: '' });

      const sanitized = original.replace(/（<\d>.*?<\/\d>）/u, '');

      return (
        sanitized || (
          <Trans i18nKey={'extendParams.enableReasoning.desc'} ns={'chat'}>
            基于 Claude Thinking 机制限制，开启后将自动禁用历史消息数限制
          </Trans>
        )
      );
    })(),
  };

  const previewFallback = String(
    t('providerModels.item.modelConfig.extendParams.previewFallback', {
      defaultValue: 'Preview unavailable',
    }),
  );

  const definitions = useMemo<ExtendParamsDefinition[]>(() => {
    return EXTEND_PARAMS_OPTIONS.map((item) => {
      const descKey = `extendParams.${item.key}.desc`;
      const rawDesc = tChat(descKey as any, { defaultValue: '' });
      const normalizedDesc =
        typeof rawDesc === 'string' && rawDesc !== '' && rawDesc !== descKey ? rawDesc : undefined;
      const desc = descOverrides[item.key] ?? normalizedDesc;
      const meta = PREVIEW_META[item.key];
      const baseLabel = String(
        tChat(`extendParams.${item.key}.title` as any, { defaultValue: item.key }),
      );

      const label = meta?.labelOverride
        ? meta.labelOverride
        : meta?.labelSuffix
          ? `${baseLabel}${meta.labelSuffix}`
          : baseLabel;

      return {
        desc,
        hint: String(t(item.hintKey as any)),
        key: item.key,
        label,
        parameterTag: meta?.tag,
        preview: previewControls[item.key],
        previewWidth: meta?.previewWidth,
      };
    });
  }, [previewControls, t, tChat]);

  const definitionMap = useMemo(() => {
    return new Map(definitions.map((item) => [item.key, item]));
  }, [definitions]);

  const options = useMemo(
    () =>
      definitions.map((item) => ({
        label: item.label,
        value: item.key,
      })),
    [definitions],
  );

  const placeholder = String(t('providerModels.item.modelConfig.extendParams.placeholder'));
  const handleChange = (val: ExtendParamsType[]) => {
    if (!Array.isArray(val) || val.length === 0) {
      onChange?.(undefined);
      return;
    }

    const filtered = val.filter((item) => definitionMap.has(item));
    onChange?.(filtered.length ? filtered : undefined);
  };

  return (
    <Flexbox gap={8}>
      <Select
        allowClear
        mode={'multiple'}
        onChange={(val) => handleChange(val as ExtendParamsType[])}
        optionRender={(option) => {
          const def = definitionMap.get(option.value as ExtendParamsType);
          if (!def) return option.label;

          return (
            <Popover
              content={
                <PreviewContent
                  desc={def.desc}
                  hint={def.hint}
                  label={def.label}
                  parameterTag={def.parameterTag}
                  preview={def.preview}
                  previewFallback={previewFallback}
                  previewWidth={def.previewWidth}
                />
              }
              placement={'right'}
            >
              <Flexbox gap={4}>
                <Typography.Text>{def.label}</Typography.Text>
                <Typography.Text style={{ fontSize: 12 }} type={'secondary'}>
                  {def.hint}
                </Typography.Text>
              </Flexbox>
            </Popover>
          );
        }}
        options={options}
        placeholder={placeholder}
        popupMatchSelectWidth={false}
        style={{ width: '100%' }}
        value={value}
      />
      {value && value.length > 0 && (
        <Space size={[8, 8]} wrap>
          {value.map((key) => {
            const def = definitionMap.get(key);
            if (!def) return null;
            return (
              <Popover
                content={
                  <PreviewContent
                    desc={def.desc}
                    hint={def.hint}
                    label={def.label}
                    parameterTag={def.parameterTag}
                    preview={def.preview}
                    previewFallback={previewFallback}
                    previewWidth={def.previewWidth}
                  />
                }
                key={key}
                placement={'top'}
              >
                <Tag bordered={false} color={'processing'}>
                  {def.label}
                </Tag>
              </Popover>
            );
          })}
        </Space>
      )}
    </Flexbox>
  );
});

export default ExtendParamsSelect;
