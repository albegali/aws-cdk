/**
 * The deployment environment for a stack.
 */
export interface Environment {
  /**
   * The AWS account ID for this environment.
   * If not specified, the context parameter `default-account` is used.
   */
  readonly account?: string;

  /**
   * The AWS region for this environment.
   * If not specified, the context parameter `default-region` is used.
   */
  readonly region?: string;
}
