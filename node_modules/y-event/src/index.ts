export type callback = (...args: any[]) => any

export interface State {
  stalled: boolean
  args: any[]
  callbacks: callback[]
}

function generateDefaultState(): State {
  return {
    stalled: false,
    args: [],
    callbacks: []
  }
}

export class YEvent {
  list: {
    [type: string]: State
  } = {}

  getState(type: string): State {
    return this.list[type]
  }

  setState(type: string, val: State): void {
    this.list[type] = val
  }

  $on(type: string, cb: callback) {
    if (!this.getState(type)) {
      this.setState(type, generateDefaultState())
    }
    const state: State = this.getState(type)
    state.callbacks.push(cb)
    if (state.stalled) {
      state.stalled = false
      return cb(...state.args)
    }
  }

  $emit(type: string, ...args: any[]) {
    const state: State = this.getState(type)
    if (!state) return
    state.callbacks.forEach(cb => cb(...args))
  }

  $off(type: string, cb?: callback) {
    if (!cb) {
      delete this.list[type]
    } else {
      const cbs = this.list[type].callbacks
      this.list[type].callbacks = cbs.filter(callback => callback !== cb)
    }
  }

  $always(type: string, ...args: any[]) {
    const state: State = this.getState(type)
    if (!state) {
      this.list[type] = generateDefaultState()
      const state: State = this.getState(type)
      state.stalled = true
      state.args = args
      return
    }
    if (state.stalled) return
    state.callbacks.forEach(cb => cb(...args))
  }

  $once(type: string, cb: callback) {
    let called: boolean = false
    let fn = function(...args: any[]) {
      !called && cb(...args)
      called = true
    }
    this.$on(type, fn)
  }
}

const e = new YEvent()

export default e
