import { ApiResponseDto } from '../dtos/api-response.dto';

export class ResponseBuilder {
  /**
   * For single resources (Singularity)
   */
  static success<T>(
    data: T,
    message = 'Operation completed successfully',
    meta?: Record<string, any>,
  ): ApiResponseDto<T> {
    return new ApiResponseDto(data, message, meta);
  }

  /**
   * For collection resources with pagination (Collection)
   */
  static paginated<T>(
    data: T[],
    meta: { page: number; limit: number; total: number; totalPages: number },
    message = 'Resources retrieved successfully',
  ): ApiResponseDto<T[]> {
    return new ApiResponseDto(data, message, meta);
  }
}
