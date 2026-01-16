# LMS Frontend - Learning Management System

A modern, responsive Learning Management System built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern UI/UX**: Beautiful, responsive design with Tailwind CSS
- **TypeScript**: Full type safety and better developer experience
- **State Management**: Zustand for lightweight state management
- **Form Validation**: React Hook Form with Zod validation
- **Routing**: React Router for client-side navigation
- **Authentication**: JWT-based authentication with persistent storage
- **Component Library**: Reusable UI components
- **API Integration**: Centralized API client with error handling

## 📁 Project Structure

```
src/
├── api/                    # API configuration and client
├── components/            # Reusable UI components
│   ├── ui/               # Basic UI components (Button, Input, etc.)
│   ├── layout/           # Layout components (Navigation, Layout)
│   └── index.ts          # Component exports
├── constants/             # Application constants and configuration
├── hooks/                 # Custom React hooks
├── pages/                 # Page components
│   ├── Auth/             # Authentication pages
│   ├── Dashboard.tsx     # Dashboard page
│   ├── Courses.tsx       # Courses page
│   ├── Profile.tsx       # Profile page
│   └── index.ts          # Page exports
├── services/              # API services and external integrations
├── store/                 # State management (Zustand stores)
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
├── App.tsx               # Main application component
└── main.tsx              # Application entry point
```

## 🛠️ Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Client-side routing
- **Zustand** - State management
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **ESLint** - Code linting

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd lms
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Design System

### Colors
- **Primary**: Orange (#f97316)
- **Secondary**: Gray (#64748b)
- **Success**: Green (#10b981)
- **Warning**: Amber (#f59e0b)
- **Error**: Red (#ef4444)

### Components
- **Button**: Multiple variants (primary, secondary, outline, ghost)
- **Input**: Form inputs with validation states
- **Navigation**: Responsive navigation bar
- **Layout**: Consistent page layout structure

## 🔐 Authentication

The application uses JWT-based authentication with:
- Login/Register forms with validation
- Persistent authentication state
- Protected routes
- Automatic token refresh
- Logout functionality

## 📱 Responsive Design

- Mobile-first approach
- Responsive breakpoints (sm, md, lg, xl, 2xl)
- Touch-friendly interface
- Optimized for all screen sizes

## 🧪 Development Guidelines

### Code Style
- Use TypeScript for all components
- Follow React best practices
- Use functional components with hooks
- Implement proper error handling
- Write clean, readable code

### Component Structure
```typescript
interface ComponentProps {
  // Define props with TypeScript
}

const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Component logic
  return (
    // JSX
  );
};

export default Component;
```

### State Management
- Use Zustand for global state
- Keep component state local when possible
- Implement proper loading and error states

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
Make sure to set the following environment variables:
- `VITE_API_BASE_URL` - Backend API URL
- `VITE_APP_NAME` - Application name
- `VITE_APP_VERSION` - Application version

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions, please open an issue in the repository.

---

Built with ❤️ by Mobiyoung