export function getVertexesForRect(raw: number[]): number[] {
  if (raw.length > 4) console.error('only support rect now!')
  const [x, y, w, h] = raw
  return [x, y, x + w, y, x + w, y + h, x, y + h]
}
