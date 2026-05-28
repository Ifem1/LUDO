# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
import json
import hashlib


_CONTRACT_VERSION = "0.2.16-2dice"

COLOURS = ("red", "blue", "yellow", "green")
COLOUR_OFFSETS = {
    "red": 0,
    "blue": 13,
    "yellow": 26,
    "green": 39,
}
SAFE_SQUARES = (0, 8, 13, 21, 26, 34, 39, 47)


class LudoProof(gl.Contract):
    games: TreeMap[str, str]
    player_stats: TreeMap[str, str]
    leaderboard_index: TreeMap[str, str]
    leaderboard_seen: TreeMap[str, str]
    recent_games: TreeMap[str, str]
    open_games: TreeMap[str, str]
    total_games: u256
    total_players: u256

    def __init__(self):
        self.total_games = u256(0)
        self.total_players = u256(0)

    @gl.public.view
    def contract_version(self) -> str:
        return _CONTRACT_VERSION

    @gl.public.view
    def get_game(self, game_id: str) -> str:
        game = self._load_game(game_id)
        return json.dumps(game, separators=(",", ":"))

    @gl.public.view
    def get_game_summary(self, game_id: str) -> str:
        game = self._load_game(game_id)
        summary = {
            "game_id": game["game_id"],
            "creator": game["creator"],
            "status": game["status"],
            "max_players": game["max_players"],
            "players": [p["address"] for p in game["players"]],
            "colours": [p["colour"] for p in game["players"]],
            "winner": game["winner"],
            "move_count": game["move_count"],
            "created_at": game["created_at"],
            "completed_at": game["completed_at"],
        }
        return json.dumps(summary, separators=(",", ":"))

    @gl.public.view
    def get_current_turn(self, game_id: str) -> str:
        game = self._load_game(game_id)
        if game["status"] != "active" or len(game["players"]) == 0:
            return json.dumps({"current_player": None}, separators=(",", ":"))

        player = game["players"][int(game["current_turn_index"])]
        return json.dumps(
            {
                "current_turn_index": game["current_turn_index"],
                "current_player": player["address"],
                "colour": player["colour"],
                "current_dice": game["current_dice"],
                "dice_remaining": game["dice_remaining"],
                "must_move": game["must_move"],
                "consecutive_doubles": game["consecutive_doubles"],
            },
            separators=(",", ":"),
        )

    @gl.public.view
    def get_valid_moves(self, game_id: str) -> str:
        game = self._load_game(game_id)
        if game["status"] != "active" or not game["dice_remaining"]:
            return json.dumps({"per_die": [], "remaining": []}, separators=(",", ":"))

        player_index = int(game["current_turn_index"])
        per_die = []
        seen_die_values = set()
        for die_value in game["dice_remaining"]:
            if die_value in seen_die_values:
                continue
            seen_die_values.add(int(die_value))
            tokens = self._valid_token_indexes(game, player_index, int(die_value))
            per_die.append({"die": int(die_value), "tokens": tokens})

        return json.dumps(
            {"per_die": per_die, "remaining": game["dice_remaining"]},
            separators=(",", ":"),
        )

    @gl.public.view
    def get_move_history(self, game_id: str) -> str:
        game = self._load_game(game_id)
        return json.dumps(game["move_history"], separators=(",", ":"))

    @gl.public.view
    def get_winner(self, game_id: str) -> str:
        game = self._load_game(game_id)
        return json.dumps({"winner": game["winner"]}, separators=(",", ":"))

    @gl.public.view
    def get_player_stats(self, player: str) -> str:
        key = self._normalise_address(player)
        stats = self._default_stats(key)
        if key in self.player_stats:
            stats = json.loads(self.player_stats[key])

        stats["win_rate"] = self._win_rate(stats)
        return json.dumps(stats, separators=(",", ":"))

    @gl.public.view
    def get_leaderboard(self, limit: u256) -> str:
        max_items = int(limit)
        total = int(self.total_players)

        if max_items <= 0:
            return json.dumps([], separators=(",", ":"))

        rows = []
        i = 0

        while i < total and len(rows) < max_items:
            index_key = str(i)
            if index_key in self.leaderboard_index:
                player = self.leaderboard_index[index_key]
                if player in self.player_stats:
                    stats = json.loads(self.player_stats[player])
                    stats["win_rate"] = self._win_rate(stats)
                    rows.append(stats)
            i += 1

        return json.dumps(rows, separators=(",", ":"))

    @gl.public.view
    def get_recent_games(self, limit: u256) -> str:
        max_items = int(limit)
        total = int(self.total_games)
        rows = []

        i = total - 1
        while i >= 0 and len(rows) < max_items:
            key = str(i)
            if key in self.recent_games:
                game_id = self.recent_games[key]
                if game_id in self.games:
                    game = json.loads(self.games[game_id])
                    rows.append(
                        {
                            "game_id": game["game_id"],
                            "players": [p["address"] for p in game["players"]],
                            "winner": game["winner"],
                            "status": game["status"],
                            "move_count": game["move_count"],
                            "created_at": game["created_at"],
                            "completed_at": game["completed_at"],
                        }
                    )

            if i == 0:
                break
            i -= 1

        return json.dumps(rows, separators=(",", ":"))

    @gl.public.view
    def get_open_games(self, limit: u256) -> str:
        max_items = int(limit)
        total = int(self.total_games)
        rows = []

        i = total - 1
        while i >= 0 and len(rows) < max_items:
            key = str(i)
            if key in self.open_games:
                game_id = self.open_games[key]
                if game_id in self.games:
                    game = json.loads(self.games[game_id])
                    if game["status"] in ("waiting", "seed_commit"):
                        rows.append(
                            {
                                "game_id": game["game_id"],
                                "creator": game["creator"],
                                "status": game["status"],
                                "max_players": game["max_players"],
                                "players_count": len(game["players"]),
                                "created_at": game["created_at"],
                            }
                        )

            if i == 0:
                break
            i -= 1

        return json.dumps(rows, separators=(",", ":"))

    @gl.public.write
    def create_game(self, game_id: str, max_players: u256) -> str:
        clean_game_id = self._clean_text(game_id)

        if clean_game_id == "":
            raise Exception("game_id_required")

        if clean_game_id in self.games:
            raise Exception("game_already_exists")

        max_p = int(max_players)
        if max_p not in (2, 3, 4):
            raise Exception("max_players_must_be_2_3_or_4")

        sender = self._get_sender()
        game_number = int(self.total_games)

        game = {
            "game_id": clean_game_id,
            "creator": sender,
            "status": "waiting",
            "max_players": max_p,
            "players": [],
            "current_turn_index": 0,
            "current_dice": None,
            "dice_remaining": [],
            "current_roll_nonce": 0,
            "consecutive_doubles": 0,
            "move_count": 0,
            "must_move": False,
            "winner": None,
            "created_at": game_number + 1,
            "completed_at": None,
            "move_history": [],
        }

        self.games[clean_game_id] = json.dumps(game, separators=(",", ":"))
        self.recent_games[str(game_number)] = clean_game_id
        self.open_games[str(game_number)] = clean_game_id
        self.total_games = u256(game_number + 1)

        return json.dumps(
            {
                "ok": True,
                "action": "create_game",
                "game_id": clean_game_id,
                "creator": sender,
            },
            separators=(",", ":"),
        )

    @gl.public.write
    def join_game(self, game_id: str, colour: str) -> str:
        clean_game_id = self._clean_text(game_id)
        clean_colour = self._clean_text(colour).lower()
        sender = self._get_sender()
        game = self._load_game(clean_game_id)

        if game["status"] not in ("waiting", "seed_commit"):
            raise Exception("game_not_joinable")

        if not self._is_valid_colour(clean_colour):
            raise Exception("invalid_colour")

        if self._find_player(game, sender) != -1:
            raise Exception("player_already_joined")

        if self._colour_taken(game, clean_colour):
            raise Exception("colour_taken")

        if len(game["players"]) >= int(game["max_players"]):
            raise Exception("game_full")

        player = {
            "address": sender,
            "colour": clean_colour,
            "tokens": [-1, -1, -1, -1],
            "seed_commitment": None,
            "has_committed_seed": False,
            "has_revealed_seed": False,
            "forfeited": False,
            "joined_at": int(game["move_count"]) + 1,
        }

        game["players"].append(player)

        if len(game["players"]) == int(game["max_players"]):
            game["status"] = "seed_commit"

        self._save_game(clean_game_id, game)

        return json.dumps(
            {
                "ok": True,
                "action": "join_game",
                "game_id": clean_game_id,
                "player": sender,
                "colour": clean_colour,
            },
            separators=(",", ":"),
        )

    @gl.public.write
    def commit_seed(self, game_id: str, seed_commitment: str) -> str:
        clean_game_id = self._clean_text(game_id)
        commitment = self._normalise_hash(seed_commitment)
        sender = self._get_sender()
        game = self._load_game(clean_game_id)

        if game["status"] not in ("waiting", "seed_commit"):
            raise Exception("cannot_commit_seed_now")

        if commitment == "":
            raise Exception("seed_commitment_required")

        player_index = self._find_player(game, sender)
        if player_index == -1:
            raise Exception("caller_not_player")

        player = game["players"][player_index]

        if player["has_committed_seed"]:
            raise Exception("seed_already_committed")

        player["seed_commitment"] = commitment
        player["has_committed_seed"] = True
        game["players"][player_index] = player

        if len(game["players"]) == int(game["max_players"]) and self._all_players_committed(game):
            game["status"] = "seed_commit"

        self._save_game(clean_game_id, game)

        return json.dumps(
            {
                "ok": True,
                "action": "commit_seed",
                "game_id": clean_game_id,
                "player": sender,
                "seed_commitment": commitment,
            },
            separators=(",", ":"),
        )

    @gl.public.write
    def start_game(self, game_id: str) -> str:
        clean_game_id = self._clean_text(game_id)
        sender = self._get_sender()
        game = self._load_game(clean_game_id)

        if sender != self._normalise_address(game["creator"]):
            raise Exception("only_creator_can_start")

        if game["status"] not in ("waiting", "seed_commit"):
            raise Exception("game_cannot_start_from_status")

        if len(game["players"]) < 2:
            raise Exception("need_at_least_2_players")

        if len(game["players"]) != int(game["max_players"]):
            raise Exception("game_not_full")

        if not self._all_players_committed(game):
            raise Exception("not_all_players_committed")

        game["status"] = "active"
        game["current_turn_index"] = 0
        game["current_dice"] = None
        game["dice_remaining"] = []
        game["current_roll_nonce"] = 0
        game["consecutive_doubles"] = 0
        game["must_move"] = False

        self._save_game(clean_game_id, game)

        return json.dumps(
            {
                "ok": True,
                "action": "start_game",
                "game_id": clean_game_id,
                "current_player": game["players"][0]["address"],
            },
            separators=(",", ":"),
        )

    @gl.public.write
    def roll_dice(self, game_id: str, revealed_seed: str) -> str:
        clean_game_id = self._clean_text(game_id)
        sender = self._get_sender()
        game = self._load_game(clean_game_id)

        if game["status"] != "active":
            raise Exception("game_not_active")

        current_index = int(game["current_turn_index"])
        current_player = game["players"][current_index]

        if sender != self._normalise_address(current_player["address"]):
            raise Exception("not_your_turn")

        if current_player.get("forfeited", False):
            raise Exception("player_forfeited")

        if game["dice_remaining"] or game["must_move"]:
            raise Exception("move_pending")

        if not current_player["has_committed_seed"]:
            raise Exception("seed_not_committed")

        seed_hash = self._hash_text(revealed_seed)
        expected = self._normalise_hash(current_player["seed_commitment"])

        if seed_hash != expected:
            raise Exception("seed_reveal_does_not_match_commitment")

        # Derive two dice values from the revealed seed. The contract uses
        # a different nonce-offset for each die so the values are independent.
        d1 = self._derive_dice(game, sender, revealed_seed, 0)
        d2 = self._derive_dice(game, sender, revealed_seed, 1)
        is_doubles = d1 == d2

        current_player["has_revealed_seed"] = True
        game["players"][current_index] = current_player

        game["current_roll_nonce"] = int(game["current_roll_nonce"]) + 1
        game["current_dice"] = [d1, d2]
        game["dice_remaining"] = [d1, d2]
        game["move_count"] = int(game["move_count"]) + 1

        if is_doubles:
            game["consecutive_doubles"] = int(game["consecutive_doubles"]) + 1
        else:
            game["consecutive_doubles"] = 0

        self._append_move(
            game,
            {
                "moveType": "roll",
                "player": sender,
                "colour": current_player["colour"],
                "dice": [d1, d2],
                "reason": "commit_reveal_verified",
            },
        )

        # Three consecutive doubles cancels the third roll and passes turn.
        if int(game["consecutive_doubles"]) >= 3:
            self._append_move(
                game,
                {
                    "moveType": "three_sixes",
                    "player": sender,
                    "colour": current_player["colour"],
                    "dice": [d1, d2],
                    "reason": "third_consecutive_double_cancelled",
                },
            )

            game["current_dice"] = None
            game["dice_remaining"] = []
            game["must_move"] = False
            game["consecutive_doubles"] = 0

            self._advance_turn(game)
            self._save_game(clean_game_id, game)

            return json.dumps(
                {
                    "ok": True,
                    "action": "roll_dice",
                    "game_id": clean_game_id,
                    "dice": [d1, d2],
                    "cancelled": True,
                    "reason": "third_consecutive_double",
                },
                separators=(",", ":"),
            )

        # Check whether any of the rolled values is usable.
        if not self._any_die_playable(game, current_index, [d1, d2]):
            self._append_move(
                game,
                {
                    "moveType": "no_move",
                    "player": sender,
                    "colour": current_player["colour"],
                    "dice": [d1, d2],
                    "reason": "no_legal_token_move",
                },
            )

            game["current_dice"] = None
            game["dice_remaining"] = []
            game["must_move"] = False
            # Doubles bonus is only granted after the player successfully
            # plays both dice. If neither die is usable, the turn passes.
            game["consecutive_doubles"] = 0
            self._advance_turn(game)
        else:
            game["must_move"] = True

        self._save_game(clean_game_id, game)

        return json.dumps(
            {
                "ok": True,
                "action": "roll_dice",
                "game_id": clean_game_id,
                "dice": [d1, d2],
                "dice_remaining": game["dice_remaining"],
                "cancelled": False,
                "is_doubles": is_doubles,
            },
            separators=(",", ":"),
        )

    @gl.public.write
    def submit_move(self, game_id: str, token_index: u256, die_value: u256) -> str:
        clean_game_id = self._clean_text(game_id)
        sender = self._get_sender()
        game = self._load_game(clean_game_id)

        if game["status"] != "active":
            raise Exception("game_not_active")

        current_index = int(game["current_turn_index"])
        current_player = game["players"][current_index]

        if sender != self._normalise_address(current_player["address"]):
            raise Exception("not_your_turn")

        if not game["must_move"] or not game["dice_remaining"]:
            raise Exception("no_move_pending")

        idx = int(token_index)
        if idx < 0 or idx > 3:
            raise Exception("invalid_token_index")

        die = int(die_value)
        if die < 1 or die > 6:
            raise Exception("invalid_die_value")

        # The selected die must still be available.
        remaining = list(game["dice_remaining"])
        if die not in remaining:
            raise Exception("die_value_not_available")

        # The chosen token must be legal for this die value.
        valid_moves = self._valid_token_indexes(game, current_index, die)
        if idx not in valid_moves:
            raise Exception("illegal_move")

        old_position = int(current_player["tokens"][idx])
        new_position = self._next_position(old_position, die)

        current_player["tokens"][idx] = new_position
        game["players"][current_index] = current_player

        capture_result = self._apply_capture(game, current_index, idx, new_position)
        captured = capture_result["captured"]

        game["move_count"] = int(game["move_count"]) + 1

        self._append_move(
            game,
            {
                "moveType": "move",
                "player": sender,
                "colour": current_player["colour"],
                "dice": die,
                "tokenIndex": idx,
                "from": old_position,
                "to": new_position,
                "reason": "legal_move_verified",
            },
        )

        for cap in capture_result["captures"]:
            self._append_move(
                game,
                {
                    "moveType": "capture",
                    "player": sender,
                    "colour": current_player["colour"],
                    "capturedPlayer": cap["capturedPlayer"],
                    "capturedTokenIndex": cap["capturedTokenIndex"],
                    "reason": "landed_on_opponent_non_safe_square",
                },
            )
            self._increment_capture_stat(sender)

        # Remove the spent die from the remaining list.
        remaining.remove(die)

        # If any dice are left but none of them can legally be played, the
        # remaining dice are forfeited.
        if remaining and not self._any_die_playable(game, current_index, remaining):
            remaining = []

        game["dice_remaining"] = remaining

        winner_found = self._check_winner(game, current_index)

        if winner_found:
            game["status"] = "completed"
            game["winner"] = sender
            game["completed_at"] = int(game["move_count"])
            game["current_dice"] = None
            game["dice_remaining"] = []
            game["must_move"] = False

            self._append_move(
                game,
                {
                    "moveType": "win",
                    "player": sender,
                    "colour": current_player["colour"],
                    "reason": "all_tokens_finished",
                },
            )

            self._update_stats_on_game_end(game, sender)

        elif not remaining:
            # Turn complete. Decide whether the player gets a bonus turn.
            original_dice = game["current_dice"] or [0, 0]
            was_doubles = (
                len(original_dice) == 2
                and int(original_dice[0]) == int(original_dice[1])
            )

            game["current_dice"] = None
            game["must_move"] = False

            if was_doubles:
                # Bonus turn — same player rolls again. The
                # consecutive_doubles counter already tracks this.
                pass
            else:
                game["consecutive_doubles"] = 0
                self._advance_turn(game)

        else:
            # Dice remain — same player continues using the rest.
            game["must_move"] = True

        self._save_game(clean_game_id, game)

        return json.dumps(
            {
                "ok": True,
                "action": "submit_move",
                "game_id": clean_game_id,
                "player": sender,
                "token_index": idx,
                "die": die,
                "from": old_position,
                "to": new_position,
                "captured": captured,
                "dice_remaining": game["dice_remaining"],
                "winner": game["winner"],
                "status": game["status"],
            },
            separators=(",", ":"),
        )

    @gl.public.write
    def forfeit_game(self, game_id: str) -> str:
        clean_game_id = self._clean_text(game_id)
        sender = self._get_sender()
        game = self._load_game(clean_game_id)

        if game["status"] not in ("waiting", "seed_commit", "active"):
            raise Exception("cannot_forfeit_now")

        player_index = self._find_player(game, sender)

        if player_index == -1:
            raise Exception("caller_not_player")

        player = game["players"][player_index]
        player["forfeited"] = True
        game["players"][player_index] = player

        self._append_move(
            game,
            {
                "moveType": "forfeit",
                "player": sender,
                "colour": player["colour"],
                "reason": "player_forfeited",
            },
        )

        self._increment_forfeit_stat(sender)

        active_indexes = self._active_player_indexes(game)

        if len(active_indexes) == 1:
            winner_index = active_indexes[0]
            winner = self._normalise_address(game["players"][winner_index]["address"])

            game["winner"] = winner
            game["status"] = "forfeited"
            game["completed_at"] = int(game["move_count"]) + 1

            self._append_move(
                game,
                {
                    "moveType": "win",
                    "player": winner,
                    "colour": game["players"][winner_index]["colour"],
                    "reason": "last_active_player_after_forfeit",
                },
            )

            self._update_stats_on_game_end(game, winner)

        elif len(active_indexes) == 0:
            game["status"] = "forfeited"
            game["completed_at"] = int(game["move_count"]) + 1

        else:
            if game["status"] == "active" and int(game["current_turn_index"]) == player_index:
                game["current_dice"] = None
                game["dice_remaining"] = []
                game["must_move"] = False
                self._advance_turn(game)

        self._save_game(clean_game_id, game)

        return json.dumps(
            {
                "ok": True,
                "action": "forfeit_game",
                "game_id": clean_game_id,
                "player": sender,
                "status": game["status"],
                "winner": game["winner"],
            },
            separators=(",", ":"),
        )

    @gl.public.write
    def cancel_game(self, game_id: str) -> str:
        clean_game_id = self._clean_text(game_id)
        sender = self._get_sender()
        game = self._load_game(clean_game_id)

        if sender != self._normalise_address(game["creator"]):
            raise Exception("only_creator_can_cancel")

        if game["status"] not in ("waiting", "seed_commit"):
            raise Exception("cannot_cancel_started_game")

        game["status"] = "cancelled"
        game["completed_at"] = int(game["move_count"]) + 1

        self._append_move(
            game,
            {
                "moveType": "cancel",
                "player": sender,
                "colour": "",
                "reason": "creator_cancelled_before_start",
            },
        )

        self._save_game(clean_game_id, game)

        return json.dumps(
            {
                "ok": True,
                "action": "cancel_game",
                "game_id": clean_game_id,
                "status": "cancelled",
            },
            separators=(",", ":"),
        )

    def _load_game(self, game_id: str) -> dict:
        clean_game_id = self._clean_text(game_id)

        if clean_game_id not in self.games:
            raise Exception("game_not_found")

        return json.loads(self.games[clean_game_id])

    def _save_game(self, game_id: str, game: dict):
        self.games[self._clean_text(game_id)] = json.dumps(game, separators=(",", ":"))

    def _get_sender(self) -> str:
        return self._normalise_address(str(gl.message.sender_address))

    def _clean_text(self, value: str) -> str:
        return str(value).strip()

    def _normalise_address(self, value: str) -> str:
        return str(value).strip().lower()

    def _normalise_hash(self, value: str) -> str:
        clean = str(value).strip().lower()

        if clean.startswith("0x"):
            clean = clean[2:]

        return clean

    def _hash_text(self, value: str) -> str:
        return hashlib.sha256(str(value).encode("utf-8")).hexdigest()

    def _derive_dice(self, game: dict, player: str, revealed_seed: str, die_index: int) -> int:
        """Derive one of the two dice values for the current roll. `die_index`
        is 0 or 1 and is mixed into the hash so the two values are independent
        but both are deterministically derived from the revealed seed."""
        source = (
            str(game["game_id"])
            + "|"
            + self._normalise_address(player)
            + "|"
            + str(revealed_seed)
            + "|"
            + str(game["current_roll_nonce"])
            + "|"
            + str(game["move_count"])
            + "|d"
            + str(die_index)
        )

        digest = hashlib.sha256(source.encode("utf-8")).hexdigest()
        value = int(digest, 16)

        return (value % 6) + 1

    def _any_die_playable(self, game: dict, player_index: int, dice_values: list) -> bool:
        """Return True if at least one of the unspent dice values yields a
        legal move for the given player."""
        seen = set()
        for die_value in dice_values:
            d = int(die_value)
            if d in seen:
                continue
            seen.add(d)
            if self._valid_token_indexes(game, player_index, d):
                return True
        return False

    def _is_valid_colour(self, colour: str) -> bool:
        return colour in COLOURS

    def _colour_taken(self, game: dict, colour: str) -> bool:
        for player in game["players"]:
            if player["colour"] == colour:
                return True

        return False

    def _find_player(self, game: dict, address: str) -> int:
        clean = self._normalise_address(address)

        i = 0
        while i < len(game["players"]):
            if self._normalise_address(game["players"][i]["address"]) == clean:
                return i

            i += 1

        return -1

    def _all_players_committed(self, game: dict) -> bool:
        if len(game["players"]) == 0:
            return False

        for player in game["players"]:
            if not player["has_committed_seed"]:
                return False

        return True

    def _next_position(self, old_position: int, dice: int) -> int:
        if old_position == -1:
            if dice == 6:
                return 0

            raise Exception("base_token_requires_six")

        new_position = old_position + dice

        if new_position > 58:
            raise Exception("must_land_exactly_on_finish")

        return new_position

    def _valid_token_indexes(self, game: dict, player_index: int, dice: int) -> list:
        player = game["players"][player_index]
        moves = []

        i = 0
        while i < 4:
            pos = int(player["tokens"][i])

            if pos == -1:
                if dice == 6:
                    moves.append(i)
            elif pos >= 0 and pos <= 57:
                if pos + dice <= 58:
                    moves.append(i)

            i += 1

        return moves

    def _local_to_global(self, colour: str, local_position: int) -> int:
        if local_position < 0 or local_position > 51:
            return -1

        offset = COLOUR_OFFSETS[colour]
        return (offset + local_position) % 52

    def _is_safe_square(self, global_square: int) -> bool:
        return global_square in SAFE_SQUARES

    def _apply_capture(self, game: dict, player_index: int, token_index: int, new_position: int) -> dict:
        captures = []

        if new_position < 0 or new_position > 51:
            return {"captured": False, "captures": captures}

        current_player = game["players"][player_index]
        current_colour = current_player["colour"]
        landing_square = self._local_to_global(current_colour, new_position)

        if self._is_safe_square(landing_square):
            return {"captured": False, "captures": captures}

        i = 0
        while i < len(game["players"]):
            if i != player_index:
                opponent = game["players"][i]

                if not opponent.get("forfeited", False):
                    j = 0
                    while j < 4:
                        opponent_pos = int(opponent["tokens"][j])

                        if opponent_pos >= 0 and opponent_pos <= 51:
                            opponent_square = self._local_to_global(opponent["colour"], opponent_pos)

                            if opponent_square == landing_square:
                                opponent["tokens"][j] = -1
                                captures.append(
                                    {
                                        "capturedPlayer": self._normalise_address(opponent["address"]),
                                        "capturedTokenIndex": j,
                                    }
                                )

                        j += 1

                    game["players"][i] = opponent

            i += 1

        return {"captured": len(captures) > 0, "captures": captures}

    def _advance_turn(self, game: dict):
        total = len(game["players"])

        if total == 0:
            game["current_turn_index"] = 0
            return

        start = int(game["current_turn_index"])
        next_index = (start + 1) % total
        checked = 0

        while checked < total:
            player = game["players"][next_index]

            if not player.get("forfeited", False):
                game["current_turn_index"] = next_index
                return

            next_index = (next_index + 1) % total
            checked += 1

        game["current_turn_index"] = start

    def _check_winner(self, game: dict, player_index: int) -> bool:
        tokens = game["players"][player_index]["tokens"]
        return tokens[0] == 58 and tokens[1] == 58 and tokens[2] == 58 and tokens[3] == 58

    def _active_player_indexes(self, game: dict) -> list:
        indexes = []

        i = 0
        while i < len(game["players"]):
            if not game["players"][i].get("forfeited", False):
                indexes.append(i)

            i += 1

        return indexes

    def _append_move(self, game: dict, move: dict):
        move_number = len(game["move_history"]) + 1

        record = {
            "moveNumber": move_number,
            "player": move.get("player", ""),
            "colour": move.get("colour", ""),
            "moveType": move.get("moveType", ""),
            "timestamp": int(game["move_count"]) + move_number,
        }

        optional_keys = (
            "dice",
            "tokenIndex",
            "from",
            "to",
            "capturedPlayer",
            "capturedTokenIndex",
            "reason",
        )

        for key in optional_keys:
            if key in move:
                record[key] = move[key]

        game["move_history"].append(record)

    def _default_stats(self, player: str) -> dict:
        return {
            "player": self._normalise_address(player),
            "games_played": 0,
            "wins": 0,
            "losses": 0,
            "captures": 0,
            "forfeits": 0,
            "total_moves": 0,
            "last_played_at": 0,
        }

    def _get_stats(self, player: str) -> dict:
        key = self._normalise_address(player)

        if key in self.player_stats:
            return json.loads(self.player_stats[key])

        return self._default_stats(key)

    def _save_stats(self, player: str, stats: dict):
        key = self._normalise_address(player)
        stats["player"] = key

        self.player_stats[key] = json.dumps(stats, separators=(",", ":"))

        if key not in self.leaderboard_seen:
            index = int(self.total_players)
            self.leaderboard_index[str(index)] = key
            self.leaderboard_seen[key] = "1"
            self.total_players = u256(index + 1)

    def _win_rate(self, stats: dict) -> int:
        played = int(stats.get("games_played", 0))

        if played == 0:
            return 0

        wins = int(stats.get("wins", 0))

        return int((wins * 10000) / played)

    def _increment_capture_stat(self, player: str):
        key = self._normalise_address(player)
        stats = self._get_stats(key)
        stats["captures"] = int(stats["captures"]) + 1
        self._save_stats(key, stats)

    def _increment_forfeit_stat(self, player: str):
        key = self._normalise_address(player)
        stats = self._get_stats(key)
        stats["forfeits"] = int(stats["forfeits"]) + 1
        self._save_stats(key, stats)

    def _update_stats_on_game_end(self, game: dict, winner: str):
        winner_key = self._normalise_address(winner)

        for player in game["players"]:
            key = self._normalise_address(player["address"])
            stats = self._get_stats(key)

            stats["games_played"] = int(stats["games_played"]) + 1
            stats["total_moves"] = int(stats["total_moves"]) + int(game["move_count"])
            stats["last_played_at"] = int(game["completed_at"] or game["move_count"])

            if key == winner_key:
                stats["wins"] = int(stats["wins"]) + 1
            else:
                stats["losses"] = int(stats["losses"]) + 1

            self._save_stats(key, stats)
