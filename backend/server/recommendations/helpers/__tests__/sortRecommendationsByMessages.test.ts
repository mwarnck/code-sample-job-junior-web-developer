const UserModel = require('../../../user/user.model');

const { user: userMock, recommendations } = require('../../../../test/db');
import { sortRecommendationsByMessages } from '../sortRecommendationByMessages';
const { USER_ROLES } = require('../../../user/customModules');

const user = userMock.withAmazonAccount();
// const normalUser = { ...user, _id: '5c3c8bfa7340ad438fe416ad' };
let normalUser: any = null;
let automationUser: any = null;
let automationUserId: any = null;
let recommendationsToSort: any = [];
// const recommendationsToSort = [
//   recommendations.fbaMissingInbound(),
//   recommendations.fbaMissingInbound(),
//   {
//     ...recommendations.fbaMissingInbound(),
//     messages: recommendations.messagesWithLastMessageFromAutomationAcc()
//   },
//   recommendations.fbaMissingInbound(),
//   recommendations.fbaMissingInbound(),

//   {
//     ...recommendations.fbaMissingInbound(),
//     messages: recommendations.messagesWithLastMessageFromUser()
//   },
//   recommendations.fbaMissingInbound()
// ];

const messagesWithLastMessageFromAutomationAcc =
  recommendations.messagesWithLastMessageFromAutomationAcc();
const messagesWithLastMessageFromUser =
  recommendations.messagesWithLastMessageFromUser();

// returns a randon automation user id (just for tests!)
const randomAutomationUserId = async () => {
  const automation_users = await UserModel.find({
    roles: { $in: [USER_ROLES.AUTOMATION_USER] }
  })
    .select({ _id: 1 })
    .lean();
  return automation_users.rand()._id;
};

describe('sortRecommendationsByMessages() helper', () => {
  beforeAll(async () => {
    normalUser = await new UserModel({
      ...user,
      _id: '5c3c8bfa7340ad438fe416ad'
    }).save();
    automationUser = await new UserModel({
      ...userMock.automation()
    }).save();
    automationUserId = await randomAutomationUserId();
    console.log(`automationUserId: ${automationUserId}`);

    // this here is a little bit of a hack to set automation user id for sender and/or receiver
    for (const message of messagesWithLastMessageFromAutomationAcc) {
      message.sender = automationUserId.toString();
    }

    for (const message of messagesWithLastMessageFromUser) {
      if (message.text === 'Hallo Georgier') {
        message.receiver = automationUserId.toString();
      } else {
        message.sender = automationUserId.toString();
      }
    }

    recommendationsToSort = [
      recommendations.fbaMissingInbound(),
      recommendations.fbaMissingInbound(),
      {
        ...recommendations.fbaMissingInbound(),
        messages: messagesWithLastMessageFromAutomationAcc
      },
      recommendations.fbaMissingInbound(),
      recommendations.fbaMissingInbound(),
      {
        ...recommendations.fbaMissingInbound(),
        messages: messagesWithLastMessageFromUser
      },
      recommendations.fbaMissingInbound()
    ];
  });

  it('should return the sorted recommendations for automation user', async () => {
    const ret = await sortRecommendationsByMessages(
      recommendationsToSort,
      automationUser
    );
    expect(ret[0].messages).toStrictEqual(messagesWithLastMessageFromUser);
    expect(ret[1].messages).toStrictEqual(
      messagesWithLastMessageFromAutomationAcc
    );
  });
  it('should return the sorted recommendations for the normal user', async () => {
    jest
      .spyOn(normalUser, 'getAutomationUserOfAmazonAccount')
      .mockImplementation(() => {
        return automationUser;
      });

    const ret = await sortRecommendationsByMessages(
      recommendationsToSort,
      normalUser
    );
    expect(ret[0].messages).toStrictEqual(
      messagesWithLastMessageFromAutomationAcc
    );
    expect(ret[1].messages).toStrictEqual(messagesWithLastMessageFromUser);
  });
  it('should sort the recommendation with the message to the top regardless of the user if the user is null', async () => {
    const ret = await sortRecommendationsByMessages(
      recommendationsToSort,
      null
    );
    expect(ret[0].messages).toStrictEqual(
      messagesWithLastMessageFromAutomationAcc
    );
    expect(ret[1].messages).toStrictEqual(messagesWithLastMessageFromUser);
    expect(ret[2].messages).toBe(undefined);
    expect(ret[3].messages).toBe(undefined);
    expect(ret[4].messages).toBe(undefined);
    expect(ret[5].messages).toBe(undefined);
    expect(ret[6].messages).toBe(undefined);
  });
});
