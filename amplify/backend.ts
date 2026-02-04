import { defineBackend } from '@aws-amplify/backend';
import { RemovalPolicy } from 'aws-cdk-lib';
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

// Retain the DynamoDB table on stack deletion to prevent data loss
backend.data.resources.cfnResources.amplifyDynamoDbTables['Node'].applyRemovalPolicy(
  RemovalPolicy.RETAIN
);

export default backend;
