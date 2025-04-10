import {
  userDocumentsService,
  UserDocumentsService
} from '../../../user/user-documents/user-documents.service';
import { BaseService } from '../../../config/base/base.service';
import { RecommendationUseCases } from '../../recommendations.enums';
import { TranslatedLanguage } from '../../recommendations.types';
import { Types } from 'mongoose';
import { renderTemplate } from '../../helpers/pdf/renderTemplate';
import path from 'path';
import { generatePDF } from '../../helpers/pdf/generatePDF';
import FileSystemService from '../../../../common/services/file-system/file-system.service';
import { IFbaMissingInboundService } from './fba_missing_inbound.interfaces';
import {
  DetailsAndItemsFromShipment,
  DetailsFromUserAddress,
  DetailsAndItemsFromShipmentItem,
  HydratedFbaMissingInboundRecommendationDoc
} from './fba_missing_inbound.types';
import RecommendationModel from '../../recommendations.model';
import { getUserAsinsAggregate } from '../../helpers/get-user-asin.helper';

const FBAInboundShipmentModel = require('../../../shipments/fba_inbound_shipment.model');
const UserModel = require('../../../user/user.model');
const UserAsin = require('../../../user/user_asins.model');
const UserAddressModel = require('../../../addresses/user_address.model');

class FbaMissingInboundService
  extends BaseService
  implements IFbaMissingInboundService
{
  private static instance: FbaMissingInboundService;
  private usecase = RecommendationUseCases.FBA_MISSING_INBOUND;
  private userDocumentsService: UserDocumentsService;

  constructor(userDocumentsService: UserDocumentsService) {
    super();
    this.userDocumentsService = userDocumentsService;
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new FbaMissingInboundService(userDocumentsService);
    }
    return this.instance;
  }

  getRecommendations = async (user: any, amazon_account_id: string) => {
    const amazonAccountIDs = user.amazon_accounts.map((acc: any) => {
      return acc._id;
    });

    const userRecommendations: any = await RecommendationModel.find({
      usecase: this.usecase,
      amazon_account_id,
      cta_id: { $exists: true }
    })
      .sort({
        shipment_date: -1,
        created_at: -1,
        resolved: 1
      })
      .lean();

    let skus: any = [];
    let amazonAccounts: any = [];
    let countries: any = [];
    for (const recommendationData of userRecommendations) {
      const amazonAcc = user.amazon_accounts.find(
        (acc: any) =>
          acc._id.toString() ===
          recommendationData.amazon_account_id!.toString()
      );
      if (amazonAcc) {
        recommendationData.currency = amazonAcc.default_marketplace.currency;
        const alreadyIn = amazonAccounts.find(
          (acc: any) => acc === amazonAcc._id
        );
        if (!alreadyIn) {
          amazonAccounts = [...amazonAccounts, amazonAcc._id];
          countries = [...countries, amazonAcc.default_marketplace.country];
        }
      }

      for (const data of recommendationData.refund_by_skus) {
        skus = [...skus, data.sku];
      }
    }

    const userAsin = await getUserAsinsAggregate(
      skus,
      amazonAccounts,
      amazonAccountIDs,
      countries
    );
    let recommendations: any = [];
    for (const recommendationData of userRecommendations) {
      for (const sku of recommendationData.refund_by_skus) {
        const matchingUserAsin = userAsin.find(
          (prod: any) => prod.sku === sku.sku
        );
        sku.name = matchingUserAsin ? matchingUserAsin?.name : null;
        sku.image = matchingUserAsin ? matchingUserAsin?.image : null;
        sku.asin = matchingUserAsin ? matchingUserAsin?.asin : null;
      }
      recommendations = [...recommendations, recommendationData];
    }
    return recommendations;
  };

  private getDetailsAndItemsFromShipment = async ({
    shipment_id,
    user_id,
    amazon_account_id
  }: {
    shipment_id: string;
    user_id: Types.ObjectId;
    amazon_account_id: Types.ObjectId;
  }): Promise<DetailsAndItemsFromShipment> => {
    const fbaInboundShipment: any = await FBAInboundShipmentModel.findOne({
      shipment_id
    });

    if (!fbaInboundShipment) throw new Error('Shipment not found');

    const {
      destination_fulfillment_center_id: destinationFulfillmentCenterId,
      shipment_name: shipmentName,
      shipment_status: shipmentStatus,
      shipment_items: shipmentItems,
      user_address: { _id: userAddressId },
      shipment_date: shipmentDate
    } = fbaInboundShipment;

    const items = await Promise.all(
      shipmentItems.map(
        async ({
          sku,
          fnsku,
          // name, // value from userAsin
          // image, // value from userAsin
          // asin, // value from userAsin
          missings,
          refund,
          quantity_shipped,
          quantity_received,
          quantity_in_case
        }: {
          sku: string;
          fnsku: string;
          missings: number;
          refund: number;
          quantity_shipped: number;
          quantity_received: number;
          quantity_in_case: number;
        }) => {
          const user = await UserModel.findOne({
            _id: user_id
          });
          if (!user) throw new Error('User not found');

          const amazonAcc = user.amazon_accounts.find(
            (acc: any) => acc._id.toString() === amazon_account_id.toString()
          );
          if (!amazonAcc) throw new Error('Amazon account not found');

          let userAsin = await UserAsin.aggregate([
            {
              $match: {
                sku: {
                  $in: [sku]
                },
                amazon_account_id,
                country_code: amazonAcc.default_marketplace.country
              }
            }
          ]);
          if (!userAsin.length) {
            userAsin = await UserAsin.aggregate([
              {
                $match: {
                  sku: {
                    $in: [sku]
                  },
                  amazon_account_id
                }
              }
            ]);
          }

          const matchingUserAsin = userAsin.find(
            (prod: any) => prod.sku === sku
          );
          const name = matchingUserAsin ? matchingUserAsin?.name : null;
          const image = matchingUserAsin ? matchingUserAsin?.image : null;
          const asin = matchingUserAsin ? matchingUserAsin?.asin : null;

          return {
            sku,
            fnsku,
            name,
            image,
            asin,
            missings,
            refund,
            quantityShipped: quantity_shipped,
            quantityReceived: quantity_received,
            quantityInCase: quantity_in_case
          };
        }
      )
    );

    return {
      destinationFulfillmentCenterId,
      shipmentName,
      shipmentStatus,
      items,
      userAddressId: userAddressId.toString(),
      shipmentDate
    };
  };

  /**
   * Extract details from userAddress.
   *
   * @param {string} userAddressId
   * @returns
   */
  private getDetailsFromUserAddress = async (
    userAddressId: string
  ): Promise<DetailsFromUserAddress> => {
    const userAddress = await UserAddressModel.findById(userAddressId);
    if (!userAddress)
      throw new Error(`userAddress not found for ID: ${userAddressId}`);

    const {
      name,
      address_line_1: addressLine1,
      address_line_2: addressLine2,
      postal_code: postalCode,
      city
    } = userAddress;

    return { name, addressLine1, addressLine2, postalCode, city };
  };

  createPackingListForOneMissingInboundRecommendation = async (
    recommendation: HydratedFbaMissingInboundRecommendationDoc,
    language: TranslatedLanguage,
    saveToFile = false
  ): Promise<Buffer> => {
    const detailsFromFbaInboundShipment =
      await this.getDetailsAndItemsFromShipment({
        shipment_id: recommendation.shipment_id!,
        user_id: recommendation.user_id!,
        amazon_account_id: recommendation.amazon_account_id!
      });

    const newItems = detailsFromFbaInboundShipment.items.map(
      (item: DetailsAndItemsFromShipmentItem) => {
        const refundBySku = recommendation.refund_by_skus!.find(
          (refundBySku: any) => refundBySku.sku === item.sku
        );
        if (refundBySku && refundBySku.quantity_send != null) {
          item.quantitySent = refundBySku.quantity_send; // manually entered quantity sent value from user
        } else {
          item.quantitySent = item.quantityShipped; // default value
        }
        return item;
      }
    );
    detailsFromFbaInboundShipment.items = newItems;

    const detailsFromUserAddress = await this.getDetailsFromUserAddress(
      detailsFromFbaInboundShipment.userAddressId
    );

    const user = await UserModel.findOne({
      _id: recommendation.user_id
    });

    const amazon_account = user.amazon_accounts.find(
      (account: any) =>
        account._id.toString() === recommendation.amazon_account_id!.toString()
    );

    let dateFromShipment = detailsFromFbaInboundShipment.shipmentDate;

    const localeForDate = language === 'de' ? 'de-DE' : 'en-US';

    if (!dateFromShipment) {
      // fallback
      dateFromShipment = new Date().toLocaleDateString(localeForDate, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } else {
      dateFromShipment = new Date(dateFromShipment).toLocaleDateString(
        localeForDate,
        {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }
      );
    }

    const credentials =
      await this.userDocumentsService.getLogoSignatureByAmazonAccountId({
        amazon_account_id: recommendation.amazon_account_id!,
        user_id: recommendation.user_id!
      });

    const logo = credentials?.logo;
    const signature = credentials?.signature;

    const dataForTemplate: any = {
      shipmentId: recommendation.shipment_id,
      companyName: detailsFromUserAddress.name,
      addressLine1: detailsFromUserAddress.addressLine1,
      addressLine2: detailsFromUserAddress.addressLine2,
      zipCode: detailsFromUserAddress.postalCode,
      city: detailsFromUserAddress.city,
      date: dateFromShipment,
      to:
        'Amazon FBA - ' +
        detailsFromFbaInboundShipment.destinationFulfillmentCenterId, // TODO: get more information about the destination fulfillment center
      reference: detailsFromFbaInboundShipment.shipmentName,
      items: detailsFromFbaInboundShipment.items,
      sellerCentralSellername: amazon_account.seller_central_sellername,
      language,
      logo,
      signature
    };

    const renderedHTML = await renderTemplate(dataForTemplate, 'packingList');

    let outputPath: string | undefined;
    if (saveToFile) {
      outputPath = path.join(
        // os.tmpdir(),
        __dirname,
        '..',
        '..',
        '..',
        '..',
        'tmp',
        'pdf',
        'packingList_' + recommendation.shipment_id + '.pdf'
      );
      // Ensure the folder exists before saving the PDF
      await FileSystemService.ensureDirectoryExists(path.dirname(outputPath));
    }

    const options = {
      outputPath,
      saveToFile
    };

    const pdfBuffer = await generatePDF(renderedHTML, options);

    return pdfBuffer;
  };
}

const fbaMissingInboundService = FbaMissingInboundService.getInstance();

export { fbaMissingInboundService, FbaMissingInboundService };
