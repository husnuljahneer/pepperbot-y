import e from '../lib/index.js'
// emit first
e.$always('test')
e.$on('test', msg => {
  console.log('test works', msg)
})
e.$emit('test', 'from emit')

// normal emit won't cause fire
e.$emit('test2')
e.$on('test2', () => {
  console.log('oops, test2 works, which is bad')
})

// args
e.$on('test3', (...args) => {
  console.log('test3 works', ...args)
})
e.$emit('test3', 1, 2, 3)

// off
e.$off('test3')
e.$emit('test3')

// off then emit more than once
e.$emit('test3')

// multi-on
e.$on('test4', (arg) => {
  console.log('test4 1', arg)
})
e.$on('test4', (arg) => {
  console.log('test4 2', arg)
})

e.$emit('test4', 'ok')

// once
e.$once('test5', () => {
  console.log('test 5, should only print once')
})
e.$emit('test5')
e.$emit('test5')