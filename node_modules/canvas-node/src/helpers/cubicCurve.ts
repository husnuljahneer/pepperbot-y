import { Pos } from '../node'
import { isPointOnLine } from './isClicked'

export function simulateBezierCurve(
  p1: number,
  p2: number,
  p3: number,
  p4: number,
  t: number
): number {
  return (
    Math.pow(1 - t, 3) * p1 +
    3 * Math.pow(1 - t, 2) * t * p2 +
    3 * (1 - t) * Math.pow(t, 2) * p3 +
    Math.pow(t, 3) * p4
  )
}

export function getDirForBezierCurve(
  p1: number,
  p2: number,
  p3: number,
  p4: number,
  t: number
): number {
  return (
    3 * Math.pow(1 - t, 2) * (p2 - p1) +
    6 * (1 - t) * t * (p3 - p2) +
    3 * Math.pow(t, 2) * (p4 - p3)
  )
}

function join(p1: number, p2: number, ratio: number = 0.5): number {
  return p1 + (p2 - p1) * ratio
}

export function getControlPoints(start: Pos, end: Pos): [Pos, Pos] {
  const { x: startX, y: startY } = start
  const { x: endX, y: endY } = end
  const c1x: number = startX
  const c1y: number = join(startY, endY, 0.33)
  const c2x: number = endX
  const c2y: number = join(startY, endY, 0.66)
  return [
    {
      x: c1x,
      y: c1y
    },
    {
      x: c2x,
      y: c2y
    }
  ]
}

export function isPointOnBezierCurve(
  start: Pos,
  end: Pos,
  point: Pos
): boolean {
  const { x: startX, y: startY } = start
  const { x: endX, y: endY } = end
  const controlPoints: [Pos, Pos] = getControlPoints(start, end)
  const { x: c1x, y: c1y } = controlPoints[0]
  const { x: c2x, y: c2y } = controlPoints[1]
  return isPointOnLine(
    point,
    0,
    1,
    0,
    simulateBezierCurve,
    {
      x: [startX, c1x, c2x, endX],
      y: [startY, c1y, c2y, endY]
    }
  )
  // const numOfTest: number = Math.floor(
  //   distanceBetween2Points(startX, startY, endX, endY) / 2
  // )
  // const $numOfTest: number = getLimitedExamTimes(numOfTest)
  // const inc: number = 1 / $numOfTest
  // let t: number = inc
  // while (t < 1) {
  //   const lineX: number = simulateBezierCurve(startX, c1x, c2x, endX, t)
  //   const lineY: number = simulateBezierCurve(startY, c1y, c2y, endY, t)
  //   if (distanceBetween2Points(x, y, lineX, lineY) < MARGIN_ERROR) return true
  //   t += inc
  // }
  // return false
}
