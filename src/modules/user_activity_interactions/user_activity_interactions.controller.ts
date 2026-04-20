import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { UserActivityInteractionsService } from './user_activity_interactions.service';
import { InteractionType } from './entities/user_activity_interaction.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('user-interactions')
export class UserActivityInteractionsController {
  constructor(
    private readonly userActivityInteractionsService: UserActivityInteractionsService,
  ) {}

  /**
   * POST /user-interactions/view
   * Track user VIEW interaction on activity
   * Weight: +1 to each activity tag
   *
   * Body: { activityId: number }
   * Response: { message: string, tracked: boolean }
   *
   * Security: JWT required
   * Idempotency: 5-minute dedup per (userId, activityId)
   * Behavior: Fire-and-forget (returns immediately)
   */
  @Post('view')
  @UseGuards(JwtAuthGuard)
  trackView(
    @Req() req: Request,
    @Body() body: { activityId: number },
  ) {
    const userId = (req.user as any)?.id;
    if (!userId) {
      return { message: 'User not authenticated', tracked: false };
    }

    try {
      // Fire-and-forget: track async without waiting or blocking
      this.userActivityInteractionsService
        .trackInteraction(userId, body.activityId, InteractionType.VIEW)
        .catch((error: Error) => {
          // Log silently, don't break response
          console.error(
            `[USER-INTERACTIONS] Failed to track VIEW for user ${userId}:`,
            error.message,
          );
        });

      // Return immediately, don't wait for tracking
      return { message: 'View tracked', tracked: true };
    } catch (error) {
      // Log but don't throw to client
      console.error('[USER-INTERACTIONS] Error tracking view:', error);
      return { message: 'View tracking failed', tracked: false };
    }
  }

  /**
   * POST /user-interactions/register
   * Track user REGISTER interaction on activity
   * Weight: +3 to each activity tag
   *
   * Body: { activityId: number }
   * Response: { message: string, tracked: boolean }
   *
   * Security: JWT required
   * Idempotency: No dedup (allow multiple registrations)
   * Behavior: Fire-and-forget (returns immediately)
   */
  @Post('register')
  @UseGuards(JwtAuthGuard)
  trackRegister(
    @Req() req: Request,
    @Body() body: { activityId: number },
  ) {
    const userId = (req.user as any)?.id;
    if (!userId) {
      return { message: 'User not authenticated', tracked: false };
    }

    try {
      // Fire-and-forget: track async without waiting or blocking
      this.userActivityInteractionsService
        .trackInteraction(userId, body.activityId, InteractionType.REGISTER)
        .catch((error: Error) => {
          console.error(
            `[USER-INTERACTIONS] Failed to track REGISTER for user ${userId}:`,
            error.message,
          );
        });

      // Return immediately, don't wait for tracking
      return { message: 'Register tracked', tracked: true };
    } catch (error) {
      // Log but don't throw to client
      console.error('[USER-INTERACTIONS] Error tracking register:', error);
      return { message: 'Register tracking failed', tracked: false };
    }
  }

  @Post('check-in')
  @UseGuards(JwtAuthGuard)
  trackCheckIn(
    @Req() req: Request,
    @Body() body: { activityId: number },
  ) {
    const userId = (req.user as any)?.id;
    if (!userId) {
      return { message: 'User not authenticated', tracked: false };
    }

    try {
      // Fire-and-forget: track async without waiting or blocking
      this.userActivityInteractionsService
        .trackInteraction(userId, body.activityId, InteractionType.CHECK_IN)
        .catch((error: Error) => {
          console.error(
            `[USER-INTERACTIONS] Failed to track REGISTER for user ${userId}:`,
            error.message,
          );
        });

      // Return immediately, don't wait for tracking
      return { message: 'Register tracked', tracked: true };
    } catch (error) {
      // Log but don't throw to client
      console.error('[USER-INTERACTIONS] Error tracking register:', error);
      return { message: 'Register tracking failed', tracked: false };
    }
  }

}

