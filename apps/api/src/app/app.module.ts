import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { FeedbacksModule } from './feedbacks/feedbacks.module';
import { GameAppointmentsModule } from './game-appointments/game-appointments.module';
import { GameResultsModule } from './game-results/game-results.module';
import { CheckInResultsModule } from './check-in-results/check-in-results.module';
import { UserRewardMapModule } from './user-reward-map/user-reward-map.module';
import { BattlePassModule } from './battle-pass/battle-pass.module';
import { MissionsModule } from './missions/missions.module';
import { RewardsModule } from './rewards/rewards.module';
import { AuthModule } from './auth/auth.module';
import { PromotionCodesModule } from './promotion-codes/promotion-codes.module';
import { WorkOperationsModule } from './work-operations/work-operations.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { EconomyModule } from './economy/economy.module';
import { SystemModule } from './system/system.module';
import { ManagementModule } from './management/management.module';
import { SecurityModule } from './security/security.module';
import { GiftRoundsModule } from './gift-rounds/gift-rounds.module';
import { BirthdayModule } from './birthday/birthday.module';
import { WelcomeRewardsModule } from './welcome-rewards/welcome-rewards.module';
import { ReportsModule } from './reports/reports.module';
import { PromotionsModule } from './promotions/promotions.module';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    ManagementModule,
    SecurityModule,
    GiftRoundsModule,
    BirthdayModule,
    WelcomeRewardsModule,
    ReportsModule,
    PromotionsModule,
    FeedbacksModule,
    GameAppointmentsModule,
    GameResultsModule,
    CheckInResultsModule,
    UserRewardMapModule,
    BattlePassModule,
    MissionsModule,
    RewardsModule,
    AuthModule,
    PromotionCodesModule,
    WorkOperationsModule,
    InfrastructureModule,
    EconomyModule,
    SystemModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
