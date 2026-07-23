export class ApiResponseDto<T> {
  constructor(
    public readonly data: T,
    public readonly message = 'Operation completed successfully',
    public readonly meta?: Record<string, any>,
  ) {}
}
