import { Types } from 'mongoose';

const {
  user,
  recommendations,
  addresses,
  shipment
} = require('../../../../../test/db');
const User = require('../../../../user/user.model');
const RecommendationModel = require('../../../recommendations.model');
const UserAddressModel = require('../../../../addresses/user_address.model');
const { fbaMissingInboundService } = require('../fba_missing_inbound.service');
const { faker } = require('@faker-js/faker');
const FBAInboundShipmentModel = require('../../../../shipments/fba_inbound_shipment.model');

describe('Recommendation Missing Inbound Service', () => {
  let userWithAmazonAccount: any;
  let userWithAmazonAccountId: Types.ObjectId;
  let fakeMissingInboundWithQuantitySend: any;
  let fakeUserAddress: any;
  let fakeShipment: any;

  beforeEach(async () => {
    userWithAmazonAccount = await new User(user.withAmazonAccount()).save();
    userWithAmazonAccountId = userWithAmazonAccount.amazon_accounts[0].id;

    fakeMissingInboundWithQuantitySend =
      recommendations.fbaMissingInboundWithQuantitySend();
    fakeMissingInboundWithQuantitySend.amazon_account_id =
      userWithAmazonAccountId;
    fakeMissingInboundWithQuantitySend.user_id = userWithAmazonAccount._id;
    fakeMissingInboundWithQuantitySend.cta_id =
      faker.database.mongodbObjectId();

    fakeUserAddress = addresses.userAddress();

    fakeShipment = shipment.fbaInboundShipment();
    fakeShipment.amazon_account_id = userWithAmazonAccountId;
    fakeShipment.shipment_id = fakeMissingInboundWithQuantitySend.shipment_id;
  });

  describe('createPackingListForOneMissingInboundRecommendation', () => {
    it('should create a packing list for one missing inbound recommendation', async () => {
      const userAddress = await new UserAddressModel(fakeUserAddress).save();
      fakeMissingInboundWithQuantitySend.user_address = userAddress._id;
      const missingInbound = await new RecommendationModel(
        fakeMissingInboundWithQuantitySend
      ).save();

      fakeShipment.user_address = userAddress._id;
      await new FBAInboundShipmentModel(fakeShipment).save();

      const pdfBuffer =
        await fbaMissingInboundService.createPackingListForOneMissingInboundRecommendation(
          missingInbound,
          userWithAmazonAccount.language
        );

      expect(pdfBuffer).toBeDefined();
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });
  });
});
