export const environment = {
  production: false,
  apiUrl: 'your-api-url',
  keycloak: {
    url: 'your-keycloakServer-url',
    realm: 'your-keycloak-realm',
    clientId: 'your-keycloak-public-client',
  },
  roleNames: {
    administrator: 'ERAS Administrator',
    officer: 'ERAS Student Services Officer',
    professional: 'ERAS Professional',
  },
};
