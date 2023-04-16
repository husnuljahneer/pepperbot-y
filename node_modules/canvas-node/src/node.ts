import { Manager } from './manager'
import { getVertexesForRect } from './helpers/getVertexes'
import { ArrowNode } from './arrow'
import { centralizePoint } from './helpers/drawArrow'
import { listenToNodeEvent, removeNodeEvent } from './helpers/nativeToNodeEvent'
import { Batch } from './helpers/batch'
import { tagFn } from './helpers/tagFn'
import { isFn } from './helpers/types'

export interface Pos {
  x: number
  y: number
}

export type x = number
export type y = number
export type width = number
export type height = number
export type RawVertexes = [x, y, width, height]

export type Callback = (node: CanvasNode) => any
export type NodeEventCallback = (e: Event, node: CanvasNode) => any
export type UpdateLineCallback = (
  node: CanvasNode,
  line: ArrowNode,
  isFrom: boolean
) => Pos
export type WatchCallback = <T extends keyof CanvasNode>(
  newVal: CanvasNode[T],
  oldVal: CanvasNode[T]
) => any

export interface CanvasNodeOption {
  name: string
  path?: Path2D
  pos: Pos
  ctx?: CanvasRenderingContext2D
  data?: any
  size?: Pos
  style?: string
  strokeStyle?: string
  color?: string
  font?: string
  text?: string
  lineWidth?: number
  drawCbs?: Callback[]
  beforeDrawCbs?: Callback[]
  rawVertexes?: RawVertexes
  updateLineCb?: UpdateLineCallback
}

function defaultData() {
  return {
    font: '14px Arial',
    style: '#fff',
    strokeStyle: '#000',
    color: '#000',
    data: {},
    display: true,
    exist: true,
    lineWidth: 2
  }
}

export class CanvasNode implements CanvasNodeOption {
  name: string
  path?: Path2D
  pos: Pos
  ctx: CanvasRenderingContext2D
  data: any
  font?: string
  size: Pos
  style: string
  strokeStyle: string
  lineWidth: number
  color: string
  text: string
  display: boolean
  exist: boolean
  drawCbs: Callback[] = []
  beforeDrawCbs: Callback[] = []
  rawVertexes: RawVertexes
  lines: ArrowNode[] = []
  updateLineCb: UpdateLineCallback

  // properties to proxied
  private autoUpdateFields: string[] = [
    'font',
    'size',
    'style',
    'strokeStyle',
    'color',
    'text',
    'pos',
    'endPos',
    'display',
    'exist',
    'lineWidth'
  ]

  private hoverInCb: NodeEventCallback[] = []
  private hoverOutCb: NodeEventCallback[] = []
  private clickCb: NodeEventCallback[] = []
  private watchList: {
    [name: string]: WatchCallback[]
  } = {}

  constructor(option: CanvasNodeOption) {
    this.proxy()
    Object.assign(this, defaultData(), option, {
      ctx: Manager.ctx,
      size: Manager.size
    })
    // go to the initial position
    this.$moveTo(this.pos)
    // add instance to Manager to monitor
    Manager.add(this)
  }

  proxy() {
    this.autoUpdateFields.forEach(key => {
      Object.defineProperty(this, key, {
        get() {
          return this['$' + key]
        },
        set(val) {
          const oldVal: any = this['$' + key]
          this['$' + key] = val
          // run watch function
          const watchList = this.watchList[key]
          if (watchList) {
            watchList.forEach(cb => cb(val, oldVal))
          }
          if (val === oldVal) return
          // auto update view
          Batch.add(() => {
            this.draw()
          }, this)
        }
      })
    })
  }

  get vertexes(): number[] {
    // since the node could move around
    // every time it moves, the coordinate of its upper-left point will change
    // the input of getVertexesForRect need to always use the real coordinate of the node's upper-left
    if (!this.rawVertexes) return
    // x, y, w, h
    const rawData: number[] = this.rawVertexes.map(
      (vertex: number, i: number) => {
        const pos: string = i === 0 ? 'x' : i === 1 ? 'y' : 'z'
        return i < 2 ? vertex + this.pos[pos] : vertex
      }
    )
    return getVertexesForRect(rawData)
  }

  moveTo(pos: Pos) {
    Manager.moveTo(this, pos)
  }

  $moveTo(pos: Pos) {
    this.updatePos(pos)
    // so the line will be redrew with new from and to positions
    // tricky point is, every line is drew after node, so it will be updated later then its from and to node
    this.updateLinePos()
  }

  $draw() {
    // to enable show/hide functionality
    if (!this.display) return
    // set lineWidth globally
    this.ctx.lineWidth = this.lineWidth
    // custom callback
    this.invokeDrawCbAbs('beforeDrawCbs')
    // start default draw
    this.ctx.save()
    // move to the desired position
    this.ctx.translate(this.pos.x, this.pos.y)
    // draw border
    this.drawBorder()
    // fill color
    this.fill()
    // fill text
    this.fillText()
    this.ctx.restore()
    // end default draw
    // custom callback
    this.invokeDrawCbAbs('drawCbs')
  }

  draw(cleanFirst: boolean = true) {
    Manager.draw(cleanFirst)
  }

  updatePos(pos: Pos) {
    this.pos = pos
  }

  // use Decorator instead
  drawBorder() {
    if (!this.path) return
    this.ctx.strokeStyle = this.strokeStyle
    this.ctx.stroke(this.path)
  }

  fill() {
    if (!this.path) return
    this.ctx.fillStyle = this.style
    this.ctx.fill(<any>this.path)
  }

  fillText(text: string = this.text) {
    if (!this.path) return
    const $text = typeof text === 'string' ? text : this.text
    const [width, height] = this.rawVertexes.slice(2)
    // make the text display in the center of box
    this.ctx.font = this.font
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.save()
    this.ctx.translate(width / 2, height / 2)
    this.ctx.fillStyle = this.color || '#000'
    this.ctx.fillText($text, 0, 0)
    this.updateText($text)
    this.ctx.restore()
  }

  updateText(text: string) {
    this.text = text
  }

  invokeDrawCbAbs(type: 'drawCbs' | 'beforeDrawCbs'): void {
    this[type].forEach(cb => {
      this.ctx.save()
      cb(this)
      this.ctx.restore()
    })
  }

  addLine(line: ArrowNode) {
    this.lines.push(line)
  }

  /**
   * there is a priority tree here
   * own > Manager > default
   */
  updateLinePos() {
    this.lines.forEach(line => {
      switch (this) {
        case line.from:
          line.pos = isFn(this.updateLineCb)
            ? this.updateLineCb(this, line, true)
            : isFn(Manager.updateLineCb)
              ? Manager.updateLineCb(this, line, true)
              : centralizePoint(this)
          break
        case line.to:
          line.endPos = isFn(this.updateLineCb)
            ? this.updateLineCb(this, line, false)
            : isFn(Manager.updateLineCb)
              ? Manager.updateLineCb(this, line, false)
              : centralizePoint(this)
          break
      }
    })
  }

  remove(node?: CanvasNode) {
    if (node && node instanceof CanvasNode) {
      node.destroy()
    }
    this.destroy()
  }

  $remove() {
    Manager.deleteNode(this)
    this.exist = false
  }

  forEach(fn: (node: CanvasNode, i: number, list: CanvasNode[]) => any) {
    Manager.list.forEach(fn)
  }

  addDrawCb(cb: Callback) {
    this.drawCbs.push(cb)
  }

  addBeforeDrawCb(cb: Callback) {
    this.beforeDrawCbs.push(cb)
  }

  hover(inCb: NodeEventCallback, outCb?: NodeEventCallback) {
    const $inCb = (e, node) => {
      if (node !== this) return
      inCb(e, node)
    }
    tagFn($inCb)
    listenToNodeEvent('mousemove', $inCb)
    this.hoverInCb.push($inCb)
    if (!outCb) return
    const $outCb = (e, node) => {
      if (node !== this) return
      outCb(e, node)
    }
    tagFn($outCb)
    listenToNodeEvent('mouseout', $outCb)
    this.hoverOutCb.push($outCb)
  }

  click(clickCb: NodeEventCallback) {
    const $clickCb = (e, node) => {
      if (node !== this) return
      clickCb(e, node)
    }
    tagFn($clickCb)
    listenToNodeEvent('click', $clickCb)
    this.clickCb.push($clickCb)
  }

  hide() {
    this.display = false
  }

  show() {
    this.display = true
  }

  watch<T extends keyof this>(key: T, cb: WatchCallback) {
    if (!this.watchList[key]) {
      this.watchList[key] = []
    }
    this.watchList[key].push(cb)
  }

  destroy() {
    this.$remove()
    this.hoverInCb.forEach(cb => {
      removeNodeEvent('mousemove', cb)
    })
    this.hoverOutCb.forEach(cb => {
      removeNodeEvent('mouseout', cb)
    })
    this.clickCb.forEach(cb => {
      removeNodeEvent('click', cb)
    })
  }
}
