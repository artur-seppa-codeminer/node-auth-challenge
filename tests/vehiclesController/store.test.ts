import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as VehiclesController from '../../src/http/controllers/vehiclesController.js';
import { VehicleModel } from '../../src/database/models/VehicleModel.js';
import { UserModel } from '../../src/database/models/UsersModel.js';

vi.mock('../../src/database/models/UsersModel');
vi.mock('../../src/database/models/VehicleModel');

describe('vehiclesController.store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    const mockUserQuery = {
      findById: vi.fn().mockReturnThis(),
      withGraphFetched: vi.fn().mockResolvedValue(null)
    };
    
    (UserModel.query as any).mockReturnValue(mockUserQuery);
  });

  it('should throw an error if required fields are missing', async () => {
    const request = {
      body: { name: '', brand: '', model: '', year: '', comments: '', userId: '' },
    };
    const reply = { redirect: vi.fn(), view: vi.fn() };

    await expect(VehiclesController.store(request as any, reply as any)).rejects.toThrow(
      'All fields are required'
    );
  });

  it('should throw an error when user is not found', async () => {
    const request = {
      body: { name: 'Corolla', brand: 'Toyota', model: 'Corolla', year: '2021', comments: 'license plate ABC-1234', userId: 999 },
    };
    const reply = { redirect: vi.fn(), view: vi.fn() };

    const mockUserQuery = {
      findById: vi.fn().mockReturnThis(),
      withGraphFetched: vi.fn().mockResolvedValue(null)
    };
    (UserModel.query as any).mockReturnValue(mockUserQuery);

    await expect(VehiclesController.store(request as any, reply as any)).rejects.toThrow(
      'Users without dealership cannot be associated with a veihicle'
    );
  });

  it('should insert a new vehicle into the database', async () => {
    const request = {
      body: { name: 'Corolla', brand: 'Toyota', model: 'Corolla', year: '2021', comments: 'license plate ABC-1234', userId: 1 },
    };
    const reply = { redirect: vi.fn(), view: vi.fn() };

    const mockUser = {
      id: 1,
      dealershipId: 1,
      $relatedQuery: vi.fn().mockResolvedValue({ id: 1 })
    };
    
    const mockUserQuery = {
      findById: vi.fn().mockReturnThis(),
      withGraphFetched: vi.fn().mockResolvedValue(mockUser)
    };
    (UserModel.query as any).mockReturnValue(mockUserQuery);

    const mockInsert = vi.fn().mockResolvedValue({ id: 1 });
    (VehicleModel.query as any).mockReturnValue({
      insert: mockInsert
    });

    await VehiclesController.store(request as any, reply as any);

    expect(mockInsert).toHaveBeenCalledWith({
      name: 'Corolla',
      brand: 'Toyota',
      model: 'Corolla',
      year: "2021",
      comments: 'license plate ABC-1234',
      dealershipId: 1
    });
    expect(reply.redirect).toHaveBeenCalledWith('/');
  });
});