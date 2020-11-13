function canPlayCard (historyNum, playerIndex, card) {
  const curGame = gameHistory.last(historyNum)
  const player = curGame.players[playerIndex]
  if (card <= 13 && card != 4 && canMoveForwardByX(curGame, player, card)) return true
  switch(card) {
    case 1:
      return player.stones.some(s => s.position === STONE_POSITION_BOX)
    case 4:
      return canMoveBackBy4(curGame, player)
    case 7:
      return canMove7(curGame, player)
    case 8:
      return true
    case 13:
      return player.stones.some(s => s.position === STONE_POSITION_BOX)
    case 14:
      let stonesOnField = 0
      curGame.players.forEach(p => {
        stonesOnField += p.stones.filter(s => s.position === STONE_POSITION_FIELD).length
      })
      return stonesOnField >= 2
    case 15:
      let lastNonTacGameIndex = null
      let cardToCheck = 0
      let gameIndex = gameHistory.length-1
      while (gameIndex < gameHistory.length) {
        const g = gameHistory.last(gameIndex)
        if (g.usedCards.last() != 15) {
          lastNonTacGameIndex = gameIndex
          cardToCheck = g.usedCards.last()
          break
        }
        gameIndex--
      }
      if (lastNonTacGameIndex !== null)
        return canPlayCard(lastNonTacGameIndex, playerIndex, cardToCheck)
  }
  return false
}

function canMoveForwardByX (game, player, fields) {
  const field = assembleGameField(game)
  const movableStones = player.stones.filter(s => s.position === STONE_POSITION_FIELD)
  for (let i = 0; i < movableStones.length; i++) {
    const stone = movableStones[i]
    let isFree = true
    for (let j = 1; j < fields; j++) {
      if (field[num2field(stone.field + j)] !== null) isFree = false
    }
    if (isFree) return true
  }
  return false
}
function canMoveBackBy4 (game, player) {
  const field = assembleGameField(game)
  const movableStones = player.stones.filter(s => s.position === STONE_POSITION_FIELD)
  for (let i = 0; i < movableStones.length; i++) {
    const stone = movableStones[i]
    let isFree = true
    for (let j = 1; j <= 3; j++) {
      if (field[num2field(stone.field - j)] !== null) isFree = false
    }
    if (isFree) return true
  }
  return false
}
function canMove7 (game, player) {
  //TODO implement
  return false
}

function assembleGameField (game) {
  const field = Array(64).map(_ => null)
  game.players.forEach((p, i) => {
    p.stones.filter(s => s.position === STONE_POSITION_FIELD).forEach(s => {
      field[s.field] = i
    })
  })
  return field
}

function num2field (num) {
  if (num < 0) return num2field(num+64)
  if (num > 63) return num2field(num-64)
  return num
}