export function isUndef(input: any): boolean {
  return typeof input === 'undefined'
}

export function isNull(input: any): boolean {
  return input === null
}

export function isFn(input: any): boolean {
  return typeof input === 'function'
}

export function isBoolean(input: any): boolean {
  return typeof input === 'boolean'
}

export function isNum(input: number): boolean {
  return typeof input === 'number' && !isNaN(input)
}