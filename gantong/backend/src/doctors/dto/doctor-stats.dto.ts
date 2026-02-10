export class DoctorStatsDto {
  videoCount: number;
  totalViews: number;
  totalLikes: number;
  profileCompleteness: number;

  constructor(data: Partial<DoctorStatsDto> = {}) {
    this.videoCount = data.videoCount || 0;
    this.totalViews = data.totalViews || 0;
    this.totalLikes = data.totalLikes || 0;
    this.profileCompleteness = data.profileCompleteness || 0;
  }
}
