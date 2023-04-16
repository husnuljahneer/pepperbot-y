import { CanvasNode, CanvasNodeOption } from './node'

export interface MenuOption extends CanvasNodeOption {
  data: {
    node: CanvasNode
  }
  path: Path2D
}

export class Menu extends CanvasNode {
  constructor(option: MenuOption) {
    super(option)
  }
}
