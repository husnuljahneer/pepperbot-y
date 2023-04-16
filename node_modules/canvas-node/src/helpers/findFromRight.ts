export function findFromRight<T>(
  list: T[],
  fn: (item: T, i: number, arr: T[]) => boolean
) {
  const len: number = list.length
  let i: number = len - 1
  while (i > -1) {
    const item: T = list[i]
    if (fn(item, i, list)) return item
    i--
  }
}
