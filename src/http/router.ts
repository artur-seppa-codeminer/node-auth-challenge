import plugin from 'fastify-plugin';
import * as DealershipController from './controllers/dealershipController.js';
import * as VehiclesController from './controllers/vehiclesController.js';
import * as UsersController from './controllers/usersController.js';
import * as loginController from './controllers/loginController.js';

const router = plugin(async (server, _) => {
  server.get('/', VehiclesController.index);

  server.get('/login', loginController.index);
  server.post('/login', loginController.login);
  server.register(async (protectedRoutes) => {
    protectedRoutes.addHook('onRequest', protectedRoutes.authenticate);

    protectedRoutes.get('/users', UsersController.index);
    protectedRoutes.get('/users/create', UsersController.create);
    protectedRoutes.post('/users', UsersController.store);
    protectedRoutes.get('/users/:id/edit', UsersController.edit);
    protectedRoutes.post('/users/:id', UsersController.update);
    protectedRoutes.get('/users/:id/delete', UsersController.destroy);

    protectedRoutes.get('/dealerships', DealershipController.index);
    protectedRoutes.get('/dealerships/create', DealershipController.create);
    protectedRoutes.post('/dealerships', DealershipController.store);
    protectedRoutes.get('/dealerships/:id/edit', DealershipController.edit);
    protectedRoutes.post('/dealerships/:id', DealershipController.update);
    protectedRoutes.get('/dealerships/:id/delete', DealershipController.destroy);

    protectedRoutes.get('/vehicles/create', VehiclesController.create);
    protectedRoutes.post('/vehicles', VehiclesController.store);
    protectedRoutes.get('/vehicles/:id/edit', VehiclesController.edit);
    protectedRoutes.post('/vehicles/:id', VehiclesController.update);
    protectedRoutes.get('/vehicles/:id/delete', VehiclesController.destroy);

    protectedRoutes.get('/logout', loginController.logout);
  }, { prefix: '' });
});

export { router };
