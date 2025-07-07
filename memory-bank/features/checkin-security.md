# Check-in Security Improvements

## Overview
Refactored the check-in functionality to prevent spam and abuse through Postman or other API tools.

## Security Issues Addressed

### 1. Client-side Star Calculation (CRITICAL)
**Problem**: User could manipulate `addedStar` parameter to claim unlimited stars
**Solution**: 
- Removed `addedStar` from client input
- Calculate stars server-side based on actual play time
- Use `Math.floor(totalPlayTime * starsPerHour)` for accurate calculation

### 2. Weak Anti-spam Protection
**Problem**: Only 10-minute cooldown between check-ins
**Solution**:
- Increased cooldown to 30 minutes
- Added hourly rate limit (5 check-ins per hour)
- Added daily limit (10 check-ins per day)

### 3. Missing Input Validation
**Problem**: No validation of user input
**Solution**:
- Added positive number validation for userId
- Required branch cookie validation
- Minimum play time requirement (1 hour)

## New Security Features

### Rate Limiting
```typescript
// Hourly rate limit
const rateLimitResult = await checkCheckInRateLimit(String(userId), branch);
// Daily rate limit  
const dailyLimitResult = await checkDailyCheckInLimit(String(userId), branch);
```

### Server-side Calculation
```typescript
// Calculate stars based on actual play time
const starsToEarn = Math.floor(totalPlayTime * starsPerHour);
const actualStarsToAdd = Math.min(starsToEarn - totalClaimed, starsPerHour);
```

### Enhanced Validation
```typescript
// Minimum play time requirement
if (totalPlayTime < 1) {
  return { error: "Bạn cần chơi ít nhất 1 giờ để có thể check-in!" };
}
```

## API Changes

### Before
```typescript
// Client could manipulate this
{ userId: 123, addedStar: 999999 }
```

### After
```typescript
// Only userId required, stars calculated server-side
{ userId: 123 }
```

## Error Messages

### Rate Limit Errors
- "Quá nhiều lần check-in. Vui lòng thử lại sau [time]"
- "Bạn đã check-in X/10 lần hôm nay. Vui lòng thử lại vào ngày mai!"

### Validation Errors
- "Bạn cần chơi ít nhất 1 giờ để có thể check-in!"
- "Bạn vừa check-in xong, vui lòng chờ X phút trước khi check-in tiếp!"

## Testing

### Security Tests
- Rate limiting validation
- Time-based anti-spam
- Server-side calculation verification
- Input validation
- Concurrent request handling

### Test Commands
```bash
npm test tests/checkin-security-tests.js
```

## Configuration

### Rate Limits
- **Hourly**: 5 check-ins per hour per user
- **Daily**: 10 check-ins per day per user
- **Cooldown**: 30 minutes between check-ins

### Play Time Requirements
- **Minimum**: 1 hour of play time
- **Calculation**: Based on actual fnet database sessions

### Timezone Handling
- **Consistent**: Uses `@/lib/timezone-utils` for all timezone operations
- **Vietnam Timezone**: All calculations use Asia/Ho_Chi_Minh timezone
- **Database Operations**: Uses `Date` objects instead of ISO strings for Prisma
- **Important**: Prisma automatically converts all dates to UTC for storage
- **Query Logic**: Uses `getStartOfDayDateVN()` and `getCurrentDateVN()` for database operations

## Monitoring

### Logs to Watch
- Rate limit violations
- Suspicious check-in patterns
- Failed validation attempts

### Metrics
- Check-in success rate
- Rate limit hit rate
- Average play time before check-in

## Future Improvements

1. **IP-based rate limiting** for additional protection
2. **Machine fingerprinting** to detect automated tools
3. **Behavioral analysis** to detect unusual patterns
4. **Real-time monitoring** dashboard for security events 