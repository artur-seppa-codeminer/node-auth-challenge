import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as UsersController from '../../src/http/controllers/usersController.js';
import { UserModel } from '../../src/database/models/UsersModel.js';
import { DealershipModel } from '../../src/database/models/DealershipModel.js';

vi.mock('../../src/database/models/UsersModel');
vi.mock('../../src/database/models/DealershipModel');

describe('usersController.update', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should update a user and redirect', async () => {
        const request = {
            params: { id: '1' },
            body: { name: 'John Updated', email: 'john@example.com', password: '123456', role: 'admin', dealershipId: null },
        };
        const reply = { redirect: vi.fn() };

        (UserModel.query as any).mockReturnValue({
            findById: vi.fn().mockReturnValue({
                throwIfNotFound: vi.fn().mockResolvedValue({
                    $set: vi.fn().mockReturnValue({
                        $query: vi.fn().mockReturnValue({
                            update: vi.fn().mockResolvedValue({}),
                        }),
                    }),
                }),
            }),
        });

        await UsersController.update(request as any, reply as any);

        expect(reply.redirect).toHaveBeenCalledWith('/users');
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