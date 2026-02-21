import { faker } from '@faker-js/faker';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { unAuthorizedResponse, usePageResponseSuccess } from '~/utils/response';

function generateMockUserList(count: number) {
  const userList = [];
  const currencies = ['BRL', 'BTC', 'ETH', 'CNY'];
  const accountTypes = ['普通会员', 'VIP会员', '代理商', '超级代理'];
  const accountStatuses = ['active', 'inactive', 'suspended', 'locked'];
  const registrationMethods = ['manual', 'invitation', 'automatic'];
  const vipLevels = ['普通', 'VIP1', 'VIP2', 'VIP3', 'VIP4', 'VIP5'];

  for (let i = 0; i < count; i++) {
    const memberId = faker.string.alphanumeric({ length: 8 }).toUpperCase();
    const agentId = faker.string.alphanumeric({ length: 6 }).toUpperCase();
    const topAgentId = faker.string.alphanumeric({ length: 4 }).toUpperCase();

    const userItem = {
      id: faker.string.uuid(),
      currency: faker.helpers.arrayElement(currencies),
      memberId: `M${memberId}`,
      memberAccount: faker.internet.username(),
      accountType: faker.helpers.arrayElement(accountTypes),
      accountStatus: faker.helpers.arrayElement(accountStatuses),
      upperAgentId: `A${agentId}`,
      upperAgent: faker.person.fullName(),
      topAgentId: `T${topAgentId}`,
      topAgent: faker.person.fullName(),
      registrationTime: faker.date.between({ 
        from: '2022-01-01T00:00:00.000Z', 
        to: '2024-12-01T00:00:00.000Z' 
      }),
      vipLevel: faker.helpers.arrayElement(vipLevels),
      memberLevel: faker.number.int({ min: 1, max: 10 }),
      registrationMethod: faker.helpers.arrayElement(registrationMethods),
      balance: faker.number.float({ min: 0, max: 100000, fractionDigits: 2 }),
      lastLoginTime: faker.date.recent(),
      totalDeposit: faker.number.float({ min: 0, max: 500000, fractionDigits: 2 }),
      totalWithdraw: faker.number.float({ min: 0, max: 300000, fractionDigits: 2 }),
      loginCount: faker.number.int({ min: 1, max: 1000 }),
      deviceCount: faker.number.int({ min: 1, max: 5 }),
    };

    userList.push(userItem);
  }

  return userList;
}

const mockUserData = generateMockUserList(500);

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  await sleep(400);

  const { 
    page = 1, 
    pageSize = 20, 
    sortBy, 
    sortOrder,
    accountStatus,
    registrationMethod,
    currency,
    vipLevel,
    startDate,
    endDate,
    search
  } = getQuery(event);

  let filteredData = structuredClone(mockUserData);

  // 筛选条件
  if (accountStatus) {
    filteredData = filteredData.filter(user => user.accountStatus === accountStatus);
  }

  if (registrationMethod) {
    filteredData = filteredData.filter(user => user.registrationMethod === registrationMethod);
  }

  if (currency) {
    filteredData = filteredData.filter(user => user.currency === currency);
  }

  if (vipLevel) {
    filteredData = filteredData.filter(user => user.vipLevel === vipLevel);
  }

  // 日期筛选
  if (startDate && endDate) {
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    filteredData = filteredData.filter(user => {
      const regTime = new Date(user.registrationTime);
      return regTime >= start && regTime <= end;
    });
  }

  // 搜索功能
  if (search) {
    const searchTerm = (search as string).toLowerCase();
    filteredData = filteredData.filter(user => 
      user.memberAccount.toLowerCase().includes(searchTerm) ||
      user.memberId.toLowerCase().includes(searchTerm) ||
      user.upperAgent.toLowerCase().includes(searchTerm) ||
      user.topAgent.toLowerCase().includes(searchTerm)
    );
  }

  // 排序
  if (sortBy && Reflect.has(filteredData[0] || {}, sortBy as string)) {
    filteredData.sort((a, b) => {
      const aValue = a[sortBy as string];
      const bValue = b[sortBy as string];
      
      if (sortOrder === 'asc') {
        if (typeof aValue === 'number') {
          return aValue - bValue;
        }
        return aValue > bValue ? 1 : -1;
      } else {
        if (typeof aValue === 'number') {
          return bValue - aValue;
        }
        return aValue < bValue ? 1 : -1;
      }
    });
  }

  return usePageResponseSuccess(page as string, pageSize as string, filteredData);
}); 
