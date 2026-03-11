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

/**
 * Registers conversation-level hotkeys within the ConversationProvider context.
 *
 * These hotkeys need access to the local ConversationStore which is only available
 * within the ConversationProvider, so they cannot be registered globally in chatScope.ts.
 */
const getLastAssistantMessageId = (displayMessages: UIChatMessage[]) => {
  for (let index = displayMessages.length - 1; index >= 0; index -= 1) {
    const item = displayMessages[index];

    if (item.role === 'assistant' || item.role === 'assistantGroup') {
      return item.id;
    }
  }

  return undefined;
};

const getLastMessageId = (displayMessages: UIChatMessage[]) => displayMessages.at(-1)?.id;

const HotkeyRegistry = memo<HotkeyRegistryProps>(({ conversationKey }) => {
  const [deleteMessage, delAndRegenerateMessage, displayMessages, regenerateAssistantMessage] =
    useConversationStore((s) => [
      s.deleteMessage,
      s.delAndRegenerateMessage,
      s.displayMessages,
      s.regenerateAssistantMessage,
    ]);
  const enabled = useConversationHotkeyStore((s) => s.activeConversationKey === conversationKey);

  useHotkeyById(
    HotkeyEnum.RegenerateMessage,
    () => {
      const id = getLastAssistantMessageId(displayMessages);

      if (id) void regenerateAssistantMessage(id);
    },
    { enableOnContentEditable: true, enabled },
    [displayMessages, enabled, regenerateAssistantMessage],
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
      const id = getLastAssistantMessageId(displayMessages);

      if (id) void delAndRegenerateMessage(id);
    },
    { enableOnContentEditable: true, enabled },
    [delAndRegenerateMessage, displayMessages, enabled],
  );

  return null;
});

HotkeyRegistry.displayName = 'ConversationHotkeyRegistry';

export default HotkeyRegistry;
