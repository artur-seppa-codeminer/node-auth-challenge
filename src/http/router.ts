import plugin from 'fastify-plugin';
import * as DealershipController from './controllers/dealershipController.js';
import * as VehiclesController from './controllers/vehiclesController.js';
import * as UsersController from './controllers/usersController.js';

const router = plugin(async (server, _) => {
  server.get('/users', UsersController.index);
  server.get('/users/create', UsersController.create);
  server.post('/users', UsersController.store);
  server.get('/users/:id/edit', UsersController.edit);
  server.post('/users/:id', UsersController.update);
  server.get('/users/:id/delete', UsersController.destroy);

  server.get('/dealerships', DealershipController.index);
  server.get('/dealerships/create', DealershipController.create);
  server.post('/dealerships', DealershipController.store);
  server.get('/dealerships/:id/edit', DealershipController.edit);
  server.post('/dealerships/:id', DealershipController.update);
  server.get('/dealerships/:id/delete', DealershipController.destroy);

  server.get('/vehicles', VehiclesController.index);
  server.get('/vehicles/create', VehiclesController.create);
  server.post('/vehicles', VehiclesController.store);
  server.get('/vehicles/:id/edit', VehiclesController.edit);
  server.post('/vehicles/:id', VehiclesController.update);
  server.get('/vehicles/:id/delete', VehiclesController.destroy);
});

export { router };
