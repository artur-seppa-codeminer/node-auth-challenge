import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as VehiclesController from '../../src/http/controllers/vehiclesController.js';
import { VehicleModel } from '../../src/database/models/VehicleModel.js';

vi.mock('../../src/database/models/VehicleModel');

describe('vehiclesController.destroy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete a vehicle and redirect to home on success', async () => {
    const mockDelete = vi.fn().mockResolvedValue(1);
    
    (VehicleModel.query as any).mockReturnValue({
      findById: vi.fn().mockReturnThis(),
      throwIfNotFound: vi.fn().mockReturnThis(),
      delete: mockDelete
    });

    const request = {
      params: { id: '1' }
    };
    const reply = { 
      redirect: vi.fn()
    };

    await VehiclesController.destroy(request as any, reply as any);

    expect(VehicleModel.query().findById).toHaveBeenCalledWith('1');
    expect(VehicleModel.query().throwIfNotFound).toHaveBeenCalled();
    expect(mockDelete).toHaveBeenCalled();
    expect(reply.redirect).toHaveBeenCalledWith('/');
  });

  it('should handle not found error and redirect to home', async () => {
    const notFoundError = new Error('Not Found') as Error & { statusCode: number };
    notFoundError.statusCode = 404;
    

    (VehicleModel.query as any).mockReturnValue({
      findById: vi.fn().mockReturnThis(),
      throwIfNotFound: vi.fn().mockRejectedValue(notFoundError),
      delete: vi.fn()
    });

    const request = {
      params: { id: '999' }
    };
    const reply = { 
      redirect: vi.fn()
    };

    await VehiclesController.destroy(request as any, reply as any);

    expect(reply.redirect).toHaveBeenCalledWith('/');
    expect(VehicleModel.query().delete).not.toHaveBeenCalled();
  });
});