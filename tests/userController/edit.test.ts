import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as UsersController from '../../src/http/controllers/usersController.js';
import { UserModel, UserRole } from '../../src/database/models/UsersModel.js';
import { DealershipModel } from '../../src/database/models/DealershipModel.js';

vi.mock('../../src/database/models/UsersModel');
vi.mock('../../src/database/models/DealershipModel');

describe('usersController.edit', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render the edit page with user and dealerships', async () => {
        const request = { params: { id: '1' } };
        const reply = { view: vi.fn() };

        (UserModel.query as any).mockReturnValue({
            findById: vi.fn().mockReturnValue({
                throwIfNotFound: vi.fn().mockResolvedValue({
                    id: 1,
                    name: 'John',
                    email: 'jonh@gmail.com',
                    password: '1234576894',
                    role: 'dealership',
                    dealershipId: 1,
                }),
            }),
        });

        (DealershipModel.query as any).mockResolvedValue([
            { id: 1, name: 'Dealership 1' },
            { id: 2, name: 'Dealership 2' },
        ]);

        await UsersController.edit(request as any, reply as any);

        expect(UserModel.query().findById).toHaveBeenCalledWith('1');
        expect(reply.view).toHaveBeenCalledWith('users/update', {
            user: {
                id: 1,
                name: 'John',
                email: 'jonh@gmail.com',
                password: '1234576894',
                role: 'dealership',
                dealershipId: 1,
            },
            dealerships: [
                { id: 1, name: 'Dealership 1' },
                { id: 2, name: 'Dealership 2' },
            ],
        });
    });

    it('should throw not found error when user does not exist', async () => {
        const mockError = new Error('Not Found') as Error & { statusCode: number };
        mockError.statusCode = 404;
        
        const mockThrowIfNotFound = vi.fn().mockRejectedValue(mockError);
        (UserModel.query as any).mockReturnValue({
          findById: vi.fn().mockReturnThis(),
          throwIfNotFound: mockThrowIfNotFound
        });
    
        const request = {
          params: { id: '999' }
        };
        const reply = { 
          view: vi.fn(),
          code: vi.fn()
        };
    
        await expect(UsersController.edit(request as any, reply as any))
          .rejects.toThrow('Not Found');
    
        expect(reply.view).not.toHaveBeenCalled();
      });
});