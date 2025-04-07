import { handler } from '../../_lib/http/handler.js';
import { UserModel, UserRole } from '../../database/models/UsersModel.js';
import { DealershipModel } from '../../database/models/DealershipModel.js'; 
import bcrypt from 'bcrypt';

interface UserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  dealershipId: string | null;
  id?: number; 
}

const index = handler(async (request, reply) => {
  const users = await UserModel.query();

  return reply.view('users/index', { users, currentUser: request.user });
});

const create = handler(async (request, reply) => {
  const dealerships = await DealershipModel.query();
  return reply.view('users/create', { user: new UserModel(), dealerships, currentUser: request.user });
});

const store = handler<{ Body: UserRequest }>(async (request, reply) => {
  const { name, email, password, role, dealershipId  } = request.body;

  if (!name || !password || !email || !role) {
    throw new Error('all fields are required');
  }

  if (role === UserRole.DEALERSHIP && !dealershipId) {
    throw new Error('Dealership ID is required for dealership users');
  }

  if (role === UserRole.ADMIN && dealershipId) {
    throw new Error('Admin users cannot be associated with a dealership');
  }

  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await UserModel.query().insert({
      name,
      email,
      password: hashedPassword,
      role,
      dealershipId: dealershipId ? parseInt(dealershipId) : null,
    });

    return reply.redirect(`/users`);
  } catch (error) {
    console.error(error);
    return reply.view('users/create', { user: new UserModel().$set({ name, email, password, role }), dealerships: await DealershipModel.query(), currentUser: request.user });
  }
});

const edit = handler<{ Params: { id: string } }>(async (request, reply) => {
  const user = await UserModel.query().findById(request.params.id).throwIfNotFound();

  return reply.view('users/update', { user, dealerships: await DealershipModel.query(), currentUser: request.user });
});

const update = handler<{
  Params: { id: string };
  Body: UserRequest;
}>(async (request, reply) => {
  const user = await UserModel.query().findById(request.params.id).throwIfNotFound();
  const { name, email, password, role, dealershipId  }  = request.body;
  const newUser = user.$set({ name, email, password, role, dealershipId: dealershipId ? parseInt(dealershipId) : null });

  try {
    await newUser.$query().update();

    return reply.redirect(`/users`);
  } catch (error) {
    console.error(error);
    return reply.view('users/update', { user: newUser, dealerships: await DealershipModel.query(), currentUser: request.user });
  }
});

const destroy = handler<{ Params: { id: string } }>(async (request, reply) => {
  try {
    await UserModel.query().findById(request.params.id).throwIfNotFound().delete();

    return reply.redirect(`/users`);
  } catch (error) {
    console.error(error);
    return reply.redirect('/users');
  }
});

export { index, create, store, edit, update, destroy };
