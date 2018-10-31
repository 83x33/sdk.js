// import butternut from 'rollup-plugin-butternut'
import { terser } from "rollup-plugin-terser"

export default {
  input: 'src/index.js',
  external: ['axios', 'socket.io-client'],
  output: {
    file: 'dist/sdk.umd.js',
    format: 'umd',
    name: 'sdk33'
  },
  plugins: [ terser() ]
}