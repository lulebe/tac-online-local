const customAlphabet = require('nanoid/non-secure').customAlphabet

const nanoid = customAlphabet('123456789ABCDEFGHIJKLMNPQRSTUVWXYZ', 5)

//game: {name: String, players: [{name: String, client: Socket(client)}], host: Socket(host), screens:[Socket()], lastActive: Int(Timestamp)}
const games = []

if (process.env.NODE_ENV != 'production')
games.push({name: 'TEST', players: [{name: 'test1', client: null},{name: 'test2', client: null},{name: 'test3', client: null},{name: 'test4', client: null}], host: null, screens: [], lastActive: (new Date()).getTime()})

setInterval(removeInactiveGames, 10000)

module.exports = {
  makeGame, getGame, removeGame, removePlayer
}

function getGame (name) {
  const game = games.find(game => game.name == name)
  if (game) game.lastActive = (new Date()).getTime()
  return game
}

function makeGame () {
  let gameName = nanoid()
  while (getGame(gameName) != null) {
    gameName = nanoid()
  }
  const game = {name: gameName, players: [], host: null, screens: [], lastActive: (new Date()).getTime()}
  games.push(game)
  return game
}

function removeGame (game) {
  games.splice(games.indexOf(game), 1)
}

function removeInactiveGames () {
  games.forEach(game => {
    if (game.lastActive && game.lastActive < ((new Date()).getTime() - 10800000))
      removeGame(game)
  })
}

function removePlayer (game, playerName) {
  const pIndex = game.players.indexOf(game.players.find(p => p.name === playerName))
  if (pIndex >= 0) {
    const p = game.players.splice(pIndex, 1)
    if (p.client) p.client.playsGame = null
  }
}