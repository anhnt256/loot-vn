# API Documentation

## User Management APIs

### Update User isUseApp Status

**Endpoint:** `PATCH /api/user/is-use-app`

**Description:** Updates the `isUseApp` field for a specific user.

**Request Body:**
```json
{
  "userId": 123,
  "isUseApp": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 123,
    "userName": "example_user",
    "isUseApp": true,
    "branch": "GO_VAP",
    // ... other user fields
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Thiếu userId hoặc isUseApp không hợp lệ"
}
```

**Requirements:**
- `userId`: Required integer
- `isUseApp`: Required boolean
- Branch cookie must be set

**Note:** If the user doesn't exist, a new user will be created automatically with:
- `userName`: "Không sử dụng - {userId}"
- `rankId`: 1 (default rank)
- `stars`: 0
- `magicStone`: 0
- `note`: "" (empty string)

---

### Update User Note

**Endpoint:** `PATCH /api/user/note`

**Description:** Updates the `note` field for a specific user.

**Request Body:**
```json
{
  "userId": 123,
  "note": "User note content"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 123,
    "userName": "example_user",
    "note": "User note content",
    "branch": "GO_VAP",
    // ... other user fields
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Thiếu userId hoặc note không hợp lệ"
}
```

**Requirements:**
- `userId`: Required integer
- `note`: Required string
- Branch cookie must be set

**Note:** If the user doesn't exist, a new user will be created automatically with:
- `userName`: "Không sử dụng - {userId}"
- `rankId`: 1 (default rank)
- `stars`: 0
- `magicStone`: 0
- `isUseApp`: true (default)

---

## Implementation Notes

1. **Authentication:** Both APIs use branch cookie for authentication
2. **Validation:** APIs validate input parameters and create users if they don't exist
3. **Error Handling:** Comprehensive error handling with meaningful messages
4. **Database:** Updates are performed on the User table using Prisma ORM
5. **Auto-creation:** If a user doesn't exist, a new user is automatically created with default values
6. **Frontend Integration:** The admin dashboard has been updated to use these new APIs

## Frontend Changes

The admin dashboard (`app/admin/page.tsx`) has been updated to:
- Use `/api/user/is-use-app` instead of `/api/computer/update-isUseApp`
- Use `/api/user/note` instead of `/api/computer/update-note`
- Send `userId` instead of `computerId` in the request body
- Handle the `note` field from User table instead of Device table

## Database Schema

Both APIs work with the User table which includes:
- `userId`: Integer (primary key from external system)
- `isUseApp`: Boolean (default: true)
- `note`: String (default: "")
- `branch`: String (for multi-branch support) 