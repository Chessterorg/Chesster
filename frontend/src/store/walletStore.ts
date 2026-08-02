import { create } from "zustand";
import {
  isConnected,
  getAddress,
  requestAccess,
//   signTransaction,
} from "@stellar/freighter-api";

interface WalletState {
  address: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  checkConnection: () => Promise<void>;
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  isConnected: false,
  connect: async () => {
    try {
      const access = await requestAccess();
      if (access.address) {
        set({ address: access.address, isConnected: true });
      } else if (access.error) {
        console.error("Freighter access error:", access.error);
      }
    } catch (error) {
      console.error("Failed to connect Freighter:", error);
    }
  },
  checkConnection: async () => {
    try {
      const connection = await isConnected();
      if (connection.isConnected) {
        const { address, error } = await getAddress();
        if (address) {
          set({ address, isConnected: true });
        } else if (error) {
          console.error("Freighter getAddress error:", error);
        }
      }
    } catch (error) {
      console.error("Failed to check Freighter connection:", error);
    }
  },
}));
