// This module is intentionally a no-op stub.
//
// The previous version configured wagmi + RainbowKit for external wallets
// (MetaMask, WalletConnect, etc.). The app now uses a client-side embedded
// wallet (see lib/auth/*), so wagmi is no longer needed.
//
// The file is kept so any straggling imports do not fail; the constant
// it exports is unused at runtime.

export const wagmiConfig = null;
