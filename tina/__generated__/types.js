export function gql(strings, ...args) {
  let str = "";
  strings.forEach((string, i) => {
    str += string + (args[i] || "");
  });
  return str;
}
export const FuelPricesPartsFragmentDoc = gql`
    fragment FuelPricesParts on FuelPrices {
  __typename
  linkLocations
  locations {
    __typename
    exit_260 {
      __typename
      regular
      diesel
      updated
    }
    mini_mart {
      __typename
      regular
      diesel
      updated
    }
    fishermans_cove {
      __typename
      regular
      diesel
      updated
    }
  }
  truckStop {
    __typename
    diesel
    def
    updated
  }
}
    `;
export const LocationPartsFragmentDoc = gql`
    fragment LocationParts on Location {
  __typename
  order
  name
  navLabel
  shortLabel
  aka
  address
  city
  state
  zip
  phone
  phoneLabel
  hours
  cardLine
  intro
  amenities
  truckStop {
    __typename
    phone
    hours
    amenities
  }
}
    `;
export const SiteAlertPartsFragmentDoc = gql`
    fragment SiteAlertParts on SiteAlert {
  __typename
  active
  message
  linkLabel
  linkHref
}
    `;
export const FuelPricesDocument = gql`
    query fuelPrices($relativePath: String!) {
  fuelPrices(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...FuelPricesParts
  }
}
    ${FuelPricesPartsFragmentDoc}`;
export const FuelPricesConnectionDocument = gql`
    query fuelPricesConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: FuelPricesFilter) {
  fuelPricesConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...FuelPricesParts
      }
    }
  }
}
    ${FuelPricesPartsFragmentDoc}`;
export const LocationDocument = gql`
    query location($relativePath: String!) {
  location(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...LocationParts
  }
}
    ${LocationPartsFragmentDoc}`;
export const LocationConnectionDocument = gql`
    query locationConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: LocationFilter) {
  locationConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...LocationParts
      }
    }
  }
}
    ${LocationPartsFragmentDoc}`;
export const SiteAlertDocument = gql`
    query siteAlert($relativePath: String!) {
  siteAlert(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...SiteAlertParts
  }
}
    ${SiteAlertPartsFragmentDoc}`;
export const SiteAlertConnectionDocument = gql`
    query siteAlertConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: SiteAlertFilter) {
  siteAlertConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...SiteAlertParts
      }
    }
  }
}
    ${SiteAlertPartsFragmentDoc}`;
export function getSdk(requester) {
  return {
    fuelPrices(variables, options) {
      return requester(FuelPricesDocument, variables, options);
    },
    fuelPricesConnection(variables, options) {
      return requester(FuelPricesConnectionDocument, variables, options);
    },
    location(variables, options) {
      return requester(LocationDocument, variables, options);
    },
    locationConnection(variables, options) {
      return requester(LocationConnectionDocument, variables, options);
    },
    siteAlert(variables, options) {
      return requester(SiteAlertDocument, variables, options);
    },
    siteAlertConnection(variables, options) {
      return requester(SiteAlertConnectionDocument, variables, options);
    }
  };
}
import { createClient } from "tinacms/dist/client";
const generateRequester = (client) => {
  const requester = async (doc, vars, options) => {
    let url = client.apiUrl;
    if (options?.branch) {
      const index = client.apiUrl.lastIndexOf("/");
      url = client.apiUrl.substring(0, index + 1) + options.branch;
    }
    const data = await client.request({
      query: doc,
      variables: vars,
      url
    }, options);
    return { data: data?.data, errors: data?.errors, query: doc, variables: vars || {} };
  };
  return requester;
};
export const ExperimentalGetTinaClient = () => getSdk(
  generateRequester(
    createClient({
      url: "http://localhost:4001/graphql",
      queries
    })
  )
);
export const queries = (client) => {
  const requester = generateRequester(client);
  return getSdk(requester);
};
