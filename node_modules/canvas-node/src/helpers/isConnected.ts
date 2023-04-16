import { CanvasNode } from '../node'
import { ArrowNode } from '../arrow'

function hasArrowNode(node1: CanvasNode, node2: CanvasNode): boolean {
  return [node1, node2].some(node => node instanceof ArrowNode)
}

export function isConnected(node1: CanvasNode, node2: CanvasNode): boolean {
  if (hasArrowNode(node1, node2)) return false
  const lines: ArrowNode[] = node1.lines
  return lines.some(line => {
    const match: CanvasNode = line.from === node1 ? line.to : line.from
    return match === node2
  })
}

export function isConnectedSeq(
  node1: CanvasNode,
  node2: CanvasNode,
  isFromFirst: boolean = true
) {
  if (hasArrowNode(node1, node2)) return false
  const lines: ArrowNode[] = node1.lines
  return lines.some(line => {
    const match: CanvasNode = isFromFirst ? line.to : line.from
    return match === node2
  })
}
