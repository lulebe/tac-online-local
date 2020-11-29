const socket = io(window.location.origin);
socket.on('connect', () => {
  socket.emit('main-name', gameName)
})
socket.on('selection-change', data => {
  const player = game.players.find(player => player.name == data.player)
  player.deck = data.deck
  handleCardSelection()
  displaySelectedCard()
})
socket.on('players', function(data) {
  const connected = {}
  data.forEach(d => {
    connected[d.name] = d.connected
  })
  game.players.forEach(player => {
    player.connected = connected[player.name]
  })
  displayScoreboard()
  updateDeckdata()
})
const SE_CLICKED_FIELD = 1
socket.on('screen-event', data => {
  switch (data.event) {
    case SE_CLICKED_FIELD:
      boardClicked(data.data)
  }
})


document.getElementById('loadgame-load').addEventListener('click', loadGame)
document.getElementById('loadgame-new').addEventListener('click', startNewGame)


const STONE_POSITION_BOX = 0
const STONE_POSITION_FIELD = 1
const STONE_POSITION_HOUSE = 2
const TEAMMATE_INDEX = [2,3,0,1]

let game = {
  name: gameName,
  players: players.map((name, i) => ({name, teamB: i % 2 === 1, canStart: false, playsFor: i, connected: false, deck: [], stones: initStones()})),
  box: makeBox(),
  usedCards: [],
  turn: 0
}
let preTurnGame = clone(game)
let unTacGame = null
const TURN_DATA_INIT = {
  isSkipped: false,
  skipNext: false,
  playingTac: false,
  tacNewCard: null,
  mustDiscard: false,
  movesLeft7: 7,
  clickableFields: [], //{position, field, playerIndex}
  boardClickHandler: null
}
let turnData = clone(TURN_DATA_INIT)
let swappingCards = []

let warningTimeout = null

if (canLoadGame()) //has saved game
  displayLoadGamePopup()
else
  initGame()


function initGame () {
  fillDecks()
  displayScoreboard()
  initCanvas()
  updateScreens()
  displayCurrentPlayer()
}


function initStones () {
  return [1,2,3,4].map(_ => ({
    position: STONE_POSITION_BOX,
    field: null,
    canGoToHouse: false,
    canMove: true
  }))
}


function startNewGame () {
  document.getElementById('loadgame-popup').classList.remove('visible')
  window.localStorage.clear()
  initGame()
}


//1-13, 14=trickser, 15=tac
function makeBox () {
  const box = []
  const cardCounts = [0,9,7,7,7,7,7,8,7,7,7,0,7,9,7,4]
  for (let card = 1; card <= 15; card++)
    for (let i=0; i < cardCounts[card]; i++)
      box.push(card)
  return arrShuffle(box)
}


function arrShuffle (array) {
  let currentIndex = array.length, temporaryValue, randomIndex
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1
    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }
  return array
}


function fillDecks () {
  if (game.box.length < (4*5)) { //refill box
    game.usedCards = []
    game.box = makeBox()
  }
  game.players.forEach(p => {
    p.deck = game.box.splice(0, 5).map(card => [card, 0])
    p.canStart = p.deck.some(c => [1,13].includes(c[0]))
  })
  swappingCards = []
  displayWarning(WARN_SWAP)
  drawGame()
  updateDeckdata()
  updateScreens()
  displayScoreboard()
}



function getPlayerStones (game, playerIndex) {
  return game.players[game.players[playerIndex].playsFor].stones
}


function isPlayerDone (game, playerIndex) {
  return !(game.players[playerIndex].stones.some(s => s.position !== STONE_POSITION_HOUSE))
}


function updateDeckdata () {
  //send new decks to clients
  const deckData = {}
  game.players.forEach(p => deckData[p.name] = {deck: p.deck, isSwapping: swappingCards !== null, canSelect: getSelectableCards(p)})
  socket.emit('client-update', {game: gameName, decks: deckData})
}


function getSelectableCards (player) {
  if (swappingCards) return player.deck.map((c, i) => i)
  if (game.players[game.turn] !== player || turnData.boardClickHandler) return []
  const selectable = []
  player.deck.forEach((c, i) => {
    if (canPlayCard(game, game.turn, c[0])) selectable.push(i)
  })
  if (!selectable.length || turnData.isSkipped) { //has to discard any card or cant tac 8-skip
    turnData.mustDiscard = true
    return player.deck.map((c, i) => i)
  }
  return selectable
}


function getLastNonTacCard () {
  const maxCardsBack = 20 - game.players.reduce((ac, p) => ac+p.deck.length, 0)
  for (let i = 0; i < maxCardsBack; i++) {
    const card = game.usedCards.last(i)
    if (card !== 15) return card
  }
  return null
}


function swapCards () {
  swappingCards.forEach((cardIndex, playerIndex) => {
    game.players[TEAMMATE_INDEX[playerIndex]].deck.push([game.players[playerIndex].deck.splice(cardIndex, 1)[0][0], 0])
  })
  swappingCards = null
  updateDeckdata()
  displayScoreboard()
  updateScreens()
}


function handleCardSelection () {
  const selectedCard = game.players[game.turn].deck.find(c => c[1] === 1)
  if (!selectedCard) return
  if (swappingCards) {
    swappingCards = game.players.map(p => p.deck.indexOf(p.deck.find(c => c[1] === 1))).map(i => i < 0 ? null : i)
    if (swappingCards.every(s => s !== null)) {
      swapCards()
    }
    return
  }
  if (turnData.boardClickHandler) return
  if (turnData.isSkipped && !(selectedCard[0] === 15 && canPlayCard(game, game.turn, 15))) {
    makeTurn()
  } else if (turnData.mustDiscard) {
    makeTurn()
  } else {
    playCard(game, game.turn, selectedCard[0])
    updateScreens()
  }
  updateDeckdata()
  drawGame()
}


function boardClicked (data) {
  let canClickHere = false
  if (data.position === STONE_POSITION_BOX) {
    canClickHere = turnData.clickableFields.some(f => f.position === STONE_POSITION_BOX && f.playerIndex === data.playerIndex)
  }
  if (data.position === STONE_POSITION_FIELD) {
    canClickHere = turnData.clickableFields.some(f => f.position === STONE_POSITION_FIELD && f.field === data.field)
  }
  if (data.position === STONE_POSITION_HOUSE) {
    canClickHere = turnData.clickableFields.some(f => f.position === STONE_POSITION_HOUSE && game.players[game.turn].playsFor === data.playerIndex && f.field === data.field)
  }
  if (turnData.boardClickHandler && canClickHere) {
    turnData.boardClickHandler(data)
    updateScreens()
    drawGame()
  }
}


function makeTurn () {
  const selectedCard = game.players[game.turn].deck.find(c => c[1] === 1)
  game.players[game.turn].deck.splice(game.players[game.turn].deck.indexOf(selectedCard), 1)
  game.usedCards.push(selectedCard[0])
  lockHouseStones(game, game.players[game.turn].playsFor)
  if (isPlayerDone(game, game.turn))
  game.players[game.turn].playsFor = TEAMMATE_INDEX[game.turn]
  toNextTurn()
}


function toNextTurn () {
  unTacGame = preTurnGame
  preTurnGame = game
  game = clone(game)
  game.turn = game.turn == 3 ? 0 : game.turn + 1
  const teamADone = isPlayerDone(game, 0) && isPlayerDone(game, 2)
  const teamBDone = isPlayerDone(game, 1) && isPlayerDone(game, 3)
  const nextCanTac = getSelectableCards(game.players[game.turn]).includes(15)
  if ((teamADone || teamBDone) && !nextCanTac) {
    gameEnd()
    return
  }
  if (!game.players.some(p => p.deck.length)) { //next round
    fillDecks()
    game.turn = game.turn == 3 ? 0 : game.turn + 1
  }
  if (turnData.skipNext) {
    turnData = clone(TURN_DATA_INIT)
    turnData.isSkipped = true
    displayWarning(WARN_SKIP)
  } else {
    turnData = clone(TURN_DATA_INIT)
  }
  drawGame()
  displayScoreboard()
  updateScreens()
  updateDeckdata()
  displaySelectedCard()
  displayCurrentPlayer()
  saveGame()
}


function gameEnd () {
  updateScreens()
  displayWarning(WARN_GAME_OVER)
  socket.emit('game-end', {gameName})
  clearSavedGame()
}


function updateScreens () {
  socket.emit('screen-update', {gameName: gameName, data: {game, turnData, swappingCards}})
}


function warnScreens (warningNum) {
  socket.emit('screen-warning', {gameName: gameName, warningNum})
}


function displayScoreboard () {
  const scoreboard = document.getElementById('scoreboard')
  const turn = game.players[game.turn]
  scoreboard.innerHTML = game.players.reduce((html, player) => html + `<li class="${player == turn ? "turn" : ""} ${player.teamB ? "team-b" : ""}"><div class="color-marker ${player.connected ? "connected" : "disconnected"}"></div>${player.name} (${player.canStart ? "can" : "can't"} start)</li>`, "")
}


function displayLoadGamePopup () {
  document.getElementById('loadgame-popup').classList.add('visible')
}


function displayCurrentPlayer () {
  document.getElementById('turn-player').innerHTML = game.players[game.turn].name
  document.getElementById('play-coop').style.display = game.players[game.turn].playsFor === game.turn ? 'none' : 'block'
}


function displaySelectedCard () {
  if (swappingCards) {
    document.getElementById('card-img').src = '/static/imgs/cards/0.png'
    document.getElementById('card-info').innerHTML = CARD_INFO[0]
    return
  }
  const selCard = game.players[game.turn].deck.find(c => c[1] === 1)
  const cardNumber = turnData.tacNewCard || (selCard && selCard[0]) || 0
  document.getElementById('card-img').src = '/static/imgs/cards/' + (cardNumber) + '.png'
  document.getElementById('card-info').innerHTML = CARD_INFO[cardNumber]
}


function displayWarning (warningNum) {
  warningTimeout && clearTimeout(warningTimeout)
  document.getElementById("warning-box").innerHTML = warnings[warningNum]
  document.getElementById("warning-box").classList.add("visible")
  warningTimeout = setTimeout(() => {document.getElementById("warning-box").classList.remove("visible")}, 6000)
  warnScreens(warningNum)
}


function saveGame () {
  for (let i = 0; i < game.players.length; i++) {
    game.players[i].teamB = (i % 2 === 1)
  }
  window.localStorage.setItem('game', JSON.stringify(game))
  window.localStorage.setItem('turnData', JSON.stringify(turnData))
}


function canLoadGame () {
  if (!window.localStorage.getItem('game')) return false
  const savedPlayerNames = JSON.parse(window.localStorage.getItem('game')).players.map(p => p.name)
  return game.players.length === savedPlayerNames.length && game.players.every(p => savedPlayerNames.includes(p.name))
}


function loadGame () {
  document.getElementById('loadgame-popup').classList.remove('visible')
  const loadedGame = JSON.parse(window.localStorage.getItem('game'))
  game.players = loadedGame.players
  game.usedCards = loadedGame.usedCards
  game.turn = loadedGame.turn
  game.box = loadedGame.box
  turnData = JSON.parse(window.localStorage.getItem('turnData'))
  document.getElementById('turn-player').innerHTML = game.players[game.turn].name
  displayScoreboard()
  initCanvas()
  updateScreens()
  updateDeckdata()
  displayCurrentPlayer()
}


function clearSavedGame () {
  window.localStorage.clear()
}
