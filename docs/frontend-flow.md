# Frontend Flow

## Create Game Flow

1. User visits `/create`, connects wallet
2. Frontend generates a unique `gameId` (UUID prefix)
3. User selects max players (2/3/4) and their colour
4. User clicks "Create & Join Game":
   a. `create_game(gameId, maxPlayers)` — registers game on-chain
   b. `join_game(gameId, colour)` — creator joins their own game
   c. `generateSeed(walletAddress)` — random seed generated client-side
   d. Raw seed saved to `localStorage` under `ludoproof_seed:{gameId}:{wallet}`
   e. `sha256(rawSeed)` computed client-side
   f. `commit_seed(gameId, sha256)` — hash committed to contract
5. Invite link shown. Creator shares it.

## Join Game Flow

1. Second player visits `/join?gameId=GAME01`, connects wallet
2. Selects available colour
3. Clicks "Join Game":
   a. `join_game(gameId, colour)` — joins on-chain
   b. Same seed generation + localStorage save + `commit_seed(...)` flow as creator

## Waiting State

- Frontend polls `get_game(gameId)` every 5 seconds
- Page shows player list, seed commit status, invite link
- Once all players have joined AND committed seeds:
  - Creator sees "Start Game" button
  - Creator calls `start_game(gameId)`

## Active Game State

- Frontend polls `get_game(gameId)` every 3 seconds
- On each update, `GameState` is parsed and stored in Zustand
- If it's your turn and `currentDice === null`:
  - Roll button is enabled
  - Click → `roll_dice(gameId, rawSeed)` sends revealed seed
  - Contract verifies hash, derives dice, sets `game.currentDice`
- If it's your turn and `mustMove === true`:
  - Valid token indexes are highlighted on the board
  - Click token → `submit_move(gameId, tokenIndex)`
  - Contract validates move, applies captures, checks winner, advances turn

## Completed Game

- Polling stops when `status === "completed"` or `"forfeited"`
- Winner modal appears
- User can navigate to `/history/{gameId}` for full replay

## Polling Intervals

| Game Status | Poll Interval |
|-------------|---------------|
| waiting | 5 seconds |
| seed_commit | 5 seconds |
| active | 3 seconds |
| completed | stop |
| cancelled | stop |
| forfeited | stop |
