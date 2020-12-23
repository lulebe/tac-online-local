let currentDeck = []
let canSelect = []
let isSwapping = false
let indexToConfirm = null

const socket = io(window.location.origin);
socket.on('connect', function(){
  socket.emit('remote-data', {game: gameName, user: userName})
})
socket.on('update', data => {
  if(!hasDataChanged(data)) return
  document.getElementById('main').style.display = 'block'
  document.getElementById('waiting').style.display = 'none'
  cancelSelection()
  currentDeck = data.deck
  canSelect = data.canSelect
  isSwapping = data.isSwapping
  displayDeck(currentDeck)
  displaySwapInfo(isSwapping)
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
    if (!currentDeck[i]) return
    if (isUnselected) { //select
      showConfirmationDialog(i)
    }
    socket.emit('selection-change', {player: userName, deck: currentDeck})
  })
}

function showConfirmationDialog (i) {
  indexToConfirm = i
  document.getElementById('card-confirmation').src = "/static/imgs/cards/"+currentDeck[i][0]+".png"
  document.getElementById('main').style.display = 'none'
  document.getElementById('remote-confirmation-dialog').style.display = 'block'
  document.getElementById('remote-confirmation-cardinfo').innerHTML = CARD_INFO[currentDeck[i][0]]
  document.getElementById('confirm').disabled = !canSelect.includes(i)
}

function cancelSelection () {
  document.getElementById('main').style.display = 'block'
  document.getElementById('remote-confirmation-dialog').style.display = 'none'
  indexToConfirm = null
}

function confirmSelection () {
  document.getElementById('main').style.display = 'block'
  document.getElementById('remote-confirmation-dialog').style.display = 'none'
  if (indexToConfirm == null) return
  document.getElementById('card-container-'+indexToConfirm).classList.add('selected')
  currentDeck[indexToConfirm][1] = 1
  socket.emit('selection-change', {player: userName, deck: currentDeck})
  indexToConfirm = null
}

document.getElementById('cancel').addEventListener('click', cancelSelection)
document.getElementById('confirm').addEventListener('click', confirmSelection)

function hasDataChanged (data) {
  if (currentDeck.length != data.deck.length || currentDeck.some((c, i) => c[0] != data.deck[i][0] || c[1] != data.deck[i][1])) return true
  if (canSelect.length != data.canSelect.length || !canSelect.every(ci => data.canSelect.includes(ci))) return true
  if (isSwapping != data.isSwapping) return true
  return false
}