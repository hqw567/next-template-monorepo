/**
 * 表示当前平台是否为macOS的布尔标志
 *
 * @example
 * ```ts
 * // 条件性地应用特定平台的行为
 * const ctrlKeyText = isMac ? '⌘' : 'Ctrl';
 *
 * // 在UI组件渲染中使用
 * function Shortcut() {
 *   return <span>{isMac ? '⌘+C' : 'Ctrl+C'}</span>;
 * }
 *
 * // 特定平台的行为
 * if (isMac) {
 *   applyMacOSStyles();
 * } else {
 *   applyWindowsStyles();
 * }
 * ```
 */
export const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0
