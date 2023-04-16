/**
 * handle mousemove and mouseout of a node
 * mouseout from a node is just when mouse not moving over the node
 * given the fact that we can only gain knowledge of whether the mouse is over any node
 * so 'not over' is just when stop 'over'
 * in other words, we are detecting when the current over 'target' is not the node which mouse was just 'over'
 */
import { CanvasNode, Pos, NodeEventCallback } from '../node'
import { getClickedNode } from './isClicked'
import event from 'y-event'

const NORMALIZE_LIST = ['mousemove', 'mouseout']
// in charge of keep track of hovering target
const queue: [any, any] = [null, null]
// manage mousemove && mouseout callbacks
const inOutList = {
  ins: [],
  outs: []
}

// handle the change
event.$on('change', e => {
  const newTarget = getNewTarget()
  const oldTarget = getOldTarget()
  // the latest target is a node
  // so it is 'moved in'
  if (newTarget instanceof CanvasNode) {
    inOutList.ins.forEach(cb => cb(e, newTarget))
  }
  // last target is a node
  // so it is 'moved out'
  if (oldTarget instanceof CanvasNode) {
    inOutList.outs.forEach(cb => cb(e, oldTarget))
  }
})

// always save the latest targets
function updateTarget(target: any): void {
  if (queue.length > 1) {
    queue.shift()
  }
  queue.push(target)
}

// should trigger change event
function hasChanged(): boolean {
  return queue[0] !== queue[1]
}

function getOldTarget(): any {
  return queue[0]
}

function getNewTarget(): any {
  return queue[1]
}

export type EventHandler = (e: Event) => any

export function shouldNormalizeEvent(type: string) {
  return NORMALIZE_LIST.includes(type)
}

export function normalizeEvent(
  type: string,
  cb: NodeEventCallback
): EventHandler {
  switch (type) {
    case 'mousemove':
      return generateMouseMoveHandler(cb)
    case 'mouseout':
      return generateMouseOutHandler(cb)
  }
}

export function normalizeEventType(type: string) {
  if (type === 'mouseout') return 'mousemove'
  return type
}

function generateMouseMoveHandler(cb: NodeEventCallback): EventHandler {
  inOutList.ins.push(cb)
  return function handler(e: MouseEvent) {
    const pos: Pos = {
      x: e.offsetX,
      y: e.offsetY
    }
    const node: CanvasNode = getClickedNode(pos)
    updateTarget(node)
    if (hasChanged()) {
      event.$emit('change', e)
    }
  }
}

function generateMouseOutHandler(cb: NodeEventCallback): EventHandler {
  inOutList.outs.push(cb)
  return function handler(e: MouseEvent) {
    const pos: Pos = {
      x: e.offsetX,
      y: e.offsetY
    }
    const node: CanvasNode = getClickedNode(pos)
    updateTarget(node)
    if (hasChanged()) {
      event.$emit('change', e)
    }
  }
}
