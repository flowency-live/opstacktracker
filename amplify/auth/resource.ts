import { defineAuth, secret } from '@aws-amplify/backend';
import { preSignUp } from './pre-sign-up/resource';

/**
 * CohortTrack Authentication Configuration
 *
 * Google OAuth restricted to jason@flowency.co.uk
 *
 * @see https://docs.amplify.aws/react/build-a-backend/auth/concepts/external-identity-providers/
 */
export const auth = defineAuth({
  loginWith: {
    externalProviders: {
      google: {
        clientId: secret('GOOGLE_CLIENT_ID'),
        clientSecret: secret('GOOGLE_CLIENT_SECRET'),
        scopes: ['profile', 'email'],
      },
      callbackUrls: [
        'http://localhost:5173/',
        'https://tracker.opstack.uk/',
      ],
      logoutUrls: [
        'http://localhost:5173/',
        'https://tracker.opstack.uk/',
      ],
    },
  },
  triggers: {
    preSignUp,
  },
});
