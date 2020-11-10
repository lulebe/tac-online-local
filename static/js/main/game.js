const socket = io(window.location.origin);
socket.on('connect', () => {
  socket.emit('main-name', gameName)
})
socket.on('selection-change', data => {
  const player = game.players.find(player => player.name == data.player)
  if (player)
    player.deck = data.deck
})
socket.on('players', function(data) {
  const connected = {}
  data.forEach(d => {
    connected[d.name] = d.connected
  })
  game.players.forEach(player => {
    player.connected = connected[player.name]
  })
  updateScoreboard()
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

function updateScreens () {
  socket.emit('screen-update', {gameName: gameName, data: game})
}

function warnScreens (warningNum) {
  socket.emit('screen-warning', {gameName: gameName, warningNum})
}

const game = {name: gameName, players: playerNames.map(name => ({name, score: 0, connected: false, deck: []})), box: makeBox(), table: {}, turn: 0}

if (canLoadGame()) //has saved game
  displayLoadGamePopup()
else
  initGame()

function initGame () {
  fillDecks()
  setStartingPlayer()
  updateScoreboard()
  initCanvas()
  updateScreens()
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
  updateScoreboard()
  initCanvas()
  updateScreens()
  updateDeckdata()
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
  //TODO implement
  updateDeckdata()
  updateScreens()
}

function updateDeckdata () {
  //send new decks to clients
  const deckData = {}
  game.players.forEach(p => deckData[p.name] = p.deck)
  socket.emit('client-update', {game: gameName, decks: deckData})
}

function clickedField () {//TODO implement
  
}

function makeTurn () {
  drawGame()
  toNextTurn()
  updateScoreboard()
  updateScreens()
}

function checkTurnAllowed () { //TODO implement
  return false
}

function updateScoreboard () {
  const scoreboard = document.getElementById('scoreboard')
  const turn = game.players[game.turn]
  scoreboard.innerHTML = [...game.players].reduce((html, player) => html + `<li class="${player == turn ? "turn" : ""}"><div class="color-marker ${player.connected ? "connected" : "disconnected"}"></div>${player.name}</li>`, "")
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
    updateScoreboard()
    gameEnd()
  } else {
    game.turn = game.turn == game.players.length - 1 ? 0 : game.turn + 1
    //TODO implement skip player
    document.getElementById('turn-player').innerHTML = game.players[game.turn].name
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
  window.localStorage.setItem('game', JSON.stringify(game))
}
function clearSavedGame () {
  window.localStorage.clear()
}

document.getElementById('main-action-reset').addEventListener('click', resetTurn)
document.getElementById('main-action-finish').addEventListener('click', makeTurn)
document.getElementById('loadgame-load').addEventListener('click', loadGame)
document.getElementById('loadgame-new').addEventListener('click', startNewGame)