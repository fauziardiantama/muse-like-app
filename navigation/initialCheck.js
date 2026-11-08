import { ROUTES } from './router';

// The one initial-check decision, used by the app start (token is the
// root route) and by the token page submit redirect. Submit does NOT
// do its own new check: it just asks to go back to the start, and
// this function decides where the start lands.
// - no token -> token page
// - token, quickstart not completed -> quickstart page (single page)
// - token, quickstart completed -> chat/home
// No API call here yet: hasToken is the connection paired flag, and
// quickstartCompleted lives in the onboarding slice. The gateway
// status call that will fill both is detail for later.
export function decideInitialRoute({ hasToken, quickstartCompleted }) {
  if (!hasToken) return ROUTES.token;
  if (!quickstartCompleted) return ROUTES.quickstart;
  return ROUTES.chat;
}
