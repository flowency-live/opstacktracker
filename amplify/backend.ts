import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';

/**
 * CohortTrack Backend Configuration
 *
 * AWS Account: 771551874768
 * Region: eu-west-2 (London)
 *
 * @see https://docs.amplify.aws/react/build-a-backend/
 */
const backend = defineBackend({
  auth,
  data,
});

export default backend;
