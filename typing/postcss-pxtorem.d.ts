declare module 'postcss-px2rem' {
  interface Px2remOption {
    remUnit: number
  }
  type Px2rem = (op: Px2remOption) => any
  const px2rem: Px2rem
  export = px2rem
}
