import { Manager } from '../manager'

export type CalculateDirFn = (...args: number[]) => number

export function getAdjustedDir(
  fn: CalculateDirFn,
  distance: number,
  ...args: number[]
): number {
  const argLen: number = args.length
  const ratio: number = args[argLen - 1]
  if (ratio <= 0.6) {
    return fn(...args)
  }
  const newArgs: number[] = args.slice()
  newArgs.pop()
  const realDir: number = fn(...args)
  const pct: number = 2 * Manager.arrowH / distance
  const balanceRatio: number = Math.max(Math.max(ratio - pct, 0), 0.5)
  newArgs.push(balanceRatio)
  const backDir: number = fn(...newArgs)
  return realDir * 0.5 + backDir * 0.5
}
