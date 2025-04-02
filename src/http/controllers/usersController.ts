import { handler } from '../../_lib/http/handler.js';
import { UserModel, UserRole } from '../../database/models/UsersModel.js';

interface UserRequest {
  name: string;
  email: string;
  password?: string;
  role: UserRole
  id?: number; 
}

const index = handler(async (request, reply) => {
  const users = await UserModel.query();

  return reply.view('users/index', { users });
});

const create = handler(async (request, reply) => {
  return reply.view('users/create', { user: new UserModel() });
});

const store = handler<{ Body: UserRequest }>(async (request, reply) => {
  const { name, email, password, role } = request.body;

  if (!name || !password || !email || !role) {
    throw new Error('all fields are required');
  }

  try {
    await UserModel.query().insert({
      name,
      email,
      password,
      role
    });

    return reply.redirect(`/users`);
  } catch (error) {
    console.error(error);
    return reply.view('users/create', { user: new UserModel().$set({ name, email, password, role }) });
  }
});

// const edit = handler<{ Params: { id: string } }>(async (request, reply) => {
//   const dealership = await DealershipModel.query().findById(request.params.id).throwIfNotFound();

//   return reply.view('dealerships/update', { dealership });
// });

// const update = handler<{
//   Params: { id: string };
//   Body: { name: string };
// }>(async (request, reply) => {
//   const dealership = await DealershipModel.query().findById(request.params.id).throwIfNotFound();
//   const { name } = request.body;
//   const newDealership = dealership.$set({ name });

//   try {
//     await newDealership.$query().update();

//     return reply.redirect(`/dealerships`);
//   } catch (error) {
//     console.error(error);
//     return reply.view('dealerships/update', { dealership: newDealership });
//   }
// });

// const destroy = handler<{ Params: { id: string } }>(async (request, reply) => {
//   try {
//     await DealershipModel.query().findById(request.params.id).throwIfNotFound().delete();

//     return reply.redirect(`/dealerships`);
//   } catch (error) {
//     console.error(error);
//     return reply.redirect('/dealerships');
//   }
// });

export { index, create, store };
