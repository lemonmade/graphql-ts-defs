// This file was generated and should not be edited.
// tslint-disable

import {DocumentNode} from 'graphql';

import {SimpleCard} from './SimpleCard.graphql';

interface ProductPublicationInput {
  channelHandle: string,
}

type MetafieldValueType = 'STRING' | 'INTEGER';

interface MetafieldInput {
  id: string | null,
  namespace: string | null,
  key: string | null,
  value: string | null,
  valueType: MetafieldValueType | null,
  description: string | null,
}

type WeightUnit = 'KILOGRAMS' | 'GRAMS' | 'POUNDS' | 'OUNCES';

type ProductVariantInventoryPolicy = 'DENY' | 'CONTINUE';

type ProductVariantInventoryManagement = 'SHOPIFY' | 'NOT_MANAGED' | 'FULFILLMENT_SERVICE';

interface ProductVariantInput {
  clientMutationId: string | null,
  id: string | null,
  productId: string | null,
  barcode: string | null,
  compareAtPrice: string | null,
  fulfillmentServiceId: string | null,
  harmonizedSystemCode: string | null,
  imageId: string | null,
  inventoryManagement: ProductVariantInventoryManagement | null,
  inventoryPolicy: ProductVariantInventoryPolicy | null,
  inventoryQuantity: number | null,
  inventoryQuantityAdjustment: number | null,
  options: string[] | null,
  position: number | null,
  price: string | null,
  requiresShipping: boolean | null,
  sku: string | null,
  taxable: boolean | null,
  title: string | null,
  taxCode: string | null,
  weight: number | null,
  weightUnit: WeightUnit | null,
  metafields: MetafieldInput[] | null,
}

interface ImageInput {
  id: string | null,
  src: string | null,
  altText: string | null,
}

interface ProductInput {
  clientMutationId: string | null,
  id: string | null,
  bodyHtml: string | null,
  descriptionHtml: string | null,
  handle: string | null,
  images: ImageInput[] | null,
  productType: string | null,
  publishOn: string | null,
  published: boolean | null,
  publishedAt: string | null,
  publishDate: string | null,
  templateSuffix: string | null,
  title: string | null,
  vendor: string | null,
  collectionsToJoin: string[] | null,
  collectionsToLeave: string[] | null,
  tags: string[] | null,
  options: string[] | null,
  variants: ProductVariantInput[] | null,
  metafields: MetafieldInput[] | null,
  productPublications: ProductPublicationInput[] | null,
}

export interface HomeVariables {
  someVariable: ProductInput | null,
  another: number,
}

export interface Home {
  shop: {
    onlineStoreChannel: {
      name: string,
    } | null,
  },
  staffMember: {
    id: string,
    firstName: string | null,
    privateData: {
      simpleCards: (SimpleCard & {
        category: string | null,
        image: {
          src: string,
        } | null,
      })[],
    },
  } | null,
}

declare const document: DocumentNode;
export default document;

// tslint-enable