import { Body, Controller, Get, Param, Patch, Post, Delete, UseGuards } from '@nestjs/common'
import { Roles } from '../auth/roles.decorator'
import { JwtAuthGuard } from '../auth/jwt.guard'
import { RolesGuard } from '../auth/roles.guard'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User, Role } from '../users/user.entity'
import { DoctorProfile } from '../users/doctor-profile.entity'
import * as bcrypt from 'bcrypt'

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
    return this.users.find({ relations: ['doctorProfile'] }) 
  }

  @Post('users')
  async createUser(@Body() b: { email?: string; phone?: string; password: string; role: Role }) {
    // 检查邮箱是否已存在
    if (b.email) {
      const existingUser = await this.users.findOne({ where: { email: b.email } })
      if (existingUser) {
        throw new Error('邮箱已存在')
      }
    }

    // 检查手机号是否已存在（如果提供了手机号）
    if (b.phone && b.phone.trim()) {
      const existingPhoneUser = await this.users.findOne({ where: { phone: b.phone.trim() } })
      if (existingPhoneUser) {
        throw new Error('手机号已存在')
      }
    }

    const passwordHash = await bcrypt.hash(b.password, 10)
    const userData: any = {
      email: b.email,
      passwordHash,
      role: b.role
    }

    // 只有当 phone 不为空时才设置
    if (b.phone && b.phone.trim()) {
      userData.phone = b.phone.trim()
    }

    return this.users.save(this.users.create(userData))
  }

  @Patch('users/:id/role')
  async setRole(@Param('id') id: number, @Body() b: { role: Role }) {
    await this.users.update(id, { role: b.role })
    return { ok: true }
  }

  @Post('doctors/:userId/verify')
  async verify(@Param('userId') userId: number, @Body() b: { ok: boolean }) {
    let prof = await this.doctors.findOne({ where: { userId } })
    if (!prof) {
      prof = this.doctors.create({ userId, name: '', hospital: '' })
    }
    prof.verified = !!b.ok
    await this.doctors.save(prof)

    if (b.ok) {
      await this.users.update(userId, { role: Role.DOCTOR })
    }

    return { ok: true }
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: number) {
    const user = await this.users.findOne({ where: { id } })
    if (!user) {
      throw new Error('用户不存在')
    }

    // 不允许删除超级管理员
    if (user.role === Role.SUPER_ADMIN) {
      throw new Error('不能删除超级管理员')
    }

    await this.users.delete(id)
    return { ok: true, message: '用户删除成功' }
  }

  @Patch('users/:id/status')
  async toggleUserStatus(@Param('id') id: number, @Body() b: { enabled: boolean }) {
    const user = await this.users.findOne({ where: { id } })
    if (!user) {
      throw new Error('用户不存在')
    }

    // 不允许停用超级管理员
    if (user.role === Role.SUPER_ADMIN) {
      throw new Error('不能停用超级管理员')
    }

    await this.users.update(id, { enabled: b.enabled })
    return { ok: true, message: b.enabled ? '用户启用成功' : '用户停用成功' }
  }

  @Post('users/batch')
  async batchOperation(@Body() b: {
    action: 'delete' | 'enable' | 'disable' | 'changeRole',
    userIds: number[],
    role?: Role
  }) {
    const { action, userIds, role } = b

    // 获取要操作的用户
    const users = await this.users.findByIds(userIds)

    // 过滤掉超级管理员
    const nonAdminUsers = users.filter(user => user.role !== Role.SUPER_ADMIN)
    const nonAdminIds = nonAdminUsers.map(user => user.id)

    if (nonAdminIds.length === 0) {
      throw new Error('没有可操作的用户')
    }

    switch (action) {
      case 'delete':
        await this.users.delete(nonAdminIds)
        return { ok: true, message: `成功删除 ${nonAdminIds.length} 个用户` }

      case 'enable':
        await this.users.update(nonAdminIds, { enabled: true })
        return { ok: true, message: `成功启用 ${nonAdminIds.length} 个用户` }

      case 'disable':
        await this.users.update(nonAdminIds, { enabled: false })
        return { ok: true, message: `成功停用 ${nonAdminIds.length} 个用户` }

      case 'changeRole':
        if (!role) {
          throw new Error('角色参数缺失')
        }
        await this.users.update(nonAdminIds, { role })
        return { ok: true, message: `成功修改 ${nonAdminIds.length} 个用户的角色` }

      default:
        throw new Error('不支持的操作')
    }
  }

  @Patch('users/:id/reset-password')
  async resetPassword(@Param('id') id: number) {
    const user = await this.users.findOne({ where: { id } })
    if (!user) {
      throw new Error('用户不存在')
    }

    // 生成临时密码
    const tempPassword = Math.random().toString(36).slice(-8)
    const passwordHash = await bcrypt.hash(tempPassword, 10)

    await this.users.update(id, { passwordHash })

    return {
      ok: true,
      message: '密码重置成功',
      tempPassword // 实际生产环境中应该通过邮件/短信发送
    }
  }
}
