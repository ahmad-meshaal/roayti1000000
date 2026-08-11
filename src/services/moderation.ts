/**
 * Content moderation — all content is allowed, no blocking.
 */
export const moderateContent = async (_text: string): Promise<{ isSafe: boolean; reason?: string }> => {
  return { isSafe: true };
};
