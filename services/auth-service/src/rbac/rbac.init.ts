import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs';
import { RolesService } from 'src/roles/roles.service';
import { RoleScope } from 'src/roles/schema/role.schema';

@Injectable()
export class RBACInitializer {
  private readonly logger = new Logger(RBACInitializer.name);

  constructor(
    private readonly rolesService: RolesService,
    private readonly usersService: UsersService,
  ) {}

  async initialize() {
    await this.createPlatformSuperAdminRole();
    await this.createRestaurantOwnerDefaultRole();
    await this.createPlatformSuperAdminUser();
  }

  // 1️⃣ FULL ACCESS ROLE FOR PLATFORM SUPER ADMIN
  private async createPlatformSuperAdminRole() {
      const existing = await this.rolesService.findByName('SUPER_ADMIN');
    if (existing) return;

    await this.rolesService.create({
      name: 'SUPER_ADMIN',
      description: 'Full platform access',
      scope: RoleScope.PLATFORM,
      permissions: ['*'], // wildcard → has all permissions
      isDefault: true,
      isActive: true,
    });

    this.logger.log('✓ SUPER_ADMIN role created');
  }

  // 2️⃣ FULL ACCESS ROLE FOR RESTAURANT OWNER
  private async createRestaurantOwnerDefaultRole() {
    const existing = await this.rolesService.findByName('OWNER');
    if (existing) return;

    await this.rolesService.create({
      name: 'OWNER',
      description: 'Full restaurant access',
      scope: RoleScope.RESTAURANT,
      permissions: ['*'], // wildcard for restaurant modules
      isDefault: true,
      isActive: true,
    });

    this.logger.log('✓ OWNER role created');
  }

  // 3️⃣ SUPER ADMIN USER
  private async createPlatformSuperAdminUser() {
    const exists = await this.usersService.findSuperAdmin();
    if (exists) return;

    const password = await bcrypt.hash('SuperAdmin@123', 12);

    const role: any = await this.rolesService.findByName('SUPER_ADMIN');
    await this.usersService.create({
      name: 'Super Admin',
      email: 'admin@platform.com',
      password,
      phone: '+910000000000',
      userType: 'platform',
      status: 'active',
      platformRole: role._id,
    });

    this.logger.log(
      '✓ Super admin user created: admin@platform.com / SuperAdmin@123',
    );
  }
}
