const ONBOARDING_KEY = 'dokuplus:onboarding:v1';
const REVIEW_KEY = 'dokuplus:review:v1';

const flag = (key: string) => {
  try { return !!localStorage.getItem(key); } catch { return false; }
};
const setFlag = (key: string) => {
  try { localStorage.setItem(key, '1'); } catch {}
};

export const hasSeenOnboarding = (): boolean => flag(ONBOARDING_KEY);
export const markOnboardingSeen = (): void => setFlag(ONBOARDING_KEY);

export const hasBeenPromptedForReview = (): boolean => flag(REVIEW_KEY);
export const markReviewPrompted = (): void => setFlag(REVIEW_KEY);
