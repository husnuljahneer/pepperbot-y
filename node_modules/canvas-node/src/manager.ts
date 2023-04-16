import { CanvasNode, Pos, UpdateLineCallback } from './node'
import { ArrowNode } from './arrow'
import { ARROW_H } from './helpers/drawArrow'
import { isBoolean, isNum } from './helpers/types'

export interface ManagerOption {
  canvas: HTMLCanvasElement
  updateLineCb?: UpdateLineCallback
  arrowPath?: Path2D & CanvasFillRule
  useCubicBezier?: boolean | null
  safePointOnLine?: boolean | null
  arrowH?: number | null
}

export class Manager {
  // size of canvas
  static size: Pos
  // context
  static ctx: CanvasRenderingContext2D
  // all CanvasNode instances
  static list: CanvasNode[] = []
  static canvas: HTMLCanvasElement
  static updateLineCb: UpdateLineCallback
  static arrowPath: Path2D & CanvasFillRule
  static useCubicBezier: boolean
  static safePointOnLine: boolean
  static arrowH: number

  static init(option: ManagerOption) {
    const {
      canvas,
      updateLineCb,
      arrowPath,
      useCubicBezier,
      safePointOnLine,
      arrowH
    } = option
    const size: Pos = {
      x: canvas.width,
      y: canvas.height
    }
    const ctx = canvas.getContext('2d')
    this.size = size
    this.ctx = ctx
    this.canvas = canvas
    this.updateLineCb = updateLineCb
    this.arrowPath = arrowPath
    this.useCubicBezier = isBoolean(useCubicBezier) ? useCubicBezier : false
    this.safePointOnLine = isBoolean(safePointOnLine) ? safePointOnLine : false
    this.arrowH = isNum(arrowH) ? arrowH : ARROW_H
  }

  static add(node: CanvasNode) {
    this.list.push(node)
  }

  static clean() {
    this.ctx.clearRect(0, 0, this.size.x, this.size.y)
  }

  // draw every thing
  static draw(cleanFirst: boolean = true) {
    cleanFirst && this.clean()
    this.ctx.save()
    this.list.forEach(node => node.$draw())
    this.ctx.restore()
  }

  // move one node
  static moveTo(target: CanvasNode, pos: Pos) {
    this.ctx.clearRect(0, 0, this.size.x, this.size.y)
    this.ctx.save()
    const isArrowNode: boolean = target instanceof ArrowNode
    type List = {
      line: ArrowNode[]
      box: CanvasNode[]
    }
    const list: List = this.list.reduce(
      (last: List, node) => {
        if (node instanceof ArrowNode) {
          last.line.push(node)
        } else {
          last.box.push(node)
        }
        return last
      },
      {
        line: [],
        box: []
      }
    )
    const updateBox = () => {
      list.box.forEach(node => {
        const $pos: Pos = node === target ? pos : node.pos
        node.$moveTo($pos)
      })
    }

    const updateLine = () => {
      list.line.forEach(line => {
        const $pos: Pos = line === target ? pos : line.endPos
        line.$moveTo($pos)
      })
    }
    if (isArrowNode) {
      updateLine()
      updateBox()
    } else {
      updateBox()
      updateLine()
    }
    this.ctx.restore()
  }

  // delete the specific node
  static deleteNode(target: CanvasNode) {
    const index: number = this.list.findIndex(node => node === target)
    this.list.splice(index, 1)
    // if the node has lines connect to it
    // then remove all those lines
    if (target.lines.length) {
      target.lines.filter(line => {
        // find the connected node the delete the line from it
        const connectedNode: CanvasNode =
          line.from === target ? line.to : line.from
        const index: number = connectedNode.lines.findIndex(
          $line => $line === line
        )
        connectedNode.lines.splice(index, 1)
        // delete the line from all
        this.list = this.list.filter(node => node !== line)
      })
    }
    // if it is a line
    // find its fromNode and toNode
    // delete the reference of the line from both nodes
    if (target instanceof ArrowNode) {
      this.deleteConnectedBox(target)
    }
  }

  static deleteConnectedBox(line: ArrowNode) {
    if (!line.to || !line.from) return
    const fromNode: CanvasNode = line.from
    const toNode: CanvasNode = line.to
    ;[fromNode, toNode].forEach(node => {
      node.lines = node.lines.filter(oldLine => oldLine !== line)
    })
  }

  static clear() {
    this.list.forEach(node => {
      node.destroy()
    })
    this.list = []
  }
}
