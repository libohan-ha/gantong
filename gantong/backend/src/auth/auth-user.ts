import { UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { Role } from '../users/user.entity';

export interface AuthUser {
  id: number;
  sub?: number;
  role: Role;
  email?: string;
  phone?: string;
}

export type AuthRequest = Request & {
  user?: Partial<AuthUser>;
};

const toPositiveInt = (value: unknown): number | null => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

export const getAuthUserId = (req: AuthRequest): number => {
  const userId = toPositiveInt(req.user?.id ?? req.user?.sub);
  if (!userId) {
    throw new UnauthorizedException('无效的用户信息');
  }
  return userId;
};

export const getAuthUserRole = (req: AuthRequest): Role => {
  const role = req.user?.role;
  if (!role) {
    throw new UnauthorizedException('缺少用户角色信息');
  }
  return role;
};

export const getAuthUser = (req: AuthRequest): AuthUser => {
  const id = getAuthUserId(req);
  const role = getAuthUserRole(req);
  return {
    id,
    sub: id,
    role,
    email: typeof req.user?.email === 'string' ? req.user.email : undefined,
    phone: typeof req.user?.phone === 'string' ? req.user.phone : undefined,
  };
};
