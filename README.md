# Angular folder structure guideline
The given Angular project structure is designed to promote scalability, maintainability, and separation of concerns, ensuring a clean and organized codebase as the application grows.
```plaintext
src/
├── app/
│   ├── core/
│   │   ├── models/
│   │   ├── services/
│   │   ├── utilities/
│   │   └── core.module.ts
│   │
│   ├── modules/
│   │   ├── module-one/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── pages/
│   │   │   └── module-one-routing.module.ts
│   │   └── module-two/
│   │
│   ├── shared/
│   │   ├── components/
│   │   ├── directives/
│   │   ├── pipes/
│   │   └── shared.module.ts
│   │
│   ├── app-routing.module.ts
│   └── app.module.ts
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
2. **`modules/`**: Contains feature-specific modules, each encapsulating its functionality (e.g., a `dashboard` module or `user-profile` module). These modules often include their own components, services, and routing configuration.
3. **`shared/`**: Contains reusable components (e.g., buttons, headers), directives, and pipes that can be shared across multiple modules.
4. **`environments/`**: Manages environment-specific configurations, like API URLs for development and production.
5. **`styles/`**: Holds global styles applied across the entire application.
## Design Pattern In Folder Structure
### Singleton Pattern (Core Module)
The Singleton Pattern is used in the `core.module.ts` and services within the `core/services/` folder to ensure a single instance of shared services exists throughout the application. For example, an authentication service can manage the logged-in state and user details globally.
### Module Pattern (Feature Modules)
The Module Pattern encapsulates related components, services, and routes into isolated feature modules. This promotes separation of concerns by organizing functionality into self-contained units.For instance, a `dashboard` module can contain all its components and routing logic, making the feature modular and easy to maintain.
### Component Reusability Pattern (Shared Module)
The Component Reusability Pattern emphasizes defining reusable components in one location, the `shared` folder, and exporting them for use across the application. This reduces duplication code and ensures consistent behavior throughout the app. For example, a reusable `Button` can be declared in the `SharedModule` and exported for use in any feature module that requires a `button`.
