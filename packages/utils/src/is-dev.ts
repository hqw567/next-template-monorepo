/**
 * 表示当前环境是否为开发环境的布尔标志
 *
 * @example
 * ```ts
 * // 仅在开发环境中条件性地运行代码
 * if (isDev) {
 *   console.log('调试信息');
 *   loadDevTools();
 * }
 *
 * // 或使用三元运算符
 * const apiUrl = isDev ? 'http://localhost:3000/api' : 'https://production.com/api';
 * ```
 */
export const isDev = process.env.NODE_ENV === "development"
