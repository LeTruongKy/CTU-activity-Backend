import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

interface RecommendationItem {
  activity_id: number;
  activity_title: string;
  description: string | null;
  similarity_score: number;
  tags: { id: number; name: string }[];
}

interface RecommendationResponse {
  user_id: string;
  total_count: number;
  recommendations: RecommendationItem[];
}

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);
  private readonly RECOMMENDATION_API_URL = 'http://localhost:8001/api/recommendations';

  constructor(private readonly httpService: HttpService) {}

  /**
   * Gá»i Python Service Ä‘á»ƒ láº¥y danh sÃ¡ch gá»£i Ã½ hoáº¡t Ä‘á»™ng
   * @param userId UUID cá»§a user
   * @param limit Sá»‘ lÆ°á»£ng gá»£i Ã½ (máº·c Ä‘á»‹nh: 10)
   * @returns Danh sÃ¡ch gá»£i Ã½ tá»« Python Service
   */
  async getRecommendationFromPython(
    userId: string,
    limit: number = 10,
  ): Promise<RecommendationResponse> {
    try {
      this.logger.log(`Fetching recommendations for user: ${userId}`);

      const url = `${this.RECOMMENDATION_API_URL}/recommend/${userId}`;
      const response: AxiosResponse<RecommendationResponse> = await firstValueFrom(
        this.httpService.get<RecommendationResponse>(url, {
          params: { limit },
          timeout: 5000, // 5 giÃ¢y timeout
        }),
      );

      this.logger.log(
        `Received ${response.data.total_count} recommendations for user ${userId}`,
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `Error calling Python recommendation service: ${error.message}`,
        error.stack,
      );

      throw new HttpException(
        {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          message: 'Recommendation service is currently unavailable',
          error: error.message,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Láº¥y thÃ´ng tin profile cá»§a user tá»« Python Service
   * @param userId UUID cá»§a user
   * @returns ThÃ´ng tin sá»Ÿ thÃ­ch cá»§a user
   */
  async getUserProfileFromPython(userId: string) {
    try {
      const url = `${this.RECOMMENDATION_API_URL}/user-profile/${userId}`;
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.get(url, { timeout: 5000 }),
      );

      return response.data;
    } catch (error) {
      this.logger.warn(`Could not fetch user profile: ${error.message}`);
      return null;
    }
  }

  /**
   * Láº¥y thÃ´ng tin chi tiáº¿t cá»§a má»™t hoáº¡t Ä‘á»™ng tá»« Python Service
   * @param activityId ID cá»§a hoáº¡t Ä‘á»™ng
   * @returns ThÃ´ng tin hoáº¡t Ä‘á»™ng
   */
  async getActivityDetailsFromPython(activityId: number) {
    try {
      const url = `${this.RECOMMENDATION_API_URL}/activity/${activityId}`;
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.get(url, { timeout: 5000 }),
      );

      return response.data;
    } catch (error) {
      this.logger.warn(
        `Could not fetch activity details ${activityId}: ${error.message}`,
      );
      return null;
    }
  }

  /**
   * Kiá»ƒm tra káº¿t ná»‘i tá»›i Python Service
   * @returns true náº¿u service hoáº¡t Ä‘á»™ng
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.get('http://localhost:8001/health', {
          timeout: 3000,
        }),
      );

      return response.status === 200;
    } catch (error) {
      this.logger.warn(
        `Python recommendation service health check failed: ${error.message}`,
      );
      return false;
    }
  }
}
