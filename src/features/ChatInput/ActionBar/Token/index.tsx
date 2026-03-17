import { getHistorySlicedMessages } from '@lobechat/context-engine';
import { type PropsWithChildren } from 'react';
import { memo, useMemo } from 'react';

import { useModelHasContextWindowToken } from '@/hooks/useModelHasContextWindowToken';
import dynamic from '@/libs/next/dynamic';
import { useAgentStore } from '@/store/agent';
import { chatConfigByIdSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { displayMessageSelectors, threadSelectors } from '@/store/chat/selectors';
import { extractDisplayMessageContent } from '@/store/chat/slices/message/selectors/displayMessage';

import { useAgentId } from '../../hooks/useAgentId';
import { useChatInputStore } from '../../store';

const LargeTokenContent = dynamic(() => import('./TokenTag'), { ssr: false });
const RUNTIME_HISTORY_COUNT_BUFFER = 2;

const Token = memo<PropsWithChildren>(({ children }) => {
  const showTag = useModelHasContextWindowToken();

  return showTag && children;
});

const useTokenRelatedConfigSubscription = (agentId: string) => {
  const [historyCount, enableHistoryCount] = useAgentStore(
    (s) =>
      [
        chatConfigByIdSelectors.getHistoryCountById(agentId)(s),
        chatConfigByIdSelectors.getEnableHistoryCountById(agentId)(s),
        chatConfigByIdSelectors.isEnableSearchById(agentId)(s),
        chatConfigByIdSelectors.getUseModelBuiltinSearchById(agentId)(s),
      ] as const,
  );

  return { enableHistoryCount, historyCount };
};

export const MainToken = memo(() => {
  const agentId = useAgentId();
  const { historyCount, enableHistoryCount } = useTokenRelatedConfigSubscription(agentId);
  const allChats = useChatStore(displayMessageSelectors.mainAIChats);
  const hasPendingInput = !!useChatInputStore((s) => s.markdownContent.trim());
  const effectiveHistoryCount =
    historyCount + RUNTIME_HISTORY_COUNT_BUFFER - (hasPendingInput ? 1 : 0);

  const total = useMemo(
    () =>
      getHistorySlicedMessages(allChats, {
        enableHistoryCount,
        historyCount: effectiveHistoryCount,
      })
        .map(extractDisplayMessageContent)
        .join(''),
    [allChats, effectiveHistoryCount, enableHistoryCount],
  );

  return (
    <Token>
      <LargeTokenContent total={total} />
    </Token>
  );
});

export const PortalToken = memo(() => {
  const agentId = useAgentId();
  const { historyCount, enableHistoryCount } = useTokenRelatedConfigSubscription(agentId);
  const allPortalChats = useChatStore(threadSelectors.portalAIChats);
  const hasPendingInput = !!useChatInputStore((s) => s.markdownContent.trim());
  const effectiveHistoryCount =
    historyCount + RUNTIME_HISTORY_COUNT_BUFFER - (hasPendingInput ? 1 : 0);

  const total = useMemo(
    () =>
      getHistorySlicedMessages(allPortalChats, {
        enableHistoryCount,
        historyCount: effectiveHistoryCount,
      })
        .map(extractDisplayMessageContent)
        .join(''),
    [allPortalChats, effectiveHistoryCount, enableHistoryCount],
  );

  return (
    <Token>
      <LargeTokenContent total={total} />
    </Token>
  );
});
