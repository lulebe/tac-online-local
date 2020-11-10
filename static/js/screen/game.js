const socket = io(window.location.origin);
socket.on('connect', () => {
  socket.emit('screen-name', gameName)
})
socket.on('players', function(data) {
  if (!game) return
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
socket.on('game-data', data => {
  console.log(data)
  game = data
  drawGame()
  updateScoreboard()
  displayCurrentPlayer()
})
socket.on('warning', data => {
  displayWarning(data.warningNum)
})

let game = null
initCanvas()

const SE_CLICKED_FIELD = 1
const SE_RESET_TURN = 2
const SE_MAKE_TURN = 3
function clickedField (x, y) {
  socket.emit('screen-event', {gameName, event: SE_CLICKED_FIELD, x, y})
}

function resetTurn () {
  socket.emit('screen-event', {gameName, event: SE_RESET_TURN})
}

function makeTurn () {
  socket.emit('screen-event', {gameName, event: SE_MAKE_TURN})
}

function updateScoreboard () {
  const scoreboard = document.getElementById('scoreboard')
  const turn = game.players[game.turn]
  scoreboard.innerHTML = [...game.players].sort((a, b) => b.score - a.score).reduce((html, player) => html + `<li class="${player == turn ? "turn" : ""}"><div class="color-marker ${player.connected ? "connected" : "disconnected"}"></div>${player.name}: ${player.score} (${player.deck.length} on hand)</li>`, "")
}

function displayCurrentPlayer () {
  document.getElementById('turn-player').innerHTML = game.players[game.turn].name
}

const WARN_NOTHING = 0
const warnings = [
  ""
]
let warningTimeout = null
function displayWarning (warningNum) {
  warningTimeout && clearTimeout(warningTimeout)
  document.getElementById("warning-box").innerHTML = warnings[warningNum]
  document.getElementById("warning-box").classList.add("visible")
  warningTimeout = setTimeout(() => {document.getElementById("warning-box").classList.remove("visible")}, 6000)
}

document.getElementById('main-action-reset').addEventListener('click', resetTurn)
document.getElementById('main-action-finish').addEventListener('click', makeTurn)