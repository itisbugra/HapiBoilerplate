'use strict'

const Code = require('code')   // assertion library
const expect = Code.expect

const Lab = require('lab')
const lab = exports.lab = Lab.script()

const server = require('index')
const Postgres = require('src/middleware/db')

var exampleRestaurant = null

lab.experiment('restaurants controller tests', () => {

  lab.beforeEach(done => {
    Postgres.connect(function (err, client, callback) {
      client.query(`TRUNCATE TABLE restaurants CASCADE`, null, function (err, result) {
        client.query(`INSERT INTO restaurants
                      (name, description) VALUES ($1, $2)
                      RETURNING *`,
                      ['testRestaurant', 'testDescription'],
                      function (err, result) {
          exampleRestaurant = result.rows[0]

          done()
        })
      })
    })
  })

  lab.test('lists all entries', (done) => {
    server.inject({
      method: 'GET',
      url: '/restaurants'
    }, function (response) {
      expect(response.statusCode).to.be.equal(200)
      expect(response.result).to.be.an.array()

      response.result.forEach(element => {
        expect(element).to.be.an.object()

        expect(element.id).to.exist()
        expect(element.name).to.exist()
        expect(element.description).to.exist()
        expect(element.inserted_at).to.exist()
      })

      done()
    })
  })

  lab.test('shows an entry', (done) => {

    server.inject({
      method: 'GET',
      url: '/restaurants/' + exampleRestaurant.id
    }, function (response) {
      expect(response.statusCode).to.be.equal(200)
      expect(response.result).to.be.an.object()

      const restaurant = response.result.restaurant

      done()
    })
  })

  lab.test('returns 404 when no entry exists with given identifier', done => {
    server.inject({
      method: 'GET',
      url: '/restaurants/-1'
    }, function (response) {
      expect(response.statusCode).to.be.equal(404)

      done()
    })
  })

  lab.test('create a new resource', done => {
    server.inject({
      method: 'POST',
      url: '/restaurants',
      payload: JSON.stringify({
        restaurant: {
          name: 'PaperMoon',
          description: 'Best quality food in Istanbul'
        }
      })
    }, function (response) {
      expect(response.statusCode).to.be.equal(201)
      expect(response.headers.location).to.match(new RegExp("\/restaurants\/[0-9]*"))

      done()
    })
  })

  lab.test('updates an existing resource', done => {
    server.inject({
      method: 'PUT',
      url: '/restaurants/' + exampleRestaurant.id,
      payload: JSON.stringify({
        restaurant: {
          name: 'HouseCafe',
          description: 'Second best quality food in Istanbul'
        }
      })
    }, function (response) {
      expect(response.statusCode).to.be.equal(204)
      Postgres.connect(function (err, client, callback) {
        client.query(`SELECT *
                      FROM restaurants
                      WHERE id = $1`,
                      [exampleRestaurant.id],
                      function (err, result) {
          callback()
          const restaurant = result.rows[0]

          expect(restaurant).to.be.an.object()

          expect(restaurant.name).to.be.equal('HouseCafe')
          expect(restaurant.description).to.be.equal('Second best quality food in Istanbul')

          done()
        })
      })
    })
  })

  lab.test('does not update anything if resource does not exist', done => {
    server.inject({
      method: 'PUT',
      url: '/restaurants/' + -1,
      payload: JSON.stringify({
        restaurant: {
          name: 'HouseCafe',
          description: 'Second best quality food in Istanbul'
        }
      })
    }, function (response) {
      expect(response.statusCode).to.be.equal(404)

      done()
    })
  })

  lab.test('deletes a resource', done => {
    server.inject({
      method: 'DELETE',
      url: '/restaurants/' + exampleRestaurant.id
    }, function (response) {
      expect(response.statusCode).to.be.equal(200)

      Postgres.connect(function (err, client, callback) {
        client.query(`SELECT *
                      FROM restaurants
                      WHERE id = $1`,
                      [exampleRestaurant.id],
                      function (err, result) {
          callback()

          expect(result.rowCount).to.be.equal(0)

          done()
        })
      })
    })
  })

  lab.test('does not delete anything and returns 404 if nothing exists with given identifier', done => {
    server.inject({
      method: 'DELETE',
      url: '/restaurants/' + -1
    }, function (response) {
      expect(response.statusCode).to.be.equal(404)

      done()
    })
  })
})
