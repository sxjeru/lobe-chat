'use client';

import { type UIChatMessage } from '@lobechat/types';
import { memo } from 'react';

import { useHotkeyById } from '@/hooks/useHotkeys/useHotkeyById';
import { HotkeyEnum } from '@/types/hotkey';

import { useConversationStore } from './store';

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

const HotkeyRegistry = memo(() => {
  const [deleteMessage, delAndRegenerateMessage, displayMessages, regenerateAssistantMessage] =
    useConversationStore((s) => [
      s.deleteMessage,
      s.delAndRegenerateMessage,
      s.displayMessages,
      s.regenerateAssistantMessage,
    ]);

  useHotkeyById(
    HotkeyEnum.RegenerateMessage,
    () => {
      const id = getLastAssistantMessageId(displayMessages);

      if (id) void regenerateAssistantMessage(id);
    },
    { enableOnContentEditable: true },
    [displayMessages, regenerateAssistantMessage],
  );

  useHotkeyById(
    HotkeyEnum.DeleteLastMessage,
    () => {
      const id = getLastMessageId(displayMessages);

      if (id) void deleteMessage(id);
    },
    { enableOnContentEditable: true },
    [deleteMessage, displayMessages],
  );

  useHotkeyById(
    HotkeyEnum.DeleteAndRegenerateMessage,
    () => {
      const id = getLastAssistantMessageId(displayMessages);

      if (id) void delAndRegenerateMessage(id);
    },
    { enableOnContentEditable: true },
    [delAndRegenerateMessage, displayMessages],
  );

  return null;
});

HotkeyRegistry.displayName = 'ConversationHotkeyRegistry';

export default HotkeyRegistry;
