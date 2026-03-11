import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HotkeyEnum } from '@/types/hotkey';

import ConversationHotkeyBoundary from './ConversationHotkeyBoundary';
import HotkeyRegistry from './HotkeyRegistry';
import { useConversationHotkeyStore } from './hotkeyStore';

const mockUseHotkeyById = vi.fn();

const mockConversationStore = {
  delAndRegenerateMessage: vi.fn(),
  deleteMessage: vi.fn(),
  displayMessages: [
    { id: 'user-1', role: 'user' },
    { id: 'assistant-1', parentId: 'user-1', role: 'assistant' },
  ],
  regenerateAssistantMessage: vi.fn(),
};

vi.mock('@/hooks/useHotkeys/useHotkeyById', () => ({
  useHotkeyById: (...args: any[]) => mockUseHotkeyById(...args),
}));

vi.mock('./store', () => ({
  useConversationStore: (selector: (state: typeof mockConversationStore) => unknown) =>
    selector(mockConversationStore),
}));

describe('HotkeyRegistry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useConversationHotkeyStore.setState({ activeConversationKey: undefined });
  });

  afterEach(() => {
    useConversationHotkeyStore.setState({ activeConversationKey: undefined });
  });

  it('should enable message control hotkeys for the active conversation only', () => {
    useConversationHotkeyStore.setState({ activeConversationKey: 'main' });

    render(<HotkeyRegistry conversationKey={'main'} />);

    expect(mockUseHotkeyById).toHaveBeenCalledTimes(3);
    expect(mockUseHotkeyById.mock.calls.map((call) => call[0])).toEqual([
      HotkeyEnum.RegenerateMessage,
      HotkeyEnum.DeleteLastMessage,
      HotkeyEnum.DeleteAndRegenerateMessage,
    ]);

    for (const [, , options] of mockUseHotkeyById.mock.calls) {
      expect(options).toMatchObject({
        enableOnContentEditable: true,
        enabled: true,
      });
    }
  });

  it('should disable message control hotkeys for an inactive conversation', () => {
    useConversationHotkeyStore.setState({ activeConversationKey: 'main' });

    render(<HotkeyRegistry conversationKey={'thread'} />);

    expect(mockUseHotkeyById).toHaveBeenCalledTimes(3);

    for (const [, , options] of mockUseHotkeyById.mock.calls) {
      expect(options).toMatchObject({
        enableOnContentEditable: true,
        enabled: false,
      });
    }
  });
});

describe('ConversationHotkeyBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useConversationHotkeyStore.setState({ activeConversationKey: undefined });
  });

  afterEach(() => {
    useConversationHotkeyStore.setState({ activeConversationKey: undefined });
  });

  it('should switch the active conversation when focus moves between boundaries', async () => {
    render(
      <>
        <ConversationHotkeyBoundary conversationKey={'main'}>
          <button type={'button'}>main</button>
        </ConversationHotkeyBoundary>
        <ConversationHotkeyBoundary conversationKey={'thread'}>
          <button type={'button'}>thread</button>
        </ConversationHotkeyBoundary>
        <button type={'button'}>outside</button>
      </>,
    );

    expect(useConversationHotkeyStore.getState().activeConversationKey).toBe('main');

    const threadButton = screen.getByRole('button', { name: 'thread' });
    const outsideButton = screen.getByRole('button', { name: 'outside' });

    fireEvent.pointerDown(threadButton);
    fireEvent.focus(threadButton);

    expect(useConversationHotkeyStore.getState().activeConversationKey).toBe('thread');

    fireEvent.blur(threadButton);
    fireEvent.focus(outsideButton);

    await waitFor(() => {
      expect(useConversationHotkeyStore.getState().activeConversationKey).toBeUndefined();
    });
  });
});
