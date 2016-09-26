'use strict'

const Postgres = require('src/middleware/db')
const Boom = require('boom')
const Hoek = require('hoek')

module.exports = {
  list: function (request, reply) {
    Postgres.connect(function (err, client, callback) {
      Hoek.assert(!err, err)

      client.query('SELECT * FROM restaurants', [], function (err, result) {
        Hoek.assert(!err, err)

        reply(result.rows)
        callback()
      })
    })
  },

  show: function (request, reply) {
    //  Fetch a client from node-postgres connection pool
    Postgres.connect(function (err, client, callback) {
      //  If some error occurred, log the error
      Hoek.assert(!err, err)

      //  Perform an SQL query
      client.query(`SELECT *
                    FROM restaurants
                    WHERE id = $1`, [request.params.id], function (err, result) {
        //  Release the pool connection
        callback()

        //  If some error occurred, propagate it again
        Hoek.assert(!err, err)

        //  Check if there is a row provided in SQL query result, return 404 if nothing has come
        if (result.rows[0]) return reply(result.rows[0])
        else return reply(Boom.notFound())
      })
    })
  },

  create: function (request, reply) {
    Postgres.connect(function (err, client, callback) {
      Hoek.assert(!err, err)

      const restaurant = request.payload.restaurant

      client.query(`INSERT INTO restaurants
                    (name, description) VALUES ($1, $2)
                    RETURNING id`,
                    [restaurant.name, restaurant.description],
                    function (err, result) {
        callback()

        Hoek.assert(!err, err)

        //  Having checked the affected row count, return the location of the new entity in
        //  the location header and return 201 (Created).
        Hoek.assert(result.rowCount == 1, 'Expected to instert and entity but non instead')
        return reply().location('/restaurants/' + result.rows[0]).code(201)
      })
    })
  },

  update: function (request, reply) {
    Postgres.connect(function (err, client, callback) {
      Hoek.assert(!err, err)

      const restaurant = request.payload.restaurant

      client.query(`UPDATE restaurants
                    SET (name, description) = ($1, $2)
                    WHERE id = $3`,
                    [restaurant.name, restaurant.description, request.params.id],
                    function (err, result) {
        callback()
        Hoek.assert(!err, err)

        if (result.rowCount == 1) return reply().code(204)
        else return reply(Boom.notFound())
      })
    })
  },

  remove: function (request, reply) {
    Postgres.connect(function (err, client, callback) {
      Hoek.assert(!err, err)

      client.query(`DELETE FROM restaurants
                    WHERE id = $1`,
                    [request.params.id],
                    function (err, result) {
        callback()
        Hoek.assert(!err, err)

        if (result.rowCount == 1) return reply()
        else return reply(Boom.notFound())
      })
    })
  }
}
