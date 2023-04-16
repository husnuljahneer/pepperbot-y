import { isSameFn } from './tagFn'
export type El = Element | Document

interface EventItem {
  el: El
  type: string
  cbs: Array<(e: Event) => any>
}

class EventManager {
  static list: EventItem[] = []

  static add(el: El, type: string, cb: (e: Event) => any) {
    let item: EventItem = findEventItem(el, type)
    if (!item) {
      item = {
        el,
        type,
        cbs: []
      }
    }
    item.cbs.push(cb)
    this.list.push(item)
  }

  static remove(el: El, type: string, cb?: (e: Event) => any) {
    const item: EventItem = findEventItem(el, type)
    if (!item) return
    if (!cb) {
      item.cbs = []
    } else {
      item.cbs = item.cbs.filter(oldCb => isSameFn(oldCb, cb))
    }
  }
}

function findEventItem(el: El, type: string): EventItem {
  return EventManager.list.find(item => item.el === el && item.type === type)
}

export function addEvent(el: El, type: string, cb: (e: Event) => any) {
  const item: EventItem = findEventItem(el, type)
  if (!item) {
    el.addEventListener(type, function handler(e: Event) {
      const cbs = findEventItem(el, type).cbs
      cbs.forEach(cb => {
        cb(e)
      })
    })
  }
  EventManager.add(el, type, cb)
}

export function removeEvent(el: El, type: string, cb?: (e: Event) => any) {
  EventManager.remove(el, type, cb)
}
