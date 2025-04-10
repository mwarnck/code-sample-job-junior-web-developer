import { faker } from '@faker-js/faker';
import { recommendationController } from '../recommendations.controller';

const { buildReq, buildRes } = require('../../../test/utils');
const RecommendationModel = require('../recommendations.model');
const UserAddressModel = require('../../addresses/user_address.model');
const FBAInboundShipmentModel = require('../../shipments/fba_inbound_shipment.model');
const {
  user,
  recommendations,
  addresses,
  shipment
} = require('../../../test/db');
const User = require('../../user/user.model');
const createSharingRelation = require('../../../test/db/compositions/sharing');
const {
  permissionLayerKeys,
  operations
} = require('../../user/sharing/model.permissions');

describe('Recommendations Controller', () => {
  let userWithAmazonAccount: any = null;
  let userWithAmazonAccountId: any = null;
  let userWithoutAccAndNoShared: any = null;
  let userAutomation: any = null;
  let fakeQuantityBundles: any = null;
  let fakeDamagedInventory: any = null;
  let fakeMisplacedInventory: any = null;
  let fakeMissingInboundWithQuantitySend: any = null;
  let fakeSizeChangeHigherFba: any = null;

  beforeAll(async () => {
    userAutomation = await new User(user.automation()).save();
  });

  beforeEach(async () => {
    userWithAmazonAccount = await new User(user.withAmazonAccount()).save();
    userWithAmazonAccountId = userWithAmazonAccount.amazon_accounts[0].id;
    userWithoutAccAndNoShared = await new User(user.minimal()).save();

    fakeQuantityBundles = recommendations.quantityBundle();
    fakeDamagedInventory = recommendations.fbaDamagedInventory();
    fakeMisplacedInventory = recommendations.fbaMisplacedInventory();
    fakeMissingInboundWithQuantitySend =
      recommendations.fbaMissingInboundWithQuantitySend();
    fakeSizeChangeHigherFba = recommendations.sizeChangeHigherFba();

    fakeQuantityBundles.amazon_account_id = userWithAmazonAccountId;
    fakeQuantityBundles.user_id = userWithAmazonAccount._id;
    fakeQuantityBundles.cta_id = faker.database.mongodbObjectId();
    fakeDamagedInventory.amazon_account_id = userWithAmazonAccountId;
    fakeDamagedInventory.user_id = userWithAmazonAccount._id;
    fakeDamagedInventory.cta_id = faker.database.mongodbObjectId();

    fakeMisplacedInventory.amazon_account_id = userWithAmazonAccountId;
    fakeMisplacedInventory.user_id = userWithAmazonAccount._id;
    fakeMisplacedInventory.cta_id = faker.database.mongodbObjectId();

    fakeMissingInboundWithQuantitySend.amazon_account_id =
      userWithAmazonAccountId;
    fakeMissingInboundWithQuantitySend.user_id = userWithAmazonAccount._id;
    fakeMissingInboundWithQuantitySend.cta_id =
      faker.database.mongodbObjectId();

    fakeSizeChangeHigherFba.amazon_account_id = userWithAmazonAccountId;
    fakeSizeChangeHigherFba.user_id = userWithAmazonAccount._id;
    fakeSizeChangeHigherFba.cta_id = faker.database.mongodbObjectId();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('patchStatus', () => {
    test('checks update status', async () => {
      const quantityBundle = await new RecommendationModel(
        fakeQuantityBundles
      ).save();

      const res = buildRes();
      const req = await buildReq({
        user: userWithAmazonAccount,
        recommendation: quantityBundle,
        body: { resolved_status: 'done', _id: quantityBundle._id }
      });

      await recommendationController.patchStatus(req, res);

      const updatedRecommendation = await RecommendationModel.findById(
        quantityBundle._id
      );

      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(updatedRecommendation._id).toEqual(quantityBundle._id);
      expect(updatedRecommendation.resolved_status).toEqual('done');
    });

    test('checks update status with invalid resolver value', async () => {
      const quantityBundle = await new RecommendationModel(
        fakeQuantityBundles
      ).save();

      const res = buildRes();
      const req = await buildReq({
        user: userWithAmazonAccount,
        recommendation: quantityBundle,
        body: {
          resolved_status: 'done',
          _id: quantityBundle._id,
          resolver: 'test' // --> invalid resolver, it should be ignored and resolver should be set to 'manual'
        }
      });

      await recommendationController.patchStatus(req, res);

      const updatedRecommendation = await RecommendationModel.findById(
        quantityBundle._id
      );

      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(updatedRecommendation._id).toEqual(quantityBundle._id);
      expect(updatedRecommendation.resolved_status).toEqual('done');
      expect(updatedRecommendation.resolver).toEqual('manual'); // --> resolver should be set to 'manual' if it is not a valid value

      // console.log(updatedRecommendation.resolver).to
    });

    test('checks update status with valid resolver value', async () => {
      const quantityBundle = await new RecommendationModel(
        fakeQuantityBundles
      ).save();

      const res = buildRes();
      const req = await buildReq({
        user: userWithAmazonAccount,
        recommendation: quantityBundle,
        body: {
          resolved_status: 'done',
          _id: quantityBundle._id,
          resolver: 'onboarding' // --> valid resolver value, it should be set to 'onboarding'
        }
      });

      await recommendationController.patchStatus(req, res);

      const updatedRecommendation = await RecommendationModel.findById(
        quantityBundle._id
      );

      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(updatedRecommendation._id).toEqual(quantityBundle._id);
      expect(updatedRecommendation.resolved_status).toEqual('done');
      expect(updatedRecommendation.resolver).toEqual('onboarding');

      // console.log(updatedRecommendation.resolver).to
    });

    test('checks update status with wrong user, should be possible because the access check is in the middleware', async () => {
      const quantityBundle = await new RecommendationModel(
        fakeQuantityBundles
      ).save();

      const test_user = user.withAmazonAccount();
      test_user._id = '123123123123';
      const db_user = await new User(test_user).save();

      const res = buildRes();
      const req = await buildReq({
        user: db_user,
        recommendation: quantityBundle,
        body: { resolved_status: 'done', _id: quantityBundle._id }
      });

      await recommendationController.patchStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.status).toHaveBeenCalledTimes(1);
    });
    test('checks update with invalid status ', async () => {
      const quantityBundle = await new RecommendationModel(
        fakeQuantityBundles
      ).save();
      const res = buildRes();
      const req = await buildReq({
        recommendation: quantityBundle,
        body: { resolved_status: 'sdafasd', _id: quantityBundle._id }
      });
      await recommendationController.patchStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.status).toHaveBeenCalledTimes(1);
    });
  });

  describe('patchCaseReimbursementId', () => {
    test('checks update case id', async () => {
      const case_reimbursement_id = '123123123123';
      const missingInbound = await new RecommendationModel(
        fakeMissingInboundWithQuantitySend
      ).save();

      const res = buildRes();
      const req = await buildReq({
        user: userWithAmazonAccount,
        recommendation: missingInbound,
        body: {
          _id: missingInbound._id,
          case_reimbursement_id,
          multi: false
        }
      });

      await recommendationController.patchCaseReimbursementId(req, res);

      const updatedRecommendation = await RecommendationModel.findById(
        missingInbound._id
      );

      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(updatedRecommendation.case_id).toEqual(case_reimbursement_id);
    });
  });

  describe('patchBundleSku', () => {
    test('update the recommendation with a bundle sku', async () => {
      const bundle_sku = '12345';
      const quantityBundle = await new RecommendationModel(
        fakeQuantityBundles
      ).save();

      const res = buildRes();
      const req = await buildReq({
        user: userWithAmazonAccount,
        recommendation: quantityBundle,
        body: {
          bundle_sku,
          multi: false
        }
      });

      await recommendationController.patchBundleSku(req, res);

      const updatedRecommendation = await RecommendationModel.findById(
        quantityBundle._id
      );

      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(updatedRecommendation.bundle_sku).toEqual(bundle_sku);
    });
  });

  describe('patchMissingInbound', () => {
    test('update missing inbound recommendation refund_by_skus with new quantity_send values', async () => {
      await new RecommendationModel(fakeMissingInboundWithQuantitySend).save();
      const recommendation = await RecommendationModel.findOne({
        amazon_account_id: userWithAmazonAccountId,
        usecase: 'fba_missing_inbound'
      });
      const res = buildRes();
      const req = await buildReq({
        user: userWithAmazonAccount,
        recommendation,
        body: {
          _id: recommendation._id,
          items: recommendation.refund_by_skus.map((item: any) => ({
            sku: item.sku,
            quantity_send: 42
          }))
        }
      });
      await recommendationController.patchMissingInbound(req, res);

      const updatedRecommendation = await RecommendationModel.findById(
        recommendation._id
      );
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      for (const item of updatedRecommendation.refund_by_skus) {
        expect(item.quantity_send).toEqual(42);
      }
    });
    test('set not_shipped status, when all quantity_send equal to quantity_received', async () => {
      await new RecommendationModel(fakeMissingInboundWithQuantitySend).save();
      const recommendation = await RecommendationModel.findOne({
        amazon_account_id: userWithAmazonAccountId,
        usecase: 'fba_missing_inbound'
      });
      const res = buildRes();
      const req = await buildReq({
        user: userWithAmazonAccount,
        recommendation,
        body: {
          _id: recommendation._id,
          items: recommendation.refund_by_skus.map((item: any) => ({
            sku: item.sku,
            quantity_send: item.quantity_received
          }))
        }
      });
      await recommendationController.patchMissingInbound(req, res);

      const updatedRecommendation = await RecommendationModel.findById(
        recommendation._id
      );
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      for (const item of updatedRecommendation.refund_by_skus) {
        expect(item.quantity_send).toEqual(item.quantity_received);
      }
      expect(updatedRecommendation.resolved_status).toEqual('not_shipped');
    });
  });

  describe('sizeChangeHigherFbaConfirmWrongMeasurement', () => {
    test('update size change higher recommendation confirm_wrong_measurement value', async () => {
      await new RecommendationModel(fakeSizeChangeHigherFba).save();
      const recommendation = await RecommendationModel.findOne({
        amazon_account_id: userWithAmazonAccountId,
        usecase: 'size_change_higher_fba'
      });
      const res = buildRes();
      const req = await buildReq({
        user: userWithAmazonAccount,
        recommendation,
        body: {
          _id: recommendation._id
        }
      });
      await recommendationController.patchSizeChangeHigherFbaConfirmWrongMeasurement(
        req,
        res
      );

      const updatedRecommendation = await RecommendationModel.findById(
        recommendation._id
      );
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(updatedRecommendation.confirm_wrong_measurement).toEqual(true);
    });
  });

  describe('getRecommendations', () => {
    let usecases: string[];
    let usecase_wrong: string;
    let userWithAccountAndWithSharedSendingRecommendations: any = null;
    let userWithoutAccountButWithSharedReceivingRecommendations: any = null;
    let amazonAccountIdRecommendations: any = null;
    let userWithAccountAndWithSharedSendingRecommendationsAutomated: any = null;
    let userWithoutAccountButWithSharedReceivingRecommendationsAutomated: any =
      null;
    let userWithoutAccountButSharedAnalystRole: any = null;
    let amazonAccountIdRecommendationsAutomated: any = null;

    beforeEach(async () => {
      usecases = ['fba_misplaced_damaged_inventory', 'fba_missing_inbound'];
      usecase_wrong = 'example_usecase';

      ({
        userWithAmazonAccount:
          userWithAccountAndWithSharedSendingRecommendations,
        userWithoutAccount:
          userWithoutAccountButWithSharedReceivingRecommendations,
        userWithoutAccountButSharedAnalystRole
      } = await createSharingRelation({
        name: permissionLayerKeys.recommendations,
        access: [operations.write]
      }));

      amazonAccountIdRecommendations =
        userWithAccountAndWithSharedSendingRecommendations.amazon_accounts[0]
          .id;

      ({
        userWithAmazonAccount:
          userWithAccountAndWithSharedSendingRecommendationsAutomated,
        userWithoutAccount:
          userWithoutAccountButWithSharedReceivingRecommendationsAutomated
      } = await createSharingRelation({
        name: permissionLayerKeys.recommendations_automated,
        access: [operations.write],
        subTypes: ['automated_recommendations']
      }));

      userWithoutAccountButWithSharedReceivingRecommendationsAutomated.username =
        userAutomation.username;
      userWithoutAccountButWithSharedReceivingRecommendationsAutomated.email =
        userAutomation.email;

      amazonAccountIdRecommendationsAutomated =
        userWithAccountAndWithSharedSendingRecommendationsAutomated
          .amazon_accounts[0].id;
    });

    test('should not return specific recommendations for a user which did not receive the recommendations_automated permission', async () => {
      const res = await buildRes();
      const req = await buildReq({
        user: userWithAmazonAccount,
        params: {
          amazon_account_id: amazonAccountIdRecommendationsAutomated
        }
      });

      await recommendationController.getRecommendations(req, res);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        data: {}
      });
    });

    test('return empty object of recommendations when amazon account id from request do not belong to user (shared account)', async () => {
      userWithAmazonAccount.roles = ['paid'];

      const res = buildRes();
      const req = await buildReq({
        user: userWithAmazonAccount,
        params: {
          id: '123456789'
        }
      });
      await recommendationController.getRecommendations(req, res);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        data: {}
      });
    });

    it('call the getRecommendations method with the right db queries', async () => {
      userWithAmazonAccount.roles = ['paid'];
      await userWithAmazonAccount.save();

      const recfakeQuantityBundles = await new RecommendationModel(
        fakeQuantityBundles
      ).save();

      const res = await buildRes();
      const req = await buildReq({
        user: userWithAmazonAccount,
        params: {
          amazon_account_id: userWithAmazonAccountId
        }
      });

      await recommendationController.getRecommendations(req, res);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json.mock.calls[0][0].data).toHaveProperty('quantity_bundles');
      expect(res.json.mock.calls[0][0].data.quantity_bundles.automated).toBe(
        false
      );
      expect(
        res.json.mock.calls[0][0].data.quantity_bundles.data[0]._id.toString()
      ).toBe(recfakeQuantityBundles._id.toString());

      expect(
        res.json.mock.calls[0][0].data.quantity_bundles.savings.potential
      ).toBe(1);
      expect(
        res.json.mock.calls[0][0].data.quantity_bundles.savings.realized
      ).toBe(0);
      expect(
        res.json.mock.calls[0][0].data.quantity_bundles
          .number_of_recommendations.total
      ).toBe(1);
      expect(
        res.json.mock.calls[0][0].data.quantity_bundles
          .number_of_recommendations.completed
      ).toBe(0);
    });
  });

  describe('getToalCostsavings', () => {
    it('should return total savings for a user', async () => {
      const savings = 32136.05454887731;
      const res = buildRes();
      const req = await buildReq({ user });

      jest
        .spyOn(RecommendationModel, 'getMaxCostsavingsByUser')
        .mockImplementation(() => {
          return Promise.resolve(savings);
        });

      await recommendationController.getToalCostsavings(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0]).toMatchInlineSnapshot(`
[
  {
    "data": {
      "savings": 32136.05454887731,
    },
  },
]
`);
    });
  });

  describe('getFbaMissingInboundPackingList', () => {
    let fakeUserAddress: any;
    let fakeShipment: any;

    beforeEach(() => {
      fakeUserAddress = addresses.userAddress();
      fakeShipment = shipment.fbaInboundShipment();
      fakeShipment.amazon_account_id = userWithAmazonAccountId;
      fakeShipment.shipment_id = fakeMissingInboundWithQuantitySend.shipment_id;
    });

    it('should return a 200 status and a PDF buffer for valid inputs', async () => {
      const userAddress = await new UserAddressModel(fakeUserAddress).save();
      fakeMissingInboundWithQuantitySend.user_address = userAddress._id;
      const missingInbound = await new RecommendationModel(
        fakeMissingInboundWithQuantitySend
      ).save();

      fakeShipment.user_address = userAddress._id;
      await new FBAInboundShipmentModel(fakeShipment).save();

      const res = await buildRes();
      const req = await buildReq({
        user: userWithAmazonAccount,
        recommendation: missingInbound,
        params: {
          amazon_account_id: userWithAmazonAccountId
        }
      });
      await recommendationController.getFbaMissingInboundPackingList(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.set).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(res.set).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('packingList_')
      );
      const responseBuffer = res.send.mock.calls[0][0];
      expect(Buffer.isBuffer(responseBuffer)).toBe(true);
      expect(responseBuffer.length).toBeGreaterThan(0);
    });
  });
});
