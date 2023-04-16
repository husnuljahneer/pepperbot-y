## Intro

Try to use object to represent canvas drawing.

Still under development

## Usage

A basic one would be:

```js
import CanvasNode from 'canvas-node'

const canvas = document.getElementById('canvas')
CanvasNode.init({canvas})
const vertexes = [0, 0, 50, 50]
const path = new Path2D()
path.rect(...vertexes)
const box = CanvasNode.drawBox({
    rawVertexes: vertexes,
    name: 'box',
    text: 'box',
    path,
    style: '#58a',
    strokeStyle: '#fff',
    pos: {x: 50, y: 50}
})

setTimeout(() => {
  box.moveTo({x: 100, y: 100})
}, 1000)
```

## API

API documents can be found [here](./docs/static.md)

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2017-present, Yuchen Liu