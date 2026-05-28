import { create } from "zustand";

type TxStatus = "idle" | "pending" | "success" | "error";

type UiStore = {
  txStatus: TxStatus;
  txMessage: string;
  txHash: string | null;
  pendingAction: string | null;
  showForfeitModal: boolean;
  showWinnerModal: boolean;
  diceAnimating: boolean;
  setTx: (status: TxStatus, message?: string, hash?: string | null) => void;
  setPendingAction: (action: string | null) => void;
  setForfeitModal: (open: boolean) => void;
  setWinnerModal: (open: boolean) => void;
  setDiceAnimating: (val: boolean) => void;
  resetTx: () => void;
};

export const useUiStore = create<UiStore>((set) => ({
  txStatus: "idle",
  txMessage: "",
  txHash: null,
  pendingAction: null,
  showForfeitModal: false,
  showWinnerModal: false,
  diceAnimating: false,
  setTx: (txStatus, txMessage = "", txHash = null) =>
    set({ txStatus, txMessage, txHash }),
  setPendingAction: (pendingAction) => set({ pendingAction }),
  setForfeitModal: (showForfeitModal) => set({ showForfeitModal }),
  setWinnerModal: (showWinnerModal) => set({ showWinnerModal }),
  setDiceAnimating: (diceAnimating) => set({ diceAnimating }),
  resetTx: () => set({ txStatus: "idle", txMessage: "", txHash: null, pendingAction: null }),
}));
