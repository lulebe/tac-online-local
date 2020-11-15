const WARN_NOTHING = 0
const WARN_GAME_OVER = 1
const WARN_SKIP = 2
const WARN_SWAP = 3
const WARN_TAC = 4
const WARN_COOP_0 = 5
const WARN_COOP_1 = 6
const WARN_COOP_2 = 7
const WARN_COOP_3 = 8
const warnings = [
  "",
  "The game is over.",
  "This Player will be skipped.",
  "Pick a card to exchange with your teammate.",
  "Last turn was undone, play that card now.",
  "Player 1 now plays for Player 3.",
  "Player 2 now plays for Player 4.",
  "Player 3 now plays for Player 1.",
  "Player 4 now plays for Player 2."
]