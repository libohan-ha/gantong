import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/user.entity';
import { TrainingsService } from './trainings.service';
import { CreateTrainingBookingDto } from './dto/create-booking.dto';
import { getAuthUserId, type AuthRequest } from '../auth/auth-user';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PARENT)
@Controller('parent/experts')
export class ParentBookingsController {
  constructor(private readonly trainingsService: TrainingsService) {}

  // 家长提交预约（免费，单场次）
  @Post('bookings')
  async createBooking(
    @Req() req: AuthRequest,
    @Body() dto: CreateTrainingBookingDto,
  ) {
    return this.trainingsService.createBooking(getAuthUserId(req), dto);
  }
}
