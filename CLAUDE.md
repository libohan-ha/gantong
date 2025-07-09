# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a sensory integration training platform called "慧悦-学院" (Hui Yue Academy) built with Vue 3 + TypeScript. The platform serves three distinct user groups: hospitals, parents, and schools, each with specialized functionality for sensory integration training and management.

## Architecture

### Frontend Structure
- **Single-page application** using Vue 3 with Composition API
- **TypeScript** for type safety throughout the application
- **Vite** as the build tool and development server
- **Pinia** for state management
- **Vue Router** with lazy loading for optimal performance

### Three-Tier User System
1. **Hospital Portal** (`/hospital/*` routes): 6 functional categories including video uploads, privacy protection, appointment management
2. **Parent Portal** (`/parent/*` routes): 6 functional categories including expert courses, sensory testing, training bases
3. **School Portal** (`/school/*` routes): 3 functional modules including environment training, study tours

### Key Directories
- `frontend/src/views/`: Main application views organized by user type
- `frontend/src/components/`: Reusable Vue components
- `frontend/src/router/`: Route definitions with lazy loading
- `frontend/src/types/`: TypeScript type definitions
- `frontend/src/assets/`: Static assets and styling

## Development Commands

### Primary Development
```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run type-check   # TypeScript type checking
```

### Testing
```bash
npm run test:unit    # Run unit tests with Vitest
npm run test:e2e     # Run end-to-end tests with Cypress
npm run test:e2e:dev # Run Cypress in development mode
```

## Configuration Files

### Build Configuration
- `vite.config.ts`: Vite configuration with path aliases and TypeScript support
- `tsconfig.json`: Main TypeScript configuration
- `tsconfig.app.json`: Application-specific TypeScript settings
- `tsconfig.node.json`: Node.js TypeScript configuration

### Code Quality
- `eslint.config.js`: ESLint configuration for Vue 3 + TypeScript
- `.prettierrc`: Prettier formatting rules
- `vitest.config.ts`: Vitest testing configuration
- `cypress.config.ts`: Cypress E2E testing setup

## Development Patterns

### Component Structure
- Single File Components (SFCs) with `<script setup>` syntax
- TypeScript interfaces defined in `/src/types/`
- Composition API with reactive patterns
- Props and emits with proper TypeScript typing

### Routing
- Lazy-loaded routes for better performance
- Route-based code splitting
- Nested routes for user-specific sections

### State Management
- Pinia stores for global state
- Composables for shared logic
- Reactive data patterns with Vue 3 Composition API

## Browser Support
- Modern browsers with ES6+ support
- Mobile-first responsive design
- Progressive Web App capabilities

## Key Dependencies
- Vue 3.5+ with Composition API
- TypeScript 5.6+
- Vite 7.0+ for build tooling
- Pinia for state management
- Vue Router 4+ for routing
- Vitest for unit testing
- Cypress for E2E testing