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

```plaintext
src/
├── app/
│   ├── core/
│   │   ├── models/
│   │   ├── services/
│   │   └── utilities/
│   │
│   ├── features/
│   │   ├── feature-one/
│   │   │   ├── components/
│   │   │   ├── services/
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

Use nodejs 22.12.0 (LTS) to install dependencies (`nvm use 22.12.0`)

```bash
npm install
```

# Run project

## Development

```bash
npm run start:dev
```
