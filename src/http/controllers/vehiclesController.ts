import { handler } from '../../_lib/http/handler.js';
import { VehicleModel } from '../../database/models/VehicleModel.js';
import { UserModel } from '../../database/models/UsersModel.js';

interface VehiclesRequest {
  name: string,
  brand: string,
  model: string,
  year: string,
  comments: string,
  userId: number
}

const index = handler(async (request, reply) => {
  const vehicles = await VehicleModel.query();

  return reply.view('vehicles/index', { vehicles });
});

const create = handler(async (request, reply) => {
  return reply.view('vehicles/create', { vehicle: new VehicleModel(), currentUser: request.user });
});

const store = handler<{ Body: VehiclesRequest }>(async (request, reply) => {
  const { name, brand, model, year, comments, userId } = request.body;

  if (!name || !brand || !model || !year || !comments || !userId) {
    throw new Error('All fields are required');
  }

  const user = await UserModel.query().findById(userId).withGraphFetched('dealership');

  if (!user || !user.dealershipId) {
    throw new Error('Users without dealership cannot be associated with a veihicle');
  }

  try {
    await VehicleModel.query().insert({ name, brand, model, year, comments, dealershipId: Number(user.dealershipId) });
    return reply.redirect(`/`);
  } catch (error) {
    console.error(error);
    return reply.view('vehicles/create', { vehicle: new VehicleModel().$set({ name, brand, model, year, comments, dealershipId: Number(user.dealershipId) }), currentUser: request.user });
  }
});

const edit = handler<{ Params: { id: string } }>(async (request, reply) => {
  const vehicle = await VehicleModel.query().findById(request.params.id).throwIfNotFound();

  return reply.view('vehicles/update', { vehicle, currentUser: request.user });
});

const update = handler<{
  Params: { id: string };
  Body: { name: string, brand: string, model: string, year: string, comments: string, dealershipId: number };
}>(async (request, reply) => {
  const vehicle = await VehicleModel.query().findById(request.params.id).throwIfNotFound();
  const { name, brand, model, year, comments, dealershipId } = request.body;
  const newVehicle = vehicle.$set({ name, brand, model, year, comments, dealershipId });

  try {
    await newVehicle.$query().update();

    return reply.redirect(`/`);
  } catch (error) {
    console.error(error);
    return reply.view('vehicles/update', { vehicle: newVehicle, currentUser: request.user });
  }
});

const destroy = handler<{ Params: { id: string } }>(async (request, reply) => {
  try {
    await VehicleModel.query().findById(request.params.id).throwIfNotFound().delete();

    return reply.redirect(`/`);
  } catch (error) {
    console.error(error);
    return reply.redirect('/');
  }
});

export { index, create, store, edit, update, destroy };
