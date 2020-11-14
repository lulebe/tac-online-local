function canPlayCard (game, playerIndex, card, movesLeft7) {
  if (card <= 13 && card != 4 && canMoveCard(game, playerIndex, card, movesLeft7)) return true
  switch(card) {
    case 1:
      return getPlayerStones(game, playerIndex).some(s => s.position === STONE_POSITION_BOX)
    case 4:
      return canMoveBackBy4(game, playerIndex)
    case 7:
      return canMove7(game, playerIndex)
    case 8:
      return getPlayerStones(game, playerIndex).some(s => s.position === STONE_POSITION_FIELD)
    case 13:
      return getPlayerStones(game, playerIndex).some(s => s.position === STONE_POSITION_BOX)
    case 14:
      let stonesOnField = 0
      game.players.forEach(p => {
        stonesOnField += p.stones.filter(s => s.position === STONE_POSITION_FIELD).length
      })
      return stonesOnField >= 2 && getPlayerStones(game, playerIndex).some(s => s.position === STONE_POSITION_FIELD)
    case 15:
      let cardToCheck = getLastNonTacCard()
      if (cardToCheck !== null)
        return canPlayCard(unTacGame, playerIndex, cardToCheck)
  }
  return false
}

function canMoveCard (game, playerIndex, cardNumber, movesLeft7) {
  return getPlayerStones(game, playerIndex).map((_, i) => getStoneMoveResults(game, playerIndex, i, cardNumber, movesLeft7)).some(r => !!r.length)
}
function canMoveBackBy4 (game, playerIndex) {
  const field = assembleGameField(game)
  const movableStones = getPlayerStones(game, playerIndex).filter(s => s.position === STONE_POSITION_FIELD)
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
function canPlay7 (game, playerIndex) {
  //TODO implement
  return false
}

function assembleGameField (game) {
  const field = Array(64).map(_ => null)
  game.players.forEach((p, pi) => {
    p.stones.forEach((s, si) => {
      if(s.position === STONE_POSITION_FIELD) {
        field[s.field] = {player: pi, stone: si}
      }
    })
  })
  return field
}

function num2field (num) {
  if (num < 0) return num2field(num+64)
  if (num > 63) return num2field(num-64)
  return num
}

function getStoneMoveResults (game, playerIndex, stoneIndex, cardNumber, movesLeft7) {
  let results = []
  const stone = getPlayerStones(game, playerIndex).stones[stoneIndex]
  if (stone.position === STONE_POSITION_FIELD) {
    if (cardNumber === 4) {
      let isFree = true
      for (let j = 1; j <= 3; j++) {
        if (field[num2field(stone.field - j)] !== null) isFree = false
      }
      if (isFree) {
        const removedStone = field[num2field(stone.field - 4)]
        results.push({
          stone: {position: STONE_POSITION_FIELD, field: num2field(stone.field - 4)},
          removed: removedStone ? [removedStone] : []
        })
      }
    }
    if ([1,2,3,5,6,8,9,10,12,13].includes(cardNumber))
      results = results.concat(getMoveForwardByXResults(game, playerIndex, stone, cardNumber))
  }
  if ([1,13].includes(cardNumber) && stone.position === STONE_POSITION_BOX) {
    const stoneOnStart = field[num2field(game.players[playerIndex].playsFor * 16)]
    results.push({
      stone: {position: STONE_POSITION_FIELD, field: game.players[playerIndex].playsFor * 16},
      removed: stoneOnStart ? [stoneOnStart] : [],
      isStart: true
    })
  }
  if (stone.position === STONE_POSITION_HOUSE && [1,2,3].includes(cardNumber)) {
    let fieldsToGo = 3 - stone.field
    const sortedHouseStones = getPlayerStones(game, playerIndex)
        .filter(s => s.position === STONE_POSITION_HOUSE)
        .sort((a, b) => a.field > b.field)
    if (sortedHouseStones) {
      fieldsToGo = sortedHouseStones[0].field - stone.field
    }
    if (fieldsToGo <= cardNumber)
      results.push({
        stone: {position: STONE_POSITION_HOUSE, field: stone.field + cardNumber},
        removed: []
      })
  }
  if (cardNumber === 7) {
    if (stone.position === STONE_POSITION_HOUSE) {
      const houseStones = getPlayerStones(game, playerIndex).filter(s => s.position === STONE_POSITION_HOUSE)
      if (stone.field > 0 && !houseStones.some(s => s.field === stone.field-1))
        results.push({
          stone: {position: STONE_POSITION_HOUSE, field: stone.field-1},
          removed: []
        })
      if (stone.field < 3 && !houseStones.some(s => s.field === stone.field+1))
        results.push({
          stone: {position: STONE_POSITION_HOUSE, field: stone.field+1},
          removed: []
        })
    }
    if (stone.position === STONE_POSITION_FIELD) {
      let fieldMoveResults = getMoveForwardByXResults(game, playerIndex, stone, 1)
      if (fieldMoveResults.some(r => r.stone.position === STONE_POSITION_HOUSE)) {
        if ((movesLeft7 || 7) > 1 && getPlayerStones(game, playerIndex).filter(s => s.position === STONE_POSITION_HOUSE).length === 3) {
          let playerToCheck = null
          if (game.players[playerIndex].playsFor === playerIndex && !isPlayerDone(TEAMMATE_INDEX[playerIndex]))
            playerToCheck = TEAMMATE_INDEX[playerIndex]
          if (playerToCheck !== null && !canPlayCard(game, playerIndex, 7, movesLeft7-1))
            fieldMoveResults = fieldMoveResults.filter(r => r.stone.position !== STONE_POSITION_HOUSE)
        }
      }
      results = results.concat(fieldMoveResults)
    }
  }
  return results
}

function getMoveForwardByXResults (game, playerIndex, stone, x) {
  const fieldsToGoInHouse = num2field(stone.field + x) - game.players[playerIndex].playsFor * 16
  if (fieldsToGoInHouse >= 1 && fieldsToGoInHouse <= 4) {
    const sortedHouseStones = getPlayerStones(game, playerIndex)
      .filter(s => s.position === STONE_POSITION_HOUSE)
      .sort((a, b) => a.field > b.field)
    if (sortedHouseStones[0] && sortedHouseStones[0].field > (fieldsToGoInHouse-1)) {
      results.push({
        stone: {position: STONE_POSITION_HOUSE, field: fieldsToGoInHouse-1},
        removed: []
      })
    }
  }
  let isFree = true
  for (let j = 1; j < (x); j++) {
    if (field[num2field(stone.field + j)] !== null) isFree = false
  }
  if (isFree) {
    const removedStone = field[num2field(stone.field + x)]
    results.push({
      stone: {position: STONE_POSITION_FIELD, field: num2field(stone.field + x)},
      removed: removedStone ? [removedStone] : []
    })
  }
}


function playCard(game, playerIndex, cardNumber) {
  const player = game.players[playerIndex]
  if (cardNumber === 7) {
    //TODO implement
    turnData.clickableFields = getStonesCanGoX(8)
  }
  if (cardNumber === 8) {
    turnData.clickableFields = getStonesCanGoX(8)
    if (getPlayerStones(game, playerIndex).some(s => s.position === STONE_POSITION_FIELD))
      turnData.clickableFields.push({position: STONE_POSITION_BOX, playerIndex: (playerIndex === 3 ? 0 : playerIndex+1)})
    turnData.boardClickHandler = function (clickData) {
      if (clickData.position === CLICK_POSITION_BOX) {
        turnData.skipNext = true
        makeTurn()
      } else {
        const stoneIndex = getPlayerStones(game, playerIndex).indexOf(getPlayerStones(game, playerIndex).find(s => s.position === clickData.position && s.field === clickData.field))
        const results = getStoneMoveResults(game, playerIndex, stoneIndex, cardNumber)
        if (results.length) {
          getPlayerStones(game, playerIndex)[stoneIndex] = results[0].stone
          removeStones(results[0].removed)
          makeTurn()
        }
      }
    }
  }
  if (cardNumber === 14) {
    game.players.forEach(p => {
      turnData.clickableFields = p.stones.filter(s => s.position === STONE_POSITION_FIELD)
    })
    turnData.firstSwapStone = null
    turnData.boardClickHandler = function (clickData) {
      if (!turnData.firstSwapStone) {
        turnData.firstSwapStone = {data: assembleGameField(game)[clickData.field], field: clickData.field}
        game.players.forEach(p => {
          turnData.clickableFields = p.stones.filter(s => s.position === STONE_POSITION_FIELD && s.field !== clickData.field)
        })
      } else {
        const secondStone = assembleGameField(game)[clickData.field]
        game.players[turnData.firstSwapStone.data.player].stones[turnData.firstSwapStone.data.stone].field = clickData.field
        game.players[secondStone.player].stones[secondStone.stone].field = turnData.firstSwapStone.field
        makeTurn()
      }
    }
  }
  if (cardNumber === 15) {
    game.players.forEach((p, i) => p.stones = unTacGame.players[i].stones)
    turnData.tacNewCard = getLastNonTacCard()
    displaySelectedCard()
    playCard(game, playerIndex, turnData.tacNewCard)
  }
  if ([1,13].includes(cardNumber)) {
    turnData.clickableFields = getStonesCanGoX(game, playerIndex, cardNumber)
    if (getPlayerStones(game, playerIndex).stones.some(s => s.position === STONE_POSITION_BOX))
      turnData.clickableFields.push({position: STONE_POSITION_BOX, playerIndex: player.playsFor})
    turnData.boardClickHandler = function (clickData) {
      if (clickData.position === CLICK_POSITION_BOX) {
        const stoneIndex = getPlayerStones(game, playerIndex).indexOf(getPlayerStones(game, playerIndex).find(s => s.position === STONE_POSITION_BOX))
        const results = getStoneMoveResults(game, playerIndex, stoneIndex, cardNumber).filter(r => r.isStart)
        if (results.length) {
          getPlayerStones(game, playerIndex)[stoneIndex] = results[0].stone
          removeStones(results[0].removed)
          makeTurn()
        }
      } else {
        const stoneIndex = getPlayerStones(game, playerIndex).indexOf(getPlayerStones(game, playerIndex).find(s => s.position === clickData.position && s.field === clickData.field))
        const results = getStoneMoveResults(game, playerIndex, stoneIndex, cardNumber)
        if (results.length) {
          getPlayerStones(game, playerIndex)[stoneIndex] = results[0].stone
          removeStones(results[0].removed)
          makeTurn()
        }
      }
    }
  }
  if ([2,3,4,5,6,9,10,12].includes(cardNumber)) {
    turnData.clickableFields = getStonesCanGoX(game, playerIndex, cardNumber)
    turnData.boardClickHandler = function (clickData) {
      const stoneIndex = getPlayerStones(game, playerIndex).indexOf(getPlayerStones(game, playerIndex).find(s => s.position === clickData.position && s.field === clickData.field))
        const results = getStoneMoveResults(game, playerIndex, stoneIndex, cardNumber)
        if (results.length) {
          getPlayerStones(game, playerIndex)[stoneIndex] = results[0].stone
          removeStones(results[0].removed)
          makeTurn()
        }
    }
  }
}

function getStonesCanGoX (game, playerIndex, x) {
  return getPlayerStones(game, playerIndex).filter((s, i) => getStoneMoveResults(game, playerIndex, i, x).length > 0)
}

//N7
/*
outside house = can always go 7 forward
into house = if 3 stones already in, check if move to field 0 uses the whole 7;
             if not 3 in, always works (given free field 0)
inside house = works if adjacent field free
*/