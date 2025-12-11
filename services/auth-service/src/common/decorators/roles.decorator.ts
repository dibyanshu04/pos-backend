import { SetMetadata } from '@nestjs/common';
import { UserType } from 'src/users/schema/user.schema';

export const ROLES_KEY = 'userTypes';
export const PERMISSIONS_KEY = 'permissions';

export const Roles = (...userTypes: UserType[]) =>
  SetMetadata(ROLES_KEY, userTypes);

export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
