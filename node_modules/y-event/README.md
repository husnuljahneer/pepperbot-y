## Intro

A event system could emit first, register later.\
Or works as normal

## Installation

```bash
npm i -D y-event
# or
yarn add --dev y-event
```

## Usage

```js
import event from 'y-event'

// emit first, register later
event.$always('event1')
event.$on('event1', () => {
  console.log('event1 works') // event1 works
})

// normal use
event.$on('event2', (...args) => {
  console.log('event2', ...args)
})
event.$emit('event2', 1, 2, 3) // event2, 1, 2, 3

// off
event.$off('event2')
event.$emit('event2') // nothing happens

// invoke once
event.$once('event3', () => {
  console.log('event3')
})
event.$emit('event3') // 'event 3'
event.$emit('event3')
```

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2017-present, Yuchen Liu