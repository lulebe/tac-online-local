const STONE_POSITION_BOX = 0
const STONE_POSITION_FIELD = 1
const STONE_POSITION_HOUSE = 2
const TEAMMATE_INDEX = [2,3,0,1]

const socket = io(window.location.origin)
socket.on('connect', () => {
  socket.emit('screen-name', gameName)
})
socket.on('game-data', data => {
  console.log(data)
  game = data.game
  turnData = data.turnData
  drawGame()
  displayScoreboard()
  displayCurrentPlayer()
  displaySelectedCard()
})
socket.on('warning', data => {
  displayWarning(data.warningNum)
})

const SE_CLICKED_FIELD = 1

let game = null
let turnData = null
initCanvas()

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
  document.getElementById('play-coop').style.display = game.players[game.turn].playsFor === game.turn ? 'none' : 'block'
}

function displaySelectedCard () {
  const selCard = game.players[game.turn].deck.find(c => c[1] === 1)
  const cardNumber = turnData.tacNewCard || (selCard && selCard[0]) || 0
  document.getElementById('card-img').src = '/static/imgs/cards/' + (cardNumber) + '.png'
  document.getElementById('card-info').innerHTML = CARD_INFO[cardNumber]
}


let warningTimeout = null
function displayWarning (warningNum) {
  warningTimeout && clearTimeout(warningTimeout)
  document.getElementById("warning-box").innerHTML = warnings[warningNum]
  document.getElementById("warning-box").classList.add("visible")
  warningTimeout = setTimeout(() => {document.getElementById("warning-box").classList.remove("visible")}, 6000)
}