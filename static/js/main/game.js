const socket = io(window.location.origin);
socket.on('connect', () => {
  socket.emit('main-name', gameName)
})
socket.on('selection-change', data => {
  const player = game.players.find(player => player.name == data.player)
  player.deck = data.deck
  updateDeckdata()
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
const SE_RESET_TURN = 2
const SE_MAKE_TURN = 3
socket.on('screen-event', data => {
  switch (data.event) {
    case SE_CLICKED_FIELD:
      clickedField(data.x, data.y)
    break;
    case SE_RESET_TURN:
      resetTurn()
    break;
    case SE_MAKE_TURN:
      makeTurn()
    break;
  }
})

const STONE_POSITION_BOX = 0
const STONE_POSITION_FIELD = 1
const STONE_POSITION_HOUSE = 2

function updateScreens () {
  socket.emit('screen-update', {gameName: gameName, data: game})
}

function warnScreens (warningNum) {
  socket.emit('screen-warning', {gameName: gameName, warningNum})
}
const gameHistory = []
const game = {
  name: gameName,
  players: players.map((name, i) => ({name, teamB: i % 2 === 1, connected: false, deck: [], stones: initStones()})),
  box: makeBox(),
  usedCards: [],
  turn: 0,
  currentStartingPlayer: 0
}


function initStones () {
  return [1,2,3,4].map(_ => ({
    position: STONE_POSITION_BOX,
    field: null
  }))
}

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

function canLoadGame () {
  if (!window.localStorage.getItem('game')) return false
  const savedPlayerNames = JSON.parse(window.localStorage.getItem('game')).players.map(p => p.name)
  return game.players.length === savedPlayerNames.length && game.players.every(p => savedPlayerNames.includes(p.name))
}

function displayLoadGamePopup () {
  document.getElementById('loadgame-popup').classList.add('visible')
}

function loadGame () {
  document.getElementById('loadgame-popup').classList.remove('visible')
  const loadedGame = JSON.parse(window.localStorage.getItem('game'))
  game.players = loadedGame.players
  game.box = loadedGame.box
  game.table = loadedGame.table
  game.turn = loadedGame.turn
  document.getElementById('turn-player').innerHTML = game.players[game.turn].name
  displayScoreboard()
  initCanvas()
  updateScreens()
  updateDeckdata()
  displayCurrentPlayer()
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
      box.push()
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
    p.deck = game.box.splice(0, 5)
    p.deck.forEach(card => [card, 0].join(','))
  })
  drawGame()
  updateDeckdata()
  updateScreens()
}

function updateDeckdata () {
  //send new decks to clients
  const deckData = {}
  game.players.forEach(p => deckData[p.name] = {deck: p.deck, canSelect: getSelectableCards(p)})
  socket.emit('client-update', {game: gameName, decks: deckData})
}

function getSelectableCards (player) {
  if (game.players[game.turn] !== player) return []
  const selectable = []
  player.deck.map(c => c.split(',')).forEach((c, i) => {
    if (canPlayCard(0, game.turn, c[0])) selectable.push(i)
  })
  return selectable
}

function boardClicked (data) {//TODO implement
  console.log(data)
}

function makeTurn () {
  gameHistory.splice(0, gameHistory.length-1)
  gameHistory.push(clone(game))
  drawGame()
  toNextTurn()
  displayScoreboard()
  updateScreens()
}

function checkTurnAllowed () { //TODO implement
  return false
}

function displayScoreboard () {
  const scoreboard = document.getElementById('scoreboard')
  const turn = game.players[game.turn]
  scoreboard.innerHTML = [...game.players].reduce((html, player) => html + `<li class="${player == turn ? "turn" : ""} ${player.teamB ? "team-b" : ""}"><div class="color-marker ${player.connected ? "connected" : "disconnected"}"></div>${player.name}</li>`, "")
}

function displayCurrentPlayer () {
  document.getElementById('turn-player').innerHTML = game.players[game.turn].name
}

function displaySelectedCard () {
  const selCardNumber = game.players[game.turn].deck.find(c => c.split(',')[1] === 1)
  document.getElementById('card-img').src = '/static/imgs/cards/' + (selCardNumber || '0') + '.png'
  document.getElementById('card-info').innerHTML = CARD_INFO(selCardNumber || 0)
}

const WARN_NOTHING = 0
const warnings = [""]
let warningTimeout = null
function displayWarning (warningNum) {
  warningTimeout && clearTimeout(warningTimeout)
  document.getElementById("warning-box").innerHTML = warnings[warningNum]
  document.getElementById("warning-box").classList.add("visible")
  warningTimeout = setTimeout(() => {document.getElementById("warning-box").classList.remove("visible")}, 6000)
  warnScreens(warningNum)
}

function gameEnd () {
  socket.emit('game-end', {gameName})
  updateScreens()
  clearSavedGame()
}

function toNextTurn () {
  if (false) {//TODO implement end game
    displayScoreboard()
    gameEnd()
  } else {
    game.turn = game.turn == game.players.length - 1 ? 0 : game.turn + 1
    //TODO implement skip player
    displayCurrentPlayer()
    saveGame()
  }
}

function resetTurn () {
  updateDeckdata()
  drawGame()
  updateScreens()
}

function clone(obj) {
  var copy
  if (null == obj || "object" != typeof obj) return obj
  if (obj instanceof Array) {
      copy = []
      for (var i = 0; i < obj.length; i++) {
          copy[i] = clone(obj[i])
      }
      return copy
  }
  if (obj instanceof Object) {
      copy = {}
      for (var attr in obj) {
          if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr])
      }
      return copy
  }
  throw new Error("Unable to copy obj! Its type isn't supported.")
}

function saveGame () {
  for (let i = 0; i < game.players.length; i++) {
    game.players[i].teamB = (i % 2 === 1)
  }
  window.localStorage.setItem('game', JSON.stringify(game))
}
function clearSavedGame () {
  window.localStorage.clear()
}

document.getElementById('main-action-reset').addEventListener('click', resetTurn)
document.getElementById('loadgame-load').addEventListener('click', loadGame)
document.getElementById('loadgame-new').addEventListener('click', startNewGame)