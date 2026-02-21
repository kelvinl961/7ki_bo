import { faker } from '@faker-js/faker';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { sleep, unAuthorizedResponse } from '~/utils/response';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  const body = await readBody(event);
  const {
    userId,
    type,
    subType,
    amount,
    multiplier = 1,
    description,
    frontendNotes,
    backendNotes,
    currency,
  } = body;

  // Validate required fields
  if (!userId || !type || !subType || !amount || !description) {
    setResponseStatus(event, 400);
    return {
      success: false,
      message: 'Missing required fields',
    };
  }

  const finalAmount = amount * multiplier;

  // Simple mock transaction processing
  const currentBalance = faker.number.float({
    min: 1000,
    max: 10_000,
    fractionDigits: 2,
  });
  let newBalance = currentBalance;

  if (type === 'credit') {
    newBalance = currentBalance + finalAmount;
  } else if (type === 'debit') {
    switch (subType) {
      case 'deduct_all_assets': {
        newBalance = 0;

        break;
      }
      case 'manual_deduct': {
        newBalance = Math.max(0, currentBalance - finalAmount);

        break;
      }
      case 'recovery_deduct': {
        newBalance = currentBalance - finalAmount; // Can go negative

        break;
      }
      // No default
    }
  }

  await sleep(300);

  const transactionResult = {
    transactionId: faker.string.alphanumeric(12).toUpperCase(),
    userId,
    type,
    subType,
    amount: finalAmount,
    beforeBalance: currentBalance,
    newBalance,
    timestamp: new Date().toISOString(),
  };

  return {
    success: true,
    message: 'Transaction completed successfully',
    data: transactionResult,
  };
});
