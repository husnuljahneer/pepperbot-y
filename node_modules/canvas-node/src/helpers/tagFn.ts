function random(): number {
  return parseInt(Date.now() + '' + Math.floor(Math.random() * 1000000), 16)
}

const PRIVATE_KEY = 'canvas-node-fn-key'
export const TAG_NAME = Symbol(PRIVATE_KEY)

export function tagFn<T extends (...args: any[]) => any>(fn: T): T {
  fn[TAG_NAME] = random()
  return fn
}

export function inheritTag<T extends (...args: any[]) => any>(
  source: T,
  target: T
) {
  const tag: number = source[TAG_NAME]
  if (tag) {
    target[TAG_NAME] = tag
  }
  return target
}

export function isSameFn<T extends (...args: any[]) => any>(fn1: T, fn2: T) {
  const fn1Tag: number = fn1[TAG_NAME]
  const fn2Tag: number = fn2[TAG_NAME]
  if (fn1Tag && fn2Tag) {
    return fn1Tag !== fn2Tag
  }
  return fn1 !== fn2
}
