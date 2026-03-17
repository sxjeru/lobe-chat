import { type PropsWithChildren } from 'react';
import { memo } from 'react';

import { useModelHasContextWindowToken } from '@/hooks/useModelHasContextWindowToken';
import dynamic from '@/libs/next/dynamic';
import { useAgentStore } from '@/store/agent';
import { chatConfigByIdSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { displayMessageSelectors, threadSelectors } from '@/store/chat/selectors';

const LargeTokenContent = dynamic(() => import('./TokenTag'), { ssr: false });

const Token = memo<PropsWithChildren>(({ children }) => {
  const showTag = useModelHasContextWindowToken();

  return showTag && children;
});

const useTokenRelatedConfigSubscription = () => {
  const activeAgentId = useChatStore((s) => s.activeAgentId) ?? '';

  useAgentStore((s) => [
    chatConfigByIdSelectors.getHistoryCountById(activeAgentId)(s),
    chatConfigByIdSelectors.getEnableHistoryCountById(activeAgentId)(s),
    chatConfigByIdSelectors.isEnableSearchById(activeAgentId)(s),
    chatConfigByIdSelectors.getUseModelBuiltinSearchById(activeAgentId)(s),
  ]);
};

export const MainToken = memo(() => {
  useTokenRelatedConfigSubscription();

  const total = useChatStore(displayMessageSelectors.mainAIChatsMessageString);

  return (
    <Token>
      <LargeTokenContent total={total} />
    </Token>
  );
});

export const PortalToken = memo(() => {
  useTokenRelatedConfigSubscription();

  const total = useChatStore(threadSelectors.portalDisplayChatsString);

  return (
    <Token>
      <LargeTokenContent total={total} />
    </Token>
  );
});
