# Event/Campaign Promotion System - TODO List

## 🎯 Overview
Thiết lập hệ thống Event/Campaign Promotion System để quản lý các chương trình khuyến mãi linh hoạt với khả năng tạo mã promotion tự động.

## 📋 Phase 1: Database Schema Setup

### 1.1 Core Tables
- [ ] **Event Table**
  - [ ] Tạo model Event với các fields cơ bản
  - [ ] Thêm enum EventType và EventStatus
  - [ ] Tạo indexes cho performance
  - [ ] Thêm relations với các table khác

- [ ] **EventParticipant Table**
  - [ ] Tạo model EventParticipant
  - [ ] Thêm enum ParticipantStatus
  - [ ] Tạo unique constraints và indexes
  - [ ] Setup relations với Event và User

- [ ] **EventReward Table (Flexible)**
  - [ ] Tạo model EventReward với JSON config
  - [ ] Thêm enum RewardType
  - [ ] Setup flexible reward configuration
  - [ ] Tạo indexes cho eventId và rewardType

- [ ] **EventRewardUsage Table**
  - [ ] Tạo model EventRewardUsage để tracking
  - [ ] Thêm fields cho order tracking
  - [ ] Tạo indexes cho reporting

### 1.2 Update Existing Tables
- [ ] **PromotionSetting Updates**
  - [ ] Thêm eventId field
  - [ ] Thêm relation với Event
  - [ ] Update existing relations

- [ ] **PromotionCode Updates**
  - [ ] Thêm eventId field
  - [ ] Thêm rewardType và rewardValue fields
  - [ ] Thêm expirationDate field
  - [ ] Update relations

## 📋 Phase 2: Core Business Logic

### 2.1 Event Management
- [ ] **Event CRUD Operations**
  - [ ] Create Event API
  - [ ] Update Event API
  - [ ] Get Event Details API
  - [ ] List Events API
  - [ ] Delete/Cancel Event API

- [ ] **Event Status Management**
  - [ ] Draft → Pending Approval workflow
  - [ ] Pending → Active workflow
  - [ ] Active → Paused/Completed workflow
  - [ ] Status validation logic

### 2.2 Reward Calculation Engine
- [ ] **Reward Calculation Service**
  - [ ] Percentage discount calculator
  - [ ] Fixed discount calculator
  - [ ] Free item calculator
  - [ ] Bonus item calculator (BOGO)
  - [ ] Multiplier calculator
  - [ ] Conditional reward calculator

- [ ] **Eligibility Check Service**
  - [ ] User eligibility validation
  - [ ] Order amount validation
  - [ ] Time-based validation
  - [ ] Usage limit validation

### 2.3 Promotion Code Generation
- [ ] **Code Generation Service**
  - [ ] Generate codes from Event
  - [ ] Generate codes from EventReward
  - [ ] Batch code generation
  - [ ] Code uniqueness validation
  - [ ] Code format customization

## 📋 Phase 3: API Endpoints

### 3.1 Event APIs
- [ ] `POST /api/events` - Create Event
- [ ] `GET /api/events` - List Events
- [ ] `GET /api/events/{id}` - Get Event Details
- [ ] `PUT /api/events/{id}` - Update Event
- [ ] `DELETE /api/events/{id}` - Cancel Event
- [ ] `POST /api/events/{id}/activate` - Activate Event
- [ ] `POST /api/events/{id}/pause` - Pause Event

### 3.2 Event Reward APIs
- [ ] `POST /api/events/{eventId}/rewards` - Add Reward to Event
- [ ] `GET /api/events/{eventId}/rewards` - List Event Rewards
- [ ] `PUT /api/events/{eventId}/rewards/{rewardId}` - Update Reward
- [ ] `DELETE /api/events/{eventId}/rewards/{rewardId}` - Remove Reward

### 3.3 Promotion Code APIs
- [ ] `POST /api/events/{eventId}/generate-codes` - Generate Codes
- [ ] `GET /api/events/{eventId}/codes` - List Generated Codes
- [ ] `POST /api/promotion-codes/validate` - Validate Code
- [ ] `POST /api/promotion-codes/apply` - Apply Code to Order

### 3.4 Event Participation APIs
- [ ] `POST /api/events/{eventId}/participate` - Join Event
- [ ] `GET /api/events/{eventId}/participants` - List Participants
- [ ] `GET /api/users/{userId}/events` - User's Events
- [ ] `POST /api/events/{eventId}/claim-reward` - Claim Reward

## 📋 Phase 4: Frontend Components

### 4.1 Admin Dashboard
- [ ] **Event Management UI**
  - [ ] Event creation form
  - [ ] Event list with filters
  - [ ] Event details view
  - [ ] Event status management

- [ ] **Reward Configuration UI**
  - [ ] Flexible reward config form
  - [ ] Reward type selector
  - [ ] JSON config editor
  - [ ] Preview reward calculation

- [ ] **Code Generation UI**
  - [ ] Batch code generation form
  - [ ] Code list with search/filter
  - [ ] Code usage tracking
  - [ ] Export codes functionality

### 4.2 User Interface
- [ ] **Event Discovery**
  - [ ] Active events list
  - [ ] Event details page
  - [ ] Event participation flow

- [ ] **Reward Claiming**
  - [ ] Available rewards list
  - [ ] Reward claiming process
  - [ ] Usage history

## 📋 Phase 5: Testing & Validation

### 5.1 Unit Tests
- [ ] Event CRUD operations
- [ ] Reward calculation logic
- [ ] Code generation logic
- [ ] Eligibility validation
- [ ] Usage tracking

### 5.2 Integration Tests
- [ ] Event workflow tests
- [ ] Promotion code application
- [ ] User participation flow
- [ ] Reward distribution

### 5.3 Performance Tests
- [ ] Batch code generation performance
- [ ] Large event participation
- [ ] Database query optimization

## 📋 Phase 6: Documentation & Deployment

### 6.1 Documentation
- [ ] API documentation
- [ ] Database schema documentation
- [ ] Business logic documentation
- [ ] User guide for admin
- [ ] User guide for customers

### 6.2 Deployment
- [ ] Database migration scripts
- [ ] Environment configuration
- [ ] Monitoring setup
- [ ] Error handling

## 📋 Phase 7: Advanced Features

### 7.1 Analytics & Reporting
- [ ] Event performance dashboard
- [ ] Reward usage analytics
- [ ] User participation metrics
- [ ] Revenue impact analysis

### 7.2 Automation
- [ ] Scheduled event activation
- [ ] Automatic reward distribution
- [ ] Event completion notifications
- [ ] Usage limit enforcement

### 7.3 Integration
- [ ] Payment system integration
- [ ] Notification system integration
- [ ] External API integration
- [ ] Third-party analytics

## 🎯 Priority Order
1. **Phase 1**: Database Schema Setup (Critical)
2. **Phase 2**: Core Business Logic (Critical)
3. **Phase 3**: API Endpoints (High)
4. **Phase 4**: Frontend Components (Medium)
5. **Phase 5**: Testing & Validation (High)
6. **Phase 6**: Documentation & Deployment (Medium)
7. **Phase 7**: Advanced Features (Low)

## 📝 Notes
- Sử dụng raw SQL queries theo yêu cầu
- Không sử dụng Prisma ORM
- Sử dụng timezone-utils cho time handling
- Tuân thủ quy tắc userId và branch từ cookie
- Không tự động migrate DB

## 🔄 Progress Tracking
- **Started**: 2024-12-19
- **Current Phase**: Phase 2 - Core Business Logic (Completed)
- **Last Updated**: 2024-12-19
- **Next Milestone**: Frontend Components Development

## ✅ Completed Tasks

### Phase 1: Database Schema Setup ✅
- [x] **Event Table** - Tạo model Event với các fields cơ bản
- [x] **EventParticipant Table** - Tạo model EventParticipant
- [x] **EventReward Table (Flexible)** - Tạo model EventReward với JSON config
- [x] **EventRewardUsage Table** - Tạo model EventRewardUsage để tracking
- [x] **PromotionSetting Updates** - Thêm eventId field và relations
- [x] **PromotionCode Updates** - Thêm event-specific fields
- [x] **Enums** - Thêm EventType, EventStatus, ParticipantStatus, RewardType

### Phase 2: Core Business Logic ✅
- [x] **Event CRUD Operations** - Create Event API, Get Events API
- [x] **Event Reward Management** - Add/Get EventReward APIs
- [x] **Promotion Code Generation** - Generate codes from Event API
- [x] **Reward Calculation Engine** - Flexible reward calculation service
- [x] **Eligibility Check Service** - User eligibility validation
- [x] **Usage Tracking** - Apply reward and track usage

### Phase 3: API Endpoints ✅
- [x] `POST /api/events` - Create Event
- [x] `GET /api/events` - List Events with filters
- [x] `POST /api/events/rewards` - Add Reward to Event
- [x] `GET /api/events/rewards` - List Event Rewards
- [x] `POST /api/events/generate-codes` - Generate Codes
- [x] `GET /api/events/generate-codes` - List Generated Codes

### Phase 4: Testing & Documentation ✅
- [x] **Test Script** - Complete event system test
- [x] **Documentation** - Comprehensive README with examples
- [x] **API Examples** - Complete workflow examples
