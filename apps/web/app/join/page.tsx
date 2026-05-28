import { Suspense } from "react";
import { WalletGuard } from "@/components/wallet/WalletGuard";
import { PageHeader } from "@/components/layout/PageHeader";
import { JoinGameForm } from "@/components/game/JoinGameForm";

export default function JoinPage() {
  return (
    <>
      <PageHeader
        title="Join Game"
        subtitle="Enter a Game ID and pick your colour. A seed commitment will be submitted on-chain."
      />
      <div className="mx-auto max-w-lg px-4 py-10">
        <WalletGuard message="Connect your wallet to join a game.">
          <Suspense>
            <JoinGameForm />
          </Suspense>
        </WalletGuard>
      </div>
    </>
  );
}
