function drawCard (x, y, size, card) {
  ctx.strokeStyle = '#000000'
  ctx.fillStyle = '#ffffff'
  ctx.lineWidth = 1
  ctx.fillRect(x - size/2, y - size*0.75, size, size*1.5)
  ctx.strokeRect(x - size/2, y - size*0.75, size, size*1.5)
  if (card < 14) drawCardNumber(x, y, size, card)
  //specials
  if (card == 1 || card == 13) drawCardStart(x, y, size, card)
  else if (card == 4) drawCardReverse(x, y, size, card)
  else if (card == 7) drawCardSingleSteps(x, y, size, card)
  else if (card == 8) drawCardHold(x, y, size, card)
  else if (card == 14) drawCardSwap(x, y, size, card)
  else if (card == 15) drawCardUndo(x, y, size, card)
}

function drawCardNumber (x, y, size, card) {
  const offsetX = card > 9 ? (size/35) : 0
  ctx.fillStyle = '#000000'
  ctx.font = (size*0.9) + 'px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(card, x-offsetX, y + size/3.3)
}

function drawCardStart (x, y, size, card) {

}

function drawCardReverse (x, y, size, card) {

}

function drawCardSingleSteps (x, y, size, card) {

}

function drawCardHold (x, y, size, card) {

}

function drawCardSwap (x, y, size, card) {

}

function drawCardUndo (x, y, size, card) {

}