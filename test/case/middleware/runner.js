const init = require('./compiler')

init().then(({app, compiler}) => {
  app.listen(5000)
})