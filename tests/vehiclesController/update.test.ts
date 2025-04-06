import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as VehiclesController from '../../src/http/controllers/vehiclesController.js';
import { VehicleModel } from '../../src/database/models/VehicleModel.js';

vi.mock('../../src/database/models/VehicleModel');

describe('vehiclesController.update', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update a vehicle and redirect to home on success', async () => {
    const mockVehicle = {
      id: '1',
      name: 'Old Name',
      brand: 'Old Brand',
      model: 'Old Model',
      year: 2020,
      comments: 'Old comments',
      dealershipId: 1,
      $set: vi.fn().mockReturnThis(),
      $query: vi.fn().mockReturnValue({
        update: vi.fn().mockResolvedValue(true)
      })
    };

    (VehicleModel.query as any).mockReturnValue({
      findById: vi.fn().mockReturnThis(),
      throwIfNotFound: vi.fn().mockResolvedValue(mockVehicle)
    });

    const request = {
      params: { id: '1' },
      body: {
        name: 'New Name',
        brand: 'New Brand',
        model: 'New Model',
        year: '2021',
        comments: 'New comments',
        dealershipId: 2
      },
      user: { id: 1, name: 'Admin' }
    };
    const reply = { 
      redirect: vi.fn(),
      view: vi.fn()
    };

    await VehiclesController.update(request as any, reply as any);

    expect(VehicleModel.query().findById).toHaveBeenCalledWith('1');
    expect(mockVehicle.$set).toHaveBeenCalledWith({
      name: 'New Name',
      brand: 'New Brand',
      model: 'New Model',
      year: '2021',
      comments: 'New comments',
      dealershipId: 2
    });
    expect(mockVehicle.$query().update).toHaveBeenCalled();
    expect(reply.redirect).toHaveBeenCalledWith('/');
    expect(reply.view).not.toHaveBeenCalled();
  });

  it('should throw not found error when vehicle does not exist', async () => {
    const notFoundError = new Error('Not Found') as Error & { statusCode: number };
    notFoundError.statusCode = 404;
    
    
    (VehicleModel.query as any).mockReturnValue({
      findById: vi.fn().mockReturnThis(),
      throwIfNotFound: vi.fn().mockRejectedValue(notFoundError)
    });

    const request = {
      params: { id: '999' },
      body: {
        name: 'New Name',
        brand: 'New Brand',
        model: 'New Model',
        year: '2021',
        comments: 'New comments',
        dealershipId: 2
      },
      user: { id: 1, name: 'Admin' }
    };
    const reply = { 
      redirect: vi.fn(),
      view: vi.fn()
    };

    await expect(VehiclesController.update(request as any, reply as any))
      .rejects.toThrow('Not Found');

    expect(reply.redirect).not.toHaveBeenCalled();
    expect(reply.view).not.toHaveBeenCalled();
  });

  it('should return to edit view with errors when update fails', async () => {
    const mockVehicle = {
      id: '1',
      $set: vi.fn().mockReturnThis(),
      $query: vi.fn().mockReturnValue({
        update: vi.fn().mockRejectedValue(new Error('Database error'))
      })
    };

    (VehicleModel.query as any).mockReturnValue({
      findById: vi.fn().mockReturnThis(),
      throwIfNotFound: vi.fn().mockResolvedValue(mockVehicle)
    });

    const request = {
      params: { id: '1' },
      body: {
        name: 'New Name',
        brand: 'New Brand',
        model: 'New Model',
        year: '2021',
        comments: 'New comments',
        dealershipId: 2
      },
      user: { id: 1, name: 'Admin' }
    };
    const reply = { 
      redirect: vi.fn(),
      view: vi.fn()
    };

    await VehiclesController.update(request as any, reply as any);

    expect(reply.view).toHaveBeenCalledWith('vehicles/update', {
      vehicle: mockVehicle,
      currentUser: request.user
    });
    expect(reply.redirect).not.toHaveBeenCalled();
  });

});