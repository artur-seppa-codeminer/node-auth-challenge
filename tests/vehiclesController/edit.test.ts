import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as VehiclesController from '../../src/http/controllers/vehiclesController.js';
import { VehicleModel } from '../../src/database/models/VehicleModel.js';

vi.mock('../../src/database/models/VehicleModel');

describe('vehiclesController.edit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the edit view with vehicle data when vehicle exists', async () => {
    const mockVehicle = {
      id: '1',
      name: 'Corolla',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2021,
      comments: 'Test vehicle'
    };

    const mockThrowIfNotFound = vi.fn().mockResolvedValue(mockVehicle);
    (VehicleModel.query as any).mockReturnValue({
      findById: vi.fn().mockReturnThis(),
      throwIfNotFound: mockThrowIfNotFound
    });

    const request = {
      params: { id: '1' },
      user: { id: 1, name: 'Admin' }
    };
    const reply = { 
      view: vi.fn().mockReturnThis(),
      code: vi.fn()
    };

    await VehiclesController.edit(request as any, reply as any);

    expect(VehicleModel.query().findById).toHaveBeenCalledWith('1');
    expect(mockThrowIfNotFound).toHaveBeenCalled();

    expect(reply.view).toHaveBeenCalledWith('vehicles/update', {
      vehicle: mockVehicle,
      currentUser: request.user
    });
  });

  it('should throw not found error when vehicle does not exist', async () => {
    const mockError = new Error('Not Found') as Error & { statusCode: number };
    mockError.statusCode = 404;
    
    const mockThrowIfNotFound = vi.fn().mockRejectedValue(mockError);
    (VehicleModel.query as any).mockReturnValue({
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

    await expect(VehiclesController.edit(request as any, reply as any))
      .rejects.toThrow('Not Found');

    expect(reply.view).not.toHaveBeenCalled();
  });
});