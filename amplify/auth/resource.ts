import { defineAuth, secret } from '@aws-amplify/backend';

/**
 * CohortTrack Authentication Configuration
 *
 * Single admin user: jason@flowency.co.uk
 * Provider: Google OAuth
 *
 * Secrets must be set via: npx ampx sandbox secret set GOOGLE_CLIENT_ID
 *
 * @see https://docs.amplify.aws/react/build-a-backend/auth/
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      google: {
        clientId: secret('GOOGLE_CLIENT_ID'),
        clientSecret: secret('GOOGLE_CLIENT_SECRET'),
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
