/**
 * To create the image of this project locally, make sure to:
 * 1. Create the file environment.production.ts in the same folder.
 * 2. Correctly set your local environment variables (copy the ones from the development environment).
 */

export const environment = {
  production: false,
  apiUrl: '__API_URL__',
  keycloak: {
    url: '__KEYCLOAK_URL__',
    realm: 'jalasoft',
    clientId: '__CLIENT_ID__',
  },
};
