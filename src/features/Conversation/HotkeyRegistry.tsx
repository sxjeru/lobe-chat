'use client';

import { type UIChatMessage } from '@lobechat/types';
import { memo } from 'react';

import { useHotkeyById } from '@/hooks/useHotkeys/useHotkeyById';
import { HotkeyEnum } from '@/types/hotkey';

import { useConversationHotkeyStore } from './hotkeyStore';
import { useConversationStore } from './store';

interface HotkeyRegistryProps {
  conversationKey: string;
}

interface RegenerateTarget {
  id: string;
  role: 'assistant' | 'assistantGroup' | 'user';
}

/**
 * Registers conversation-level hotkeys within the ConversationProvider context.
 *
 * These hotkeys need access to the local ConversationStore which is only available
 * within the ConversationProvider, so they cannot be registered globally in chatScope.ts.
 */
const getLastRegenerateTarget = (
  displayMessages: UIChatMessage[],
): RegenerateTarget | undefined => {
  for (let index = displayMessages.length - 1; index >= 0; index -= 1) {
    const item = displayMessages[index];

    if (item.role === 'assistant' || item.role === 'assistantGroup' || item.role === 'user') {
      return {
        id: item.id,
        role: item.role,
      };
    }
  }

  return undefined;
};

const getLastMessageId = (displayMessages: UIChatMessage[]) => displayMessages.at(-1)?.id;

const HotkeyRegistry = memo<HotkeyRegistryProps>(({ conversationKey }) => {
  const [
    deleteMessage,
    delAndRegenerateMessage,
    displayMessages,
    regenerateAssistantMessage,
    regenerateUserMessage,
  ] = useConversationStore((s) => [
    s.deleteMessage,
    s.delAndRegenerateMessage,
    s.displayMessages,
    s.regenerateAssistantMessage,
    s.regenerateUserMessage,
  ]);
  const enabled = useConversationHotkeyStore((s) => s.activeConversationKey === conversationKey);

  useHotkeyById(
    HotkeyEnum.RegenerateMessage,
    () => {
      const target = getLastRegenerateTarget(displayMessages);

      if (!target) return;

      if (target.role === 'user') {
        void regenerateUserMessage(target.id);
        return;
      }

      void regenerateAssistantMessage(target.id);
    },
    { enableOnContentEditable: true, enabled },
    [displayMessages, enabled, regenerateAssistantMessage, regenerateUserMessage],
  );

  useHotkeyById(
    HotkeyEnum.DeleteLastMessage,
    () => {
      const id = getLastMessageId(displayMessages);

      if (id) void deleteMessage(id);
    },
    { enableOnContentEditable: true, enabled },
    [deleteMessage, displayMessages, enabled],
  );

  useHotkeyById(
    HotkeyEnum.DeleteAndRegenerateMessage,
    () => {
      const target = getLastRegenerateTarget(displayMessages);

      if (!target) return;

      if (target.role === 'user') {
        void regenerateUserMessage(target.id);
        return;
      }

      void delAndRegenerateMessage(target.id);
    },
    { enableOnContentEditable: true, enabled },
    [delAndRegenerateMessage, displayMessages, enabled, regenerateUserMessage],
  );

  return null;
});

HotkeyRegistry.displayName = 'ConversationHotkeyRegistry';

export default HotkeyRegistry;
