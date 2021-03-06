const canvas = document.getElementById("game-canvas")
const ctx = canvas.getContext("2d")

let minWidth = 100, fieldDistance = 10, fieldSize = 10
const padding = 10
const PASTEL_COLORS = ['#f2dcfb', '#d3d3f3', '#fff6d5', '#cfffcd']
const FULL_COLORS = ['#ba3ee8', '#3333bb', '#d08000', '#008a1b']
const DARK_COLORS = ['#8515af', '#1e1e6e', '#955c00', '#004f0f']

window.addEventListener('resize', resizeCanvas)

function resizeCanvas () {
  document.getElementById("game-canvas").width = document.body.clientWidth - document.body.clientWidth*0.3 - 2 - 4
  document.getElementById("game-canvas").height = window.innerHeight - 64 - 4
  minWidth = Math.min(canvas.width, canvas.height)
  const fieldDistanceX = Math.cos((1/64)*2*Math.PI) * (minWidth/2 - 2*padding) - (minWidth/2 - 2*padding)
  const fieldDistanceY = Math.sin((1/64)*2*Math.PI) * (minWidth/2 - 2*padding)
  fieldDistance = Math.sqrt(Math.pow(fieldDistanceX, 2) + Math.pow(fieldDistanceY, 2))
  fieldSize = (minWidth/2 - 2*padding)/32
  drawGame()
}

function initCanvas () {
  resizeCanvas()
}

function drawGame () {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  drawBoard()
  drawStones()
  drawUsedCards()
  drawClickables()
}

function drawBoard () {
  //draw circles
  ctx.strokeStyle = '#555555'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(canvas.width/2, canvas.height/2, minWidth/2 - 2*padding, 0, 2 * Math.PI)
  ctx.stroke()
  ctx.strokeStyle = '#888888'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(canvas.width/2, canvas.height/2, minWidth/3.7 - 2*padding, 0, 2 * Math.PI)
  ctx.stroke()
  drawArrows()
  drawBoxes()
  drawHouseFields()
  drawFields()
  drawNoUsedCards()
}

function drawArrows () {
  ctx.strokeStyle = '#555555'
  ctx.lineWidth = 2
  ctx.beginPath()
  let centerX = Math.cos((5/512)*2*Math.PI) * (minWidth/2 - 2*padding) + canvas.width/2
  let centerY = Math.sin((5/512)*2*Math.PI) * (minWidth/2 - 2*padding) + canvas.height/2
  let endX1 = centerX - fieldSize/1.5
  let endY1 = centerY - fieldSize/1.5
  let endX2 = centerX + fieldSize/1.5
  let endY2 = centerY - fieldSize/1.5
  ctx.moveTo(endX1, endY1)
  ctx.lineTo(centerX, centerY)
  ctx.lineTo(endX2, endY2)
  ctx.stroke()
  centerX = Math.cos((133/512)*2*Math.PI) * (minWidth/2 - 2*padding) + canvas.width/2
  centerY = Math.sin((133/512)*2*Math.PI) * (minWidth/2 - 2*padding) + canvas.height/2
  endX1 = centerX + fieldSize/1.5
  endY1 = centerY - fieldSize/1.5
  endX2 = centerX + fieldSize/1.5
  endY2 = centerY + fieldSize/1.5
  ctx.moveTo(endX1, endY1)
  ctx.lineTo(centerX, centerY)
  ctx.lineTo(endX2, endY2)
  ctx.stroke()
  centerX = Math.cos((261/512)*2*Math.PI) * (minWidth/2 - 2*padding) + canvas.width/2
  centerY = Math.sin((261/512)*2*Math.PI) * (minWidth/2 - 2*padding) + canvas.height/2
  endX1 = centerX - fieldSize/1.5
  endY1 = centerY + fieldSize/1.5
  endX2 = centerX + fieldSize/1.5
  endY2 = centerY + fieldSize/1.5
  ctx.moveTo(endX1, endY1)
  ctx.lineTo(centerX, centerY)
  ctx.lineTo(endX2, endY2)
  ctx.stroke()
  centerX = Math.cos((389/512)*2*Math.PI) * (minWidth/2 - 2*padding) + canvas.width/2
  centerY = Math.sin((389/512)*2*Math.PI) * (minWidth/2 - 2*padding) + canvas.height/2
  endX1 = centerX - fieldSize/1.5
  endY1 = centerY - fieldSize/1.5
  endX2 = centerX - fieldSize/1.5
  endY2 = centerY + fieldSize/1.5
  ctx.moveTo(endX1, endY1)
  ctx.lineTo(centerX, centerY)
  ctx.lineTo(endX2, endY2)
  ctx.stroke()
}

//0 = normal, 1 = go-field, 2 = -4, 3 = 8, then house fields
const FIELD_TYPES = [
  {stroke: '#000000', width: 2, fill: '#ffffff'},
  {stroke: '#000000', width: 2, fill: '#c5c5c5'},
  {stroke: '#880000', width: 2, fill: '#e5e5e5'},
  {stroke: '#333333', width: 2, fill: '#e5e5e5'},
  {stroke: '#333333', width: 2, fill: PASTEL_COLORS[0]},
  {stroke: '#333333', width: 2, fill: PASTEL_COLORS[1]},
  {stroke: '#333333', width: 2, fill: PASTEL_COLORS[2]},
  {stroke: '#333333', width: 2, fill: PASTEL_COLORS[3]}
]
function drawFields () {
  for (let i = 0; i < 64; i++) {
    const centerX = Math.cos((i/64)*2*Math.PI) * (minWidth/2 - 2*padding) + canvas.width/2
    const centerY = Math.sin((i/64)*2*Math.PI) * (minWidth/2 - 2*padding) + canvas.height/2
    let style = 0
    if (i % 16 === 0)
      style = 1
    else if ((i+4) % 16 === 0)
      style = 2
    else if ((i+8) % 16 === 0)
      style = 3
    drawField(style, centerX, centerY)
  }
}

function drawHouseFields () {
  const fieldDistanceX = Math.cos((1/64)*2*Math.PI) * (minWidth/2 - 2*padding) - (minWidth/2 - 2*padding)
  const fieldDistanceY = Math.sin((1/64)*2*Math.PI) * (minWidth/2 - 2*padding)
  const fieldDistance = Math.sqrt(Math.pow(fieldDistanceX, 2) + Math.pow(fieldDistanceY, 2))
  let baseX = Math.cos(0*2*Math.PI) * (minWidth/2 - 2*padding) + canvas.width/2
  let baseY = Math.sin(0*2*Math.PI) * (minWidth/2 - 2*padding) + canvas.height/2
  drawHouseLine([baseX, baseY], [baseX-4*fieldDistance, baseY])
  for (let i = 1; i <= 4; i++) {
    drawField(4, baseX - i*fieldDistance, baseY)
  }
  baseX = Math.cos(0.25*2*Math.PI) * (minWidth/2 - 2*padding) + canvas.width/2
  baseY = Math.sin(0.25*2*Math.PI) * (minWidth/2 - 2*padding) + canvas.height/2
  drawHouseLine([baseX, baseY], [baseX, baseY-4*fieldDistance])
  for (let i = 1; i <= 4; i++) {
    drawField(5, baseX, baseY - i*fieldDistance)
  }
  baseX = Math.cos(0.5*2*Math.PI) * (minWidth/2 - 2*padding) + canvas.width/2
  baseY = Math.sin(0.5*2*Math.PI) * (minWidth/2 - 2*padding) + canvas.height/2
  drawHouseLine([baseX, baseY], [baseX+4*fieldDistance, baseY])
  for (let i = 1; i <= 4; i++) {
    drawField(6, baseX + i*fieldDistance, baseY)
  }
  baseX = Math.cos(0.75*2*Math.PI) * (minWidth/2 - 2*padding) + canvas.width/2
  baseY = Math.sin(0.75*2*Math.PI) * (minWidth/2 - 2*padding) + canvas.height/2
  drawHouseLine([baseX, baseY], [baseX, baseY+4*fieldDistance])
  for (let i = 1; i <= 4; i++) {
    drawField(7, baseX, baseY + i*fieldDistance)
  }
}

function drawField (style, centerX, centerY) {
  ctx.strokeStyle = FIELD_TYPES[style].stroke
  ctx.lineWidth = FIELD_TYPES[style].width
  ctx.fillStyle = FIELD_TYPES[style].fill
  ctx.beginPath()
  ctx.arc(centerX, centerY, fieldSize, 0, 2 * Math.PI)
  ctx.stroke()
  ctx.fill()
}

function drawHouseLine (from, to) {
  ctx.strokeStyle = '#555555'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(from[0], from[1])
  ctx.lineTo(to[0], to[1])
  ctx.stroke()
}

function drawBoxes () {
  const diameter = Math.cos(0.25*Math.PI) * (minWidth/2 - 2*padding)
  ctx.strokeStyle = '#555555'
  ctx.lineWidth = 2
  ctx.fillStyle = PASTEL_COLORS[3]
  ctx.beginPath()
  ctx.arc(0, 0, diameter / 2, 0, 2 * Math.PI)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = PASTEL_COLORS[0]
  ctx.beginPath()
  ctx.arc(canvas.width, 0, diameter / 2, 0, 2 * Math.PI)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = PASTEL_COLORS[2]
  ctx.beginPath()
  ctx.arc(0, canvas.height, diameter / 2, 0, 2 * Math.PI)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = PASTEL_COLORS[1]
  ctx.beginPath()
  ctx.arc(canvas.width, canvas.height, diameter / 2, 0, 2 * Math.PI)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = '#555555'
  ctx.font = (diameter*0.15) + 'px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(1, canvas.width - diameter/6, diameter/4.5)
  ctx.fillText(2, canvas.width - diameter/6, canvas.height - diameter/8.7)
  ctx.fillText(3, diameter/6, canvas.height - diameter/8.7)
  ctx.fillText(4, diameter/6, diameter/4.5)
}

function drawNoUsedCards () {
  const minX = canvas.width/2 - minWidth/30
  const minY = canvas.height/2 - minWidth/30
  const maxX = canvas.width/2 + minWidth/30
  const maxY = canvas.height/2 + minWidth/30
  ctx.strokeStyle = '#555555'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(minX, minY)
  ctx.lineTo(maxX, maxY)
  ctx.moveTo(minX, maxY)
  ctx.lineTo(maxX, minY)
  ctx.stroke()
}

function drawStones () {
  for (let pi = 0; pi < game.players.length; pi++) {
    let boxSize = 0
    game.players[pi].stones.forEach(stone => {
      switch (stone.position) {
        case STONE_POSITION_BOX:
          boxSize++
        break
        case STONE_POSITION_FIELD:
          drawStoneField(stone.field, pi)
        break
        case STONE_POSITION_HOUSE:
          drawStoneHouse(stone.field, pi)
      }
    })
    drawBox(boxSize, pi)
  }
}

function drawStoneField (field, playerIndex) {
  const centerX = Math.cos((field/64)*2*Math.PI) * (minWidth/2 - 2*padding) + canvas.width/2
  const centerY = Math.sin((field/64)*2*Math.PI) * (minWidth/2 - 2*padding) + canvas.height/2
  drawStone(centerX, centerY, playerIndex)
}

function drawStoneHouse (field, playerIndex) {
  
  let baseX, baseY
  switch (playerIndex) {
    case 0:
      baseX = Math.cos(0*2*Math.PI) * (minWidth/2 - 2*padding) + canvas.width/2
      baseY = Math.sin(0*2*Math.PI) * (minWidth/2 - 2*padding) + canvas.height/2
      drawStone(baseX - (1+field)*fieldDistance, baseY, playerIndex)
    break
    case 1:
      baseX = Math.cos(0.25*2*Math.PI) * (minWidth/2 - 2*padding) + canvas.width/2
      baseY = Math.sin(0.25*2*Math.PI) * (minWidth/2 - 2*padding) + canvas.height/2
      drawStone(baseX, baseY - (1+field)*fieldDistance, playerIndex)
    break
    case 2:
      baseX = Math.cos(0.5*2*Math.PI) * (minWidth/2 - 2*padding) + canvas.width/2
      baseY = Math.sin(0.5*2*Math.PI) * (minWidth/2 - 2*padding) + canvas.height/2
      drawStone(baseX + (1+field)*fieldDistance, baseY, playerIndex)
    break
    case 3:
      baseX = Math.cos(0.75*2*Math.PI) * (minWidth/2 - 2*padding) + canvas.width/2
      baseY = Math.sin(0.75*2*Math.PI) * (minWidth/2 - 2*padding) + canvas.height/2
      drawStone(baseX, baseY + (1+field)*fieldDistance, playerIndex)
  }
}

function drawBox (size, playerIndex) {
  let boxCenterX, boxCenterY
  const boxRadius = Math.cos(0.25*Math.PI) * (minWidth/2 - 2*padding) * 0.5
  switch (playerIndex) {
    case 0:
      boxCenterX = canvas.width - boxRadius/3
      boxCenterY = boxRadius/3
    break
    case 1:
      boxCenterX = canvas.width - boxRadius/3
      boxCenterY = canvas.height - boxRadius/3
    break
    case 2:
      boxCenterX = boxRadius/3
      boxCenterY = canvas.height - boxRadius/3
    break
    case 3:
      boxCenterX = boxRadius/3
      boxCenterY = boxRadius/3
  }
  switch (size) {
    case 1:
      drawStone(boxCenterX, boxCenterY, playerIndex)
    break
    case 2:
      drawStone(boxCenterX - fieldSize*1.5, boxCenterY, playerIndex)
      drawStone(boxCenterX + fieldSize*1.5, boxCenterY, playerIndex)
    break
    case 3:
      drawStone(boxCenterX - fieldSize*1.5, boxCenterY - fieldSize*1.5, playerIndex)
      drawStone(boxCenterX + fieldSize*1.5, boxCenterY - fieldSize*1.5, playerIndex)
      drawStone(boxCenterX, boxCenterY + fieldSize*1.5, playerIndex)
    break
    case 4:
      drawStone(boxCenterX - fieldSize*1.5, boxCenterY - fieldSize*1.5, playerIndex)
      drawStone(boxCenterX + fieldSize*1.5, boxCenterY - fieldSize*1.5, playerIndex)
      drawStone(boxCenterX - fieldSize*1.5, boxCenterY + fieldSize*1.5, playerIndex)
      drawStone(boxCenterX + fieldSize*1.5, boxCenterY + fieldSize*1.5, playerIndex)
    break
  }
}

function drawStone (centerX, centerY, playerIndex) {
  ctx.fillStyle = FULL_COLORS[playerIndex]
  ctx.beginPath()
  ctx.arc(centerX, centerY, fieldSize, 0, 2 * Math.PI)
  ctx.fill()
  ctx.fillStyle = DARK_COLORS[playerIndex]
  ctx.beginPath()
  ctx.arc(centerX, centerY, fieldSize / 3, 0, 2 * Math.PI)
  ctx.fill()
}

function drawUsedCards () {
  if (game.usedCards.length === 0) return
  for (let i = 0; i < game.usedCards.length-1; i += 10) {
    ctx.save()
    ctx.translate(canvas.width/2, canvas.height/2)
    ctx.rotate(2 * Math.PI * i / 1500)
    drawCard(0, 0, minWidth/6, game.usedCards[i])
    ctx.restore()
  }
  ctx.save()
  ctx.translate(canvas.width/2, canvas.height/2)
  ctx.rotate(2 * Math.PI * game.usedCards.length / 1500)
  drawCard(0, 0, minWidth/6, game.usedCards[game.usedCards.length-1])
  ctx.restore()
}

function drawClickables () {
  turnData.clickableFields.forEach(f => drawClickable(f))
}

function drawClickable (field) {
  ctx.strokeStyle = '#ff0000'
  ctx.lineWidth = 4
  ctx.beginPath()
  switch(field.position) {
    case STONE_POSITION_BOX:
      const radius = Math.cos(0.25*Math.PI) * (minWidth/2 - 2*padding) * 0.5
      if (field.playerIndex === 0)
        ctx.arc(canvas.width, 0, radius, 0, 2 * Math.PI)
      if (field.playerIndex === 1)
        ctx.arc(canvas.width, canvas.height, radius, 0, 2 * Math.PI)
      if (field.playerIndex === 2)
        ctx.arc(0, canvas.height, radius, 0, 2 * Math.PI)
      if (field.playerIndex === 3)
        ctx.arc(0, 0, radius, 0, 2 * Math.PI)
    break
    case STONE_POSITION_FIELD:
      const centerX = Math.cos((field.field/64)*2*Math.PI) * (minWidth/2 - 2*padding) + canvas.width/2
      const centerY = Math.sin((field.field/64)*2*Math.PI) * (minWidth/2 - 2*padding) + canvas.height/2
      ctx.arc(centerX, centerY, fieldSize, 0, 2 * Math.PI)
    break
    case STONE_POSITION_HOUSE:
      let baseX, baseY
      switch (game.players[game.turn].playsFor) {
        case 0:
          baseX = Math.cos(0*2*Math.PI) * (minWidth/2 - 2*padding) + canvas.width/2
          baseY = Math.sin(0*2*Math.PI) * (minWidth/2 - 2*padding) + canvas.height/2
          ctx.arc(baseX - (1+field.field)*fieldDistance, baseY, fieldSize, 0, 2 * Math.PI)
        break
        case 1:
          baseX = Math.cos(0.25*2*Math.PI) * (minWidth/2 - 2*padding) + canvas.width/2
          baseY = Math.sin(0.25*2*Math.PI) * (minWidth/2 - 2*padding) + canvas.height/2
          ctx.arc(baseX, baseY - (1+field.field)*fieldDistance, fieldSize, 0, 2 * Math.PI)
        break
        case 2:
          baseX = Math.cos(0.5*2*Math.PI) * (minWidth/2 - 2*padding) + canvas.width/2
          baseY = Math.sin(0.5*2*Math.PI) * (minWidth/2 - 2*padding) + canvas.height/2
          ctx.arc(baseX + (1+field.field)*fieldDistance, baseY, fieldSize, 0, 2 * Math.PI)
        break
        case 3:
          baseX = Math.cos(0.75*2*Math.PI) * (minWidth/2 - 2*padding) + canvas.width/2
          baseY = Math.sin(0.75*2*Math.PI) * (minWidth/2 - 2*padding) + canvas.height/2
          ctx.arc(baseX, baseY + (1+field.field)*fieldDistance, fieldSize, 0, 2 * Math.PI)
      }
  }
  ctx.stroke()
}

function canvasClick (x, y) {
  const bounds = canvas.getBoundingClientRect()
  const realX = Math.floor(x - bounds.left)
  const realY = Math.floor(y - bounds.top)
  const centerDistanceX = realX - canvas.width/2
  const centerDistanceY = realY - canvas.height/2
  const centerDistance = Math.sqrt(Math.pow(centerDistanceX, 2) + Math.pow(centerDistanceY, 2))
  let radians = Math.acos(centerDistanceX / centerDistance)
  if (Math.asin(centerDistanceY / centerDistance) < 0)
    radians = 2 * Math.PI - radians
  let field = radians/2/Math.PI * 64
  field = field > 63.5 ? 0 : Math.round(field)
  //field
  if (centerDistance < (minWidth/2 - 2*padding + fieldSize) && centerDistance > (minWidth/2 - 2*padding - fieldSize)) {
    boardClicked({position: STONE_POSITION_FIELD, field, playerIndex: null})
    return
  }
  //houses
  const fieldDistanceX = Math.cos((1/64)*2*Math.PI) * (minWidth/2 - 2*padding) - (minWidth/2 - 2*padding)
  const fieldDistanceY = Math.sin((1/64)*2*Math.PI) * (minWidth/2 - 2*padding)
  const fieldDistance = Math.sqrt(Math.pow(fieldDistanceX, 2) + Math.pow(fieldDistanceY, 2))
  let base = Math.cos(0*2*Math.PI) * (minWidth/2 - 2*padding)
  if (centerDistance < base && centerDistance > base-4*fieldDistance-fieldSize && field % 16 === 0) {
    boardClicked({
      position: STONE_POSITION_HOUSE,
      field: Math.round((base-centerDistance)/fieldDistance)-1,
      playerIndex: Math.round(field / 16)
    })
    return
  }
  //boxes
  const boxRadius = Math.cos(0.25*Math.PI) * (minWidth/2 - 2*padding) * 0.5
  if (Math.sqrt(Math.pow(realX - canvas.width, 2) + Math.pow(realY, 2)) < boxRadius) {
    boardClicked({position: STONE_POSITION_BOX, field: null, playerIndex: 0})
    return
  }
  if (Math.sqrt(Math.pow(realX - canvas.width, 2) + Math.pow(realY - canvas.height, 2)) < boxRadius) {
    boardClicked({position: STONE_POSITION_BOX, field: null, playerIndex: 1})
    return
  }
  if (Math.sqrt(Math.pow(realX, 2) + Math.pow(realY - canvas.height, 2)) < boxRadius) {
    boardClicked({position: STONE_POSITION_BOX, field: null, playerIndex: 2})
    return
  }
  if (Math.sqrt(Math.pow(realX, 2) + Math.pow(realY, 2)) < boxRadius) {
    boardClicked({position: STONE_POSITION_BOX, field: null, playerIndex: 3})
    return
  }
}

canvas.addEventListener('click', e => {
  canvasClick(e.clientX, e.clientY)
})