import { defineAuth } from '@aws-amplify/backend';

/**
 * CohortTrack Authentication Configuration
 *
 * Single admin user: jason@flowency.co.uk
 * Provider: Google OAuth
 *
 * Session Settings (Cognito defaults):
 * - Access token: 1 hour
 * - Refresh token: 30 days
 *
 * @see https://docs.amplify.aws/react/build-a-backend/auth/
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID ?? '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
        scopes: ['email', 'profile', 'openid'],
        attributeMapping: {
          email: 'email',
          fullname: 'name',
        },
      },
      callbackUrls: [
        'http://localhost:5173/',
        'https://cohorttrack.opstack.uk/',
      ],
      logoutUrls: [
        'http://localhost:5173/',
        'https://cohorttrack.opstack.uk/',
      ],
    },
  },
});
