import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as LoginController from '../../src/http/controllers/loginController.js';
import { UserModel } from '../../src/database/models/UsersModel.js';
import bcrypt from 'bcrypt';

vi.mock('../../src/database/models/UsersModel');
vi.mock('bcrypt');

describe('LoginController.authenticate', () => {
  const mockValidUser = {
    id: 1,
    email: 'valid@example.com',
    password: 'correct_hashed_password',
    name: 'Valid User',
    role: 'user'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(bcrypt.compare).mockImplementation(async (plain, hashed) => {
      return plain === 'correct_password' && hashed === 'correct_hashed_password';
    });
  });

  it('should authenticate successfully with valid credentials', async () => {
    (UserModel.query as any).mockReturnValue({
      findOne: vi.fn().mockResolvedValue(mockValidUser)
    });

    const result = await LoginController.authenticate('valid@example.com', 'correct_password');

    expect(result).toEqual({
      success: true,
      user: {
        id: 1,
        email: 'valid@example.com',
        name: 'Valid User',
        role: 'user'
      }
    });
    
    expect(UserModel.query().findOne).toHaveBeenCalledWith({ email: 'valid@example.com' });
    expect(bcrypt.compare).toHaveBeenCalledWith('correct_password', 'correct_hashed_password');
  });

  it('should fail when user is not found', async () => {
    (UserModel.query as any).mockReturnValue({
      findOne: vi.fn().mockResolvedValue(null)
    });

    const result = await LoginController.authenticate('nonexistent@example.com', 'any_password');

    expect(result).toEqual({
      success: false,
      message: 'User not found with the provided email'
    });
    
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it('should fail when password is incorrect', async () => {
    (UserModel.query as any).mockReturnValue({
      findOne: vi.fn().mockResolvedValue(mockValidUser)
    });

    const result = await LoginController.authenticate('valid@example.com', 'wrong_password');

    expect(result).toEqual({
      success: false,
      message: 'Invalid password'
    });
    
    expect(bcrypt.compare).toHaveBeenCalledWith('wrong_password', 'correct_hashed_password');
  });

  it('should handle database errors gracefully', async () => {
    (UserModel.query as any).mockReturnValue({
      findOne: vi.fn().mockRejectedValue(new Error('Database connection failed'))
    });

    await expect(
      LoginController.authenticate('valid@example.com', 'correct_password')
    ).rejects.toThrow('Database connection failed');
  });

  it('should not include password in the returned user object', async () => {
    (UserModel.query as any).mockReturnValue({
      findOne: vi.fn().mockResolvedValue(mockValidUser)
    });

    const result = await LoginController.authenticate('valid@example.com', 'correct_password');

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user).not.toHaveProperty('password');
  });

  it('should handle bcrypt.compare errors', async () => {
    (UserModel.query as any).mockReturnValue({
      findOne: vi.fn().mockResolvedValue(mockValidUser)
    });

    vi.mocked(bcrypt.compare).mockRejectedValue(new Error('Bcrypt error'));

    await expect(
      LoginController.authenticate('valid@example.com', 'correct_password')
    ).rejects.toThrow('Bcrypt error');
  });
});