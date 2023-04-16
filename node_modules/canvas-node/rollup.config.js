const ts = require('rollup-plugin-typescript2')
const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
module.exports = {
  input: 'src/index.ts',
  plugins: [
    resolve({
      browser: true
    }),
    commonjs(),
    ts()
  ],
  output: {
    file: 'index.js',
    format: 'umd',
    name: 'CanvasNode'
  }
}