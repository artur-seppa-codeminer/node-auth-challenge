import { JSONSchema, ModelObject, RelationMappings  } from 'objection';
import { BaseModel } from './BaseModel.js';
import { DealershipModel } from './DealershipModel.js';

export enum UserRole {
  ADMIN = 'admin',
  DEALERSHIP = 'dealership'
}

class UserModel extends BaseModel {
  static tableName = 'users';
  
  id!: number;
  name!: string;
  email!: string;
  password!: string;
  role!: UserRole;
  dealershipId?: number | null;

  static jsonSchema: JSONSchema = {
    type: 'object',
    required: ['name', 'email', 'password', 'role'],
    properties: {
      id: { type: 'integer' },
      name: { type: 'string', minLength: 1, maxLength: 255 },
      email: { 
        type: 'string',
        format: 'email',
        minLength: 5,
        maxLength: 255
      },
      password: { 
        type: 'string',
        minLength: 8
      },
      role: { 
        type: 'string',
        enum: Object.values(UserRole)
      },
      dealershipId: { 
        type: ['integer', 'null']
      }
    },
  };

  static relationMappings: RelationMappings = {
    dealership: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: DealershipModel,
      join: {
        from: 'users.dealershipId',
        to: 'dealerships.id'
      }
    }
  };
}

export { UserModel };
export type UserSchema = ModelObject<UserModel>;
