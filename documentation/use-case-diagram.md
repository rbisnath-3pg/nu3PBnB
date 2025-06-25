# nu3PBnB Use Case Diagram

## System Overview
nu3PBnB is a vacation rental platform that connects property hosts with guests, providing booking management, payment processing, messaging, and review systems.

## Actors

### Primary Actors
1. **Guest** - Users who book properties
2. **Host** - Users who list and manage properties
3. **Administrator** - System administrators with full platform access

### Secondary Actors
4. **Payment System** - External payment processing service
5. **Email Service** - External email notification service
6. **Analytics Engine** - Internal analytics tracking system

## Use Case Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                    nu3PBnB System                                           │
│                                                                                                             │
│  ┌─────────────┐                                                                                            │
│  │   Guest     │                                                                                            │
│  └─────┬───────┘                                                                                            │
│        │                                                                                                    │
│        ├─── Register Account                                                                                │
│        ├─── Login/Logout                                                                                    │
│        ├─── Browse Properties                                                                               │
│        ├─── Search Properties                                                                               │
│        ├─── View Property Details                                                                           │
│        ├─── Book Property                                                                                   │
│        ├─── Manage Bookings                                                                                 │
│        │   ├─── View Booking History                                                                        │
│        │   ├─── Cancel Booking                                                                              │
│        │   └─── Pay for Booking                                                                             │
│        ├─── Manage Wishlist                                                                                 │
│        │   ├─── Add to Wishlist                                                                             │
│        │   ├─── Remove from Wishlist                                                                        │
│        │   └─── View Wishlist                                                                               │
│        ├─── Send Messages                                                                                   │
│        ├─── Write Reviews                                                                                   │
│        ├─── Manage Profile                                                                                  │
│        │   ├─── Update Personal Information                                                                 │
│        │   ├─── Upload Profile Picture                                                                      │
│        │   ├─── Set Preferences                                                                             │
│        │   └─── Change Language                                                                             │
│        └─── View Payment History                                                                            │
│                                                                                                             │
│  ┌─────────────┐                                                                                            │
│  │    Host     │                                                                                            │
│  └─────┬───────┘                                                                                            │
│        │                                                                                                    │
│        ├─── Register Account                                                                                │
│        ├─── Login/Logout                                                                                    │
│        ├─── Create Property Listing                                                                         │
│        ├─── Manage Property Listings                                                                        │
│        │   ├─── Edit Listing Details                                                                        │
│        │   ├─── Upload Property Photos                                                                      │
│        │   ├─── Set Pricing                                                                                 │
│        │   ├─── Manage Availability Calendar                                                                │
│        │   └─── Delete Listing                                                                              │
│        ├─── Manage Booking Requests                                                                         │
│        │   ├─── View Booking Requests                                                                       │
│        │   ├─── Approve Booking                                                                             │
│        │   ├─── Decline Booking                                                                             │
│        │   └─── Cancel Booking                                                                              │
│        ├─── Respond to Messages                                                                             │
│        ├─── View Analytics Dashboard                                                                        │
│        │   ├─── View Revenue Analytics                                                                      │
│        │   ├─── View Booking Analytics                                                                      │
│        │   └─── View Property Performance                                                                    │
│        ├─── Manage Profile                                                                                  │
│        └─── View Payment Reports                                                                            │
│                                                                                                             │
│  ┌─────────────┐                                                                                            │
│  │Administrator│                                                                                            │
│  └─────┬───────┘                                                                                            │
│        │                                                                                                    │
│        ├─── Manage Users                                                                                    │
│        │   ├─── View All Users                                                                              │
│        │   ├─── Create User Accounts                                                                        │
│        │   ├─── Update User Roles                                                                           │
│        │   ├─── Delete Users                                                                                │
│        │   └─── View User Activity                                                                          │
│        ├─── Manage Content                                                                                  │
│        │   ├─── Create Platform Content                                                                     │
│        │   ├─── Edit Content                                                                                │
│        │   ├─── Manage Translations                                                                         │
│        │   └─── Delete Content                                                                              │
│        ├─── Monitor Analytics                                                                               │
│        │   ├─── View System Analytics                                                                       │
│        │   ├─── View User Analytics                                                                         │
│        │   ├─── View Revenue Analytics                                                                      │
│        │   └─── Generate Reports                                                                            │
│        ├─── Manage Payments                                                                                 │
│        │   ├─── View Payment History                                                                        │
│        │   ├─── Process Refunds                                                                             │
│        │   └─── Monitor Payment Issues                                                                      │
│        ├─── Manage Messages                                                                                 │
│        │   ├─── View All Messages                                                                           │
│        │   ├─── Moderate Conversations                                                                      │
│        │   └─── Send System Notifications                                                                   │
│        ├─── Run System Tests                                                                                │
│        │   ├─── Execute Automated Tests                                                                     │
│        │   ├─── View Test Results                                                                           │
│        │   └─── Monitor System Health                                                                       │
│        └─── System Configuration                                                                             │
│            ├─── Manage Platform Settings                                                                    │
│            ├─── Configure Payment Methods                                                                    │
│            └─── Manage System Security                                                                       │
│                                                                                                             │
│  ┌─────────────┐                                                                                            │
│  │   Payment   │                                                                                            │
│  │   System    │                                                                                            │
│  └─────┬───────┘                                                                                            │
│        │                                                                                                    │
│        ├─── Process Payment                                                                                 │
│        ├─── Validate Payment Method                                                                         │
│        ├─── Generate Receipt                                                                                │
│        └─── Process Refund                                                                                  │
│                                                                                                             │
│  ┌─────────────┐                                                                                            │
│  │    Email    │                                                                                            │
│  │   Service   │                                                                                            │
│  └─────┬───────┘                                                                                            │
│        │                                                                                                    │
│        ├─── Send Booking Confirmations                                                                      │
│        ├─── Send Payment Receipts                                                                           │
│        ├─── Send System Notifications                                                                       │
│        └─── Send Welcome Emails                                                                             │
│                                                                                                             │
│  ┌─────────────┐                                                                                            │
│  │  Analytics  │                                                                                            │
│  │   Engine    │                                                                                            │
│  └─────┬───────┘                                                                                            │
│        │                                                                                                    │
│        ├─── Track User Activity                                                                             │
│        ├─── Track Page Views                                                                                │
│        ├─── Track User Behavior                                                                             │
│        └─── Generate Analytics Data                                                                         │
│                                                                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Detailed Use Case Descriptions

### Guest Use Cases

#### 1. Register Account
- **Description**: Create a new guest account
- **Preconditions**: User is not logged in
- **Postconditions**: Guest account is created and user is logged in
- **Main Flow**:
  1. User provides email, password, and name
  2. System validates input
  3. System creates account with 'guest' role
  4. System sends welcome email
  5. User is redirected to onboarding

#### 2. Browse Properties
- **Description**: View available property listings
- **Preconditions**: User is authenticated
- **Postconditions**: User can see property listings
- **Main Flow**:
  1. User navigates to homepage
  2. System displays featured and recent listings
  3. User can filter by location, price, dates
  4. User can view listing details

#### 3. Book Property
- **Description**: Make a booking request for a property
- **Preconditions**: User is logged in, property is available
- **Postconditions**: Booking request is created
- **Main Flow**:
  1. User selects property and dates
  2. User provides guest count and message
  3. System calculates total price
  4. User completes payment
  5. System creates booking request
  6. Host is notified of booking request

#### 4. Manage Wishlist
- **Description**: Add/remove properties from personal wishlist
- **Preconditions**: User is logged in
- **Postconditions**: Wishlist is updated
- **Main Flow**:
  1. User clicks "Add to Wishlist" on property
  2. System adds property to user's wishlist
  3. User can view and manage wishlist items

### Host Use Cases

#### 1. Create Property Listing
- **Description**: Create a new property listing
- **Preconditions**: User has host role
- **Postconditions**: Property listing is created and visible
- **Main Flow**:
  1. Host provides property details (title, description, photos)
  2. Host sets pricing and availability
  3. Host specifies amenities and rules
  4. System creates listing
  5. Listing becomes visible to guests

#### 2. Manage Booking Requests
- **Description**: Review and respond to booking requests
- **Preconditions**: Host has active listings with booking requests
- **Postconditions**: Booking status is updated
- **Main Flow**:
  1. Host receives notification of booking request
  2. Host reviews booking details
  3. Host approves or declines request
  4. System notifies guest of decision
  5. If approved, payment is processed

#### 3. View Analytics Dashboard
- **Description**: Access property performance analytics
- **Preconditions**: Host has active listings
- **Postconditions**: Host can view analytics data
- **Main Flow**:
  1. Host navigates to analytics dashboard
  2. System displays revenue, bookings, and performance metrics
  3. Host can filter by time period
  4. Host can view detailed reports

### Administrator Use Cases

#### 1. Manage Users
- **Description**: Oversee all user accounts and activities
- **Preconditions**: User has admin role
- **Postconditions**: User management actions are completed
- **Main Flow**:
  1. Admin views user management dashboard
  2. Admin can create, update, or delete users
  3. Admin can change user roles
  4. Admin can view user activity logs

#### 2. Monitor Analytics
- **Description**: View comprehensive platform analytics
- **Preconditions**: User has admin role
- **Postconditions**: Admin has access to analytics data
- **Main Flow**:
  1. Admin accesses analytics dashboard
  2. System displays platform-wide metrics
  3. Admin can generate custom reports
  4. Admin can export data

#### 3. Run System Tests
- **Description**: Execute automated system tests
- **Preconditions**: User has admin role
- **Postconditions**: Test results are available
- **Main Flow**:
  1. Admin triggers test execution
  2. System runs automated tests
  3. System displays test results
  4. Admin can review and act on results

## System Boundaries

### Included in System
- User authentication and authorization
- Property listing management
- Booking system
- Payment processing
- Messaging system
- Review system
- Analytics and reporting
- Content management
- Admin tools

### Excluded from System
- External payment gateways (handled by Payment System actor)
- Email delivery (handled by Email Service actor)
- Third-party integrations
- Mobile applications (separate system)

## Relationships and Dependencies

### Include Relationships
- "Book Property" includes "Process Payment"
- "Create Property Listing" includes "Upload Property Photos"
- "Manage Users" includes "View User Activity"

### Extend Relationships
- "View Analytics Dashboard" extends "Login/Logout" for hosts
- "Run System Tests" extends "Login/Logout" for admins
- "Send Messages" extends "View Property Details" for guests

### Generalization Relationships
- All actors inherit from "User" (implicit)
- "Guest" and "Host" are specialized user types
- "Administrator" is a specialized user type with elevated privileges

## Notes

1. **Security**: All use cases require appropriate authentication and authorization
2. **Internationalization**: The system supports multiple languages (English, French, Spanish)
3. **Responsive Design**: All user interfaces are mobile-responsive
4. **Real-time Updates**: Messaging and booking status updates are real-time
5. **Data Privacy**: User data is protected according to privacy regulations
6. **Scalability**: The system is designed to handle high user loads
7. **Monitoring**: All system activities are logged and monitored
8. **Backup**: Regular data backups are performed automatically

---

*This use case diagram provides a comprehensive overview of the nu3PBnB system functionality and user interactions. It serves as a foundation for system design, development, and testing activities.* 