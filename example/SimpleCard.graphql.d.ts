// This file was generated and should not be edited.
// tslint-disable

import {DocumentNode} from 'graphql';

export interface SimpleCard {
  title: string,
  id: string,
  message: string | null,
  dateRange: string | null,
  image: {
    src: string,
  } | null,
  buttons: {
    text: string,
    url: string,
  }[],
}

declare const document: DocumentNode;
export default document;

// tslint-enable