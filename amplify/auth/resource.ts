import { defineAuth } from '@aws-amplify/backend';

/**
 * CohortTrack Authentication Configuration
 *
 * Single admin user: jason@flowency.co.uk
 * Using email/password auth for now - Google OAuth can be added later
 *
 * @see https://docs.amplify.aws/react/build-a-backend/auth/
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
});
