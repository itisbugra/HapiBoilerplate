'use strict';

const Hapi = require('hapi');

const server = module.exports = new Hapi.Server();
server.connection({ port: 3000 });

const RestaurantRoutes = require('src/routes/restaurants_routes')

server.route(RestaurantRoutes)

/* $lab:coverage:off$ */
if (process.env.NODE_ENV !== 'test') {
  server.start((err) => {

      if (err) {
          throw err;
      }
      console.log(`Server running at: ${server.info.uri}`);
  });
}
/* $lab:coverage:on$ */
