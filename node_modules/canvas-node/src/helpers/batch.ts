import { isUndef, isNull } from './types'

export type BatchCallback = (...args: any[]) => any
const PRIVATE_KEY: string = 'canvas-node'
const KEY_NAME: symbol = Symbol(PRIVATE_KEY)

export class Batch {
  static timer: number = 0
  static list: BatchCallback[] = []
  static limit: number = 10

  /**
   * add callback to list
   * @param {BatchCallback} fn
   * @param {*=} uniqueKey: used to track callback. For callbacks share the same key, only the last fn will be fired (throttle)
   * @returns {void}
   */
  static add(fn: BatchCallback, uniqueKey?: any) {
    if (!isUndef(uniqueKey) && !isNull(uniqueKey)) {
      fn[KEY_NAME] = uniqueKey
    }
    this.unify(uniqueKey, fn)
    this.batch()
  }

  /**
   * find whether the type of callback (with the same uniqueKey) existed
   * @param {*} key
   * @return {boolean}
   */
  static includes(key: any): boolean {
    return this.list.some(cb => {
      return cb[KEY_NAME] === key
    })
  }

  /**
   * make sure only one callback with the specific uniqueKey existed
   * @param {*} key : unique key for the callback
   * @param {BatchCallback} fn
   */
  static unify(key: any, fn: BatchCallback) {
    if (!key || !this.includes(key)) {
      this.list.push(fn)
    } else {
      this.list = this.list.map(cb => {
        if (cb[KEY_NAME] === key) {
          return fn
        }
        return cb
      })
    }
  }

  static batch() {
    cancelAnimationFrame(this.timer)
    if (this.list.length > this.limit) {
      this.invoke()
    } else {
      this.timer = requestAnimationFrame(() => {
        this.invoke()
      })
    }
  }

  static invoke() {
    let len = this.list.length
    if (!len) return
    // only pick the last one
    // since for each render, Canvas.forEach will be called
    const cb = this.list[Math.min(len - 1, this.limit - 1)]
    cb()
    this.list = []
  }
}
