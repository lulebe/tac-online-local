function drawCard (x, y, size, card) {
  //outline & bg
  ctx.strokeStyle = '#000000'
  ctx.fillStyle = '#ffffff'
  ctx.lineWidth = 1
  ctx.fillRect(x - size/2, y - size*0.75, size, size*1.5)
  ctx.strokeRect(x - size/2, y - size*0.75, size, size*1.5)
  //texture
  ctx.strokeStyle = '#aaaaaa'
  ctx.lineWidth = 1
  ctx.beginPath()
  const textureLines = [1,2,3,4,5,6,7,8,9]
  textureLines.forEach(i => {
    ctx.moveTo(x - size*i*0.05, y - size*0.75)
    ctx.lineTo(x - size/2, y - size*0.25 - size*i*0.05)
    ctx.moveTo(x + size*i*0.05, y - size*0.75)
    ctx.lineTo(x + size/2, y - size*0.25 - size*i*0.05)
    ctx.moveTo(x - size*i*0.05, y + size*0.75)
    ctx.lineTo(x - size/2, y + size*0.25 + size*i*0.05)
    ctx.moveTo(x + size*i*0.05, y + size*0.75)
    ctx.lineTo(x + size/2, y + size*0.25 + size*i*0.05)
  })
  ctx.stroke()
  //specials
  if (card == 1 || card == 13) drawCardStart(x, y, size, card)
  else if (card == 4) drawCardReverse(x, y, size, card)
  else if (card == 7) drawCardSingleSteps(x, y, size, card)
  else if (card == 8) drawCardHold(x, y, size, card)
  else if (card == 14) drawCardSwap(x, y, size, card)
  else if (card == 15) drawCardUndo(x, y, size, card)
  else drawCardNumber(x, y, size, card)
}

function drawCardNumber (x, y, size, card) {
  const offsetX = card > 9 ? (size/35) : 0
  ctx.fillStyle = '#000000'
  ctx.font = (size*0.8) + 'px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(card, x-offsetX, y + size/3.6)
}

function drawCardStart (x, y, size, card) {
  drawCardNumber(x, y, size, card)
  ctx.fillStyle = '#000000'
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(x, y - size*0.5, size/20, 0, 2*Math.PI)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x, y - size*0.5, size/10, 0, 2*Math.PI)
  ctx.stroke()
}

function drawCardReverse (x, y, size, card) {
  ctx.strokeStyle = '#666666'
  ctx.fillStyle = '#880000'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(x + size/2.75, y)
  ctx.lineTo(x - size/3.5, y)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x - size/3.5, y + size/10)
  ctx.lineTo(x - size/3.5, y - size/10)
  ctx.lineTo(x - size/3.5 - size/10, y)
  ctx.fill()
  drawCardNumber(x, y, size, card)
}

function drawCardSingleSteps (x, y, size, card) {
  ctx.fillStyle = '#666666'
  ctx.fillRect(x - size/40 - size/5, y - size/40 - size/2.3, size/20, size/20)
  ctx.fillRect(x - size/40, y - size/40 - size/2.3, size/20, size/20)
  ctx.fillRect(x - size/40 + size/5, y - size/40 - size/2.3, size/20, size/20)
  ctx.fillRect(x - size/40 - size*3/14, y - size/40 + size/2.3, size/20, size/20)
  ctx.fillRect(x - size/40 - size*1/14, y - size/40 + size/2.3, size/20, size/20)
  ctx.fillRect(x - size/40 + size*1/14, y - size/40 + size/2.3, size/20, size/20)
  ctx.fillRect(x - size/40 + size*3/14, y - size/40 + size/2.3, size/20, size/20)
  drawCardNumber(x, y, size, card)
}

function drawCardHold (x, y, size, card) {
  const signSize = size/10
  drawCardNumber(x, y, size, card)
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 2
  ctx.fillStyle = '#ff0000'
  ctx.beginPath()
  ctx.moveTo(x + size/3.5, y - signSize)
  ctx.lineTo(x + size/3.5 + signSize, y - signSize)
  ctx.lineTo(x + size/3.5 + signSize*1.6, y)
  ctx.lineTo(x + size/3.5 + signSize, y + signSize)
  ctx.lineTo(x + size/3.5, y + signSize)
  ctx.lineTo(x + size/3.5 - signSize*0.6, y)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = '#ffffff'
  ctx.font = (signSize*0.5) + 'px Arial'
  ctx.textAlign = 'center'
  ctx.fillText("STOP", x + size/3.5 + signSize/2, y + signSize*0.2)
}

function drawCardSwap (x, y, size, card) {
  //stones
  ctx.fillStyle = '#333333'
  ctx.beginPath()
  ctx.arc(x - size/3, y, size/10, 0, 2 * Math.PI)
  ctx.fill()
  ctx.fillStyle = '#000000'
  ctx.beginPath()
  ctx.arc(x - size/3, y, size/10 / 3, 0, 2 * Math.PI)
  ctx.fill()
  ctx.fillStyle = '#333333'
  ctx.beginPath()
  ctx.arc(x + size/3, y, size/10, 0, 2 * Math.PI)
  ctx.fill()
  ctx.fillStyle = '#000000'
  ctx.beginPath()
  ctx.arc(x + size/3, y, size/10 / 3, 0, 2 * Math.PI)
  ctx.fill()
  //lines
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(x, y + size*0.6, size*0.7, 1.4 * Math.PI, 1.6 * Math.PI)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(x, y - size*0.6, size*0.7, 0.4 * Math.PI, 0.6 * Math.PI)
  ctx.stroke()
}

function drawCardUndo (x, y, size, card) {
  //circle
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(x, y, size/3, 1.05*Math.PI, 2.5*Math.PI)
  ctx.stroke()
  //arrow
  ctx.fillStyle = '#000000'
  ctx.beginPath()
  ctx.moveTo(x - size/3 - size/10, y - size/20)
  ctx.lineTo(x - size/3 + size/10, y - size/20)
  ctx.lineTo(x - size/3, y + size/20)
  ctx.fill()
}