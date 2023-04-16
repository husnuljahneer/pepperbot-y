# API

> `CanvasNode` means two thing in this doc.
> One is the exposed object with all the methods described below.
> Another one is internal class, definition of which can be found [here](./canvasNode.md).
> Should be easy to tell which is which based on the context.
>
> And here you can find out what is [`ArrowNode`](./line.md)

## CanvasNode.init(option)

* option `<object>`
  * canvas `<HTMLCanvasElement>`
  * [updateLineCb] `<function(box, line, isFrom)>`: define how to place the connecting line between two boxes.
    Details could be found [here](./updateLineCb.md).
  * [arrowPath] `<Path2D>`: path for arrow on line. Details could be found [here](./arrowPath.md)
  * [arrowH] `<number>`: when use custom `arrowPath` above, should provide with this as well. Stands for the height of the arrow shape.
  * [useCubicBezier] `<boolean>`: default to `false` and use quadratic Bezier curves.
  * [safePointOnLine] `<boolean>`: use old-fashioned point-to-point process to detect whether a point is on a specific line.
    Default to `false`, and use binary search, WHICH COULD CAUSE PROBLEMS WITHOUT CAUTION.

```js
CanvasNode.init({
  canvas: canvasDom
})
```

## CanvasNode.drawBox(option)

Internally, just call:

```js
new CanvasNode.CanvasNode(option)
```

* option `<object>`
  * name `<string>`: name of the instance.
  * pos `<object>`: starting point of the box. In form of `{x: number, y: number}`.
  * path `<Path2D>`: path for the box.
  * rawVertexes `<number[]>`: [x, y, width, height] of the box. More likely should be [0, 0, width, height].
  * [text] `<string>`: text to show.
  * [color] `<string>`: color of the text
  * [data] `<any>`: any thing to bind with the box.
  * [style] `<string>`: fill style of the box.
  * [strokeStyle] `<string>`: stroke style of the box.
  * [lineWidth] `<number>`: width of stoke line.
  * [font] `<string>`: font style of the text.
  * [beforeDrawCbs] `<function[]>`: custom callback for extra drawing. Execute before all default drawing process.
  * [drawCbs] `<function[]>`: custom callback for extra drawing. Execute after all default drawing process.
  * [updateLineCb] `<function(box, line, isFrom)>`: see [here](./updateLineCb.md)

return `<CanvasNode>`

## CanvasNode.drawLine(from [, to])

* from `<object>`: starting point in form of `{x: number, y: number}`.
* [to] `<object>`: ending point.

return `<ArrowNode>`

## CanvasNode.connect(line, fromBox, toBox)

* line `<ArrowNode>`
* fromBox `<CanvasNode>`
* toBox `<CanvasNode>`

## CanvasNode.addEvent(type, cb)

* type `<string>`: type of event to be listened to. Type name just like the native ones, like `click` etc.
* cb `<function(event, node)>`: handler function.
  * event `<Event>`: the native event object.
  * node `<CanvasNode>`: the target node that such event happening on.

```js
CanvasNode.addEvent('mouseover', (e, node) => {
  console.log(e, node) // when the cursor is over the node, this will execute
})
```

## CanvasNode.removeEvent(type)

* type `<string>`: type of event wish to stop listening to.

## CanvasNode.nativeAddEvent(el, type, handler)

* el `<HTMLElement>`: delegating element.
* type `<string>`: type of native event to listen to.
* handler `<function(event)>`: event handler.

## CanvasNode.nativeRemoveEvent(el, type [, handler])

* el `<HTMLElement>`: delegating element.
* type `<string>`: type of native event wish to stop listening to.
* [handler] `<function(event)>`: specific handler to be removed. If not provided, all handlers registered by `CanvasNode.nativeAddEvent` for such type of event will be removed.

## CanvasNode.getClickedLine(position)

* position `<object>`: clicked position in form of `{x: number, y: number}`.

return `ArrowNode`

## CanvasNode.getClickedNode(position)

* position `<object>`: clicked position in form of `{x: number, y: number}`.

return `CanvasNode`

## CanvasNode.getClickedBox(position)

* position `<object>`: clicked position in form of `{x: number, y: number}`.

return `CanvasNode` but exclude `ArrowNode`

## CanvasNode.centralizePoint(node)

* node `<CanvasNode>`: the center point of which will be returned.

return `{x: number, y: number}`

## CanvasNode.placePointOnEdge(startPos, endPos, node [, isStart])

* startPos `<object>`: start point position.
* endPos `<object>`: end point position.
* node `<CanvasNode>`: of which the point will be placed on.
* [isStart]: if the point is starting point, default `true`.

## CanvasNode.isConnected(node1, node2)

* node1 `<CanvasNode>`
* node2 `<CanvasNode>`

return `<boolean>`

## CanvasNode.isConnectedSeq(node1, node2[, isFromFirst])

* node1 `<CanvasNode>`
* node2 `<CanvasNode>`
* [isFromFirst] `<boolean>`: whether `node1` is the starting node, default to `true`

return `<boolean>`

> The difference between `isConnected` and `isConnectedSeq` is that
> `isConnectedSeq` takes sequence into account. In other words, which one of the nodes is
> the starting one matters.

## CanvasNode.clear()

Destroy all instances

## CanvasNode.ArrowNode

return the class of [`ArrowNode`](./line.md).

## CanvasNode.Menu

return the class of `Menu`, which is just a subclass of [`CanvasNode`](./canvasNode.md).

## CanvasNode.Node

return the class of [`CanvasNode`](./canvasNode.md).

## CanvasNode.all

return all the instances of `CanvasNode`.

## CanvasNode.lines

return all the instances of `ArrowNode`.

## CanvasNode.menus

return all the instances of `Menu`
