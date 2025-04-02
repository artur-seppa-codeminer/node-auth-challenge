import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as UsersController from '../../src/http/controllers/usersController.js';
import { UserModel } from '../../src/database/models/UsersModel.js';

vi.mock('../../src/database/models/UsersModel');

describe('usersController.destroy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete a user and redirect', async () => {
    const request = { params: { id: '1' } };
    const reply = { redirect: vi.fn() };

    (UserModel.query as any).mockReturnValue({
      findById: vi.fn().mockReturnValue({
        throwIfNotFound: vi.fn().mockReturnValue({
          delete: vi.fn().mockResolvedValue({}),
        }),
      }),
    });

    await UsersController.destroy(request as any, reply as any);

    expect(UserModel.query().findById).toHaveBeenCalledWith('1');
    expect(reply.redirect).toHaveBeenCalledWith('/users');
  });
});