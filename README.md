# ERAS - Frontend

<!--toc:start-->

- [ERAS - Frontend](#eras-frontend)
- [Angular folder structure guideline](#angular-folder-structure-guideline)
  - [Folder Explanation](#folder-explanation)
- [Code Review Checklist](#code-review-checklist)
- [Setup project](#setup-project)
  - [Copy environment files](#copy-environment-files)
  - [Install dependencies](#install-dependencies)
- [Run project](#run-project)
  - [Development](#development)
  <!--toc:end-->

# Angular folder structure guideline

The given Angular project structure is designed to promote scalability, maintainability, and separation of concerns, ensuring a clean and organized codebase as the application grows.

All file naming is kebab case i.e. (some-thing-else.interface.ts)
```plaintext
src/
├── app/
│   ├── core/
│   │   ├── models/ Based on domain entities. Only one file per entity
│   │   ├── services/
│   │   │   ├──-interfaces: Only for special cases, only one file per entity
│   │   └── utilities/
│   │
│   ├── modules/ #Reflects on the actual application menu
│   │   ├── reports/
│   │   │   ├── components/
│   │   │   └── pages/
│   │   └── student-monitoring/
│   │
│   ├── features/ #Only specific features that are no part of a defined module yet
│   │   ├── feature-one/
│   │   │   ├── components/
│   │   │   └── pages/
│   │   └── feature-two/
│   │
│   └── shared/
│   │   ├── components/
│   │   ├── directives/
│   │   └── pipes/
│
├── assets/
├── environments/
│   ├── environment.ts
│   └── environment.prod.ts
│
├── styles/
├── index.html
└── main.ts
```

## Folder Explanation

1. **`core/`**: Contains application-wide singleton services (e.g., `AuthService`, `ApiService`), models, and utilities. This folder is loaded once and remains in memory throughout the app's lifecycle.
2. **`features/`**: Contains feature-specific folders, each encapsulating its functionality (e.g., a `dashboard` or `user-profile`). These folders often include their own components, services, and routing configuration.
3. **`shared/`**: Contains reusable components (e.g., buttons, headers), directives, and pipes that can be shared across the project.
4. **`environments/`**: Manages environment-specific configurations, like API URLs for development and production.
5. **`styles/`**: Holds global styles applied across the entire application.

# Code Review Checklist

- [ ] Have the requirements been met?
- [ ] Is the code easy to read?
- [ ] Do unit tests pass?
- [ ] Is the code formatted correctly?
- [ ] ***
- [ ] Are components following the single responsibility principle?
- [ ] Is the routing configuration clean and well-organized?
- [ ] Are form validations implemented and working correctly?
- [ ] Are errors gracefully handled and logged?
- [ ] Is there a consistent approach to styling (CSS, SCSS, CSS-in-JS)?
- [ ] Is user input sanitized to prevent XSS attacks?
- [ ] Are all dependencies necessary and up-to-date?

# Setup project

## Copy environment files

```bash
cp src/environments/environment.development.sample.ts src/environments/environment.development.ts
```

## Install dependencies

Use nodejs 22.12.0 (LTS) to install dependencies

```bash
npm install
```

# Development Environment Configuration

This section will help you properly configure the ERAS Frontend project for local development.

## Configuration Files

Development mode uses `src/environments/environment.development.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost',           // Backend URL
  keycloak: {
    url: 'http://localhost:18080',      // Keycloak server URL
    realm: 'ERAS',                      // Realm name in Keycloak
    clientId: 'public-client'           // Client ID in Keycloak
  },
};
```

## Run Development Server

```bash
npm run start:dev
```

The application will run on **port 4200** (Angular's default port).


## Initial System Setup

After running the application, you need to configure the system with a service provider and configuration:

### Step 1: Create Service Provider

Go to Swagger UI at `http://localhost/swagger` and create a service provider:

**POST** `/api/v1/service-providers`

```json
{
  "serviceProviderName": "Cosmic Latte",
  "serviceProviderLogo": "https://i.imgur.com/cDQU1M7.png"
}
```

### Step 2: Create Configuration

After creating the service provider, create a configuration:

**POST** `/api/v1/configurations`

```json
{
  "configurationName": "<Your choice>",
  "baseURL": "https://staging.cosmic-latte.com/api/1.0/",
  "encryptedKey": "[ask team member]",
  "serviceProviderId": 1,
  "userId": "<Your user ID>"
}
```

> **Note**: The `serviceProviderId` should match the ID returned from Step 1, and `userId` should be your authenticated user ID.

## Important Notes

- **No .env file needed** - This project uses TypeScript files for configuration  
- **Port 4200 is automatic** - Angular CLI handles it for you  


