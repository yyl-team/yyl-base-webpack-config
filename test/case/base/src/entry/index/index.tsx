import '@babel/polyfill'
import React from 'react'
import ReactDom from 'react-dom'
import { HashRouter as Router, Route, Switch, Redirect } from 'react-router-dom'
import axios from 'axios'

import './index.scss'
import { routes } from '~/routes/index'

const App = (
  <Router>
    <Switch>
      {routes.map((item, index) => {
        return <Route exact={true} path={item.path} component={item.component} key={index} />
      })}
      <Redirect from='/' to={routes[0].path} />
    </Switch>
  </Router>
)

axios.get('//9u9ntpb8xp.api.quickmocker.com/getter-test').then((rs) => {
  console.log(rs)
})

ReactDom.render(App, document.getElementById('app'))
