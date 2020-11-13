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
  const container = document.getElementById('card-container')
  for (let i = 1; index <= 5; i++) {
    const element = document.getElementById('card-'+i)
    const card = deck[i].split(',') //card number, isSelected
    if (!card) {
      element.classList.remove('visible')
      element.src = "/static/imgs/cards/0.png"
    } else {
      element.classList.add('visible')
      element.src = "/static/imgs/cards/"+card[0]+".png"
    }
  }
}

for (let i = 1; index <= 5; i++) {
  const element = document.getElementById('card-'+i)
  element.addEventListener('click', e => {
    console.log("clicked card", i)
  })
}