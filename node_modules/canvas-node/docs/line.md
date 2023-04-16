# class ArrowNode

ArrowNode inherit all methods from `CanvasNode`, and has some own ones.

## new ArrowNode(option)

* option `<object>`: almost the same as the one for `CanvasNode`, with two more optional fields:
  * [ratio] `<number>`: place where the arrow should be on the line
  * [arrowPath] `<Path2D>`: custom arrow shape. Should be pointing RIGHT.

## connect(from, to)

* from `<CanvasNode>`: from which `CanvasNode`.
* to `<CanvasNode>`: to which `CanvasNode`.

```js
line.connect(box1, box2)
```

> `connect` only save the reference of `from` and `to` to the line.\
> Visually, you need to set proper `pos` and call `moveTo` to actually 'connect' two box.

## abort()

Abort from the current connecting process.

```js
line.abort()
```

## endPos

* `<{x: number, y: number}>`: like `pos`, this is another property to define where to place the line.
  Updating `endPos` would effectively change the end point of the line.
  While updating `pos` would change the origin of the line.

## from

* `<CanvasNode>`: node which the line starts from.

## to

* `<CanvasNode>`: node which the line ends with.
