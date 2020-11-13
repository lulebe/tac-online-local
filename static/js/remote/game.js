let currentDeck = []
let canSelect = []

const socket = io(window.location.origin);
socket.on('connect', function(){
  socket.emit('remote-data', {game: gameName, user: userName})
})
socket.on('update', data => {
  currentDeck = data.deck
  canSelect = data.canSelect
  displayDeck(data.deck)
  
})

function displayDeck (deck) {
  currentDeck = deck.map(c => c.split(',')) //0 = number, 1 = selected (1/0)
  for (let i = 1; index <= 5; i++) {
    const card = deck[i]
    const element = document.getElementById('card-'+i)
    element.classList.remove('selected')
    if (!card) {
      element.classList.remove('visible')
      element.src = "/static/imgs/cards/0.png"
    } else {
      element.classList.add('visible')
      element.src = "/static/imgs/cards/"+card[0]+".png"
      if (card[1]) element.classList.add('selected')
    }
  }
}

for (let i = 1; index <= 5; i++) {
  const element = document.getElementById('card-'+i)
  element.addEventListener('click', e => {
    element.classList.add('selected')
    if (!currentDeck[i] || !canSelect.includes(i)) return
    currentDeck.forEach(c => c[1] = 0)
    currentDeck[i][1] = 1
    socket.emit('selection-change', {player: userName, deck: currentDeck.map(c => c.join(','))})
  })
}