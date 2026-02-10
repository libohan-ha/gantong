import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Role } from '../users/user.entity';
import { DoctorProfile } from '../users/doctor-profile.entity';
import * as bcrypt from 'bcrypt';

type BatchAction = 'delete' | 'enable' | 'disable' | 'changeRole';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
@Controller('admin')
export class AdminController {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(DoctorProfile) private doctors: Repository<DoctorProfile>,
  ) {}

  @Get('users')
  listUsers() {
    return this.users.find({ relations: ['doctorProfile'] });
  }

  @Post('users')
  async createUser(
    @Body() b: { email?: string; phone?: string; password: string; role: Role },
  ) {
    const email = b.email?.trim();
    const phone = b.phone?.trim();

    if (!email && !phone) {
      throw new BadRequestException('邮箱或手机号至少填写一个');
    }
    if (!b.password?.trim()) {
      throw new BadRequestException('密码不能为空');
    }
    if (b.password.trim().length < 8) {
      throw new BadRequestException('密码长度不能少于8位');
    }
    this.assertValidRole(b.role);

    if (email) {
      const existingUser = await this.users.findOne({ where: { email } });
      if (existingUser) {
        throw new BadRequestException('邮箱已存在');
      }
    }

    if (phone) {
      const existingPhoneUser = await this.users.findOne({ where: { phone } });
      if (existingPhoneUser) {
        throw new BadRequestException('手机号已存在');
      }
    }

    const passwordHash = await bcrypt.hash(b.password, 10);
    return this.users.save(
      this.users.create({ email, phone, passwordHash, role: b.role }),
    );
  }

  @Patch('users/:id/role')
  async setRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() b: { role: Role },
  ) {
    this.assertValidRole(b.role);

    const user = await this.users.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    if (user.role === Role.SUPER_ADMIN) {
      throw new ForbiddenException('不能修改超级管理员角色');
    }

    await this.users.update(id, { role: b.role });
    return { ok: true };
  }

  @Post('doctors/:userId/verify')
  async verify(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() b: { ok: boolean },
  ) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    let prof = await this.doctors.findOne({ where: { userId } });
    if (!prof) {
      prof = this.doctors.create({ userId, name: '', hospital: '' });
    }
    prof.verified = Boolean(b.ok);
    await this.doctors.save(prof);

    if (b.ok) {
      await this.users.update(userId, { role: Role.DOCTOR });
    }

    return { ok: true };
  }

  @Delete('users/:id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    const user = await this.users.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    if (user.role === Role.SUPER_ADMIN) {
      throw new ForbiddenException('不能删除超级管理员');
    }

    await this.users.delete(id);
    return { ok: true, message: '用户删除成功' };
  }

  @Patch('users/:id/status')
  async toggleUserStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() b: { enabled: boolean },
  ) {
    if (typeof b.enabled !== 'boolean') {
      throw new BadRequestException('enabled 参数必须是布尔值');
    }

    const user = await this.users.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    if (user.role === Role.SUPER_ADMIN) {
      throw new ForbiddenException('不能停用超级管理员');
    }

    await this.users.update(id, { enabled: b.enabled });
    return { ok: true, message: b.enabled ? '用户启用成功' : '用户停用成功' };
  }

  @Post('users/batch')
  async batchOperation(
    @Body() b: { action: BatchAction; userIds: number[]; role?: Role },
  ) {
    const { action, userIds, role } = b;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new BadRequestException('userIds 不能为空');
    }

    const allowedActions: BatchAction[] = [
      'delete',
      'enable',
      'disable',
      'changeRole',
    ];
    if (!allowedActions.includes(action)) {
      throw new BadRequestException('不支持的操作');
    }

    const users = await this.users.findByIds(userIds);
    if (users.length === 0) {
      throw new NotFoundException('用户不存在');
    }

    const nonAdminUsers = users.filter(
      (user) => user.role !== Role.SUPER_ADMIN,
    );
    const nonAdminIds = nonAdminUsers.map((user) => user.id);
    if (nonAdminIds.length === 0) {
      throw new ForbiddenException('没有可操作的用户');
    }

    switch (action) {
      case 'delete':
        await this.users.delete(nonAdminIds);
        return { ok: true, message: `成功删除 ${nonAdminIds.length} 个用户` };
      case 'enable':
        await this.users.update(nonAdminIds, { enabled: true });
        return { ok: true, message: `成功启用 ${nonAdminIds.length} 个用户` };
      case 'disable':
        await this.users.update(nonAdminIds, { enabled: false });
        return { ok: true, message: `成功停用 ${nonAdminIds.length} 个用户` };
      case 'changeRole':
        if (!role) {
          throw new BadRequestException('角色参数缺失');
        }
        this.assertValidRole(role);
        await this.users.update(nonAdminIds, { role });
        return {
          ok: true,
          message: `成功修改 ${nonAdminIds.length} 个用户的角色`,
        };
      default:
        throw new BadRequestException('不支持的操作');
    }
  }

  @Patch('users/:id/reset-password')
  async resetPassword(@Param('id', ParseIntPipe) id: number) {
    const user = await this.users.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    await this.users.update(id, { passwordHash });

    return {
      ok: true,
      message: '密码重置成功',
      tempPassword,
    };
  }

  private assertValidRole(role: Role | undefined) {
    if (!role || !Object.values(Role).includes(role)) {
      throw new BadRequestException('角色参数不合法');
    }
  }
}
