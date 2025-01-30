export const environment = {
  production: false,
  apiUrl: 'your-api-url',
  keycloak: {
    url: 'your-keycloakServer-url',
    realm: 'your-keycloak-realm',
    clientId: 'your-keycloak-public-client',
    enable: true, //Enable or disable Keycloak for Frontend app
    redirectUri: 'Frontend app URL',
    postLogoutRedirectUri: 'Optional value to redirect after logout'
  }
};
