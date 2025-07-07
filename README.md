# Gateway Gaming App

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## 🧪 Testing

This project includes comprehensive timezone tests to ensure all time-sensitive features work correctly with Vietnam timezone (GMT+7).

### Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific test categories
npm run test:timezone    # Timezone tests only
npm run test:api         # API tests only
npm run test:coverage    # Tests with coverage report

# Build with tests (recommended)
npm run build

# Build without tests (if needed)
npm run build:no-test
```

### Test Categories

- **Game Roll Tests**: Weekly reset, rate limiting, timezone edge cases
- **Check-in Tests**: Daily reset, anti-spam protection, day change handling
- **Daily Usage Tests**: Session calculation, overnight sessions, timezone conversion
- **API Tests**: Endpoint validation, error handling, performance testing
- **Integration Tests**: DST handling, leap year, timezone consistency

### CI/CD Integration

Tests run automatically on:
- Every push to main/develop branches
- Every pull request
- Daily at 9 AM VN time (2 AM UTC)

See [`.github/workflows/test.yml`](.github/workflows/test.yml) for details.

### Test Coverage

- **Lines**: 80% minimum
- **Functions**: 80% minimum  
- **Branches**: 80% minimum
- **Statements**: 80% minimum

### Timezone Validation

All tests ensure:
- ✅ VN timezone (GMT+7) correctly applied
- ✅ Weekly reset (Monday 00:00) working
- ✅ Daily reset (00:00) working
- ✅ Anti-spam protection working
- ✅ Overnight sessions handled correctly

For detailed test documentation, see [tests/README.md](tests/README.md).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
