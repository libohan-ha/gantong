import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt.guard'
import { TrainingsService } from './trainings.service'
import { CreateTrainingBookingDto } from './dto/create-booking.dto'

@UseGuards(JwtAuthGuard)
@Controller('parent/experts')
export class ParentBookingsController {
  constructor(private readonly trainingsService: TrainingsService) {}

  // 家长提交预约（免费，单场次）
  @Post('bookings')
  async createBooking(@Req() req: any, @Body() dto: CreateTrainingBookingDto) {
    const userId = req.user?.id || req.user?.sub
    return this.trainingsService.createBooking(userId, dto)
  }
}

