/**
 * Returns HTML string wrapped with required Emoji CSS styles.
 */
export function wrapEmoji(emoji: string): string {
  return `<span class="emoji">${emoji}</span>`;
}
