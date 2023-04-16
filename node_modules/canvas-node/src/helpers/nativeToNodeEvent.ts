import { addEvent, removeEvent } from './eventHelper'
import { CanvasNode, Pos, NodeEventCallback } from '../node'
import { Manager } from '../manager'
import { getClickedNode } from './isClicked'
import {
  shouldNormalizeEvent,
  normalizeEvent,
  normalizeEventType
} from './normalizeNodeEvent'
import { inheritTag, isSameFn } from './tagFn'

export type Handler = (...args: any[]) => any

interface NodeEventItem {
  type: string
  cbs: Handler[]
}

/**
 * delegate events of CanvasNode
 */
class NodeEventManager {
  static list: NodeEventItem[] = []

  // add node event
  static add(type: string, cb: (any) => any) {
    let item: NodeEventItem = this.getItem(type)
    if (!item) {
      item = {
        type,
        cbs: [cb]
      }
      this.list.push(item)
    } else {
      item.cbs.push(cb)
    }
  }

  // get all callbacks
  static getCbs(type: string) {
    return this.getItem(type).cbs
  }

  // get item based on type
  static getItem(type: string) {
    return this.list.find(item => item.type === type)
  }

  // remove cb based on input
  static remove(type: string, cb?: Handler) {
    if (!cb) {
      this.list = this.list.filter(item => item.type !== type)
    } else {
      const item: NodeEventItem = this.getItem(type)
      if (!item) return
      item.cbs = item.cbs.filter(oldCb => isSameFn(oldCb, cb))
    }
  }
}

export function listenToNodeEvent(type: string, cb: NodeEventCallback) {
  const $type: string = normalizeEventType(type)
  let fn: Handler
  if (shouldNormalizeEvent(type)) {
    fn = normalizeEvent(type, cb)
  } else {
    fn = eventHandler
  }
  // generate new eventHandler
  function eventHandler(e: MouseEvent) {
    const pos: Pos = {
      x: e.offsetX,
      y: e.offsetY
    }
    const target: CanvasNode = getClickedNode(pos)
    if (!target) return
    cb(e, target)
  }
  // inherit tag from cb
  inheritTag(cb, fn)

  // listen to native event
  addEvent(Manager.canvas, $type, fn)
  // cache it
  NodeEventManager.add(type, fn)
}

export function removeNodeEvent(
  type: string,
  cb?: NodeEventCallback & Handler
) {
  const $type: string = normalizeEventType(type)
  if (cb) {
    // remove from native event listener
    removeEvent(Manager.canvas, $type, cb)
    NodeEventManager.remove(type, cb)
  } else {
    NodeEventManager.getCbs(type).forEach(cb => {
      removeEvent(Manager.canvas, $type, cb)
    })
    NodeEventManager.remove(type)
  }
}
