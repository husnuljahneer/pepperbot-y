# updateLineCb

This function is used to define how to place the line connecting two boxes.

## Basic

* `<function(box, line, isFrom)>`: needs to return the new position in form of
  `{x: number, y: number}`.
  * box `<CanvasNode>`: the box that is being moved around.
    Could be the start point of the line as well as the end point.
  * line `<ArrowNode>`: the line that is being placed
  * isFrom `<boolean>`: whether the box being moved is the start point of the line

> Need to return an object in form of `{x: number, y: number}` to define
> the new position of the start/end point of line.
>
> Extra information could be found from `line` itself.
> `line.from` is the starting box and `line.to` is the ending one.

There are two ways to register `updateLineCb`.

First one is to register globally.

```js
CanvasNode.init({
  updateLineCb() {
    return {
      x: 0,
      y: 0
    }
  }
})
```

Another one is to register for each instance.

```js
const box = CanvasNode.drawBox({
  updateLineCb() {
    return {
      x: 0,
      y: 0
    }
  }
})
```

## Priority

Instance > global > default

Default one is to place the start/end point at the center of each box.
