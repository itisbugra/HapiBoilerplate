'use strict'

const RestaurantsController = require('src/controllers/restaurants_controller')

module.exports = [
  {
    method: 'GET',
    path: '/restaurants',
    handler: RestaurantsController.list
  },

  {
    method: 'GET',
    path: '/restaurants/{id}',
    handler: RestaurantsController.show
  },

  {
    method: 'POST',
    path: '/restaurants',
    handler: RestaurantsController.create
  },

  {
    method: 'PUT',
    path: '/restaurants/{id}',
    handler: RestaurantsController.update
  },

  {
    method: 'DELETE',
    path: '/restaurants/{id}',
    handler: RestaurantsController.remove
  }
]
