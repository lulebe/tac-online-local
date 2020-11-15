let currentDeck = []
let canSelect = []

const socket = io(window.location.origin);
socket.on('connect', function(){
  socket.emit('remote-data', {game: gameName, user: userName})
})
socket.on('update', data => {
  currentDeck = data.deck
  canSelect = data.canSelect
  displayDeck(currentDeck)
  displaySwapInfo(data.isSwapping)
})

function displayDeck (deck) {
  for (let i = 0; i < 5; i++) {
    const card = deck[i]
    const cardElement = document.getElementById('card-'+i)
    const cardContainer = document.getElementById('card-container-'+i)
    cardContainer.classList.remove('selected')
    if (!card) {
      cardContainer.classList.remove('visible')
      cardElement.src = "/static/imgs/cards/0.png"
    } else {
      cardContainer.classList.add('visible')
      cardElement.src = "/static/imgs/cards/"+card[0]+".png"
      if (card[1] === 1) cardContainer.classList.add('selected')
    }
  }
}

function displaySwapInfo (show) {
  document.getElementById('swap-info').style.display = show ? 'block' : 'none'
}

for (let i = 0; i < 5; i++) {
  const element = document.getElementById('card-container-'+i)
  element.addEventListener('click', e => {
    const isUnselected = currentDeck[i][1] === 0
    currentDeck.forEach(c => c[1] = 0)
    for (let j = 0; j < 5; j++) {
      document.getElementById('card-container-'+j).classList.remove('selected')   
    }
    if (!currentDeck[i] || !canSelect.includes(i)) return
    if (isUnselected) { //select
      element.classList.add('selected')
      currentDeck[i][1] = 1
    }
    socket.emit('selection-change', {player: userName, deck: currentDeck})
  })
}