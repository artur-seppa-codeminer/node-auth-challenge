import { describe, it, expect, vi, beforeEach } from 'vitest';
import  * as UsersController from '../../src/http/controllers/usersController.js';
import { UserModel, UserRole } from '../../src/database/models/UsersModel.js';
import { DealershipModel } from '../../src/database/models/DealershipModel.js';

vi.mock('../../src/database/models/UsersModel');
vi.mock('../../src/database/models/DealershipModel');

describe('usersController.store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw an error if required fields are missing', async () => {
    const request = {
      body: { name: '', email: '', password: '', role: '' },
    };
    const reply = { redirect: vi.fn(), view: vi.fn() };

    await expect(UsersController.store(request as any, reply as any)).rejects.toThrow(
      'all fields are required'
    );
  });

  it('should throw an error if role is DEALERSHIP and dealershipId is missing', async () => {
    const request = {
      body: { name: 'John', email: 'john@example.com', password: '123456', role: UserRole.DEALERSHIP, dealershipId: null },
    };
    const reply = { redirect: vi.fn(), view: vi.fn() };

    await expect(UsersController.store(request as any, reply as any)).rejects.toThrow(
      'Dealership ID is required for dealership users'
    );
  });

  it('should throw an error if role is ADMIN and dealershipId is provided', async () => {
    const request = {
      body: { name: 'John', email: 'john@example.com', password: '123456', role: UserRole.ADMIN, dealershipId: '1' },
    };
    const reply = { redirect: vi.fn(), view: vi.fn() };

    await expect(UsersController.store(request as any, reply as any)).rejects.toThrow(
      'Admin users cannot be associated with a dealership'
    );
  });

  it('should insert a new user into the database', async () => {
    const request = {
      body: { name: 'John', email: 'john@example.com', password: '123456', role: UserRole.ADMIN, dealershipId: null },
    };
    const reply = { redirect: vi.fn(), view: vi.fn() };

    (UserModel.query as any).mockReturnValue({
      insert: vi.fn().mockResolvedValue({}),
    });

    await UsersController.store(request as any, reply as any);

    expect(UserModel.query().insert).toHaveBeenCalledWith({
      name: 'John',
      email: 'john@example.com',
      password: '123456',
      role: UserRole.ADMIN,
      dealershipId: null,
    });
    expect(reply.redirect).toHaveBeenCalledWith('/users');
  });
});