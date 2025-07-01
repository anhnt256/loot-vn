# Technical Context

## Technology Stack

### Core Technologies

- Next.js 14.0.4
- React 18
- TypeScript
- Node.js

### Frontend

1. UI Framework

   - Next.js App Router
   - React Server Components
   - Client Components where needed

2. Styling

   - Tailwind CSS
   - Radix UI Components
   - Framer Motion for animations

3. State Management
   - Zustand for global state
   - React Query for server state
   - React Hook Form for forms

### Backend

1. Database

   - Prisma ORM
   - Multiple database schemas
   - Type-safe database operations

2. Authentication

   - NextAuth.js
   - JWT handling
   - Session management

3. Real-time
   - Pusher for real-time features
   - WebSocket integration
   - Event-based communication

### Development Tools

1. Package Management

   - Yarn/npm
   - Node.js environment

2. Code Quality

   - ESLint
   - Prettier
   - TypeScript strict mode

3. Build Tools
   - Next.js build system
   - Webpack configuration
   - PostCSS processing

## Development Setup

### Prerequisites

1. Node.js environment
2. Yarn or npm package manager
3. Git for version control

### Environment Setup

1. Clone repository
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Set up environment variables
4. Generate Prisma client:
   ```bash
   yarn generate:prisma
   ```

### Development Commands

1. Start development server:
   ```bash
   yarn dev
   ```
2. Build for production:
   ```bash
   yarn build
   ```
3. Start production server:
   ```bash
   yarn start
   ```

### Database Management

1. Prisma schemas:

   - Global schema
   - Fnet schema
   - FnetTP schema

2. Database operations:
   - Prisma migrations
   - Type generation
   - Client updates

## Technical Constraints

### Performance

1. Server-side rendering
2. Code splitting
3. Image optimization
4. Bundle size management

### Security

1. Authentication requirements
2. API security
3. Data protection
4. CORS policies

### Scalability

1. Database design
2. Caching strategy
3. Real-time features
4. API design

## Dependencies

### Production Dependencies

- Next.js and React ecosystem
- Prisma and database tools
- UI components and styling
- State management libraries
- Authentication and security
- Real-time communication

### Development Dependencies

- TypeScript and type definitions
- ESLint and Prettier
- Build and development tools
- Testing utilities

## Deployment

### Platform

- Vercel deployment
- Environment configuration
- Build optimization

### Monitoring

- Performance monitoring
- Error tracking
- Usage analytics

### Maintenance

- Dependency updates
- Security patches
- Performance optimization
