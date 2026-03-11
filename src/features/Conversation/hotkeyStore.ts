import { create } from 'zustand';

interface ConversationHotkeyState {
  activeConversationKey?: string;
  setActiveConversationKey: (key?: string) => void;
}

export const useConversationHotkeyStore = create<ConversationHotkeyState>((set) => ({
  activeConversationKey: undefined,
  setActiveConversationKey: (activeConversationKey) => set({ activeConversationKey }),
}));
