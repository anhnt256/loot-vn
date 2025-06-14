# Battle Pass Technical Design

## Database Schema

### BattlePassSeason
```prisma
model BattlePassSeason {
  id          Int       @id @default(autoincrement())
  name        String
  startDate   DateTime
  endDate     DateTime
  isActive    Boolean   @default(false)
  rewards     BattlePassReward[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

### BattlePassReward
```prisma
model BattlePassReward {
  id          Int       @id @default(autoincrement())
  seasonId    Int
  level       Int
  name        String
  description String
  requirements Json     // Stores conditions as JSON
  rewards     Json     // Stores rewards as JSON
  season      BattlePassSeason @relation(fields: [seasonId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([seasonId])
}
```

### UserBattlePassProgress
```prisma
model UserBattlePassProgress {
  id                Int       @id @default(autoincrement())
  userId           Int
  seasonId         Int
  isVip            Boolean   @default(false)
  totalPlayTime    Int       @default(0)
  totalFoodSpending Int      @default(0)
  totalDrinkSpending Int     @default(0)
  claimedRewards   Json      // Array of reward IDs
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  user             User      @relation(fields: [userId], references: [id])
  season           BattlePassSeason @relation(fields: [seasonId], references: [id])

  @@index([userId])
  @@index([seasonId])
}
```

## Architecture

### Components
1. **Battle Pass Service**
   - Quản lý logic nghiệp vụ
   - Xử lý tiến độ người chơi
   - Quản lý phần thưởng

2. **Battle Pass API**
   - RESTful API endpoints
   - Xử lý requests từ client
   - Validation và error handling

3. **Battle Pass UI**
   - React components
   - State management
   - Real-time updates

### Data Flow
1. **Tracking Progress**
   ```
   Time Tracking System -> Battle Pass Service -> Update Progress -> Notify User
   Payment System -> Battle Pass Service -> Update Progress -> Notify User
   ```

2. **Claiming Rewards**
   ```
   User Request -> Battle Pass API -> Battle Pass Service -> Validate -> Update Database -> Send Reward
   ```

3. **Admin Management**
   ```
   Admin UI -> Battle Pass API -> Battle Pass Service -> Database
   ```

## Security Considerations
1. Authentication và Authorization
2. Rate limiting
3. Data validation
4. SQL injection prevention
5. XSS prevention

## Performance Considerations
1. Database indexing
2. Caching strategy
3. Batch processing
4. Real-time updates optimization

## Error Handling
1. Validation errors
2. Business logic errors
3. System errors
4. Network errors

## Monitoring
1. Performance metrics
2. Error tracking
3. User activity
4. System health 