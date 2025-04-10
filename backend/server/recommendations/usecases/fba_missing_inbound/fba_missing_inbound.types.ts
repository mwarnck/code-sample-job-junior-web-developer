import { HydratedDocument } from 'mongoose';
import {
  IFbaMissingInboundData,
  IFbaMissingInboundMethods,
  IFbaMissingInboundVirtuals
} from './fba_missing_inbound.interfaces';
import {
  IRecommendationData,
  IRecommendationMethods
} from '../../recommendations.interfaces';

export type DetailsAndItemsFromShipmentItem = {
  sku: string;
  fnsku: string;
  name: string;
  image: string;
  asin?: string;
  missings?: number;
  refund?: number;
  quantityShipped: number;
  quantityReceived: number;
  quantityInCase: number;
  quantitySent?: number;
};

export type DetailsAndItemsFromShipment = {
  destinationFulfillmentCenterId: string;
  shipmentName: string;
  shipmentStatus: string;
  items: DetailsAndItemsFromShipmentItem[];
  userAddressId: string;
  shipmentDate: string;
};

export type DetailsFromUserAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  postalCode: string;
  city: string;
};

export type HydratedFbaMissingInboundRecommendationDoc = HydratedDocument<
  IFbaMissingInboundData & IRecommendationData,
  IFbaMissingInboundMethods & IRecommendationMethods,
  IFbaMissingInboundVirtuals
>;

export type UpdateFbaMissingInboundItems = {
  sku: string;
  quantity_send: number;
};
