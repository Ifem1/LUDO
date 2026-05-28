export const env = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "LudoProof",
  contractAddress: process.env.NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS ?? "",
  rpcUrl: process.env.NEXT_PUBLIC_GENLAYER_RPC_URL ?? "http://localhost:4000/api",
  chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? "61999"),
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "",
} as const;
