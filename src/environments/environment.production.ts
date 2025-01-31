export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  keycloak: {
    url: 'http://localhost:18080',
    realm: 'ERAS',
    clientId: 'public-client',
    enable: true, //Enable or disable Keycloak for Frontend app
    authority: 'http://localhost:18080', //Keycloak URL
    redirectUri: 'http://localhost:4200', //Frontend app URL
    postLogoutRedirectUri: 'http://localhost:4200/login', //Optional value
  },
};
