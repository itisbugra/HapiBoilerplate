'use strict'

const pg = require('pg')

/* $lab:coverage:off$ */
module.internals = {}

if (process.env.NODE_ENV === 'dev') {
  module.internals.config = {
    user: 'main',
    database: 'ali_deneme_dev',
    password: 'kuz60TOL12',
    host: 'localhost',
    port: 5432,
    max: 10
  }
} else if (process.env.NODE_ENV === 'test') {
  module.internals.config = {
    user: 'main',
    database: 'ali_deneme_test',
    password: 'kuz60TOL12',
    host: 'localhost',
    port: 5432,
    max: 10
  }
}
/* $lab:coverage:on$ */

const pool = module.exports = new pg.Pool(module.internals.config)

/* $lab:coverage:off$ */
pool.on('error', function (err, client) {
  console.error('idle client error', err.message, err.stack)
})
/* $lab:coverage:on$ */
