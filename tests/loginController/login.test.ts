import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as LoginController from '../../src/http/controllers/loginController.js';
import { UserModel } from '../../src/database/models/UsersModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

vi.mock('../../src/database/models/UsersModel');
vi.mock('bcrypt');
vi.mock('jsonwebtoken');

describe('LoginController.login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    vi.mocked(jwt.sign).mockReturnValue('mocked_token' as never);
  });

  it('should set cookie and redirect on successful login', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashed_password'
    };

    (UserModel.query as any).mockReturnValue({
      findOne: vi.fn().mockResolvedValue(mockUser)
    });

    const request = {
      body: {
        email: 'test@example.com',
        password: 'correct_password'
      },
      server: {
        generateToken: vi.fn().mockReturnValue('generated_token')
      }
    };

    const reply = {
      view: vi.fn(),
      clearCookie: vi.fn(),
      setCookie: vi.fn(),
      redirect: vi.fn()
    };

    await LoginController.login(request as any, reply as any);

    expect(UserModel.query().findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(bcrypt.compare).toHaveBeenCalledWith('correct_password', 'hashed_password');
    expect(reply.clearCookie).toHaveBeenCalledWith('auth_token');
    expect(reply.setCookie).toHaveBeenCalledWith('auth_token', 'generated_token', {
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 3600
    });
    expect(reply.redirect).toHaveBeenCalledWith('/users');
    expect(reply.view).not.toHaveBeenCalled();
  });

  it('should render login view with error when authentication fails', async () => {
    (UserModel.query as any).mockReturnValue({
      findOne: vi.fn().mockResolvedValue(null)
    });

    const request = {
      body: {
        email: 'nonexistent@example.com',
        password: 'any_password'
      }
    };

    const reply = {
      view: vi.fn(),
      redirect: vi.fn()
    };

    await LoginController.login(request as any, reply as any);

    expect(reply.view).toHaveBeenCalledWith('login/index', {
      error: 'User not found with the provided email'
    });
    expect(reply.redirect).not.toHaveBeenCalled();
  });
});