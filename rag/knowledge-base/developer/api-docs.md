# API Documentation

Integrate with Treslingo's powerful language learning platform using our comprehensive REST API. Build custom applications, sync learning data, and create innovative educational experiences.

## Getting Started

### API Overview
**Treslingo API v2.0**
- **Base URL**: `https://api.treslingo.com/v2`
- **Protocol**: HTTPS only (TLS 1.2+)
- **Format**: JSON request and response bodies
- **Authentication**: OAuth 2.0 and API keys
- **Rate Limiting**: Tiered based on plan level

### Authentication
**API Key Authentication (Recommended):**
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.treslingo.com/v2/users/me
```

**OAuth 2.0 Flow:**
```bash
# Step 1: Authorization URL
https://auth.treslingo.com/oauth/authorize?
  client_id=YOUR_CLIENT_ID&
  response_type=code&
  scope=read+write&
  redirect_uri=YOUR_REDIRECT_URI

# Step 2: Exchange code for token
curl -X POST https://auth.treslingo.com/oauth/token \
  -d "grant_type=authorization_code" \
  -d "code=AUTHORIZATION_CODE" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET"
```

### Quick Start Example
```javascript
const TreslingoAPI = require('@treslingo/api-client');

const client = new TreslingoAPI({
  apiKey: 'your-api-key-here',
  environment: 'production' // or 'sandbox'
});

// Get user profile
const user = await client.users.getCurrent();
console.log(`Hello, ${user.name}!`);

// Get learning progress
const progress = await client.progress.getOverview(user.id);
console.log(`XP: ${progress.totalXP}, Streak: ${progress.currentStreak}`);
```

## Core Endpoints

### User Management
**Get Current User**
```http
GET /users/me
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "user_123456",
  "email": "learner@example.com",
  "name": "Alex Smith",
  "profile": {
    "nativeLanguage": "en",
    "targetLanguages": ["es", "fr"],
    "timezone": "America/New_York",
    "level": "intermediate"
  },
  "subscription": {
    "plan": "plus",
    "status": "active",
    "expiresAt": "2025-12-31T23:59:59Z"
  }
}
```

**Update User Profile**
```http
PATCH /users/me
Content-Type: application/json
Authorization: Bearer {token}

{
  "profile": {
    "timezone": "Europe/London",
    "dailyGoal": 30
  }
}
```

### Learning Progress
**Get Progress Overview**
```http
GET /users/{userId}/progress
Authorization: Bearer {token}
```

**Response:**
```json
{
  "totalXP": 15420,
  "currentStreak": 45,
  "longestStreak": 127,
  "lessonsCompleted": 234,
  "skillsUnlocked": 18,
  "achievements": [
    {
      "id": "week_warrior",
      "unlockedAt": "2025-01-15T10:30:00Z",
      "category": "consistency"
    }
  ],
  "languageProgress": [
    {
      "language": "es",
      "level": "B1",
      "xp": 8900,
      "lessonsCompleted": 156,
      "skillsCompleted": 12
    }
  ]
}
```

**Get Detailed Progress**
```http
GET /users/{userId}/progress/detailed?language=es&timeframe=week
Authorization: Bearer {token}
```

### Lesson Data
**Get Available Lessons**
```http
GET /lessons?language=es&skill=basics&difficulty=beginner
Authorization: Bearer {token}
```

**Response:**
```json
{
  "lessons": [
    {
      "id": "lesson_basics_001",
      "title": "Greetings and Introductions",
      "skill": "basics",
      "difficulty": "beginner",
      "estimatedDuration": 10,
      "xpReward": 15,
      "prerequisites": [],
      "isUnlocked": true
    }
  ],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "total": 156,
    "hasNext": true
  }
}
```

**Get Lesson Details**
```http
GET /lessons/{lessonId}
Authorization: Bearer {token}
```

**Start Lesson Session**
```http
POST /lessons/{lessonId}/sessions
Authorization: Bearer {token}

{
  "device": "mobile",
  "platform": "ios"
}
```

### Exercise Results
**Submit Exercise Results**
```http
POST /lessons/{lessonId}/exercises/{exerciseId}/results
Content-Type: application/json
Authorization: Bearer {token}

{
  "responses": [
    {
      "questionId": "q1",
      "answer": "Hola",
      "isCorrect": true,
      "timeSpent": 3.2
    }
  ],
  "completedAt": "2025-01-15T14:30:00Z"
}
```

**Response:**
```json
{
  "score": 85,
  "xpEarned": 12,
  "feedback": {
    "correct": 8,
    "incorrect": 2,
    "suggestions": [
      "Practice pronunciation of 'rr' sounds"
    ]
  }
}
```

### Vocabulary Management
**Get User Vocabulary**
```http
GET /users/{userId}/vocabulary?language=es&status=learning
Authorization: Bearer {token}
```

**Add Vocabulary**
```http
POST /users/{userId}/vocabulary
Content-Type: application/json
Authorization: Bearer {token}

{
  "word": "biblioteca",
  "translation": "library",
  "language": "es",
  "context": "Voy a la biblioteca todos los días",
  "difficulty": "intermediate"
}
```

## Advanced Features

### Analytics and Reporting
**Get Learning Analytics**
```http
GET /users/{userId}/analytics?
  startDate=2025-01-01&
  endDate=2025-01-31&
  metrics=xp,time,accuracy
Authorization: Bearer {token}
```

**Response:**
```json
{
  "period": {
    "startDate": "2025-01-01",
    "endDate": "2025-01-31"
  },
  "metrics": {
    "totalXP": 1250,
    "totalTimeMinutes": 420,
    "averageAccuracy": 87.3,
    "dailyAverages": {
      "xp": 40.3,
      "timeMinutes": 13.5,
      "lessonsCompleted": 1.2
    }
  },
  "trends": {
    "xpGrowth": "+12%",
    "accuracyImprovement": "+5.2%",
    "consistencyScore": 89
  }
}
```

### Achievements and Badges
**Get User Achievements**
```http
GET /users/{userId}/achievements
Authorization: Bearer {token}
```

**Check Achievement Eligibility**
```http
POST /users/{userId}/achievements/check
Content-Type: application/json
Authorization: Bearer {token}

{
  "achievementIds": ["week_warrior", "perfect_score"]
}
```

### Social Features
**Get Friends List**
```http
GET /users/{userId}/friends
Authorization: Bearer {token}
```

**Get Leaderboard**
```http
GET /leaderboards/friends?userId={userId}&timeframe=week
Authorization: Bearer {token}
```

**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "user": {
        "id": "user_789",
        "name": "Maria",
        "avatar": "https://cdn.treslingo.com/avatars/user_789.jpg"
      },
      "xp": 245,
      "streak": 7
    }
  ],
  "userRank": 3,
  "timeframe": "week"
}
```

## Webhooks

### Setting Up Webhooks
**Create Webhook Endpoint**
```http
POST /webhooks
Content-Type: application/json
Authorization: Bearer {token}

{
  "url": "https://your-app.com/webhooks/treslingo",
  "events": [
    "lesson.completed",
    "achievement.unlocked",
    "streak.broken"
  ],
  "secret": "your-webhook-secret"
}
```

### Webhook Events
**Lesson Completed**
```json
{
  "event": "lesson.completed",
  "timestamp": "2025-01-15T14:30:00Z",
  "userId": "user_123456",
  "data": {
    "lessonId": "lesson_basics_001",
    "score": 85,
    "xpEarned": 15,
    "timeSpent": 8.5,
    "accuracy": 85
  }
}
```

**Achievement Unlocked**
```json
{
  "event": "achievement.unlocked",
  "timestamp": "2025-01-15T14:30:00Z",
  "userId": "user_123456",
  "data": {
    "achievementId": "week_warrior",
    "category": "consistency",
    "xpBonus": 50
  }
}
```

## Rate Limits and Quotas

### Rate Limiting
**Request Limits by Plan:**
- **Free Plan**: 100 requests/hour
- **Plus Plan**: 1,000 requests/hour
- **Max Plan**: 5,000 requests/hour
- **Enterprise**: Custom limits

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642597200
```

**Rate Limit Exceeded Response:**
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 3600 seconds.",
    "retryAfter": 3600
  }
}
```

### Quota Management
**Data Quotas:**
- **Free Plan**: 1MB data transfer/day
- **Plus Plan**: 100MB data transfer/day
- **Max Plan**: 1GB data transfer/day
- **Enterprise**: Custom quotas

## Error Handling

### HTTP Status Codes
- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request format
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

### Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ],
    "requestId": "req_abc123",
    "timestamp": "2025-01-15T14:30:00Z"
  }
}
```

## SDKs and Libraries

### Official SDKs
**JavaScript/Node.js**
```bash
npm install @treslingo/api-client
```

**Python**
```bash
pip install treslingo-api
```

**PHP**
```bash
composer require treslingo/api-client
```

**Ruby**
```bash
gem install treslingo_api
```

### Community Libraries
- **Swift (iOS)**: treslingo-swift
- **Java/Android**: treslingo-android
- **C# (.NET)**: Treslingo.ApiClient
- **Go**: go-treslingo
- **Rust**: treslingo-rs

## Testing and Development

### Sandbox Environment
**Sandbox Base URL**: `https://api-sandbox.treslingo.com/v2`
- **Test data** with realistic learning scenarios
- **Reset capabilities** for development testing
- **No rate limits** during development
- **Free sandbox access** for all developers

### API Testing Tools
**Postman Collection:**
- **Download**: [treslingo-api.postman.json](https://api.treslingo.com/postman)
- **Pre-configured requests** for all endpoints
- **Environment variables** for easy switching
- **Example responses** for reference

**OpenAPI Specification:**
- **Swagger UI**: [api.treslingo.com/docs](https://api.treslingo.com/docs)
- **OpenAPI 3.0** specification download
- **Interactive testing** interface
- **Code generation** support

## Security and Compliance

### Security Best Practices
**API Key Security:**
- **Never expose** API keys in client-side code
- **Rotate keys** regularly (every 90 days recommended)
- **Use environment variables** for key storage
- **Implement key rotation** without service interruption

**Data Protection:**
- **HTTPS only** for all API communications
- **Data encryption** at rest and in transit
- **GDPR compliance** for European users
- **SOC 2 Type II** certified infrastructure

### Compliance Features
**COPPA Compliance:**
- **Parental consent** verification endpoints
- **Child user** data protection
- **Limited data collection** for users under 13
- **Automatic data deletion** capabilities

**FERPA Compliance:**
- **Educational records** protection
- **Student privacy** safeguards
- **Directory information** controls
- **Consent management** features

## Support and Resources

### Developer Support
**Documentation:**
- **API Reference**: Complete endpoint documentation
- **Tutorials**: Step-by-step integration guides
- **Code Examples**: Real-world implementation samples
- **Best Practices**: Optimization and security guidelines

**Community:**
- **Developer Forum**: [developers.treslingo.com](https://developers.treslingo.com)
- **Discord Server**: Real-time developer chat
- **GitHub**: Open source tools and examples
- **Stack Overflow**: #treslingo-api tag

**Support Channels:**
- **Email**: developers@treslingo.com
- **Response Time**: 24-48 hours for technical questions
- **Escalation**: Priority support for Enterprise customers
- **Office Hours**: Weekly developer Q&A sessions

---

**Ready to start building?** Get your API keys from the [Developer Dashboard](https://developers.treslingo.com/dashboard) and check out our [Quick Start Tutorial](https://developers.treslingo.com/quickstart) for your first integration.

*Questions about the API?* Join our [developer community](https://developers.treslingo.com/community) or [contact our technical team](mailto:developers@treslingo.com) for assistance.