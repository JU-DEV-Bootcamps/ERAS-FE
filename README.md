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
2. **`features/`**: Contains feature-specific folders, each encapsulating its functionality (e.g., a `dashboard` or `user-profile`). These  folders often include their own components, services, and routing configuration.
3. **`shared/`**: Contains reusable components (e.g., buttons, headers), directives, and pipes that can be shared across the project.
4. **`environments/`**: Manages environment-specific configurations, like API URLs for development and production.
5. **`styles/`**: Holds global styles applied across the entire application.
