function canPlayCard (game, playerIndex, card, movesLeft7) {
  if (card <= 13 && canMoveCard(game, playerIndex, card, movesLeft7)) return true
  switch(card) {
    case 1:
      return getPlayerStones(game, playerIndex).some(s => s.position === STONE_POSITION_BOX)
    case 7:
      return canPlay7(game, playerIndex)
    case 8:
      return getPlayerStones(game, playerIndex).some(s => s.position === STONE_POSITION_FIELD) && game.players[playerIndex === 3 ? 0 : playerIndex+1].deck.length
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
function canPlay7 (game, playerIndex) {
  if (getPlayerStones(game, playerIndex).some(s => s.position === STONE_POSITION_FIELD))
    return true
  //only house stones => check if any movable stones
  if (getPlayerStones(game, playerIndex).some(s => s.position === STONE_POSITION_HOUSE && s.canMove))
    return true
  return false
}

function assembleGameField (game) {
  const field = [...Array(64).keys()].map(_ => null)
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
  const field = assembleGameField(game)
  let results = []
  const stone = getPlayerStones(game, playerIndex)[stoneIndex]
  if (stone.position === STONE_POSITION_FIELD && [1,2,3,4,5,6,8,9,10,12,13].includes(cardNumber)) {
    results = results.concat(getMoveByXResults(game, playerIndex, stone, cardNumber === 4 ? -4 : cardNumber))
  }
  if ([1,13].includes(cardNumber) && stone.position === STONE_POSITION_BOX) {
    const stoneOnStart = field[num2field(game.players[playerIndex].playsFor * 16)]
    results.push({
      stone: {position: STONE_POSITION_FIELD, field: game.players[playerIndex].playsFor * 16, canGoToHouse: false},
      removed: stoneOnStart ? [stoneOnStart] : [],
      isStart: true
    })
  }
  if (stone.position === STONE_POSITION_HOUSE && [1,2,3].includes(cardNumber)) {
    let fieldsToGo = 3 - stone.field
    const sortedHouseStones = getPlayerStones(game, playerIndex)
        .filter(s => s.position === STONE_POSITION_HOUSE && s !== stone)
        .sort((a, b) => a.field > b.field)
    if (sortedHouseStones[0]) {
      fieldsToGo = sortedHouseStones[0].field - stone.field
    }
    if (fieldsToGo >= cardNumber) {
      results.push({
        stone: {position: STONE_POSITION_HOUSE, field: stone.field + cardNumber, canGoToHouse: true},
        removed: []
      })
    }
  }
  if (cardNumber === 7) {
    if (stone.position === STONE_POSITION_HOUSE && stone.canMove) {
      const sortedHouseStones = getPlayerStones(game, playerIndex)
      .filter(s => s.position === STONE_POSITION_HOUSE)
      .sort((a, b) => a.field > b.field)
      if (stone.field < 3 && !sortedHouseStones.some(s => s.field === stone.field+1)) {
        results.push({
          stone: {position: STONE_POSITION_HOUSE, field: stone.field+1, canGoToHouse: true, canMove: true},
          removed: []
        })
      }
      if (stone.field > 0 && !sortedHouseStones.some(s => s.field === stone.field-1) && stone.canMove)
        results.push({
          stone: {position: STONE_POSITION_HOUSE, field: stone.field-1, canGoToHouse: true, canMove: true},
          removed: []
        })
    }
    if (stone.position === STONE_POSITION_FIELD) {
      let fieldMoveResults = getMoveByXResults(game, playerIndex, stone, 1)
      if (fieldMoveResults.some(r => r.stone.position === STONE_POSITION_HOUSE)) {
        if ((movesLeft7 || 7) > 1 && getPlayerStones(game, playerIndex).filter(s => s.position === STONE_POSITION_HOUSE).length === 3) {
          let playerToCheck = null
          if (game.players[playerIndex].playsFor === playerIndex && !isPlayerDone(TEAMMATE_INDEX[playerIndex]))
            playerToCheck = TEAMMATE_INDEX[playerIndex]
          if (playerToCheck !== null && !canPlayCard(game, playerIndex, 7, (movesLeft7 || 7) - 1))
            fieldMoveResults = fieldMoveResults.filter(r => r.stone.position !== STONE_POSITION_HOUSE)
        }
      }
      results = results.concat(fieldMoveResults)
    }
  }
  return results
}

function getHouseLockedFromPosition (game, playerIndex, housePosition) {
  const house = [null, null, null, null]
  game.players[playerIndex].stones.filter(s => s.position === STONE_POSITION_HOUSE).forEach(s => house[s.field] = s)
  for (let i = housePosition; i < 4; i++) {
    if (house [i]) {
      if (house[i].canMove)
        return false
    } else
      return false
  }
  return true
}

function lockHouseStones (game, playerIndex) {
  const house = [null, null, null, null]
  game.players[playerIndex].stones.filter(s => s.position === STONE_POSITION_HOUSE).forEach(s => house[s.field] = s)
  for (let i = 3; i >= 0; i--) {
    if (!house[i]) continue
    if (i === 3) house[i].canMove = false
    else if (house[i+1]) house[i].canMove = house[i+1].canMove
  }
}

function getFieldsToHouse (playerIndex, stoneField, goingForward) {
  const transformedField = num2field(stoneField - playerIndex * 16)
  if (!goingForward) return transformedField
  return 64 - (transformedField === 0 ? 64 : transformedField)
}

function getMoveByXResults (game, playerIndex, stone, x) {
  const results = []
  const field = assembleGameField(game)
  const fieldsToHouse = getFieldsToHouse(playerIndex, stone.field, x>0)
  const fieldsToGoInHouse = Math.abs(x) - fieldsToHouse
  if (stone.canGoToHouse && fieldsToGoInHouse >= 1 && fieldsToGoInHouse <= 4) {
    let isFree = true
    for (let j = 1; j < fieldsToHouse; j++) {
      if (field[num2field(x>0 ? (stone.field + j) : (stone.field - j))] !== null) isFree = false
    }
    const sortedHouseStones = getPlayerStones(game, playerIndex)
      .filter(s => s.position === STONE_POSITION_HOUSE)
      .sort((a, b) => a.field > b.field)
    let isFreeInHouse = sortedHouseStones[0] ? sortedHouseStones[0].field > (fieldsToGoInHouse-1) : true
    if (isFree && isFreeInHouse) {
      results.push({
        stone: {position: STONE_POSITION_HOUSE, field: fieldsToGoInHouse-1, canGoToHouse: true, canMove: true},
        removed: []
      })
    }
  }
  let isFree = true
  for (let j = 1; j < Math.abs(x); j++) {
    if (field[num2field(x>0 ? (stone.field + j) : (stone.field - j))] !== null) isFree = false
  }
  if (isFree) {
    const removedStone = field[num2field(stone.field + x)]
    results.push({
      stone: {position: STONE_POSITION_FIELD, field: num2field(stone.field + x), canGoToHouse: true, canMove: true},
      removed: removedStone ? [removedStone] : []
    })
  }
  return results
}


function playCard(game, playerIndex, cardNumber) {
  const player = game.players[playerIndex]
  if (cardNumber === 7) {
    turnData.clickableFields = getStonesCanGoX(game, playerIndex, 7, turnData.movesLeft7)
    turnData.boardClickHandler = function (clickData) {
      const stoneIndex = getPlayerStones(game, playerIndex).indexOf(getPlayerStones(game, playerIndex).find(s => s.position === clickData.position && s.field === clickData.field))
      const results = getStoneMoveResults(game, playerIndex, stoneIndex, 7, turnData.movesLeft7)
      if (results.length) {
        getPlayerStones(game, playerIndex)[stoneIndex] = results[0].stone
        removeStones(results[0].removed)
        turnData.movesLeft7--
        if (turnData.movesLeft7 === 0) {
          makeTurn()
        } else
          turnData.clickableFields = getStonesCanGoX(game, playerIndex, 7, turnData.movesLeft7)
      }
    }
  }
  if (cardNumber === 8) {
    turnData.clickableFields = getStonesCanGoX(game, playerIndex, 8)
    if (getPlayerStones(game, playerIndex).some(s => s.position === STONE_POSITION_FIELD) && game.players[playerIndex === 3 ? 0 : playerIndex+1].deck.length)
      turnData.clickableFields.push({position: STONE_POSITION_BOX, playerIndex: (playerIndex === 3 ? 0 : playerIndex+1)})
    turnData.boardClickHandler = function (clickData) {
      if (clickData.position === STONE_POSITION_BOX) {
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
      turnData.clickableFields = turnData.clickableFields.concat(p.stones.filter(s => s.position === STONE_POSITION_FIELD))
    })
    turnData.firstSwapStone = null
    turnData.boardClickHandler = function (clickData) {
      if (!turnData.firstSwapStone) {
        const stoneField = assembleGameField(game)[clickData.field]
        turnData.firstSwapStone = game.players[stoneField.player].stones[stoneField.stone]
        turnData.clickableFields = []
        game.players.forEach(p => {
          turnData.clickableFields = turnData.clickableFields.concat(p.stones.filter(s => s.position === STONE_POSITION_FIELD && s.field !== clickData.field))
        })
        updateScreens()
      } else {
        const stoneField = assembleGameField(game)[clickData.field]
        const secondStone = game.players[stoneField.player].stones[stoneField.stone]
        secondStone.field = turnData.firstSwapStone.field
        turnData.firstSwapStone.field = clickData.field
        turnData.firstSwapStone.canGoToHouse = true
        secondStone.canGoToHouse = true
        makeTurn()
      }
    }
  }
  if (cardNumber === 15) {
    game.players.forEach((p, i) => p.stones = unTacGame.players[i].stones)
    turnData.tacNewCard = getLastNonTacCard()
    displaySelectedCard()
    drawGame()
    updateScreens()
    playCard(game, playerIndex, turnData.tacNewCard)
  }
  if ([1,13].includes(cardNumber)) {
    turnData.clickableFields = getStonesCanGoX(game, playerIndex, cardNumber)
    if (getPlayerStones(game, playerIndex).some(s => s.position === STONE_POSITION_BOX))
      turnData.clickableFields.push({position: STONE_POSITION_BOX, playerIndex: player.playsFor})
    turnData.boardClickHandler = function (clickData) {
      if (clickData.position === STONE_POSITION_BOX) {
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


function getStonesCanGoX (game, playerIndex, x, movesLeft7) {
  return getPlayerStones(game, playerIndex).filter((s, i) => getStoneMoveResults(game, playerIndex, i, x, movesLeft7).length > 0)
}


function removeStones(removedStones) {
  removedStones.forEach(s => {
    const stone = game.players[s.player].stones[s.stone]
    stone.position = STONE_POSITION_BOX
    stone.canGoToHouse = false
    stone.canMove = true
    stone.field = null
  })
}
//N7
/*
outside house = can always go 7 forward
into house = if 3 stones already in, check if move to field 0 uses the whole 7;
             if not 3 in, always works (given free field 0)
inside house = works if adjacent field free
*/