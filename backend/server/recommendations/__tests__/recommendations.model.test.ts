const { recommendations, user } = require('../../../test/db');
const User = require('../../user/user.model');
const { MessageModel } = require('../../messages/messages.model');

const {
  filterForInboundReceived
} = require('../recommendations.model.statics');

const Recommendation = require('../recommendations.model');

describe('Recommendations Model', () => {
  let quantityBundlesRecommendation: any = null;
  let userWithAcc: any = null;

  beforeEach(async () => {
    quantityBundlesRecommendation = recommendations.quantityBundle();
    userWithAcc = await new User(user.withAmazonAccount()).save();
    quantityBundlesRecommendation.amazon_account_id =
      userWithAcc.amazon_accounts[0]._id;
    quantityBundlesRecommendation.user_id = userWithAcc._id;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('quantity bundles', () => {
    test('checks the types of quantity bundles', async () => {
      const valid = await new Recommendation(
        quantityBundlesRecommendation
      ).save();
      expect(valid.usecase).not.toBe(undefined);
      expect(valid.user_id).not.toBe(undefined);
      expect(valid.resolved).not.toBe(undefined);
      expect(valid.products[0].sku).not.toBe(undefined);
      expect(valid.products[0].asin).not.toBe(undefined);
      expect(valid.amazon_account_id).not.toBe(undefined);
      expect(valid.orders).not.toBe(undefined);
      expect(valid.costsavings).not.toBe(undefined);
      expect(valid.average_fee_per_unit).not.toBe(undefined);
    });

    test('checks the value of resolver', async () => {
      const recommendation = await new Recommendation(
        quantityBundlesRecommendation
      ).save();

      recommendation.resolver = 'test';
      await expect(
        recommendation.save()
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        '"quantity_bundles validation failed: resolver: `test` is not a valid enum value for path `resolver`."'
      );
      recommendation.resolver = 'auto';
      await recommendation.save();
    });

    test('checks the value of resolved status', async () => {
      const recommendation = await new Recommendation(
        quantityBundlesRecommendation
      ).save();
      recommendation.resolved_status = 'test';
      await expect(
        recommendation.save()
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        '"quantity_bundles validation failed: resolved_status: `test` is not a valid enum value for path `resolved_status`."'
      );

      recommendation.resolved_status = 'done';
      await recommendation.save();
    });
    test('checks filterForInboundReceived', async () => {
      const recommendationInboundReceived =
        recommendations.inboundLabelsLowFbaStock();
      recommendationInboundReceived.inbound_received = true;

      const recommendationsWithNoInboundReceived = [
        recommendations.quantityBundle(),
        recommendations.fbaDamagedInventory(),
        recommendations.fbaMisplacedInventory(),
        recommendations.inboundLabelsLowFbaStock(),
        recommendations.inboundLabelsLowFbaStock()
      ];
      const recommendationsWithInboundReceived = [
        recommendations.quantityBundle(),
        recommendations.fbaDamagedInventory(),
        recommendations.fbaMisplacedInventory(),
        recommendations.inboundLabelsLowFbaStock(),
        recommendationInboundReceived
      ];

      const nothingFiltered = filterForInboundReceived(
        recommendationsWithNoInboundReceived
      );
      const oneFiltered = filterForInboundReceived(
        recommendationsWithInboundReceived
      );

      expect(nothingFiltered.length).toBe(5);
      expect(nothingFiltered).toStrictEqual(
        recommendationsWithNoInboundReceived
      );
      expect(oneFiltered.length).toBe(4);
      expect(oneFiltered).toStrictEqual(
        recommendationsWithInboundReceived.slice(0, -1)
      );
    });
    test('dont creates a new recommendations if user_id is not compatible to amazon_account_id', async () => {
      const recommendation = await new Recommendation(
        recommendations.quantityBundle()
      );
      await expect(
        recommendation.save()
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"quantity_bundles validation failed: user_id: User does not exist or is not the owner of this amazon account id"`
      );
    });

    test('creates a new recommendation without amazon_acc if usecase is seller_account_not_connected', async () => {
      const newUser = await new User(user.minimal()).save();
      const accountNotConnectedRecommendation =
        recommendations.sellerAccountNotConnected();
      accountNotConnectedRecommendation.user_id = newUser._id;
      await new Recommendation(accountNotConnectedRecommendation).save();
    });

    test('Should save a message an attach it to the Recommendation', async () => {
      const newUser1 = await new User(user.minimal()).save();
      const newUser2 = await new User(user.minimal()).save();
      const accountNotConnectedRecommendation =
        recommendations.sellerAccountNotConnected();
      accountNotConnectedRecommendation.user_id = newUser1._id;

      const messages = [
        {
          sender: newUser1._id,
          receiver: newUser2._id,
          text: 'test'
        }
      ];
      const messagesSaved = await MessageModel.insertMany(messages);

      accountNotConnectedRecommendation.messages = messagesSaved.map(
        (message: any) => message._id
      );

      await new Recommendation(accountNotConnectedRecommendation).save();
    });
  });
});
