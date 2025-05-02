/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateOrder = /* GraphQL */ `
  subscription OnCreateOrder($filter: ModelSubscriptionOrderFilterInput) {
    onCreateOrder(filter: $filter) {
      id
      userId
      date
      total
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateOrder = /* GraphQL */ `
  subscription OnUpdateOrder($filter: ModelSubscriptionOrderFilterInput) {
    onUpdateOrder(filter: $filter) {
      id
      userId
      date
      total
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteOrder = /* GraphQL */ `
  subscription OnDeleteOrder($filter: ModelSubscriptionOrderFilterInput) {
    onDeleteOrder(filter: $filter) {
      id
      userId
      date
      total
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onCreateAddress = /* GraphQL */ `
  subscription OnCreateAddress(
    $filter: ModelSubscriptionAddressFilterInput
    $userId: String
  ) {
    onCreateAddress(filter: $filter, userId: $userId) {
      userId
      email
      firstName
      lastName
      line
      postal
      locality
      phone
      id
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateAddress = /* GraphQL */ `
  subscription OnUpdateAddress(
    $filter: ModelSubscriptionAddressFilterInput
    $userId: String
  ) {
    onUpdateAddress(filter: $filter, userId: $userId) {
      userId
      email
      firstName
      lastName
      line
      postal
      locality
      phone
      id
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteAddress = /* GraphQL */ `
  subscription OnDeleteAddress(
    $filter: ModelSubscriptionAddressFilterInput
    $userId: String
  ) {
    onDeleteAddress(filter: $filter, userId: $userId) {
      userId
      email
      firstName
      lastName
      line
      postal
      locality
      phone
      id
      createdAt
      updatedAt
      __typename
    }
  }
`;
