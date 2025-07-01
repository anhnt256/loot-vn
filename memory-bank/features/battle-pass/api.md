# Battle Pass API Documentation

## Endpoints

### Get Current Season

```http
GET /api/battle-pass/current-season
```

**Response**

```json
{
  "id": 1,
  "name": "Summer Season 2024",
  "startDate": "2024-06-01T00:00:00Z",
  "endDate": "2024-08-31T23:59:59Z",
  "isActive": true,
  "rewards": [
    {
      "id": 1,
      "level": 1,
      "name": "5 Hours Play Time",
      "description": "Play for 5 hours to unlock",
      "requirements": {
        "type": "PLAY_TIME",
        "amount": 5
      },
      "rewards": {
        "normal": [
          {
            "type": "STARS",
            "amount": 100
          }
        ],
        "vip": [
          {
            "type": "STARS",
            "amount": 200
          }
        ]
      }
    }
  ]
}
```

### Get User Progress

```http
GET /api/battle-pass/progress
```

**Response**

```json
{
  "seasonId": 1,
  "isVip": false,
  "totalPlayTime": 3,
  "totalFoodSpending": 50000,
  "totalDrinkSpending": 30000,
  "claimedRewards": [1, 2],
  "availableRewards": [
    {
      "id": 3,
      "level": 3,
      "name": "10 Hours Play Time",
      "description": "Play for 10 hours to unlock",
      "requirements": {
        "type": "PLAY_TIME",
        "amount": 10
      },
      "rewards": {
        "normal": [
          {
            "type": "STARS",
            "amount": 200
          }
        ],
        "vip": [
          {
            "type": "STARS",
            "amount": 400
          }
        ]
      }
    }
  ]
}
```

### Claim Reward

```http
POST /api/battle-pass/claim-reward/:rewardId
```

**Response**

```json
{
  "success": true,
  "reward": {
    "type": "STARS",
    "amount": 100
  }
}
```

### Purchase VIP

```http
POST /api/battle-pass/purchase-vip
```

**Request Body**

```json
{
  "duration": 30 // days
}
```

**Response**

```json
{
  "success": true,
  "expiryDate": "2024-07-01T00:00:00Z"
}
```

## Error Responses

### 400 Bad Request

```json
{
  "error": "Invalid request",
  "message": "Detailed error message"
}
```

### 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 403 Forbidden

```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found

```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

## Rate Limiting

- 100 requests per minute per IP
- 1000 requests per hour per user

## Authentication

- JWT token required in Authorization header
- Token format: `Bearer <token>`

## Caching

- GET requests are cached for 5 minutes
- Cache can be bypassed with `Cache-Control: no-cache` header
