# Developer Documentation

This document serves as the primary technical guide for backend architecture, database schemas, and core workflows for the **OutletOps (POS)** project.

---

## 1. Database Schema & Relationships

The MongoDB database relies heavily on referencing (`ref:`) between collections instead of deeply nesting sub-documents, allowing for a normalized structure. Almost all major collections tie back to `Organization` and `User`.

### A. Core Models
*   **Organization**: Acts as the central tenant entity. Every module's data (POS, Workforce, Operations) references an `organizationId`.
*   **User**: Details authentication and profile information. Referenced across all module entities to track ownership and action logs (e.g., `assignedTo`, `createdBy`).
*   **Role / Permission / EmployeeProfile**: Defines access control schemas. The `EmployeeProfile` joins a `User` to an `Organization` with a specific `Role`.

### B. POS (Point of Sale) Models
*   **MenuItem**: Represents products. Refers to `Organization`.
*   **Table**: Represents physical tables. Refers to `Organization` and actively references a current `Order`.
*   **Order**: The central transactional model. Contains fields referencing:
    *   `Table` (where the order is taking place)
    *   `MenuItem` (array of items ordered)
    *   `User` (waiter/staff handling the bill)
*   **Expense / InventoryRequest**: Track outward operational limits and restock needs.

### C. Workforce (HR) Models
*   **Attendance**: Tracks shifts. References `User` and `Organization`.
*   **Break**: References the parent `Attendance` record to track in/out shift breaks.
*   **SalaryRecord / SalaryTransaction**: Links a `User`'s monthly payroll to the `Organization`.
*   **LeaveRequest / AdvanceRequest**: Staff requests referencing the `User` and routing to an `Organization` Admin for approval.

### D. Operations & Resources
*   **Task**: Tracks daily jobs. References `User` (Assignee), `Organization`, and optionally an `SOP` (Standard Operating Procedure).
*   **SOP**: Defines operational guidelines. 
*   **Request / AiReview**: Operations specific processes tracing up locally to `User` / `Organization`.

---

## 2. Core Workflow Processes

### Workflow 1: Authentication & Organization Selection
1.  **Login**: User authenticates, receiving a JWT/Session.
2.  **Organization Routing**: The system checks the user profile to see which `Organization`s they are linked to.
3.  **Redirection**: If linked to a single org, they are automatically forwarded to `/client/{orgId}/dashboard`. Otherwise, an Organization Select menu is triggered.

### Workflow 2: Point of Sale (POS) Order Cycle
1.  **Creation**: A waiter or admin logs an Order attached to a `Table`. Status is strictly tracked (e.g., `Open`, `Sent to Kitchen`).
2.  **Kitchen Processing**: Kitchen Display Systems fetch orders where status necessitates preparation. 
3.  **Fulfillment**: Moving the order through statuses. The `Table` model updates its active references.
4.  **Checkout**: Order is marked completed/paid. Impacts financial aggregation (`Report` model) and releases the `Table`.

### Workflow 3: Workforce & Attendance Track
1.  **Check-in**: Employee creates an `Attendance` record attached to today's date and the `Organization`.
2.  **Breaks**: Intermediate pauses generate `Break` records tied exactly to the active `Attendance` record ID.
3.  **Check-out**: Closes the attendance log block and computes net working hours based on timestamps.
4.  **Salary Calculation**: End of month batch process parses attendance/leaves to formulate `SalaryRecord` and processes through `SalaryTransaction`.

### Workflow 4: Task & SOP Monitoring
1.  **Assignment**: Admin triggers a new `Task` tied to a specific `User`.
2.  **SOP Context**: The admin attaches an `SOP` model ID as a learning resource to the `Task`.
3.  **Execution**: User completes checklist, logging completion metrics. Admin reviews from the `/client/:orgId/task` dashboard.
