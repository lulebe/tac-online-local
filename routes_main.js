const twing = require('./templates')
const router = require('express').Router()

const games = require('./games')

module.exports = router

router.post('/create_game', (req, res) => {
  const game = games.makeGame()
  twing.render('main/setup_phase.twig', {gameName: game.name}).then(rendered => res.end(rendered))
})

router.post('/start_game', (req, res) => {
  const game = games.getGame(req.body.gameName)
  const playerOrder = [req.body.player1, req.body.player2, req.body.player3, req.body.player4]
  if (!game)
    return res.status(400).send()
  twing.render('main/game.twig', {gameName: game.name, players: JSON.stringify(playerOrder)}).then(rendered => res.end(rendered))
})

router.get('/start_game', (req, res) => {
  twing.render('main/game.twig', {gameName: "TEST", players: JSON.stringify(['test1','test2','test3','test4'])}).then(rendered => res.end(rendered))
})