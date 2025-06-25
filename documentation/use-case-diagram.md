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

## Key Use Cases by Actor

### Guest Use Cases
- **Register Account**: Create new guest account with email/password
- **Browse Properties**: View and search available listings
- **Book Property**: Make booking requests with payment
- **Manage Bookings**: View history, cancel bookings, pay for bookings
- **Manage Wishlist**: Add/remove properties from wishlist
- **Send Messages**: Communicate with hosts
- **Write Reviews**: Rate and review properties
- **Manage Profile**: Update personal info, preferences, language

### Host Use Cases  
- **Create Property Listing**: Add new properties with details/photos
- **Manage Property Listings**: Edit, update pricing, manage availability
- **Manage Booking Requests**: Approve/decline guest bookings
- **Respond to Messages**: Communicate with guests
- **View Analytics Dashboard**: Monitor revenue and performance
- **View Payment Reports**: Track earnings and transactions

### Administrator Use Cases
- **Manage Users**: Create, update, delete user accounts
- **Manage Content**: Create/edit platform content and translations
- **Monitor Analytics**: View comprehensive platform metrics
- **Manage Payments**: Process refunds, monitor payment issues
- **Manage Messages**: Moderate conversations, send notifications
- **Run System Tests**: Execute automated testing
- **System Configuration**: Manage platform settings and security

### Secondary Actor Use Cases
- **Payment System**: Process payments, validate methods, generate receipts
- **Email Service**: Send confirmations, receipts, notifications
- **Analytics Engine**: Track user activity, page views, behavior

## System Boundaries

### Included
- User authentication and authorization
- Property listing management
- Booking system with payment processing
- Messaging and communication
- Review and rating system
- Analytics and reporting
- Content management
- Admin tools and testing

### Excluded
- External payment gateways (handled by Payment System)
- Email delivery infrastructure (handled by Email Service)
- Third-party integrations
- Mobile applications (separate system)

## Relationships

### Include Relationships
- "Book Property" includes "Process Payment"
- "Create Property Listing" includes "Upload Property Photos"
- "Manage Users" includes "View User Activity"

### Extend Relationships
- "View Analytics Dashboard" extends "Login/Logout" for hosts
- "Run System Tests" extends "Login/Logout" for admins
- "Send Messages" extends "View Property Details" for guests

## Notes

1. **Security**: All use cases require appropriate authentication
2. **Internationalization**: Supports English, French, Spanish
3. **Responsive Design**: Mobile-responsive interfaces
4. **Real-time Updates**: Live messaging and booking status
5. **Data Privacy**: User data protection compliance
6. **Scalability**: High-load handling capabilities
7. **Monitoring**: Comprehensive activity logging
8. **Backup**: Automated data backup systems

---

*This use case diagram provides a comprehensive overview of the nu3PBnB system functionality and user interactions.*
