/* eslint-disable node/no-extraneous-require */
const extOs = require('yyl-os')
const path = require('path')

jest.setTimeout(30000)

test('case base test', async () => {
  await extOs.runSpawn('node ./run.js', path.join(__dirname, '../'))
})
