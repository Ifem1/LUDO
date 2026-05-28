export type LeaderboardRow = {
  player: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  captures: number;
  forfeits: number;
  totalMoves: number;
  winRate: number;
  lastPlayedAt: number;
};
