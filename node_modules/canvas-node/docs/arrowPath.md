# arrowPath

## Basic

* `<Path2D>`: used to draw the arrow shape on each line.

> The arrow needs to point to the right

You could set `arrowPath` in two ways.

One is to set when creating instance of `ArrowNode`.

```js
const ArrowNode = CanvasNode.ArrowNode
const line = new ArrowNode({
  arrowPath: new Path2D()
})
```

Another one is to register globally.

```js
CanvasNode.init({
  arrowPath: new Path2D()
})
```

## Priority

Instance > global > default

The default one is just a simple triangle.
