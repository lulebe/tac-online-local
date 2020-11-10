const canvas = document.getElementById("game-canvas")
const ctx = canvas.getContext("2d")

let minWidth = 100
const padding = 10
const PASTEL_COLORS = ['#ffe8cc', '#ccccff', '#ffcccc', '#ceffce']
const FULL_COLORS = ['#ff9008', '#0808ff', '#ff0808', '#00bb00']

window.addEventListener('resize', resizeCanvas)

function resizeCanvas () {
  document.getElementById("game-canvas").width = document.getElementById("game-table").clientWidth -10
  document.getElementById("game-canvas").height = document.getElementById("game-table").clientHeight -10
  minWidth = Math.min(canvas.width, canvas.height)
  drawGame()
}

function initCanvas () {
  resizeCanvas()
}

function drawGame () {
  drawBoard()
}

function drawBoard () {
  //1. draw circle
  ctx.strokeStyle = '#555555'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(canvas.width/2, canvas.height/2, minWidth/2 - 2*padding, 0, 2 * Math.PI)
  ctx.stroke()
  //2. draw arrows

  //3. draw starting box
  drawBoxes()
  //4. draw house fields
  drawHouseFields()
  //5. draw fields
  drawFields()
}

//0 = normal, 1 = go-field, 2 = -4, 3 = 8, then house fields
const FIELD_TYPES = [
  {stroke: '#000000', width: 2, fill: '#ffffff'},
  {stroke: '#000000', width: 2, fill: '#cccccc'},
  {stroke: '#660000', width: 2, fill: '#eeeeee'},
  {stroke: '#333333', width: 2, fill: '#eeeeee'},
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
    else if ((i+12) % 16 === 0)
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
  ctx.arc(centerX, centerY, (minWidth/2 - 2*padding) / 32, 0, 2 * Math.PI)
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
}

function canvasClick (x, y) {
  const bounds = canvas.getBoundingClientRect()
  const realX = Math.floor((x - bounds.left - translateX) / scale / tileSize)
  const realY = Math.floor((y - bounds.top - translateY) / scale / tileSize)
  const clickedField = {realX, realY}
  console.log(clickedField)
}
