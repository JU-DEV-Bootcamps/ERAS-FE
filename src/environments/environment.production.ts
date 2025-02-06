export const environment = {
  production: false,
  apiUrl: '__API_URL__',
  keycloak: {
    url: '__KEYCLOAK_URL__',
    realm: 'ERAS',
    clientId: 'public-client',
    enable: true,
    authority: '__KEYCLOAK_URL__',
    redirectUri: '__WEB_URL__',
    postLogoutRedirectUri: '__WEB_URL__/login',
  },
};
