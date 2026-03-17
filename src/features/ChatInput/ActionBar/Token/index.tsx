import { type PropsWithChildren } from 'react';
import { memo, useMemo } from 'react';

import { useModelHasContextWindowToken } from '@/hooks/useModelHasContextWindowToken';
import dynamic from '@/libs/next/dynamic';
import { useAgentStore } from '@/store/agent';
import { chatConfigByIdSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { chatHelpers } from '@/store/chat/helpers';
import { displayMessageSelectors, threadSelectors } from '@/store/chat/selectors';
import { extractDisplayMessageContent } from '@/store/chat/slices/message/selectors/displayMessage';

import { useAgentId } from '../../hooks/useAgentId';

const LargeTokenContent = dynamic(() => import('./TokenTag'), { ssr: false });

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

  const total = useMemo(
    () =>
      chatHelpers
        .getSlicedMessages(allChats, {
          enableHistoryCount,
          historyCount,
        })
        .map(extractDisplayMessageContent)
        .join(''),
    [allChats, enableHistoryCount, historyCount],
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

  const total = useMemo(
    () =>
      chatHelpers
        .getSlicedMessages(allPortalChats, {
          enableHistoryCount,
          historyCount,
        })
        .map(extractDisplayMessageContent)
        .join(''),
    [allPortalChats, enableHistoryCount, historyCount],
  );

  return (
    <Token>
      <LargeTokenContent total={total} />
    </Token>
  );
});
