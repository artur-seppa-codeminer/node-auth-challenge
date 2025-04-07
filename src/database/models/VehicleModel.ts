import { JSONSchema, ModelObject, RelationMappings } from 'objection';
import { BaseModel } from './BaseModel.js';
import { DealershipModel, DealershipSchema } from './DealershipModel.js';

class VehicleModel extends BaseModel {
  static tableName = 'vehicles';

  id!: number;
  brand!: string;
  name!: string;
  model!: string;
  year!: string;
  comments!: string;

  dealershipId!: number;
  dealership!: DealershipSchema;

  static get relationMappings(): RelationMappings {
    return {
      dealership: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: DealershipModel,
        join: {
          from: 'vehicles.dealershipId',
          to: 'dealerships.id',
        },
      },
    };
  }

  static jsonSchema: JSONSchema = {
    type: 'object',
    required: ['brand', 'name', 'model', 'year', 'dealershipId'],
    properties: {
      id: { type: 'integer' },
      brand: { type: 'string' },
      name: { type: 'string' },
      model: { type: 'string' },
      year: { type: 'string' },
      comments: { type: 'string' },
      dealershipId: { type: 'integer' },
    },
  };
}

export { VehicleModel };
export type VehicleSchema = ModelObject<VehicleModel>;
