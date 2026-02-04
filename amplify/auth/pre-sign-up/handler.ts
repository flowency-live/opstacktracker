import type { PreSignUpTriggerHandler } from 'aws-lambda';

const ALLOWED_EMAILS = ['jason@flowency.co.uk'];

export const handler: PreSignUpTriggerHandler = async (event) => {
  const email = event.request.userAttributes.email?.toLowerCase();

  if (!email || !ALLOWED_EMAILS.includes(email)) {
    throw new Error('Access denied. Only authorized users can sign up.');
  }

  return event;
};
