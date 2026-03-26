# Complete Swiggy & Zomato Integration Guide for SaaS POS Systems

## 📚 Table of Contents

1. [Understanding the Problem](#understanding-the-problem)
2. [The Right Solution](#the-right-solution)
3. [Testing & Sandbox Environments](#testing--sandbox-environments)
4. [Complete Architecture](#complete-architecture)
5. [Step-by-Step Implementation](#step-by-step-implementation)
6. [Code Implementation](#code-implementation)
7. [User Experience Flow](#user-experience-flow)
8. [Security & Best Practices](#security--best-practices)
9. [Business Considerations](#business-considerations)
10. [Getting Started Checklist](#getting-started-checklist)

---

## Understanding the Problem

### ❌ The Wrong Approach (What Most Developers Think)

```
┌─────────────────────────────────────────────────────────────┐
│  Restaurant Owner                                            │
│  1. Registers with Swiggy/Zomato                           │
│  2. Gets API keys                                           │
│  3. Copies API key                                          │
│  4. Pastes into your POS software                          │
│  5. Repeat for each restaurant                             │
└─────────────────────────────────────────────────────────────┘

Problems:
❌ Not scalable
❌ Poor user experience
❌ Technical knowledge required from users
❌ Security risks (users handling API keys)
❌ Support nightmare
```

### ✅ The Right Approach (SaaS Multi-Tenant Model)

```
┌─────────────────────────────────────────────────────────────┐
│  Restaurant Owner                                            │
│  1. Logs into YOUR POS software                            │
│  2. Clicks "Enable Swiggy" button                          │
│  3. Enters their Restaurant ID (30 seconds)                │
│  4. Done! Orders start flowing automatically               │
└─────────────────────────────────────────────────────────────┘

Benefits:
✅ One-click integration
✅ No technical knowledge needed
✅ Scalable to 1000s of restaurants
✅ Centralized management
✅ Better support
✅ Professional UX
```

---

## The Right Solution

### How Professional POS Systems Actually Work

Companies like **UrbanPiper**, **Petpooja**, and **Posist** use the **Middleware/Master Account Model**:

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR POS SOFTWARE                         │
│                  (Serves 100s of restaurants)                │
│                                                              │
│  Restaurant A  │  Restaurant B  │  Restaurant C  │  ...     │
└────────┬────────────┬─────────────────┬─────────────────────┘
         │            │                 │
         └────────────┴─────────────────┘
                      │
         ┌────────────▼──────────────┐
         │  YOUR MIDDLEWARE API       │
         │                           │
         │  ONE Master API Account   │
         │  Maps to all restaurants  │
         └────────────┬──────────────┘
                      │
         ┌────────────┴──────────────┐
         │                           │
    ┌────▼─────┐              ┌─────▼────┐
    │  Swiggy  │              │  Zomato  │
    │   API    │              │   API    │
    └──────────┘              └──────────┘
```

### Key Concept

**YOU become the Integration Partner, not your users!**

- You get ONE master API account from Swiggy/Zomato
- Each restaurant just provides their Restaurant ID
- Your middleware routes orders to the correct restaurant
- Users never see or handle API keys

---

## Testing & Sandbox Environments

### 🟢 Zomato - YES, Sandbox Available

Zomato provides a comprehensive testing environment:

**What They Offer:**
- ✅ Developer Portal with documentation
- ✅ Sandbox environment for testing
- ✅ Test restaurants with mock data
- ✅ Real-time API testing tools
- ✅ Mock server examples

**How to Access:**
1. Visit: https://www.zomato.com/developer/integration
2. Email: **posintegrations@zomato.com**
3. Request POS integration partnership
4. Get sandbox credentials
5. Start testing immediately

**Testing Process:**
```bash
1. Create mock server for testing
2. Use example API responses from docs
3. Get test restaurant credentials from Zomato POC
4. Test all workflows in sandbox
5. Move to production after approval
```

### 🔴 Swiggy - NO Public Sandbox

Swiggy has a more restricted approach:

**Current Situation:**
- ❌ No public developer portal
- ❌ No sandbox environment for testing
- ❌ Cannot test without being a partner
- ✅ Partner-only API access

**How to Access:**
1. Email: **partnersupport@swiggy.in**
2. Apply as POS Integration Partner
3. Explain your SaaS business model
4. Get approved (may take 2-4 weeks)
5. Receive production API credentials

**Alternative Testing Options:**
1. **Use UrbanPiper Trial**: They already have Swiggy integration
2. **Register Test Restaurant**: If you have a physical location
3. **Partner with Existing Provider**: Initially use their API

### Comparison Table

| Feature | Zomato | Swiggy |
|---------|--------|--------|
| Developer Portal | ✅ Yes | ❌ No |
| Sandbox Environment | ✅ Yes | ❌ No |
| Public Documentation | ✅ Yes | ⚠️ Limited |
| Testing Before Partnership | ✅ Yes | ❌ No |
| API Access | After approval | After partnership |
| Response Time | 1-2 weeks | 2-4 weeks |

### Recommended Testing Strategy

**Phase 1: Start with Zomato**
```bash
Week 1: Apply for Zomato developer account
Week 2: Get sandbox access
Week 3: Build and test integration
Week 4: Get production approval
```

**Phase 2: Add Swiggy**
```bash
Option A: Apply for Swiggy partnership directly
Option B: Use UrbanPiper API temporarily
Option C: Build integration, test later with real partner
```

---

## Complete Architecture

### Overall System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                    RESTAURANT OWNER                              │
│              Uses Your POS Software                              │
│              (e.g., "Burger Palace")                            │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          │ 1. Clicks "Enable Swiggy"
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                 YOUR POS SOFTWARE DASHBOARD                      │
│                                                                  │
│  ┌───────────────────────────────────────────────────────┐     │
│  │  Swiggy Integration Setup                             │     │
│  │  ──────────────────────────────────────               │     │
│  │                                                        │     │
│  │  Enter your Swiggy Restaurant ID: [_________]         │     │
│  │  (Find this in Swiggy Partner App)                    │     │
│  │                                                        │     │
│  │  Outlet Name (Optional): [_________]                  │     │
│  │  Auto-Accept Orders: [ ] Yes [x] No                   │     │
│  │  Preparation Time: [20] minutes                       │     │
│  │                                                        │     │
│  │  [Submit & Activate Integration]                      │     │
│  └───────────────────────────────────────────────────────┘     │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          │ 2. Backend receives restaurant ID
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              YOUR BACKEND (Node.js/Express)                      │
│                                                                  │
│  Step 1: Verify Restaurant ID with Swiggy                       │
│  ┌─────────────────────────────────────────────────┐           │
│  │ GET /restaurants/{id}/info                       │           │
│  │ Using YOUR master API credentials                │           │
│  └─────────────────────────────────────────────────┘           │
│                                                                  │
│  Step 2: Create mapping in database                             │
│  ┌─────────────────────────────────────────────────┐           │
│  │ organizationID: "64a1b2c3..."                    │           │
│  │ swiggyRestaurantId: "12345"                      │           │
│  │ isEnabled: true                                  │           │
│  │ autoAcceptOrders: false                          │           │
│  └─────────────────────────────────────────────────┘           │
│                                                                  │
│  Step 3: Register webhook with Swiggy                           │
│  ┌─────────────────────────────────────────────────┐           │
│  │ POST /restaurants/{id}/webhooks                  │           │
│  │ URL: https://yourapp.com/api/webhooks/swiggy    │           │
│  └─────────────────────────────────────────────────┘           │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          │ 3. Customer places order
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SWIGGY PLATFORM                               │
│  Customer orders food → Swiggy processes → Sends webhook        │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          │ 4. Webhook delivered
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              YOUR WEBHOOK HANDLER                                │
│  POST /api/webhooks/swiggy                                       │
│                                                                  │
│  Receives:                                                       │
│  {                                                               │
│    "event_type": "order.placed",                                │
│    "data": {                                                     │
│      "restaurant_id": "12345",                                  │
│      "order_id": "ORD-789",                                     │
│      "items": [...],                                            │
│      "total": 450                                               │
│    }                                                             │
│  }                                                               │
│                                                                  │
│  Process:                                                        │
│  1. Extract restaurant_id: "12345"                              │
│  2. Look up organizationID in database                          │
│  3. Create order for correct restaurant                         │
│  4. Send real-time notification via Socket.IO                   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          │ 5. Real-time notification
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              RESTAURANT'S POS DASHBOARD                          │
│  🔔 New Swiggy Order Received!                                  │
│  Order #ORD-789 | ₹450 | 3 items                               │
│  [Accept] [Reject]                                              │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow Diagram

```
Customer          Swiggy          YOUR API          Database       Restaurant
   │                │                 │                 │               │
   │──Order Food───>│                 │                 │               │
   │                │                 │                 │               │
   │                │──Webhook──────>│                 │               │
   │                │   (restaurant_id=12345)          │               │
   │                │                 │                 │               │
   │                │                 │──Query by───────>               │
   │                │                 │  restaurant_id  │               │
   │                │                 │                 │               │
   │                │                 │<──Returns────────               │
   │                │                 │  organizationID │               │
   │                │                 │                 │               │
   │                │                 │──Save Order─────>               │
   │                │                 │  for org        │               │
   │                │                 │                 │               │
   │                │                 │──WebSocket──────────────────────>
   │                │                 │  Notification   │               │
   │                │                 │                 │               │
   │                │                 │<──Accept────────────────────────│
   │                │                 │  Order          │               │
   │                │                 │                 │               │
   │                │<──Confirm───────│                 │               │
   │                │   Acceptance    │                 │               │
   │                │                 │                 │               │
   │<──Update Status│                 │                 │               │
   │                │                 │                 │               │
```

---

## Step-by-Step Implementation

### Prerequisites

Before starting implementation:

1. **Business Setup**
   - [ ] Registered company/business
   - [ ] Valid business documents
   - [ ] GSTIN (for India)
   - [ ] Website/app for your POS software

2. **Technical Setup**
   - [ ] Node.js >= 16.x installed
   - [ ] MongoDB database
   - [ ] SSL certificate for webhooks (HTTPS required)
   - [ ] Server with public IP/domain

3. **Account Setup**
   - [ ] Zomato Developer Portal account
   - [ ] Swiggy partner application submitted

### Implementation Phases

#### Phase 1: Become Integration Partner (Week 1-2)

**Step 1.1: Apply to Zomato**

```bash
# Email Template for Zomato

To: posintegrations@zomato.com
Subject: POS Integration Partnership Application

Dear Zomato Team,

We are [Your Company Name], a cloud-based POS system serving 
[X number] of restaurants across [cities/regions].

We would like to integrate with Zomato's platform to enable 
our restaurant partners to manage their Zomato orders directly 
from our POS system.

Our POS System:
- Name: [Your POS Name]
- Website: [your-website.com]
- Current Restaurants: [number]
- Target Market: [restaurant types]

Technical Details:
- Multi-tenant SaaS architecture
- Real-time order processing
- Automated menu synchronization
- Order analytics and reporting

We request:
1. POS Integration Partnership approval
2. Sandbox environment access for testing
3. API documentation and credentials
4. Technical support contact

Please let us know the next steps.

Best regards,
[Your Name]
[Your Company]
[Contact Information]
```

**Step 1.2: Apply to Swiggy**

```bash
# Email Template for Swiggy

To: partnersupport@swiggy.in
Subject: POS Integration Partnership Application

Dear Swiggy Team,

[Similar content as Zomato email, adjusted for Swiggy]

Looking forward to partnering with Swiggy.

Best regards,
[Your Name]
```

**Step 1.3: Follow Up**

```bash
Week 1: Send initial application
Week 2: Follow up if no response
Week 3: Schedule call/meeting
Week 4: Receive credentials (typical timeline)
```

#### Phase 2: Database Setup (Week 2)

**Step 2.1: Create Required Models**

You need 3 new database models:

1. **AggregatorConfig**: Stores integration settings per restaurant
2. **AggregatorOrder**: Stores orders from aggregators
3. **AggregatorMenuItem**: Maps menu items to aggregators

See [Code Implementation](#code-implementation) section for complete schemas.

**Step 2.2: Add Environment Variables**

```env
# .env file additions

# Swiggy Master API (YOU get these from Swiggy)
SWIGGY_MASTER_API_KEY=your_master_key_here
SWIGGY_MASTER_API_SECRET=your_master_secret_here
SWIGGY_API_BASE_URL=https://partner-api.swiggy.com/v1

# Zomato Master API (YOU get these from Zomato)
ZOMATO_MASTER_API_KEY=your_master_key_here
ZOMATO_CLIENT_ID=your_client_id_here
ZOMATO_CLIENT_SECRET=your_client_secret_here
ZOMATO_API_BASE_URL=https://api.zomato.com/v1/partner

# Your app details (for webhooks)
APP_BASE_URL=https://yourapp.com
APP_WEBHOOK_SECRET=random_secret_for_verification

# Optional: Separate secrets per aggregator
SWIGGY_WEBHOOK_SECRET=swiggy_webhook_secret
ZOMATO_WEBHOOK_SECRET=zomato_webhook_secret
```

#### Phase 3: Service Layer Implementation (Week 3)

**Step 3.1: Create Master Services**

These services use YOUR master API credentials to interact with Swiggy/Zomato on behalf of ALL your restaurant customers.

```javascript
// File structure:
src/
  Services/
    aggregator/
      MasterSwiggyService.js    // Handles all Swiggy API calls
      MasterZomatoService.js    // Handles all Zomato API calls
```

**Step 3.2: Implement Webhook Handlers**

```javascript
// File structure:
src/
  Controller/
    pos/
      AggregatorWebhookController.js  // Receives webhooks
      AggregatorOrderController.js    // Manages orders
      AggregatorIntegrationController.js  // Setup/configuration
```

#### Phase 4: API Routes (Week 3)

**Step 4.1: Add Routes**

```javascript
// src/Routes/aggregatorRoutes.js

import express from "express";
import { protect } from "../Middlewares/Auth.middleware.js";

const router = express.Router();

// Webhooks (NO auth - verified by signature)
router.post("/webhooks/swiggy", swiggyWebhook);
router.post("/webhooks/zomato", zomatoWebhook);

// Protected routes (require authentication)
router.use(protect);

// Integration setup
router.post("/swiggy/connect", connectSwiggy);
router.put("/swiggy/disconnect", disconnectSwiggy);
router.post("/zomato/connect", connectZomato);
router.put("/zomato/disconnect", disconnectZomato);
router.get("/status", getIntegrationStatus);

// Order management
router.get("/orders", getAggregatorOrders);
router.post("/orders/:orderId/accept", acceptOrder);
router.post("/orders/:orderId/reject", rejectOrder);
router.put("/orders/:orderId/status", updateOrderStatus);

// Menu sync
router.post("/menu/sync", syncMenuToAggregators);
router.put("/menu/items/:itemId/availability", updateItemAvailability);

// Analytics
router.get("/analytics", getAggregatorAnalytics);

export default router;
```

**Step 4.2: Register Routes in App**

```javascript
// src/app.js

import aggregatorRoutes from "./Routes/aggregatorRoutes.js";

// ... other imports

app.use("/api/aggregator", aggregatorRoutes);
```

#### Phase 5: Frontend Implementation (Week 4)

**Step 5.1: Create Integration Dashboard**

Location: `client/src/pages/Integrations.jsx` or similar

**Step 5.2: Add Real-time Notifications**

Use Socket.IO for instant order notifications:

```javascript
// client/src/services/socket.js

import io from 'socket.io-client';

const socket = io('http://localhost:8080');

socket.on('NEW_AGGREGATOR_ORDER', (data) => {
  // Show notification
  notification.success({
    message: `New ${data.aggregator} Order`,
    description: `Order #${data.order.aggregatorOrderId}`,
  });
  
  // Play sound
  const audio = new Audio('/notification.mp3');
  audio.play();
});
```

#### Phase 6: Testing (Week 5)

**Step 6.1: Unit Testing**

```javascript
// Test webhook routing
describe('Swiggy Webhook', () => {
  it('should route order to correct restaurant', async () => {
    const mockOrder = {
      event_type: 'order.placed',
      data: {
        restaurant_id: '12345',
        order_id: 'ORD-789',
        // ... order data
      }
    };
    
    const res = await request(app)
      .post('/api/webhooks/swiggy')
      .send(mockOrder);
    
    expect(res.status).toBe(200);
    
    // Verify order created for correct organization
    const order = await AggregatorOrder.findOne({
      aggregatorOrderId: 'ORD-789'
    });
    
    expect(order.organizationID).toBe(expectedOrgId);
  });
});
```

**Step 6.2: Integration Testing**

Test with sandbox environments:

```bash
# Test flow:
1. Connect test restaurant
2. Trigger test order from Zomato sandbox
3. Verify webhook received
4. Verify order created
5. Test accept/reject
6. Test status updates
7. Test menu sync
```

**Step 6.3: Load Testing**

```javascript
// Simulate high order volume
// Test 100 simultaneous orders
// Ensure system handles peak hours
```

#### Phase 7: Production Deployment (Week 6)

**Step 7.1: Pre-deployment Checklist**

- [ ] All tests passing
- [ ] SSL certificates configured
- [ ] Environment variables set
- [ ] Database backups configured
- [ ] Monitoring setup (e.g., Sentry)
- [ ] Log aggregation setup
- [ ] Webhook endpoints accessible publicly
- [ ] Rate limiting configured

**Step 7.2: Pilot Launch**

```bash
# Start with 2-3 test restaurants
Week 1: Internal testing with friendly restaurants
Week 2: Monitor and fix issues
Week 3: Expand to 10 restaurants
Week 4: Full launch to all customers
```

**Step 7.3: Go Live**

```bash
1. Deploy to production
2. Configure webhooks with Swiggy/Zomato
3. Enable for pilot restaurants
4. Monitor closely for 1 week
5. Gradual rollout to all customers
```

---

## Code Implementation

### Complete Database Models

#### 1. AggregatorConfig Model

```javascript
// src/Models/pos/AggregatorConfig.js
import mongoose from "mongoose";

const aggregatorConfigSchema = new mongoose.Schema({
  organizationID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
    unique: true,
  },
  
  // Swiggy Configuration
  swiggy: {
    isEnabled: {
      type: Boolean,
      default: false,
    },
    // Restaurant's Swiggy ID from their partner account
    restaurantId: {
      type: String,
      sparse: true,
    },
    outletName: String,
    
    // Auto-accept configuration
    autoAcceptOrders: {
      type: Boolean,
      default: false,
    },
    preparationTime: {
      type: Number,
      default: 20, // minutes
    },
    
    // Status tracking
    lastSyncedAt: Date,
    integrationStatus: {
      type: String,
      enum: ["pending", "active", "failed", "disabled"],
      default: "pending",
    },
    
    // Optional per-restaurant webhook secret
    webhookSecret: String,
  },
  
  // Zomato Configuration (similar structure)
  zomato: {
    isEnabled: {
      type: Boolean,
      default: false,
    },
    restaurantId: {
      type: String,
      sparse: true,
    },
    outletName: String,
    autoAcceptOrders: {
      type: Boolean,
      default: false,
    },
    preparationTime: {
      type: Number,
      default: 20,
    },
    lastSyncedAt: Date,
    integrationStatus: {
      type: String,
      enum: ["pending", "active", "failed", "disabled"],
      default: "pending",
    },
    webhookSecret: String,
  },
  
  // Notification preferences
  notifications: {
    email: {
      type: Boolean,
      default: true,
    },
    sms: {
      type: Boolean,
      default: false,
    },
    inApp: {
      type: Boolean,
      default: true,
    },
  },
  
}, {
  timestamps: true,
});

// Indexes for fast lookup
aggregatorConfigSchema.index({ "swiggy.restaurantId": 1 });
aggregatorConfigSchema.index({ "zomato.restaurantId": 1 });
aggregatorConfigSchema.index({ organizationID: 1 });

export default mongoose.model("AggregatorConfig", aggregatorConfigSchema);
```

#### 2. AggregatorOrder Model

```javascript
// src/Models/pos/AggregatorOrder.js
import mongoose from "mongoose";

const aggregatorOrderSchema = new mongoose.Schema({
  // Which platform (swiggy/zomato)
  aggregator: {
    type: String,
    enum: ["swiggy", "zomato"],
    required: true,
  },
  
  // Order ID from aggregator
  aggregatorOrderId: {
    type: String,
    required: true,
    unique: true,
  },
  
  // Which restaurant in YOUR system
  organizationID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  
  // Customer details (often masked for privacy)
  customer: {
    name: String,
    phone: String, // Masked: +91-XXXX-XX-1234
    address: String,
  },
  
  // Order items
  items: [{
    itemId: String,
    name: String,
    quantity: Number,
    price: Number,
    addons: [{
      name: String,
      price: Number,
    }],
    instructions: String,
  }],
  
  // Pricing breakdown
  itemTotal: Number,
  deliveryCharge: Number,
  packagingCharge: Number,
  taxes: Number,
  discount: Number,
  totalAmount: Number,
  
  // Order status
  status: {
    type: String,
    enum: [
      "new",
      "accepted",
      "preparing",
      "ready",
      "picked_up",
      "delivered",
      "rejected",
      "cancelled",
    ],
    default: "new",
  },
  
  // Delivery information
  deliveryType: {
    type: String,
    enum: ["platform", "self"], // platform = Swiggy/Zomato delivery, self = restaurant delivery
  },
  deliveryPartner: {
    name: String,
    phone: String,
    trackingUrl: String,
  },
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date,
  
  // Timestamps for each stage
  orderPlacedAt: Date,
  acceptedAt: Date,
  readyAt: Date,
  pickedUpAt: Date,
  deliveredAt: Date,
  rejectedAt: Date,
  cancelledAt: Date,
  
  // Rejection/cancellation reason
  rejectionReason: String,
  cancellationReason: String,
  
  // Store complete raw data for debugging
  rawOrderData: mongoose.Schema.Types.Mixed,
  
}, {
  timestamps: true,
});

// Indexes
aggregatorOrderSchema.index({ aggregatorOrderId: 1, aggregator: 1 });
aggregatorOrderSchema.index({ organizationID: 1, status: 1 });
aggregatorOrderSchema.index({ createdAt: -1 });
aggregatorOrderSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("AggregatorOrder", aggregatorOrderSchema);
```

#### 3. AggregatorMenuItem Model

```javascript
// src/Models/pos/AggregatorMenuItem.js
import mongoose from "mongoose";

const aggregatorMenuItemSchema = new mongoose.Schema({
  organizationID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  
  // Reference to your local menu item
  localMenuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuItem",
    required: true,
  },
  
  // Swiggy mapping
  swiggy: {
    itemId: String, // Swiggy's ID for this item
    isActive: Boolean,
    price: Number,
    lastSynced: Date,
  },
  
  // Zomato mapping
  zomato: {
    itemId: String, // Zomato's ID for this item
    isActive: Boolean,
    price: Number,
    lastSynced: Date,
  },
  
  // Common item details
  name: String,
  description: String,
  category: String,
  isVeg: Boolean,
  image: String,
  
  // Availability settings
  isAvailable: {
    type: Boolean,
    default: true,
  },
  
  // Schedule-based availability
  availabilitySchedule: [{
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6, // 0 = Sunday, 6 = Saturday
    },
    startTime: String, // "09:00"
    endTime: String,   // "22:00"
  }],
  
}, {
  timestamps: true,
});

// Indexes
aggregatorMenuItemSchema.index({ organizationID: 1 });
aggregatorMenuItemSchema.index({ localMenuItemId: 1 });
aggregatorMenuItemSchema.index({ "swiggy.itemId": 1 });
aggregatorMenuItemSchema.index({ "zomato.itemId": 1 });

export default mongoose.model("AggregatorMenuItem", aggregatorMenuItemSchema);
```

### Service Layer Implementation

#### Master Swiggy Service

```javascript
// src/Services/aggregator/MasterSwiggyService.js
import axios from "axios";
import crypto from "crypto";

/**
 * Master Swiggy Service
 * Handles ALL Swiggy API interactions for ALL restaurants
 * Uses YOUR master API credentials
 */
class MasterSwiggyService {
  constructor() {
    this.masterAPIKey = process.env.SWIGGY_MASTER_API_KEY;
    this.masterAPISecret = process.env.SWIGGY_MASTER_API_SECRET;
    this.baseURL = process.env.SWIGGY_API_BASE_URL;
    
    if (!this.masterAPIKey || !this.masterAPISecret) {
      console.warn("⚠️  Swiggy API credentials not configured");
    }
  }
  
  /**
   * Generate signature for API authentication
   */
  generateSignature(payload) {
    const timestamp = Date.now();
    const data = `${timestamp}:${JSON.stringify(payload)}`;
    const signature = crypto
      .createHmac("sha256", this.masterAPISecret)
      .update(data)
      .digest("hex");
    return { signature, timestamp };
  }
  
  /**
   * Verify restaurant ID is valid
   * Called when user first connects their Swiggy account
   */
  async verifyRestaurant(restaurantId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/restaurants/${restaurantId}/info`,
        {
          headers: {
            "X-API-Key": this.masterAPIKey,
            "X-API-Secret": this.masterAPISecret,
          },
        }
      );
      
      return {
        isValid: true,
        restaurantName: response.data.restaurant_name,
        address: response.data.address,
        city: response.data.city,
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          isValid: false,
          error: "Restaurant not found in Swiggy system",
        };
      }
      
      console.error("[Swiggy] Verify restaurant failed:", error.message);
      throw new Error(`Failed to verify restaurant: ${error.message}`);
    }
  }
  
  /**
   * Register webhook for a restaurant
   * Tells Swiggy to send orders to YOUR webhook URL
   */
  async registerWebhook(restaurantId) {
    try {
      const webhookUrl = `${process.env.APP_BASE_URL}/api/webhooks/swiggy`;
      
      const payload = {
        restaurant_id: restaurantId,
        url: webhookUrl,
        events: [
          "order.placed",
          "order.cancelled",
          "delivery.assigned",
          "delivery.picked_up",
          "delivery.delivered",
        ],
      };
      
      const { signature, timestamp } = this.generateSignature(payload);
      
      const response = await axios.post(
        `${this.baseURL}/restaurants/${restaurantId}/webhooks`,
        payload,
        {
          headers: {
            "X-API-Key": this.masterAPIKey,
            "X-API-Secret": this.masterAPISecret,
            "X-Signature": signature,
            "X-Timestamp": timestamp,
          },
        }
      );
      
      console.log(`✅ [Swiggy] Webhook registered for restaurant ${restaurantId}`);
      return response.data;
    } catch (error) {
      console.error("[Swiggy] Webhook registration failed:", error.message);
      throw error;
    }
  }
  
  /**
   * Accept order
   */
  async acceptOrder(restaurantId, orderId, preparationTime) {
    try {
      const payload = {
        restaurant_id: restaurantId,
        order_id: orderId,
        preparation_time: preparationTime,
      };
      
      const { signature, timestamp } = this.generateSignature(payload);
      
      const response = await axios.post(
        `${this.baseURL}/restaurants/${restaurantId}/orders/${orderId}/accept`,
        payload,
        {
          headers: {
            "X-API-Key": this.masterAPIKey,
            "X-API-Secret": this.masterAPISecret,
            "X-Signature": signature,
            "X-Timestamp": timestamp,
          },
        }
      );
      
      console.log(`✅ [Swiggy] Order ${orderId} accepted`);
      return response.data;
    } catch (error) {
      console.error(`[Swiggy] Accept order failed:`, error.message);
      throw error;
    }
  }
  
  /**
   * Reject order
   */
  async rejectOrder(restaurantId, orderId, reason) {
    try {
      const payload = {
        restaurant_id: restaurantId,
        order_id: orderId,
        reason: reason,
      };
      
      const { signature, timestamp } = this.generateSignature(payload);
      
      const response = await axios.post(
        `${this.baseURL}/restaurants/${restaurantId}/orders/${orderId}/reject`,
        payload,
        {
          headers: {
            "X-API-Key": this.masterAPIKey,
            "X-API-Secret": this.masterAPISecret,
            "X-Signature": signature,
            "X-Timestamp": timestamp,
          },
        }
      );
      
      console.log(`❌ [Swiggy] Order ${orderId} rejected`);
      return response.data;
    } catch (error) {
      console.error(`[Swiggy] Reject order failed:`, error.message);
      throw error;
    }
  }
  
  /**
   * Update order status
   */
  async updateOrderStatus(restaurantId, orderId, status) {
    try {
      const payload = {
        restaurant_id: restaurantId,
        order_id: orderId,
        status: status, // "preparing", "ready", "picked_up"
      };
      
      const { signature, timestamp } = this.generateSignature(payload);
      
      const response = await axios.put(
        `${this.baseURL}/restaurants/${restaurantId}/orders/${orderId}/status`,
        payload,
        {
          headers: {
            "X-API-Key": this.masterAPIKey,
            "X-API-Secret": this.masterAPISecret,
            "X-Signature": signature,
            "X-Timestamp": timestamp,
          },
        }
      );
      
      console.log(`📦 [Swiggy] Order ${orderId} status: ${status}`);
      return response.data;
    } catch (error) {
      console.error(`[Swiggy] Update status failed:`, error.message);
      throw error;
    }
  }
  
  /**
   * Update menu item availability
   */
  async updateItemAvailability(restaurantId, itemId, isAvailable) {
    try {
      const payload = {
        restaurant_id: restaurantId,
        item_id: itemId,
        available: isAvailable,
      };
      
      const { signature, timestamp } = this.generateSignature(payload);
      
      const response = await axios.put(
        `${this.baseURL}/restaurants/${restaurantId}/menu/items/${itemId}/availability`,
        payload,
        {
          headers: {
            "X-API-Key": this.masterAPIKey,
            "X-API-Secret": this.masterAPISecret,
            "X-Signature": signature,
            "X-Timestamp": timestamp,
          },
        }
      );
      
      console.log(`🍔 [Swiggy] Item ${itemId} availability: ${isAvailable}`);
      return response.data;
    } catch (error) {
      console.error(`[Swiggy] Update item failed:`, error.message);
      throw error;
    }
  }
  
  /**
   * Sync complete menu
   */
  async syncMenu(restaurantId, menuItems) {
    try {
      const payload = {
        restaurant_id: restaurantId,
        items: menuItems.map(item => ({
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          veg: item.isVeg,
          image_url: item.image,
        })),
      };
      
      const { signature, timestamp } = this.generateSignature(payload);
      
      const response = await axios.post(
        `${this.baseURL}/restaurants/${restaurantId}/menu/sync`,
        payload,
        {
          headers: {
            "X-API-Key": this.masterAPIKey,
            "X-API-Secret": this.masterAPISecret,
            "X-Signature": signature,
            "X-Timestamp": timestamp,
          },
        }
      );
      
      console.log(`📋 [Swiggy] Menu synced for restaurant ${restaurantId}`);
      return response.data;
    } catch (error) {
      console.error(`[Swiggy] Menu sync failed:`, error.message);
      throw error;
    }
  }
}

// Export singleton instance
export default new MasterSwiggyService();
```

#### Master Zomato Service

```javascript
// src/Services/aggregator/MasterZomatoService.js
import axios from "axios";

/**
 * Master Zomato Service
 * Handles ALL Zomato API interactions for ALL restaurants
 */
class MasterZomatoService {
  constructor() {
    this.masterAPIKey = process.env.ZOMATO_MASTER_API_KEY;
    this.clientId = process.env.ZOMATO_CLIENT_ID;
    this.clientSecret = process.env.ZOMATO_CLIENT_SECRET;
    this.baseURL = process.env.ZOMATO_API_BASE_URL;
    
    if (!this.masterAPIKey) {
      console.warn("⚠️  Zomato API credentials not configured");
    }
  }
  
  /**
   * Verify restaurant
   */
  async verifyRestaurant(restaurantId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/restaurants/${restaurantId}`,
        {
          headers: {
            "X-API-Key": this.masterAPIKey,
          },
        }
      );
      
      return {
        isValid: true,
        restaurantName: response.data.name,
        address: response.data.location,
        city: response.data.city,
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          isValid: false,
          error: "Restaurant not found in Zomato system",
        };
      }
      
      console.error("[Zomato] Verify restaurant failed:", error.message);
      throw error;
    }
  }
  
  /**
   * Register webhook
   */
  async registerWebhook(restaurantId) {
    try {
      const webhookUrl = `${process.env.APP_BASE_URL}/api/webhooks/zomato`;
      
      const response = await axios.post(
        `${this.baseURL}/restaurants/${restaurantId}/webhooks`,
        {
          url: webhookUrl,
          events: [
            "order.new",
            "order.cancelled",
            "rider.assigned",
            "rider.pickedup",
            "rider.delivered",
          ],
        },
        {
          headers: {
            "X-API-Key": this.masterAPIKey,
          },
        }
      );
      
      console.log(`✅ [Zomato] Webhook registered for restaurant ${restaurantId}`);
      return response.data;
    } catch (error) {
      console.error("[Zomato] Webhook registration failed:", error.message);
      throw error;
    }
  }
  
  /**
   * Accept order
   */
  async acceptOrder(restaurantId, orderId, preparationTime) {
    try {
      const response = await axios.post(
        `${this.baseURL}/restaurants/${restaurantId}/orders/${orderId}/accept`,
        { preparation_time: preparationTime },
        {
          headers: {
            "X-API-Key": this.masterAPIKey,
          },
        }
      );
      
      console.log(`✅ [Zomato] Order ${orderId} accepted`);
      return response.data;
    } catch (error) {
      console.error(`[Zomato] Accept order failed:`, error.message);
      throw error;
    }
  }
  
  /**
   * Reject order
   */
  async rejectOrder(restaurantId, orderId, reason) {
    try {
      const response = await axios.post(
        `${this.baseURL}/restaurants/${restaurantId}/orders/${orderId}/reject`,
        { reason },
        {
          headers: {
            "X-API-Key": this.masterAPIKey,
          },
        }
      );
      
      console.log(`❌ [Zomato] Order ${orderId} rejected`);
      return response.data;
    } catch (error) {
      console.error(`[Zomato] Reject order failed:`, error.message);
      throw error;
    }
  }
  
  /**
   * Mark order ready
   */
  async markOrderReady(restaurantId, orderId) {
    try {
      const response = await axios.post(
        `${this.baseURL}/restaurants/${restaurantId}/orders/${orderId}/ready`,
        {},
        {
          headers: {
            "X-API-Key": this.masterAPIKey,
          },
        }
      );
      
      console.log(`📦 [Zomato] Order ${orderId} marked ready`);
      return response.data;
    } catch (error) {
      console.error(`[Zomato] Mark ready failed:`, error.message);
      throw error;
    }
  }
  
  /**
   * Update item availability
   */
  async updateItemAvailability(restaurantId, itemId, isAvailable) {
    try {
      const response = await axios.put(
        `${this.baseURL}/restaurants/${restaurantId}/menu/items/${itemId}`,
        { in_stock: isAvailable },
        {
          headers: {
            "X-API-Key": this.masterAPIKey,
          },
        }
      );
      
      console.log(`🍔 [Zomato] Item ${itemId} availability: ${isAvailable}`);
      return response.data;
    } catch (error) {
      console.error(`[Zomato] Update item failed:`, error.message);
      throw error;
    }
  }
  
  /**
   * Sync menu
   */
  async syncMenu(restaurantId, menuData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/restaurants/${restaurantId}/menu/sync`,
        menuData,
        {
          headers: {
            "X-API-Key": this.masterAPIKey,
          },
        }
      );
      
      console.log(`📋 [Zomato] Menu synced for restaurant ${restaurantId}`);
      return response.data;
    } catch (error) {
      console.error(`[Zomato] Menu sync failed:`, error.message);
      throw error;
    }
  }
}

// Export singleton
export default new MasterZomatoService();
```

### Controller Implementation

#### Integration Setup Controller

```javascript
// src/Controller/pos/AggregatorIntegrationController.js
import asyncHandler from "../../Utils/AsyncHandler.js";
import ApiError from "../../Utils/ApiError.js";
import ApiResponse from "../../Utils/ApiResponse.js";
import AggregatorConfig from "../../Models/pos/AggregatorConfig.js";
import MasterSwiggyService from "../../Services/aggregator/MasterSwiggyService.js";
import MasterZomatoService from "../../Services/aggregator/MasterZomatoService.js";

// ─────────────────────────────────────────────────────────────
//  POST /api/aggregator/swiggy/connect
//  User enables Swiggy integration
// ─────────────────────────────────────────────────────────────
export const connectSwiggy = asyncHandler(async (req, res) => {
  const {
    restaurantId,
    outletName,
    autoAcceptOrders,
    preparationTime,
  } = req.body;
  
  // Validate input
  if (!restaurantId) {
    throw new ApiError(400, "Swiggy Restaurant ID is required");
  }
  
  console.log(`[Integration] Connecting Swiggy for org: ${req.user.organizationID}`);
  
  // Step 1: Verify restaurant ID with Swiggy
  const verification = await MasterSwiggyService.verifyRestaurant(restaurantId);
  
  if (!verification.isValid) {
    throw new ApiError(400, `Invalid Swiggy Restaurant ID: ${verification.error}`);
  }
  
  // Step 2: Check if this restaurant is already connected elsewhere
  const existingConfig = await AggregatorConfig.findOne({
    "swiggy.restaurantId": restaurantId,
  });
  
  if (
    existingConfig &&
    existingConfig.organizationID.toString() !== req.user.organizationID.toString()
  ) {
    throw new ApiError(
      400,
      "This Swiggy restaurant is already connected to another account in our system"
    );
  }
  
  // Step 3: Register webhook with Swiggy
  try {
    await MasterSwiggyService.registerWebhook(restaurantId);
  } catch (error) {
    console.error("⚠️  Webhook registration failed:", error.message);
    // Continue anyway - can be configured manually later
  }
  
  // Step 4: Save configuration
  const config = await AggregatorConfig.findOneAndUpdate(
    { organizationID: req.user.organizationID },
    {
      $set: {
        "swiggy.isEnabled": true,
        "swiggy.restaurantId": restaurantId,
        "swiggy.outletName": outletName || verification.restaurantName,
        "swiggy.autoAcceptOrders": autoAcceptOrders || false,
        "swiggy.preparationTime": preparationTime || 20,
        "swiggy.integrationStatus": "active",
        "swiggy.lastSyncedAt": new Date(),
      },
    },
    {
      new: true,
      upsert: true,
    }
  );
  
  console.log(`✅ [Integration] Swiggy connected successfully`);
  
  res.json(
    new ApiResponse(
      200,
      {
        config,
        restaurantInfo: {
          name: verification.restaurantName,
          address: verification.address,
          city: verification.city,
        },
      },
      "Swiggy integration enabled successfully! Orders will now appear in your dashboard."
    )
  );
});

// ─────────────────────────────────────────────────────────────
//  POST /api/aggregator/zomato/connect
// ─────────────────────────────────────────────────────────────
export const connectZomato = asyncHandler(async (req, res) => {
  const {
    restaurantId,
    outletName,
    autoAcceptOrders,
    preparationTime,
  } = req.body;
  
  if (!restaurantId) {
    throw new ApiError(400, "Zomato Restaurant ID is required");
  }
  
  console.log(`[Integration] Connecting Zomato for org: ${req.user.organizationID}`);
  
  // Verify with Zomato
  const verification = await MasterZomatoService.verifyRestaurant(restaurantId);
  
  if (!verification.isValid) {
    throw new ApiError(400, `Invalid Zomato Restaurant ID: ${verification.error}`);
  }
  
  // Check for duplicates
  const existingConfig = await AggregatorConfig.findOne({
    "zomato.restaurantId": restaurantId,
  });
  
  if (
    existingConfig &&
    existingConfig.organizationID.toString() !== req.user.organizationID.toString()
  ) {
    throw new ApiError(
      400,
      "This Zomato restaurant is already connected to another account"
    );
  }
  
  // Register webhook
  try {
    await MasterZomatoService.registerWebhook(restaurantId);
  } catch (error) {
    console.error("⚠️  Webhook registration failed:", error.message);
  }
  
  // Save config
  const config = await AggregatorConfig.findOneAndUpdate(
    { organizationID: req.user.organizationID },
    {
      $set: {
        "zomato.isEnabled": true,
        "zomato.restaurantId": restaurantId,
        "zomato.outletName": outletName || verification.restaurantName,
        "zomato.autoAcceptOrders": autoAcceptOrders || false,
        "zomato.preparationTime": preparationTime || 20,
        "zomato.integrationStatus": "active",
        "zomato.lastSyncedAt": new Date(),
      },
    },
    {
      new: true,
      upsert: true,
    }
  );
  
  console.log(`✅ [Integration] Zomato connected successfully`);
  
  res.json(
    new ApiResponse(
      200,
      {
        config,
        restaurantInfo: {
          name: verification.restaurantName,
          address: verification.address,
          city: verification.city,
        },
      },
      "Zomato integration enabled successfully!"
    )
  );
});

// ─────────────────────────────────────────────────────────────
//  PUT /api/aggregator/swiggy/disconnect
// ─────────────────────────────────────────────────────────────
export const disconnectSwiggy = asyncHandler(async (req, res) => {
  const config = await AggregatorConfig.findOneAndUpdate(
    { organizationID: req.user.organizationID },
    {
      $set: {
        "swiggy.isEnabled": false,
        "swiggy.integrationStatus": "disabled",
      },
    },
    { new: true }
  );
  
  if (!config) {
    throw new ApiError(404, "Integration config not found");
  }
  
  console.log(`🔌 [Integration] Swiggy disconnected`);
  
  res.json(
    new ApiResponse(200, config, "Swiggy integration disabled")
  );
});

// ─────────────────────────────────────────────────────────────
//  PUT /api/aggregator/zomato/disconnect
// ─────────────────────────────────────────────────────────────
export const disconnectZomato = asyncHandler(async (req, res) => {
  const config = await AggregatorConfig.findOneAndUpdate(
    { organizationID: req.user.organizationID },
    {
      $set: {
        "zomato.isEnabled": false,
        "zomato.integrationStatus": "disabled",
      },
    },
    { new: true }
  );
  
  if (!config) {
    throw new ApiError(404, "Integration config not found");
  }
  
  console.log(`🔌 [Integration] Zomato disconnected`);
  
  res.json(
    new ApiResponse(200, config, "Zomato integration disabled")
  );
});

// ─────────────────────────────────────────────────────────────
//  GET /api/aggregator/status
//  Get current integration status
// ─────────────────────────────────────────────────────────────
export const getIntegrationStatus = asyncHandler(async (req, res) => {
  const config = await AggregatorConfig.findOne({
    organizationID: req.user.organizationID,
  });
  
  if (!config) {
    return res.json(
      new ApiResponse(
        200,
        {
          swiggy: { isEnabled: false },
          zomato: { isEnabled: false },
        },
        "No integrations configured"
      )
    );
  }
  
  res.json(
    new ApiResponse(
      200,
      {
        swiggy: {
          isEnabled: config.swiggy?.isEnabled || false,
          restaurantId: config.swiggy?.restaurantId,
          outletName: config.swiggy?.outletName,
          status: config.swiggy?.integrationStatus,
          lastSynced: config.swiggy?.lastSyncedAt,
          autoAcceptOrders: config.swiggy?.autoAcceptOrders,
          preparationTime: config.swiggy?.preparationTime,
        },
        zomato: {
          isEnabled: config.zomato?.isEnabled || false,
          restaurantId: config.zomato?.restaurantId,
          outletName: config.zomato?.outletName,
          status: config.zomato?.integrationStatus,
          lastSynced: config.zomato?.lastSyncedAt,
          autoAcceptOrders: config.zomato?.autoAcceptOrders,
          preparationTime: config.zomato?.preparationTime,
        },
      },
      "Integration status fetched successfully"
    )
  );
});
```

#### Webhook Handler (The Smart Router)

```javascript
// src/Controller/pos/AggregatorWebhookController.js
import asyncHandler from "../../Utils/AsyncHandler.js";
import ApiError from "../../Utils/ApiError.js";
import ApiResponse from "../../Utils/ApiResponse.js";
import AggregatorOrder from "../../Models/pos/AggregatorOrder.js";
import AggregatorConfig from "../../Models/pos/AggregatorConfig.js";
import MasterSwiggyService from "../../Services/aggregator/MasterSwiggyService.js";
import { sendSocketNotification } from "../../Utils/SocketHelper.js";

// ─────────────────────────────────────────────────────────────
//  POST /api/webhooks/swiggy
//  Receives ALL Swiggy orders for ALL your restaurant customers
// ─────────────────────────────────────────────────────────────
export const swiggyWebhook = asyncHandler(async (req, res) => {
  const { event_type, data } = req.body;
  
  console.log(`📥 [Swiggy Webhook] Received event: ${event_type}`);
  
  // Extract restaurant ID from payload
  const swiggyRestaurantId = data.restaurant_id;
  
  if (!swiggyRestaurantId) {
    console.error("❌ [Swiggy Webhook] Missing restaurant_id in payload");
    throw new ApiError(400, "Missing restaurant_id");
  }
  
  // CRITICAL: Find which of YOUR customers this order belongs to
  const config = await AggregatorConfig.findOne({
    "swiggy.restaurantId": swiggyRestaurantId,
    "swiggy.isEnabled": true,
  });
  
  if (!config) {
    console.log(
      `⚠️  [Swiggy Webhook] Unknown restaurant ID: ${swiggyRestaurantId}`
    );
    // Return 200 to avoid retry spam from Swiggy
    return res.json(
      new ApiResponse(200, {}, "Restaurant not found in system")
    );
  }
  
  console.log(
    `✅ [Swiggy Webhook] Routed to organization: ${config.organizationID}`
  );
  
  // Route to appropriate handler
  switch (event_type) {
    case "order.placed":
      await handleNewSwiggyOrder(data, config);
      break;
    
    case "order.cancelled":
      await handleSwiggyOrderCancellation(data, config);
      break;
    
    case "delivery.assigned":
      await handleSwiggyDeliveryAssigned(data, config);
      break;
    
    case "delivery.picked_up":
      await handleSwiggyPickedUp(data, config);
      break;
    
    case "delivery.delivered":
      await handleSwiggyDelivered(data, config);
      break;
    
    default:
      console.log(`⚠️  [Swiggy Webhook] Unhandled event: ${event_type}`);
  }
  
  res.json(new ApiResponse(200, {}, "Webhook processed successfully"));
});

// ─────────────────────────────────────────────────────────────
//  POST /api/webhooks/zomato
//  Receives ALL Zomato orders for ALL your restaurant customers
// ─────────────────────────────────────────────────────────────
export const zomatoWebhook = asyncHandler(async (req, res) => {
  const { event, data } = req.body;
  
  console.log(`📥 [Zomato Webhook] Received event: ${event}`);
  
  const zomatoRestaurantId = data.restaurant_id || data.store_id;
  
  if (!zomatoRestaurantId) {
    console.error("❌ [Zomato Webhook] Missing restaurant_id");
    throw new ApiError(400, "Missing restaurant_id");
  }
  
  // Find the customer restaurant
  const config = await AggregatorConfig.findOne({
    "zomato.restaurantId": zomatoRestaurantId,
    "zomato.isEnabled": true,
  });
  
  if (!config) {
    console.log(
      `⚠️  [Zomato Webhook] Unknown restaurant ID: ${zomatoRestaurantId}`
    );
    return res.json(
      new ApiResponse(200, {}, "Restaurant not found in system")
    );
  }
  
  console.log(
    `✅ [Zomato Webhook] Routed to organization: ${config.organizationID}`
  );
  
  // Route to handlers
  switch (event) {
    case "order.new":
      await handleNewZomatoOrder(data, config);
      break;
    
    case "order.cancelled":
      await handleZomatoOrderCancellation(data, config);
      break;
    
    case "rider.assigned":
      await handleZomatoDeliveryAssigned(data, config);
      break;
    
    case "rider.pickedup":
      await handleZomatoPickedUp(data, config);
      break;
    
    case "rider.delivered":
      await handleZomatoDelivered(data, config);
      break;
    
    default:
      console.log(`⚠️  [Zomato Webhook] Unhandled event: ${event}`);
  }
  
  res.json(new ApiResponse(200, {}, "Webhook processed successfully"));
});

// ─────────────────────────────────────────────────────────────
//  Helper Functions
// ─────────────────────────────────────────────────────────────

async function handleNewSwiggyOrder(orderData, config) {
  console.log(`🆕 [Swiggy] New order: ${orderData.order_id}`);
  
  // Create order in YOUR database for the CORRECT restaurant
  const order = await AggregatorOrder.create({
    aggregator: "swiggy",
    aggregatorOrderId: orderData.order_id,
    organizationID: config.organizationID, // THIS IS THE KEY!
    customer: {
      name: orderData.customer.name,
      phone: orderData.customer.phone, // Usually masked
      address: orderData.delivery_address,
    },
    items: orderData.items.map(item => ({
      itemId: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      addons: item.addons || [],
      instructions: item.instructions,
    })),
    itemTotal: orderData.item_total,
    deliveryCharge: orderData.delivery_charge,
    packagingCharge: orderData.packaging_charge,
    taxes: orderData.taxes,
    discount: orderData.discount,
    totalAmount: orderData.total_amount,
    status: "new",
    deliveryType: orderData.delivery_type,
    orderPlacedAt: new Date(orderData.created_at),
    estimatedDeliveryTime: new Date(orderData.estimated_delivery_time),
    rawOrderData: orderData,
  });
  
  // Send real-time notification ONLY to this specific restaurant
  await sendSocketNotification(config.organizationID, {
    type: "NEW_AGGREGATOR_ORDER",
    aggregator: "swiggy",
    order: order,
  });
  
  // Auto-accept if configured
  if (config.swiggy.autoAcceptOrders) {
    try {
      await MasterSwiggyService.acceptOrder(
        config.swiggy.restaurantId,
        orderData.order_id,
        config.swiggy.preparationTime
      );
      
      order.status = "accepted";
      order.acceptedAt = new Date();
      await order.save();
      
      console.log(`✅ [Swiggy] Auto-accepted order ${orderData.order_id}`);
    } catch (error) {
      console.error(`❌ [Swiggy] Auto-accept failed:`, error.message);
    }
  }
  
  return order;
}

async function handleNewZomatoOrder(orderData, config) {
  console.log(`🆕 [Zomato] New order: ${orderData.order_id}`);
  
  const order = await AggregatorOrder.create({
    aggregator: "zomato",
    aggregatorOrderId: orderData.order_id,
    organizationID: config.organizationID,
    customer: {
      name: orderData.customer_name,
      phone: orderData.customer_phone,
      address: orderData.delivery_address,
    },
    items: orderData.items.map(item => ({
      itemId: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
    totalAmount: orderData.order_total,
    status: "new",
    orderPlacedAt: new Date(orderData.placed_at),
    rawOrderData: orderData,
  });
  
  await sendSocketNotification(config.organizationID, {
    type: "NEW_AGGREGATOR_ORDER",
    aggregator: "zomato",
    order: order,
  });
  
  if (config.zomato.autoAcceptOrders) {
    // Auto-accept logic
  }
  
  return order;
}

async function handleSwiggyOrderCancellation(data, config) {
  console.log(`❌ [Swiggy] Order cancelled: ${data.order_id}`);
  
  await AggregatorOrder.findOneAndUpdate(
    {
      aggregatorOrderId: data.order_id,
      organizationID: config.organizationID,
    },
    {
      status: "cancelled",
      cancelledAt: new Date(),
      cancellationReason: data.reason,
    }
  );
  
  await sendSocketNotification(config.organizationID, {
    type: "ORDER_CANCELLED",
    aggregator: "swiggy",
    orderId: data.order_id,
  });
}

async function handleZomatoOrderCancellation(data, config) {
  console.log(`❌ [Zomato] Order cancelled: ${data.order_id}`);
  
  await AggregatorOrder.findOneAndUpdate(
    {
      aggregatorOrderId: data.order_id,
      organizationID: config.organizationID,
    },
    {
      status: "cancelled",
      cancelledAt: new Date(),
      cancellationReason: data.reason,
    }
  );
  
  await sendSocketNotification(config.organizationID, {
    type: "ORDER_CANCELLED",
    aggregator: "zomato",
    orderId: data.order_id,
  });
}

async function handleSwiggyDeliveryAssigned(data, config) {
  console.log(`🏍️ [Swiggy] Delivery assigned: ${data.order_id}`);
  
  await AggregatorOrder.findOneAndUpdate(
    {
      aggregatorOrderId: data.order_id,
      organizationID: config.organizationID,
    },
    {
      deliveryPartner: {
        name: data.partner.name,
        phone: data.partner.phone,
        trackingUrl: data.tracking_url,
      },
    }
  );
}

async function handleZomatoDeliveryAssigned(data, config) {
  console.log(`🏍️ [Zomato] Delivery assigned: ${data.order_id}`);
  
  await AggregatorOrder.findOneAndUpdate(
    {
      aggregatorOrderId: data.order_id,
      organizationID: config.organizationID,
    },
    {
      deliveryPartner: {
        name: data.rider.name,
        phone: data.rider.phone,
      },
    }
  );
}

async function handleSwiggyPickedUp(data, config) {
  await AggregatorOrder.findOneAndUpdate(
    {
      aggregatorOrderId: data.order_id,
      organizationID: config.organizationID,
    },
    {
      status: "picked_up",
      pickedUpAt: new Date(),
    }
  );
}

async function handleZomatoPickedUp(data, config) {
  await AggregatorOrder.findOneAndUpdate(
    {
      aggregatorOrderId: data.order_id,
      organizationID: config.organizationID,
    },
    {
      status: "picked_up",
      pickedUpAt: new Date(),
    }
  );
}

async function handleSwiggyDelivered(data, config) {
  await AggregatorOrder.findOneAndUpdate(
    {
      aggregatorOrderId: data.order_id,
      organizationID: config.organizationID,
    },
    {
      status: "delivered",
      deliveredAt: new Date(),
      actualDeliveryTime: new Date(data.delivered_at),
    }
  );
}

async function handleZomatoDelivered(data, config) {
  await AggregatorOrder.findOneAndUpdate(
    {
      aggregatorOrderId: data.order_id,
      organizationID: config.organizationID,
    },
    {
      status: "delivered",
      deliveredAt: new Date(),
    }
  );
}
```

---

## User Experience Flow

### From Restaurant Owner's Perspective

#### Step-by-Step Journey

**Step 1: Restaurant Owner Logs In**
```
Owner opens your POS software dashboard
Sees clean, modern interface
Navigation shows: Orders | Menu | Reports | Integrations
```

**Step 2: Navigate to Integrations**
```
Clicks "Integrations" in sidebar
Sees integration marketplace:
┌──────────────────────────────────────────┐
│  Online Ordering Integrations            │
│  ─────────────────────────────────       │
│                                          │
│  🟠 Swiggy         [Not Connected]       │
│  🔴 Zomato         [Not Connected]       │
│  🟢 Your Website   [Connected]           │
└──────────────────────────────────────────┘
```

**Step 3: Click "Connect Swiggy"**
```
Beautiful modal opens:
┌──────────────────────────────────────────┐
│  Connect Your Swiggy Restaurant          │
│  ─────────────────────────────────       │
│                                          │
│  Enter your Swiggy Restaurant ID         │
│  ┌────────────────────────────┐         │
│  │ 12345                      │         │
│  └────────────────────────────┘         │
│                                          │
│  💡 Find this in:                        │
│  Swiggy Partner App > Settings >         │
│  Restaurant Details                      │
│                                          │
│  Advanced Settings (Optional)            │
│  ▼                                       │
│  Auto-accept orders: [x] Yes [ ] No     │
│  Preparation time: [20] minutes          │
│                                          │
│  [Cancel]  [Connect Swiggy] ✅           │
└──────────────────────────────────────────┘
```

**Step 4: Enter Restaurant ID**
```
Owner opens Swiggy Partner App on phone
Finds Restaurant ID: "12345"
Copies it
Pastes in your form
Takes 30 seconds total
```

**Step 5: Click Connect**
```
Loading spinner appears
Your backend:
  ✅ Verifies ID with Swiggy
  ✅ Registers webhook
  ✅ Saves configuration
Success message: "Swiggy Connected Successfully!"
```

**Step 6: See Updated Status**
```
Dashboard now shows:
┌──────────────────────────────────────────┐
│  🟢 Swiggy         [Connected] ✅         │
│  Restaurant: Burger Palace               │
│  Status: Active                          │
│  Auto-accept: Yes                        │
│  [Manage] [Disconnect]                   │
└──────────────────────────────────────────┘
```

**Step 7: Orders Start Flowing**
```
Customer places order on Swiggy
↓
Swiggy sends webhook to YOUR server
↓
Your server creates order for Burger Palace
↓
Real-time notification appears in dashboard:
┌──────────────────────────────────────────┐
│  🔔 New Swiggy Order!                    │
│  ────────────────────                    │
│  Order #ORD-789                          │
│  3 items | ₹450                          │
│  Delivery: Platform                      │
│  [View Details] [Accept] [Reject]        │
└──────────────────────────────────────────┘
```

### Complete User Flow Diagram

```
Restaurant Owner Journey
─────────────────────────

1. Login to POS
   │
   ├─> Dashboard loads
   │
2. Click "Integrations"
   │
   ├─> See available integrations
   │
3. Click "Connect Swiggy"
   │
   ├─> Modal opens
   │
4. Enter Restaurant ID (from Swiggy app)
   │
   ├─> Validate input
   │
5. Click "Connect"
   │
   ├─> Backend verifies with Swiggy
   ├─> Webhook registered
   ├─> Config saved
   │
6. Success! ✅
   │
   ├─> Dashboard updated
   ├─> Integration active
   │
7. Orders arrive automatically
   │
   ├─> Real-time notifications
   ├─> Sound alerts
   ├─> Desktop notifications
   │
8. Accept/Process orders
   │
   ├─> Status syncs to Swiggy
   ├─> Customer gets updates
   │
9. Analytics & Reports
   │
   └─> See Swiggy vs Dine-in performance
```

---

## Security & Best Practices

### API Security

#### 1. Webhook Signature Verification

```javascript
// Verify webhook is actually from Swiggy/Zomato
import crypto from "crypto";

function verifySwiggySignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(payload))
    .digest("hex");
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// In webhook handler:
export const swiggyWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-swiggy-signature"];
  const isValid = verifySwiggySignature(
    req.body,
    signature,
    process.env.SWIGGY_WEBHOOK_SECRET
  );
  
  if (!isValid) {
    throw new ApiError(401, "Invalid webhook signature");
  }
  
  // Process webhook...
});
```

#### 2. Environment Variables Security

```bash
# NEVER commit these to Git
# Use .env file and add to .gitignore

# Store in environment, not code
SWIGGY_MASTER_API_KEY=xxxxx
SWIGGY_MASTER_API_SECRET=xxxxx

# Encrypt in database
// When saving sensitive config:
const encryptedSecret = encrypt(secret, process.env.ENCRYPTION_KEY);
```

#### 3. Rate Limiting

```javascript
// Prevent abuse of your API
import rateLimit from "express-rate-limit";

const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: "Too many webhook requests",
});

router.post("/webhooks/swiggy", webhookLimiter, swiggyWebhook);
```

#### 4. Input Validation

```javascript
// Always validate user input
import { body, validationResult } from "express-validator";

router.post(
  "/swiggy/connect",
  [
    body("restaurantId")
      .notEmpty()
      .withMessage("Restaurant ID is required")
      .isLength({ min: 4, max: 20 })
      .withMessage("Invalid restaurant ID format"),
    body("preparationTime")
      .optional()
      .isInt({ min: 10, max: 60 })
      .withMessage("Preparation time must be between 10-60 minutes"),
  ],
  connectSwiggy
);
```

### Database Security

#### 1. Data Encryption

```javascript
// Encrypt sensitive fields
import crypto from "crypto";

const encrypt = (text) => {
  const cipher = crypto.createCipher(
    "aes-256-cbc",
    process.env.ENCRYPTION_KEY
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

const decrypt = (encrypted) => {
  const decipher = crypto.createDecipher(
    "aes-256-cbc",
    process.env.ENCRYPTION_KEY
  );
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
```

#### 2. Access Control

```javascript
// Ensure users can only see their own data
export const getOrders = asyncHandler(async (req, res) => {
  const orders = await AggregatorOrder.find({
    organizationID: req.user.organizationID, // CRITICAL
  });
  
  res.json(new ApiResponse(200, orders));
});
```

### Error Handling

```javascript
// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  
  // Don't expose internal errors to users
  const status = err.statusCode || 500;
  const message = process.env.NODE_ENV === "production"
    ? "Something went wrong"
    : err.message;
  
  res.status(status).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});
```

### Logging & Monitoring

```javascript
// Structured logging
import winston from "winston";

const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

// Log all API interactions
logger.info("Swiggy order received", {
  orderId: order.aggregatorOrderId,
  organizationID: order.organizationID,
  amount: order.totalAmount,
  timestamp: new Date(),
});
```

### Performance Best Practices

#### 1. Database Indexing

```javascript
// Add indexes for frequently queried fields
aggregatorOrderSchema.index({ organizationID: 1, createdAt: -1 });
aggregatorOrderSchema.index({ status: 1 });
aggregatorOrderSchema.index({ aggregatorOrderId: 1, aggregator: 1 });
```

#### 2. Caching

```javascript
// Cache aggregator config to reduce DB hits
import NodeCache from "node-cache";
const configCache = new NodeCache({ stdTTL: 600 }); // 10 minutes

async function getConfig(organizationID) {
  const cached = configCache.get(organizationID);
  if (cached) return cached;
  
  const config = await AggregatorConfig.findOne({ organizationID });
  configCache.set(organizationID, config);
  return config;
}
```

#### 3. Async Processing

```javascript
// Don't block webhook response
export const swiggyWebhook = asyncHandler(async (req, res) => {
  // Immediately respond to Swiggy
  res.json(new ApiResponse(200, {}, "Received"));
  
  // Process order asynchronously
  processOrderAsync(req.body).catch(console.error);
});

async function processOrderAsync(data) {
  // Handle order creation
  // Send notifications
  // Update inventory
}
```

---

## Business Considerations

### Pricing Models

#### Option 1: Commission-Based
```
Free to connect
You take 1-2% of each order (if allowed by terms)
Pros: Easy to sell, restaurants pay only for value
Cons: Need high volume, complex accounting
```

#### Option 2: Monthly Subscription
```
₹500-2000/month per restaurant
Unlimited orders
Pros: Predictable revenue, simple
Cons: Harder to sell to small restaurants
```

#### Option 3: Freemium
```
Free: 1 aggregator + basic features
Pro: Both aggregators + advanced analytics
Pros: Lower barrier to entry, upsell opportunity
Cons: Need good conversion rate
```

#### Option 4: Tiered Pricing
```
Starter: ₹500/mo  - 1 aggregator, 100 orders
Pro:     ₹1500/mo - Both aggregators, unlimited
Enterprise: Custom - Multiple outlets, priority support
```

### Legal Considerations

#### 1. Terms of Service
- Clearly state you're an integration provider
- Explain data handling and privacy
- Liability limitations

#### 2. Partnership Agreements
- Get written agreement from Swiggy/Zomato
- Understand their terms for integration partners
- Commission sharing (if applicable)

#### 3. Data Privacy
- GDPR/Data Protection Act compliance
- Customer data handling
- Data retention policies

#### 4. Insurance
- Professional liability insurance
- Errors & omissions coverage

### Support & Maintenance

#### Support Tiers
```
Tier 1: Email support (24-48 hrs)
Tier 2: Priority email (4-8 hrs)
Tier 3: Phone + dedicated manager
```

#### Ongoing Maintenance
- API version updates
- Bug fixes
- Feature enhancements
- Performance optimization

### Marketing Strategy

#### Target Customers
1. **Cloud Kitchens** - High order volume
2. **QSR Chains** - Multiple outlets
3. **Fine Dining** - Premium pricing
4. **Cafes** - Growing market

#### Sales Channels
- Direct outreach to restaurants
- Partner with POS hardware vendors
- Restaurant associations
- Digital marketing (SEO, Ads)
- Referral program

---

## Getting Started Checklist

### Week 1: Setup & Application

- [ ] Set up development environment
- [ ] Create MongoDB database
- [ ] Install required dependencies
- [ ] Apply to Zomato Developer Program
  - Email: posintegrations@zomato.com
  - Prepare business documents
- [ ] Apply to Swiggy Partnership
  - Email: partnersupport@swiggy.in
  - Explain SaaS business model

### Week 2: Core Development

- [ ] Create database models
  - AggregatorConfig
  - AggregatorOrder
  - AggregatorMenuItem
- [ ] Implement Master Services
  - MasterSwiggyService
  - MasterZomatoService
- [ ] Set up environment variables
- [ ] Configure SSL/HTTPS for webhooks

### Week 3: API Implementation

- [ ] Implement integration controllers
  - Connect/disconnect endpoints
  - Status check endpoint
- [ ] Implement webhook handlers
  - Swiggy webhook
  - Zomato webhook
  - Order routing logic
- [ ] Add API routes
- [ ] Test with Postman

### Week 4: Frontend Development

- [ ] Create integration dashboard page
- [ ] Build connection forms
- [ ] Add real-time notifications (Socket.IO)
- [ ] Create order management UI
- [ ] Design analytics dashboard

### Week 5: Testing

- [ ] Unit tests
- [ ] Integration tests with sandbox
- [ ] Load testing
- [ ] Security testing
- [ ] User acceptance testing with beta users

### Week 6: Deployment

- [ ] Deploy to production server
- [ ] Configure DNS and SSL
- [ ] Set up monitoring (Sentry, etc.)
- [ ] Configure logging
- [ ] Create documentation
- [ ] Train support team

### Week 7: Pilot Launch

- [ ] Onboard 2-3 pilot restaurants
- [ ] Monitor closely
- [ ] Gather feedback
- [ ] Fix issues
- [ ] Optimize performance

### Week 8: Full Launch

- [ ] Announce to all customers
- [ ] Marketing campaign
- [ ] Create tutorial videos
- [ ] Monitor and support

---

## Contact Information

### Zomato
- **Developer Support**: posintegrations@zomato.com
- **Partnership Queries**: pos-partnership@zomato.com
- **Developer Portal**: https://www.zomato.com/developer/integration

### Swiggy
- **Partner Support**: partnersupport@swiggy.in
- **Partner Portal**: https://partner.swiggy.com

### Alternative Solutions

If direct integration seems overwhelming:

#### UrbanPiper
- Website: https://www.urbanpiper.com/
- Established Swiggy/Zomato integrations
- Can white-label their solution

#### Dyno APIs
- Website: https://dynoapis.com/
- API-first approach
- Good for rapid integration

#### Petpooja
- Website: https://www.petpooja.com/
- Complete POS with integrations
- Consider partnership

---

## Conclusion

This guide provides everything you need to build a professional, scalable Swiggy and Zomato integration for your SaaS POS system.

### Key Takeaways:

1. ✅ **YOU become the integration partner**, not your users
2. ✅ **One master API account** serves all your restaurants
3. ✅ **One-click integration** for restaurant owners
4. ✅ **Smart webhook routing** to correct restaurants
5. ✅ **Scalable to 1000s** of restaurants

### Next Steps:

1. Apply to Zomato and Swiggy today
2. Start with Zomato (has sandbox)
3. Build core infrastructure (Week 1-3)
4. Test thoroughly (Week 4-5)
5. Launch pilot (Week 6-7)
6. Scale to all customers (Week 8+)

**Good luck building your integration!** 🚀

---

*Last Updated: March 2026*
*Version: 2.0*
