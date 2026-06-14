# Averywell Frontend

A modern, responsive web application for the Averywell Clinics medical and clinical report management system built with React, TypeScript, and Vite.

## 🌟 Features

- **Medical Dashboard** - Comprehensive clinic management interface
- **Report Management** - Create, view, and manage clinical reports
- **Patient Management** - Track patient information and medical history
- **Real-time Updates** - Seamless data synchronization with backend API
- **Responsive Design** - Works on desktop and tablet devices
- **Modern UI Components** - Built with Ant Design for professional aesthetics
- **Type-Safe** - Full TypeScript support for reliability
- **Fast Development** - Vite for rapid development and hot module replacement

## 🏗️ Tech Stack

- **Framework**: React 18.3+ with TypeScript
- **Build Tool**: Vite 8.0+
- **UI Library**: Ant Design 5.29+
- **Admin Panel**: Refine Admin Framework
- **HTTP Client**: Axios
- **Routing**: React Router 7.13+
- **Styling**: Tailwind CSS 4.2+
- **Date/Time**: Day.js & Moment.js
- **PDF Export**: PDFMake

## 📋 Prerequisites

- Node.js v16+ (LTS recommended)
- npm or pnpm
- Backend API running (default: `http://localhost:6333`)

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create or update `.env` file:

```env
VITE_API_URL=/api/v1
VITE_API_TIMEOUT=30000
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:6173` (or the next available port)

### 4. Build for Production

```bash
npm run build
```

Production files will be generated in the `dist/` directory.

### 5. Preview Production Build

```bash
npm run preview
```

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |

## 📁 Project Structure

```
averywell-frontend/
├── src/
│   ├── App.tsx                 # Main application component
│   ├── App.css                 # Global styles
│   ├── index.css               # CSS variables and global styles
│   ├── main.tsx                # Entry point
│   ├── assets/                 # Static assets (images, icons)
│   ├── pages/                  # Page components
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   ├── Reports.tsx         # Reports management
│   │   └── ...
│   └── providers/              # Context providers and configuration
├── public/                     # Static files
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration
└── index.html                  # HTML entry point
```

## 🔌 API Integration

The application communicates with the Averywell Backend API:

### Base Configuration

- **API URL**: Configured via `VITE_API_URL` environment variable
- **Default Port**: 6333
- **Base Path**: `/api/v1`

### Authentication

All API requests include the authorization token in the header:

```
Authorization: Bearer {access_token}
```

Token is automatically managed and attached to requests via Axios interceptors.

### Example API Endpoints

- **Login**: `POST /api/v1/auth/login`
- **Logout**: `POST /api/v1/auth/logout`
- **Profile**: `GET /api/v1/account/profile`
- **Reports**: `GET/POST /api/v1/reports`

## 🎨 UI Components

Components are built using Ant Design (antd) and Refine Admin components for consistency and professional appearance.

### Common Components

- **Tables**: Data display with pagination, sorting, and filtering
- **Forms**: Input validation and submission handling
- **Modals**: Dialog boxes for confirmations and data entry
- **Notifications**: Toast messages for user feedback
- **Layouts**: Header, Sidebar, and Content area

## 🚦 Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Develop new features or fix bugs
   - Keep changes atomic and focused

3. **Check Code Quality**
   ```bash
   npm run lint
   ```

4. **Build and Test**
   ```bash
   npm run build
   ```

5. **Commit and Push**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Describe changes and improvements
   - Link related issues if applicable

## 🔧 Configuration

### Vite Configuration

Configuration is in `vite.config.ts`:

- React plugin with Oxc
- Tailwind CSS integration
- Development server settings
- Build optimization

### TypeScript Configuration

Multiple TypeScript configs for different contexts:

- `tsconfig.json` - Base configuration
- `tsconfig.app.json` - Application-specific settings
- `tsconfig.node.json` - Build tool configuration

## 📚 Resources

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Ant Design Components](https://ant.design/components/overview)
- [Refine Documentation](https://refine.dev)
- [Tailwind CSS](https://tailwindcss.com)

## 🤝 Contributing

When contributing to the frontend:

1. Follow the existing code style
2. Write clean, maintainable code
3. Use TypeScript for type safety
4. Test your changes thoroughly
5. Run linter before committing
6. Write meaningful commit messages

## 📝 Notes

- HMR (Hot Module Replacement) is enabled for fast development
- CSS is scoped using component files
- Ant Design dark mode can be enabled via theme configuration
- PDF export functionality is available for reports

## 📄 License

MIT

---

**Averywell Clinics** - Medical & Clinical Report Management System
