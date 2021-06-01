import '@babel/polyfill'
import React from 'react'
import ReactDom from 'react-dom'
import axios from 'axios'

import './third.scss'

declare global {
  interface Window {
    [key: string]: any
  }
}

const App = (
  <div>third Page</div>
)

ReactDom.render(App, document.getElementById('app'))
