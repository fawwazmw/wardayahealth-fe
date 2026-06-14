# Wardayahealth Frontend

React frontend for the Wardayahealth clinical diagnostics dashboard.

## Stack

- React
- TypeScript
- Vite
- Refine
- Ant Design
- Tailwind CSS
- Recharts
- `@react-three/fiber` for the nodule viewer

## Runs On

- Default dev URL: `http://localhost:6173`
- API base in development: proxied from `/api` to `http://localhost:6333`

If port `6173` is already taken, Vite uses the next available port.

## Setup

### 1. Install

```bash
npm install
```

### 2. Environment

```bash
cp .env.example .env
```

Default:

```env
VITE_API_URL=/api/v1
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Validate

```bash
npm run lint
npm test
npm run build
```

## Main UI Flows

- Login and role-based access
- Dashboard overview
- Manual test order creation
- OCR-assisted scan document intake
- Patient match or create within test-order flow
- Results detail and trend views
- Approximate 3D nodule visualization
- Profile management

## Key Notes

- The main workflow does not depend on a visible Patients section in navigation.
- Patient data is still reused through test-order creation and OCR intake.
- Browser title branding is controlled in `src/App.tsx`.
- API auth token is stored in local storage and attached via `src/providers/authProvider.ts`.

## Useful Commands

```bash
npm run dev
npm run lint
npm test
npm run build
npm run preview
```

## Important Files

- `src/App.tsx` - routes, Refine config, document title handling
- `src/components/CustomLayout.tsx` - shell and navigation
- `src/pages/clinicalDiagnostics/create.tsx` - manual test-order flow
- `src/pages/clinicalDiagnostics/scan-document.tsx` - OCR-assisted intake flow
- `src/pages/clinicalDiagnostics/show.tsx` - clinical diagnostic detail rendering
- `src/pages/results/` - result views and tabs
- `src/components/NoduleViewer3D.tsx` - 3D nodule visualization

## Demo Flow

1. Log in with a seeded backend account
2. Open `Test Orders`
3. Create a manual order or use `Scan Document`
4. Confirm patient matching or creation works
5. Open the result detail page
6. Review metadata, imaging, trends, and the viewer

## Known Non-Blockers

- Production build warns about a large frontend chunk
- The ML service health endpoint can be offline if the separate prediction service is not running

## License

MIT
