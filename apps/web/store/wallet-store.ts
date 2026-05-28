import { create } from "zustand";

type WalletStore = {
  address: string | null;
  isConnected: boolean;
  setWallet: (address: string | null) => void;
};

export const useWalletStore = create<WalletStore>((set) => ({
  address: null,
  isConnected: false,
  setWallet: (address) =>
    set({ address: address?.toLowerCase() ?? null, isConnected: Boolean(address) }),
}));
