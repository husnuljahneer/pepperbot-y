import { CanvasNode, Pos } from '../node'
import { getDirective, simulateCurve } from './quadraticCurve'
import { Color } from '../arrow'
import {
  getControlPoints,
  getDirForBezierCurve,
  simulateBezierCurve
} from './cubicCurve'
import { getAdjustedDir } from './adjustDir'
import { distanceBetween2Points } from './isClicked'

const MARGIN_ERROR: number = 5
export const ARROW_H: number = 15

function drawTriangle(): Path2D | CanvasFillRule {
  const triangle = new Path2D()

  triangle.moveTo(-ARROW_H, 0)
  triangle.lineTo(-ARROW_H, 5)
  triangle.lineTo(0, 0)
  triangle.lineTo(-ARROW_H, -5)
  triangle.closePath()
  return triangle
}

/**
 * whether to consider two value are the same
 * @param {number} diff
 * @returns {boolean}
 */
function withInMargin(diff: number) {
  return Math.abs(diff) < MARGIN_ERROR
}

/**
 * get direction of the arrow (for end point)
 * @param {Pos} start
 * @param {Pos} end
 * @returns {string}: for the end, which direction it is on from start
 */
function getDirection(start: Pos, end: Pos): string {
  const { x: startX, y: startY } = start
  const { x: endX, y: endY } = end
  if (withInMargin(startY - endY)) {
    return startX > endX ? 'left' : 'right'
  } else if (withInMargin(startX - endX)) {
    return startY > endY ? 'top' : 'bottom'
  } else {
    return startY > endY ? 'top' : 'bottom'
  }
}

/**
 * get direction for start point
 * @param {Pos} start
 * @param {Pos} end
 * @returns {string}: for the start, which direction it is on from the end
 */
function getDirectionForStart(start: Pos, end: Pos): string {
  const dir: string = getDirection(start, end)
  const { x: startX, y: startY } = start
  const { x: endX, y: endY } = end
  switch (dir) {
    case 'top':
    case 'bottom':
      if (withInMargin(startX - endX)) {
        return endY > startY ? 'top' : 'bottom'
      }
      return endX > startX ? 'left' : 'right'
    case 'left':
    case 'right':
      if (withInMargin(startY - endY)) {
        return endX > startX ? 'left' : 'right'
      }
      return endY > startY ? 'top' : 'bottom'
  }
}

/**
 * get the control point of a single line
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @returns {[number , number]}
 */
export function calculateStop(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): [number, number] {
  const dir: string = getDirection(
    {
      x: x1,
      y: y1
    },
    {
      x: x2,
      y: y2
    }
  )
  switch (dir) {
    case 'top':
    case 'bottom':
      return [x2, y1]
    case 'left':
    case 'right':
      return [x1, y2]
    default:
      return [x1, y2]
  }
}

/**
 * make sure ratio is in a reasonable range
 * @param {number} ratio 
 */
function fixRatio(ratio: number): number {
  return Math.min(Math.max(0.001, ratio), 0.999)
}

/**
 * draw a line with arrow
 * @param {CanvasRenderingContext2D} ctx
 * @param {Pos} start
 * @param {Pos} end
 * @param {number} ratio
 * @param {Path2D & CanvasFillRule} arrowPath
 * @param {Color} colorObj
 */
export function drawLine(
  ctx: CanvasRenderingContext2D,
  start: Pos,
  end: Pos,
  ratio: number,
  arrowPath: Path2D & CanvasFillRule,
  colorObj: Color
) {
  const { style, strokeStyle } = colorObj
  const { x: startX, y: startY } = start
  const { x: endX, y: endY } = end

  ctx.beginPath()
  ctx.moveTo(startX, startY)
  const stop = calculateStop(startX, startY, endX, endY)
  // draw curve
  ctx.quadraticCurveTo(stop[0], stop[1], endX, endY)
  // get where to put arrow
  const arrowX: number = simulateCurve(startX, stop[0], endX, fixRatio(ratio))
  const arrowY: number = simulateCurve(startY, stop[1], endY, fixRatio(ratio))
  // calculate tan
  const distance: number = distanceBetween2Points(startX, startY, endX, endY)
  const arrowDirX: number = getAdjustedDir(
    getDirective,
    distance,
    startX,
    stop[0],
    endX,
    fixRatio(ratio)
  )
  const arrowDirY: number = getAdjustedDir(
    getDirective,
    distance,
    startY,
    stop[1],
    endY,
    fixRatio(ratio)
  )
  const tan: number = arrowDirY / arrowDirX
  // get rotate angle
  const angle: number = Math.atan(tan)
  const goLeft: boolean = endX < startX
  const rotateAngle: number = goLeft ? angle - Math.PI : angle
  ctx.lineWidth = 2
  ctx.strokeStyle = strokeStyle
  ctx.stroke()
  ctx.save()
  ctx.translate(arrowX, arrowY)
  ctx.rotate(rotateAngle)
  const triangle = drawTriangle()
  ctx.fillStyle = style
  // use custom arrow path or default one
  ctx.fill((arrowPath as CanvasFillRule) || (triangle as CanvasFillRule))
  ctx.restore()
}

/**
 * make sure every line start/end at the center of a node
 * @param {CanvasNode} node
 * @returns {Pos}
 */
export function centralizePoint(node: CanvasNode): Pos {
  const [width, height] = node.rawVertexes.slice(2)
  return {
    x: node.pos.x + width / 2,
    y: node.pos.y + height / 2
  }
}

/**
 * place point on the limit of polygon
 * @param {Pos} start
 * @param {Pos} end
 * @param {CanvasNode} node
 * @param {boolean} isStart
 * @returns {Pos}
 */
export function placePointOnEdge(
  start: Pos,
  end: Pos,
  node: CanvasNode,
  isStart: boolean = true
): Pos {
  const dir: string = isStart
    ? getDirectionForStart(start, end)
    : getDirection(start, end)
  return calculatePos(dir, node)
}

/**
 * given direction and targeted node, get the coordinate of point on limit
 * @param {string} dir: for the perspective of the end, which direction it is on for the start
 * @param {CanvasNode} node
 * @returns {Pos}
 */
function calculatePos(dir: string, node: CanvasNode): Pos {
  const [width, height] = node.rawVertexes.slice(2)
  let x: number
  let y: number
  switch (dir) {
    case 'bottom':
      x = node.pos.x + width / 2
      y = node.pos.y
      break
    case 'top':
      x = node.pos.x + width / 2
      y = node.pos.y + height
      break
    case 'right':
      x = node.pos.x
      y = node.pos.y + height / 2
      break
    case 'left':
      x = node.pos.x + width
      y = node.pos.y + height / 2
      break
  }
  return {
    x,
    y
  }
}

export function drawCubicBezier(
  ctx: CanvasRenderingContext2D,
  start: Pos,
  end: Pos,
  ratio: number,
  arrowPath: Path2D & CanvasFillRule,
  colorObj: Color
) {
  const { style, strokeStyle } = colorObj
  const { x: startX, y: startY } = start
  const { x: endX, y: endY } = end

  ctx.beginPath()
  ctx.moveTo(startX, startY)
  const controlPoints: [Pos, Pos] = getControlPoints(start, end)
  const { x: c1x, y: c1y } = controlPoints[0]
  const { x: c2x, y: c2y } = controlPoints[1]
  ctx.bezierCurveTo(c1x, c1y, c2x, c2y, endX, endY)

  const distance: number = distanceBetween2Points(startX, startY, endX, endY)
  // get where to put arrow
  const arrowX: number = simulateBezierCurve(
    startX,
    c1x,
    c2x,
    endX,
    fixRatio(ratio)
  )
  const arrowY: number = simulateBezierCurve(
    startY,
    c1y,
    c2y,
    endY,
    fixRatio(ratio)
  )
  // calculate tan
  const arrowDirX: number = getAdjustedDir(
    getDirForBezierCurve,
    distance,
    startX,
    c1x,
    c2x,
    endX,
    fixRatio(ratio)
  )
  const arrowDirY: number = getAdjustedDir(
    getDirForBezierCurve,
    distance,
    startY,
    c1y,
    c2y,
    endY,
    fixRatio(ratio)
  )
  const tan: number = arrowDirY / arrowDirX
  // get rotate angle
  const angle: number = Math.atan(tan)
  const goLeft: boolean = endX < startX
  const rotateAngle: number = goLeft ? angle - Math.PI : angle
  ctx.lineWidth = 2
  ctx.strokeStyle = strokeStyle
  ctx.stroke()
  ctx.save()
  ctx.translate(arrowX, arrowY)
  ctx.rotate(rotateAngle)
  const triangle = drawTriangle()
  ctx.fillStyle = style
  // use custom arrow path or default one
  ctx.fill((arrowPath as CanvasFillRule) || (triangle as CanvasFillRule))
  ctx.restore()
}
