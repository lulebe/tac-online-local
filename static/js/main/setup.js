const socket = io(window.location.origin);
socket.on('connect', function(){
  socket.emit('main-name', gameName)
})
socket.on('players', function(data) {
  updatePlayers(data)
})

let players = []

function updatePlayers (playerList) {
  players = playerList
  for (let i = 0; i < players.length; i++) {
    players[i].teamB = (i % 2 === 1)
  }
  displayPlayers()
}

function displayPlayers () {
  const container = document.getElementById("setup-player-list")
  let html = ""
  for (let i = 0; i < players.length; i++) {
    const player = players[i]
    html += `
    <li onclick="togglePlayerTeam(${i})" class="${player.teamB ? "team-b" : ""}">
      <div class="color-marker ${player.connected ? "connected" : "disconnected"}"></div>
      ${player.name}: Team ${player.teamB ? "B" : "A"}
      <button onClick="deletePlayer(${i})" class="remove-player-btn">X</button>
    </li>
    `
  }
  container.innerHTML = html
  document.getElementById("connected-players").innerHTML = players.length
  document.getElementById("start-button").disabled = !checkTeamsCorrect()
  if (!checkTeamsCorrect()) return
  document.getElementById('inp-p1').value = players.filter(p => !p.teamB)[0].name
  document.getElementById('inp-p2').value = players.filter(p => p.teamB)[0].name
  document.getElementById('inp-p3').value = players.filter(p => !p.teamB)[1].name
  document.getElementById('inp-p4').value = players.filter(p => p.teamB)[1].name
}

function togglePlayerTeam (playerIndex) {
  players[playerIndex].teamB = !players[playerIndex].teamB
  displayPlayers()
}

function deletePlayer (playerIndex) {
  players.splice(playerIndex, 1)
  socket.emit('remove-player', players[playerIndex].name)
  displayPlayers()
}

function checkTeamsCorrect () {
  if (players.length !== 4) return false
  if (players.filter(p => p.teamB).length !== 2) return false
  return true
}

if (window.localStorage.length > 0) { //has saved game
  document.getElementById("loadgame-info").classList.add('visible')
  document.getElementById("loadgame-playernames").innerHTML = JSON.parse(window.localStorage.getItem('game')).players.map(p => '"' + p.name + '" (Team ' + (p.teamB ? 'B' : 'A') + ')').join(', ')
}