# AGENTS.md — ERAS Frontend (`ERAS-FE/`)

Frontend rules of ERAS. The shared rules (core principles §1.1, conventions §5, cross-cutting contracts §4.3, workflow §8, limits §9) live in the root `AGENTS.md` of the ERAS parent repository and apply in full here too. Section numbers in this file are the same as in the root file, so "`AGENTS.md` §7.1" means this file. A rule lives in exactly one file (ADR-0005 in `openspec/adr/` of the parent repository); Backend rules are in the `AGENTS.md` of the backend repository (`ERAS-BE`).

Commands below are written from the parent repository root; when you are already inside `ERAS-FE/`, skip the `cd ERAS-FE` line.

---

## 3. Commands

### 3.3 Frontend (`ERAS-FE/`)

```bash
cd ERAS-FE
npm ci
npm run lint                                                        # ESLint + Prettier
npm test -- --watch=false --browsers=ChromeHeadless                 # all specs
npm test -- --watch=false --browsers=ChromeHeadless --code-coverage # coverage (CI gate ≥ 15%)
npm test -- --watch=false --browsers=ChromeHeadless --include="src/app/modules/<feature>/**/*.spec.ts"
npm run build                                                       # production build
```

---

## 4. Architecture

### 4.2 Frontend — Angular 19 (`ERAS-FE/`)

| Layer | Path | Owns |
|---|---|---|
| Bootstrap | `src/main.ts`, `src/app/app.config.ts`, `src/app/app.routes.ts` | Providers, Keycloak init, feature-flag loading, top-level lazy routes under the `LayoutComponent` shell |
| Core | `src/app/core/` | Singletons: API services (`services/api/`), auth (`services/access/`, `auth/guards/`), permissions (`services/permissions/`), interceptors, models (`models/<entity>.model.ts`), constants, route metadata (`utils/routing/route-metadata.ts`), layout |
| Feature modules | `src/app/modules/<feature>/` | Feature pages and components (assessments, students, reports, lists, imports, profile, settings, home-v2, …), plus feature-local `models/` and `<feature>.routes.ts` |
| Shared | `src/app/shared/` | Reusable presentational components (`eras-button`, `eras-modal`, `eras-select`, list/table, cards), directives (`*appHasERASRoles`), pipes |
| Styles | `src/styles/utils/` | Material 3 theme, tokens (`--primary-*`, `--color-neutral-*`, `--font-size-*`), partials |

Path aliases: `@core/*`, `@shared/*`, `@modules/*`.

---

## 7. Frontend

### 7.1 Golden path for a new frontend feature

1. **Route.** Add a lazy route (`loadComponent` or `loadChildren` to `<feature>.routes.ts`).
   - Guard it with `canActivateAuthRole`.
   - Add an entry in `ROUTE_METADATA` with `roles`, `breadcrumb` and `headerTitle`.
   - Put `roles` on the **same** route the guard runs on. Use `canActivateChild` when the roles live on child routes.
   - For v1/v2 rollouts, also add `featureFlagGuard(FEATURE_FLAGS.<flag>)`.
2. **Model.** Add `src/app/core/models/<entity>.model.ts`, one entity per file, mirroring the BE DTO exactly, including enums as string unions.
3. **Service.** Add `src/app/core/services/api/<resource>.service.ts` that `extends BaseApiService` with `protected resource = '<api-resource>'`.
   - Use the base `get/post/put/delete`.
   - Endpoints have no leading slash.
   - Use `@Cacheable()` only for read-mostly lookups.
4. **Component.** Build a standalone component with `ChangeDetectionStrategy.OnPush`.
   - Use `inject()`, signal `input()` / `output()` / `computed()`, and the `@if` / `@for` control flow.
   - Tear down subscriptions with `takeUntilDestroyed()` or `toSignal()`.
   - Use Reactive Forms.
5. **Permissions in the UI.** Use `PermissionsService.can(...)` / `permission.policies.ts` or `*appHasERASRoles`. Never compare raw role strings.
6. **UI.** Use Angular Material and the `eras-*` wrappers. Use SCSS with theme tokens; no hard-coded colors. User-facing text goes in `core/constants/messages.ts`.

### 7.2 Frontend rules

- File names are kebab-case with Angular suffixes (`.component.ts`, `.service.ts`, `.model.ts`, `.guard.ts`, `.routes.ts`). Component selectors use the `app-` prefix.
- `strict` TypeScript and `strictTemplates`. No `any` without a written justification.
- Environment values come from `src/environments/*`. Never hard-code URLs, realms or role names.
- **Do not copy these legacy patterns into new code:**
  - `@Input()` / `@Output()` decorators.
  - Constructor injection.
  - `*ngIf` / `*ngFor`.
  - Manual `.subscribe` without teardown.
  - `HttpClientModule` in tests.
  - Building URLs outside `BaseApiService`.
  - New files in `_unused/`.
  - Non-kebab-case file names.

### 7.3 Frontend tests — Jasmine/Karma (`ERAS-FE/src/app/`)

The spec file sits next to the unit as `*.spec.ts`. Use TestBed, `provideHttpClient()` + `provideHttpClientTesting()` / `HttpTestingController`, and `jasmine.createSpyObj`.

```ts
describe('ConfigurationsComponent', () => {
  it('[608-reject-duplicate-configuration-name/AC-1] shows the conflict message when the name already exists', () => {
    // GIVEN … WHEN … THEN
  });
});
```

The AC key goes **first in the `it()` title, in square brackets**. Write one `it()` per AC; never `fit` or `xit` in commits.
