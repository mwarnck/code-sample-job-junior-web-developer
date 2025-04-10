import Toggle from '../../toggles/toggles.model';
import { faker } from '@faker-js/faker';

const RecommendationModel = require('../recommendations.model');
const User = require('../../user/user.model');
const { MessageModel } = require('../../messages/messages.model');
const createSharingRelation = require('../../../test/db/compositions/sharing');
const {
  permissionLayerKeys,
  operations
} = require('../../user/sharing/model.permissions');
const { recommendations, user } = require('../../../test/db');
const CtasModel = require('../../assistant/cta/cta.model');
const { filter_config } = require('../recommendations.constants');
const { recommendationService } = require('../recommendations.service');
const { USER_ROLES } = require('../../user/customModules');
const { ToggleNames } = require('../../toggles/toggles.enums');

jest.mock('../../toggles/toggles.model', () => ({
  findOne: jest.fn(),
  getTimeSavingsReviewsTrigger: jest.fn()
}));

describe('Recommendations Service', () => {
  let usecases: any = null;
  let usecase_quantity_bundles: any = null;
  let quantityBundlesRecommendation: any = null;
  let userWithAcc: any = null;
  let userAutomation: any = null;
  let userWithAccAmazonAccountId: any = null;
  let userWithoutAccountButWithSharedReceivingRecommendations: any = null;
  let userWithAccountAndWithSharedSendingRecommendations: any = null;
  let userWithoutAccountButWithSharedReceivingRecommendationsAutomated: any =
    null;
  let userWithAccountAndWithSharedSendingRecommendationsAutomated: any = null;
  let quantityBundlesRecommendationSaved: any = null;
  let userWithoutAccAndNoShared: any = null;
  let amazonAccountIdRecommendations: any = null;
  let amazonAccountIdRecommendationsAutomated: any = null;
  let recommendationFindSpy: any = null;

  beforeEach(async () => {
    userAutomation = await new User(user.automation()).save();
    usecases = ['fba_misplaced_damaged_inventory', 'fba_missing_inbound'];
    usecase_quantity_bundles = 'quantity_bundles';
    recommendationFindSpy = jest.spyOn(RecommendationModel, 'find');
    jest.spyOn(CtasModel, 'find');
    userWithAcc = await new User(user.withAmazonAccount()).save();
    userWithAccAmazonAccountId = userWithAcc.amazon_accounts[0].id;
    quantityBundlesRecommendation = recommendations.quantityBundle();
    quantityBundlesRecommendation.amazon_account_id =
      userWithAccAmazonAccountId;
    quantityBundlesRecommendation.user_id = userWithAcc._id;
    quantityBundlesRecommendation.cta_id = faker.database.mongodbObjectId();
    quantityBundlesRecommendationSaved = await new RecommendationModel(
      quantityBundlesRecommendation
    ).save();
    userWithoutAccAndNoShared = await new User(user.minimal()).save();
    ({
      userWithAmazonAccount: userWithAccountAndWithSharedSendingRecommendations,
      userWithoutAccount:
        userWithoutAccountButWithSharedReceivingRecommendations
    } = await createSharingRelation(
      {
        name: permissionLayerKeys.recommendations,
        access: [operations.write]
      },
      userAutomation
    ));
    amazonAccountIdRecommendations =
      userWithAccountAndWithSharedSendingRecommendations.amazon_accounts[0].id;
    ({
      userWithoutAccount:
        userWithoutAccountButWithSharedReceivingRecommendationsAutomated,
      userWithAmazonAccount:
        userWithAccountAndWithSharedSendingRecommendationsAutomated
    } = await createSharingRelation(
      {
        name: permissionLayerKeys.recommendations_automated,
        access: [operations.write],
        subTypes: ['automated_recommendations']
      },
      userAutomation
    ));

    userWithoutAccountButWithSharedReceivingRecommendationsAutomated.username =
      // config.automationAccount.username;
      userAutomation.username;
    userWithoutAccountButWithSharedReceivingRecommendationsAutomated.email =
      // config.automationAccount.email;
      userAutomation.email;

    amazonAccountIdRecommendationsAutomated =
      userWithAccountAndWithSharedSendingRecommendationsAutomated
        .amazon_accounts[0].id;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // currenty skipped because recommendations.service.getRecommendationsByUsecase withMessages not used
  describe.skip('Recommendations - Populate with Messages Collection', () => {
    it('should return the messages when called with withMessages: true', async () => {
      const messages = [
        {
          sender: userWithAccAmazonAccountId,
          receiver: faker.database.mongodbObjectId(),
          text: 'test'
        }
      ];
      const messagesSaved = await MessageModel.insertMany(messages);

      quantityBundlesRecommendation.messages = messagesSaved.map(
        (message: any) => message._id
      );

      quantityBundlesRecommendationSaved = await new RecommendationModel(
        quantityBundlesRecommendation
      ).save();

      const recTest = await recommendationService.getRecommendationsByUsecase(
        usecase_quantity_bundles,
        userWithAcc,
        userWithAccAmazonAccountId,
        { withMessages: true }
      );

      expect(recTest[0].messages[0]).toEqual(
        expect.objectContaining(messagesSaved[0].toObject())
      );

      await expect(recommendationFindSpy).toHaveBeenNthCalledWith(1, {
        usecase: 'quantity_bundles',
        amazon_account_id: userWithAccAmazonAccountId,
        cta_id: { $exists: true }
      });
    });
  });

  describe('getRecommendationsByUsecase', () => {
    it('should return the value returned by the usecase function', async () => {
      await recommendationService.getRecommendationsByUsecase(
        usecase_quantity_bundles,
        userWithAcc,
        userWithAccAmazonAccountId
      );

      await expect(recommendationFindSpy).toHaveBeenNthCalledWith(1, {
        usecase: 'quantity_bundles',
        amazon_account_id: userWithAccAmazonAccountId,
        cta_id: { $exists: true }
      });
    });

    it('should throw an error when an unknown usecase is provided', async () => {
      const invalidUsecase = 'invalid_usecase';
      await expect(
        recommendationService.getRecommendationsByUsecase(
          invalidUsecase,
          userWithAcc,
          userWithAccAmazonAccountId
        )
      ).rejects.toThrow(`Use case '${invalidUsecase}' not handled`);
    });

    // [
    //   'quantity_bundles',
    //   'fba_missing_inbound',
    //   'fba_misplaced_damaged_inventory',
    //   'products_bundles',
    //   'size_change_higher_fba',
    //   'inbound_labels_low_fba_stock',
    //   'product_feedbacks'
    // ].forEach((usecase) => {
    //   it(`should return the value returned by the usecase function for ${usecase}`, async () => {
    //     const recommendations =
    //       await recommendationService.getRecommendationsByUsecase(
    //         usecase,
    //         userWithAcc,
    //         userWithAccAmazonAccountId
    //       );

    //     expect(recommendations).toEqual(
    //       expect.arrayContaining([
    //         expect.objectContaining({
    //           usecase: usecase,
    //           amazon_account_id: userWithAccAmazonAccountId
    //         })
    //       ])
    //     );
    //   });
    // });
  });

  describe('calculateSavingsForUsecase', () => {
    it('should return the value returned by the usecase function', async () => {
      const savings = await recommendationService.calculateSavingsForUsecase(
        usecase_quantity_bundles,
        [quantityBundlesRecommendation]
      );
      expect(savings).toEqual({
        potential: 1,
        realized: 0,
        currency: 'EUR'
      });
    });

    it('should throw an error when no recommendations data is provided', async () => {
      const invalidRecommendationsData = null;
      await expect(
        recommendationService.calculateSavingsForUsecase(
          usecase_quantity_bundles,
          invalidRecommendationsData
        )
      ).rejects.toThrow(`No recommendations provided`);
    });
  });

  describe('removeRecommendationDataIfUserIsNotPaid', () => {
    it('should remove the data of the usecase if the owner user is not paid', async () => {
      const data =
        await recommendationService.removeRecommendationDataIfUserIsNotPaid(
          false,
          [quantityBundlesRecommendation]
        );
      expect(data).toEqual([]);
    });
    it('should not remove the data of the usecase if the owner user is paid', async () => {
      const data =
        await recommendationService.removeRecommendationDataIfUserIsNotPaid(
          true,
          [quantityBundlesRecommendation]
        );
      expect(data).toEqual([quantityBundlesRecommendation]);
    });
  });

  describe('getRecommendationCountOfUsecase', () => {
    it('should return the value returned by the usecase function', async () => {
      const resolvedQuantityBundlesRecommendation =
        recommendations.quantityBundle();
      resolvedQuantityBundlesRecommendation.resolved = true;
      const unresolvedQuantityBundlesRecommendation =
        recommendations.quantityBundle();
      unresolvedQuantityBundlesRecommendation.resolved = false;

      const returnValue =
        await recommendationService.getRecommendationCountOfUsecase(
          usecase_quantity_bundles,
          [
            unresolvedQuantityBundlesRecommendation,
            resolvedQuantityBundlesRecommendation
          ]
        );

      expect(returnValue).toEqual({
        total: 2,
        completed: 1
      });
    });
  });

  describe('getIsAutomated', () => {
    let findOneSpy: jest.SpyInstance;

    beforeEach(() => {
      jest.clearAllMocks();
      findOneSpy = jest.spyOn(Toggle, 'findOne');
    });

    afterEach(() => {
      findOneSpy.mockRestore();
    });

    it('should return true when toggle is found and it is active', async () => {
      const amazon_account_id = 'example_account_id';

      // @ts-ignore
      Toggle.findOne.mockResolvedValue({ active: true });

      const result =
        await recommendationService.getIsAutomated(amazon_account_id);
      expect(result).toBe(true);
      expect(Toggle.findOne).toHaveBeenCalledWith({
        toggle_name: ToggleNames.AUTOMATED_RECOMMENDATIONS_TRIGGER,
        amazon_account_id
      });
    });

    it('should return false when toggle is found but it is not active', async () => {
      const amazon_account_id = 'example_account_id';

      // @ts-ignore
      Toggle.findOne.mockResolvedValue({ active: false });

      const result =
        await recommendationService.getIsAutomated(amazon_account_id);
      expect(result).toBe(false);
    });

    it('should return false when no matching toggle is found', async () => {
      const amazon_account_id = 'example_account_id';

      // @ts-ignore
      Toggle.findOne.mockResolvedValue(null);

      const result =
        await recommendationService.getIsAutomated(amazon_account_id);
      expect(result).toBe(false);
    });
  });

  describe('getRecommendationData', () => {
    it('should return the correct data structure for automation user', async () => {
      const expectedValue = 'Expected Value';

      jest
        .spyOn(recommendationService, 'getRecommendationsByUsecase')
        .mockResolvedValue(expectedValue);

      const result = await recommendationService.getRecommendationData(
        usecases[0],
        userWithoutAccountButWithSharedReceivingRecommendationsAutomated,
        amazonAccountIdRecommendationsAutomated,
        userWithoutAccountButWithSharedReceivingRecommendationsAutomated
      );

      expect(result).toMatchInlineSnapshot(`
  {
    "automated": true,
    "data": "Expected Value",
  }
  `);
    });

    it('should return the correct data structure for paid user', async () => {
      const expectedValue = 'Expected Value';

      const paidUser =
        userWithAccountAndWithSharedSendingRecommendationsAutomated;
      paidUser.roles = ['paid', 'unlimited'];

      jest
        .spyOn(recommendationService, 'getRecommendationsByUsecase')
        .mockResolvedValue(expectedValue);
      jest
        .spyOn(recommendationService, 'calculateSavingsForUsecase')
        .mockResolvedValue(expectedValue);
      jest
        .spyOn(recommendationService, 'getRecommendationCountOfUsecase')
        .mockResolvedValue(expectedValue);

      const result = await recommendationService.getRecommendationData(
        usecases[0],
        paidUser,
        amazonAccountIdRecommendationsAutomated,
        paidUser
      );

      expect(result).toMatchInlineSnapshot(`
{
  "automated": false,
  "data": "Expected Value",
}
`);
    });
  });

  describe('filterRecommendations', () => {
    const createRecommendations = ({
      usecaseNameCamelCase,
      usecaseName
    }: any) => {
      const resolved_recommendations = filter_config[
        usecaseName
      ].is_resolved_with_status.map((status: any) => {
        const recommendation = recommendations[usecaseNameCamelCase]();
        recommendation.resolved_status = status;
        return recommendation;
      });
      const in_progress_recommendations = filter_config[
        usecaseName
      ].is_in_progress_with_status.map((status: any) => {
        const recommendation = recommendations[usecaseNameCamelCase]();
        recommendation.resolved_status = status;
        return recommendation;
      });

      return [...resolved_recommendations, ...in_progress_recommendations];
    };
    const getRecommendations = () => {
      return {
        fba_missing_inbound: {
          data: createRecommendations({
            usecaseName: 'fba_missing_inbound',
            usecaseNameCamelCase: 'fbaMissingInbound'
          })
        },
        fba_misplaced_damaged_inventory: {
          data: createRecommendations({
            usecaseName: 'fba_misplaced_damaged_inventory',
            usecaseNameCamelCase: 'fbaMisplacedDamagedInventory'
          })
        },
        size_change_higher_fba: {
          data: createRecommendations({
            usecaseName: 'size_change_higher_fba',
            usecaseNameCamelCase: 'sizeChangeHigherFba'
          })
        },
        products_bundles: {
          data: createRecommendations({
            usecaseName: 'products_bundles',
            usecaseNameCamelCase: 'productsBundles'
          })
        },
        quantity_bundles: {
          data: createRecommendations({
            usecaseName: 'quantity_bundles',
            usecaseNameCamelCase: 'quantityBundle'
          })
        },
        inbound_labels_low_fba_stock: {
          data: createRecommendations({
            usecaseName: 'inbound_labels_low_fba_stock',
            usecaseNameCamelCase: 'inboundLabelsLowFbaStock'
          })
        },
        product_feedbacks: {
          data: createRecommendations({
            usecaseName: 'product_feedbacks',
            usecaseNameCamelCase: 'productFeedbacks'
          })
        }
      };
    };

    it('should filter recommendations with last message from automation ', async () => {
      const without_msg = recommendations.fbaMissingInbound();
      const last_msg_automation = recommendations.fbaMissingInbound();
      last_msg_automation.messages =
        recommendations.messagesWithLastMessageFromAutomationAcc();
      last_msg_automation.messages[0].sender = userAutomation._id.toString();
      const last_msg_user = recommendations.fbaMissingInbound();
      last_msg_user.messages =
        recommendations.messagesWithLastMessageFromUser();
      for (const message of last_msg_user.messages) {
        if (message.text === 'Hallo Georgier') {
          message.receiver = userAutomation._id.toString();
        } else {
          message.sender = userAutomation._id.toString();
        }
      }

      const result = await recommendationService.filterRecommendations({
        recommendationsData: {
          fba_missing_inbound: {
            data: [without_msg, last_msg_user, last_msg_automation]
          }
        },
        filter: 'messages'
      });
      expect(result.fba_missing_inbound.data.length).toBe(1);
    });
    it('should filter resolved recommendations', async () => {
      const data = getRecommendations();
      const result = await recommendationService.filterRecommendations({
        recommendationsData: data,
        filter: 'resolved'
      });
      for (const usecase in filter_config) {
        const expected_length =
          filter_config[usecase].is_resolved_with_status.length;
        expect(result[usecase].data.length).toBe(expected_length);
      }
    });
    it('should filter in_progress recommendations', async () => {
      const data = getRecommendations();
      const result = await recommendationService.filterRecommendations({
        recommendationsData: data,
        filter: 'in_progress'
      });
      for (const usecase in filter_config) {
        const expected_length =
          filter_config[usecase].is_in_progress_with_status.length;
        expect(result[usecase].data.length).toBe(expected_length);
      }
    });
    it('should filter unresolved recommendations', async () => {
      const resolved = recommendations.fbaMissingInbound();
      resolved.resolved = true;
      const unresolved = recommendations.fbaMissingInbound();
      unresolved.resolved = false;

      const result = await recommendationService.filterRecommendations({
        recommendationsData: {
          fba_missing_inbound: { data: [resolved, unresolved] }
        },
        filter: 'unresolved'
      });
      expect(result.fba_missing_inbound.data.length).toBe(1);
    });
    it('should filter resolved_by_automation recommendations', async () => {
      const resolved_by_automation = recommendations.fbaMissingInbound();
      resolved_by_automation.resolved_status = 'reimbursed';
      resolved_by_automation.resolved_by_automation = true;
      const in_progress_by_automation = recommendations.fbaMissingInbound();
      in_progress_by_automation.resolved_status = 'proof_of_service';
      in_progress_by_automation.resolved_by_automation = true;
      const resolved_by_user = recommendations.fbaMissingInbound();
      resolved_by_user.resolved_status = 'reimbursed';
      resolved_by_user.resolved_by_automation = false;

      const result = await recommendationService.filterRecommendations({
        recommendationsData: {
          fba_missing_inbound: {
            data: [
              resolved_by_automation,
              in_progress_by_automation,
              resolved_by_user
            ]
          }
        },
        filter: 'resolved_by_automation'
      });
      expect(result.fba_missing_inbound.data.length).toBe(1);
    });
    it('should filter in_progress_by_automation recommendations', async () => {
      const resolved_by_automation = recommendations.fbaMissingInbound();
      resolved_by_automation.resolved_status = 'reimbursed';
      resolved_by_automation.resolved_by_automation = true;
      const in_progress_by_automation = recommendations.fbaMissingInbound();
      in_progress_by_automation.resolved_status = 'proof_of_service';
      in_progress_by_automation.resolved_by_automation = true;
      const in_progress_by_user = recommendations.fbaMissingInbound();
      in_progress_by_user.resolved_status = 'proof_of_service';
      in_progress_by_user.resolved_by_automation = false;

      const result = await recommendationService.filterRecommendations({
        recommendationsData: {
          fba_missing_inbound: {
            data: [
              resolved_by_automation,
              in_progress_by_automation,
              in_progress_by_user
            ]
          }
        },
        filter: 'in_progress_by_automation'
      });
      expect(result.fba_missing_inbound.data.length).toBe(1);
    });
  });
});
