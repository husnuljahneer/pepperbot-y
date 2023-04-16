import { Pos } from '../node'
import { distanceBetween2Points, MARGIN_ERROR } from './isClicked'
import { getLimitedExamTimes } from './quadraticCurve'
import { simulateBezierCurve } from './cubicCurve'
import { simulateCurve } from './quadraticCurve'
import { Manager } from '../manager'

export function isPointOnCurveOld(
  point: Pos,
  points: {
    x: number[]
    y: number[]
  }
): boolean {
  // subjective number
  const pointsNum: number = points.x.length
  const numOfTest: number = Math.floor(
    distanceBetween2Points(
      points.x[0],
      points.y[0],
      points.x[pointsNum - 1],
      points.y[pointsNum - 1]
    ) / MARGIN_ERROR
  )
  const $numOfTest: number = getLimitedExamTimes(numOfTest)
  const inc: number = 1 / $numOfTest
  let t: number = inc
  const fn: (...args: number[]) => number = Manager.useCubicBezier
    ? simulateBezierCurve
    : simulateCurve
  while (t < 1) {
    const lineX: number = fn(...points.x, t)
    const lineY: number = fn(...points.y, t)
    if (distanceBetween2Points(point.x, point.y, lineX, lineY) < MARGIN_ERROR)
      return true
    t += inc
  }
  return false
}
