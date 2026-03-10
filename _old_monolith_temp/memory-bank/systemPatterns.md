# System Patterns

## User Table Joins Pattern

### Rule: No Foreign Key Relationships with User Table
- **NEVER** use foreign key relationships with the User table
- **ALWAYS** join manually using `userId` and `branch` from cookie
- Pattern: `user.userId = table.userId AND user.branch = branch (from cookie)`

### Implementation Pattern
```typescript
// ❌ WRONG - Using foreign key relationship
const data = await db.userRewardMap.findMany({
  include: {
    user: true, // This uses foreign key relationship
  }
});

// ✅ CORRECT - Manual join
const rewards = await db.userRewardMap.findMany({
  where: { branch: branch },
  include: {
    reward: true,
    promotionCode: true,
  }
});

// Manual join with User table
const rewardsWithUser = await Promise.all(
  rewards.map(async (reward) => {
    let user = null;
    if (reward.userId) {
      user = await db.user.findFirst({
        where: {
          userId: reward.userId,
          branch: branch, // From cookie
        },
        select: {
          id: true,
          userId: true,
          userName: true,
          stars: true,
          branch: true,
        },
      });
    }
    return {
      ...reward,
      user,
    };
  })
);
```

### Why This Pattern?
- User table has both `id` and `userId` fields
- `userId` is the business identifier, `id` is just auto-increment
- Branch isolation: users from different branches should not be mixed
- Security: ensures data isolation between branches

### Files Using This Pattern
- `app/api/reward-exchange/history/route.ts`
- `app/api/reward-exchange/pending/route.ts` 
- `app/api/reward-exchange/approve/route.ts`

## Architecture Overview

The application follows a modern Next.js architecture with the following key patterns:

### Frontend Architecture

1. App Router Pattern (Next.js 14)

   - Server Components by default
   - Client Components when needed
   - Route-based code organization

2. Component Structure
   - Atomic Design principles
   - Reusable UI components
   - Layout-based organization

### State Management

1. Server State

   - React Query for server state
   - Prisma for database operations
   - Server Actions for mutations

2. Client State
   - Zustand for global state
   - React Hook Form for form state
   - Local component state when appropriate

### Data Flow

1. Server-Side

   - Prisma ORM for database operations
   - Server Actions for mutations
   - API Routes for external services

2. Client-Side
   - React Query for data fetching
   - Real-time updates via Pusher
   - Form handling with React Hook Form

## Design Patterns

### Component Patterns

1. Container/Presenter Pattern

   - Separation of logic and presentation
   - Reusable UI components
   - State management isolation

2. Custom Hooks
   - Logic reuse
   - State management
   - Side effect handling

### Authentication Pattern

1. NextAuth.js Integration
   - JWT-based authentication
   - Session management
   - Protected routes

### Real-time Pattern

1. Pusher Integration
   - Real-time updates
   - Event-based communication
   - Channel-based organization

## Code Organization

1. Feature-based Structure

   - Components grouped by feature
   - Shared components in common directory
   - Utils and helpers separated

2. Type System
   - TypeScript for type safety
   - Shared type definitions
   - API type generation

## Testing Strategy

1. Component Testing
   - Unit tests for components
   - Integration tests for features
   - E2E testing where needed

## Performance Patterns

1. Code Splitting

   - Route-based splitting
   - Component lazy loading
   - Dynamic imports

2. Caching Strategy
   - React Query caching
   - Static page generation
   - Incremental Static Regeneration

## Security Patterns

1. Authentication

   - JWT-based auth
   - Session management
   - Protected routes

2. Data Protection
   - Input validation
   - API security
   - CORS policies
