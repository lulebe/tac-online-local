let currentDeck = []

const socket = io(window.location.origin);
socket.on('connect', function(){
  socket.emit('remote-data', {game: gameName, user: userName})
})
socket.on('update', deck => {
  currentDeck = deck
  displayDeck(deck)
  
})

function displayDeck (deck) {
  
}

for (let i = 0; i < deck.length; i++) {
  
}
