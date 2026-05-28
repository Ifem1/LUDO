import { WalletGuard } from "@/components/wallet/WalletGuard";
import { PageHeader } from "@/components/layout/PageHeader";
import { CreateGameForm } from "@/components/game/CreateGameForm";

export default function CreatePage() {
  return (
    <>
      <PageHeader
        title="Create Game"
        subtitle="Set up a new LudoProof game. A GenLayer contract call will register your game on-chain."
      />
      <div className="mx-auto max-w-lg px-4 py-10">
        <WalletGuard message="Connect your wallet to create a game. Your wallet address is your player identity on-chain.">
          <CreateGameForm />
        </WalletGuard>
      </div>
    </>
  );
}
