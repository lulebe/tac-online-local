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
  game = data.game
  turnData = data.turnData
  drawGame()
  displayScoreboard()
  displayCurrentPlayer()
})
socket.on('warning', data => {
  displayWarning(data.warningNum)
})

const STONE_POSITION_BOX = 0
const STONE_POSITION_FIELD = 1
const STONE_POSITION_HOUSE = 2
const TEAMMATE_INDEX = [2,3,0,1]

let game = null
let turnData = null
initCanvas()

const SE_CLICKED_FIELD = 1
function boardClicked (data) {
  socket.emit('screen-event', {gameName, event: SE_CLICKED_FIELD, data})
}

function displayScoreboard () {
  const scoreboard = document.getElementById('scoreboard')
  const turn = game.players[game.turn]
  scoreboard.innerHTML = game.players.reduce((html, player) => html + `<li class="${player == turn ? "turn" : ""} ${player.teamB ? "team-b" : ""}"><div class="color-marker ${player.connected ? "connected" : "disconnected"}"></div>${player.name} (${player.canStart ? "can" : "can't"} start)</li>`, "")
}

function displayCurrentPlayer () {
  document.getElementById('turn-player').innerHTML = game.players[game.turn].name
}

const WARN_NOTHING = 0
const WARN_GAME_OVER = 1
const WARN_SKIP = 2
const warnings = [
  "",
  "The game is over.",
  "This Player will be skipped."
]
let warningTimeout = null
function displayWarning (warningNum) {
  warningTimeout && clearTimeout(warningTimeout)
  document.getElementById("warning-box").innerHTML = warnings[warningNum]
  document.getElementById("warning-box").classList.add("visible")
  warningTimeout = setTimeout(() => {document.getElementById("warning-box").classList.remove("visible")}, 6000)
}