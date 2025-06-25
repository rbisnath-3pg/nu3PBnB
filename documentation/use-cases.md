# nu3PBnB - Use Case Specifications

## 📋 Document Information

- **Project**: nu3PBnB - Vacation Rental Platform
- **Version**: 2.0
- **Date**: June 2025
- **Status**: Approved

## 🎯 Overview

This document provides detailed use case specifications for the nu3PBnB vacation rental platform. **Updated June 2025 to include new use cases for content management, admin testing, analytics, and multilingual features.**

## 👥 Actor Definitions

### Primary Actors

#### Guest
- **Description**: Travelers who book vacation rentals
- **Goals**: Find and book suitable accommodations
- **Characteristics**: Various travel preferences, budgets, and group sizes

#### Host
- **Description**: Property owners who list their properties for rent
- **Goals**: Manage properties, handle bookings, and earn income
- **Characteristics**: Property owners, property managers, or rental agencies

#### Admin
- **Description**: Platform administrators who manage the system
- **Goals**: Ensure platform quality, handle disputes, and maintain system health
- **Characteristics**: Technical expertise, customer service skills

### Secondary Actors

#### Payment Gateway (Stripe)
- **Description**: Third-party payment processing service
- **Role**: Process secure payments and handle financial transactions

#### Email Service
- **Description**: Email notification service
- **Role**: Send automated emails for bookings, confirmations, and notifications

#### File Storage Service (Cloudinary)
- **Description**: Cloud-based file storage service
- **Role**: Store and serve property images and user uploads

#### Analytics Service
- **Description**: External analytics and reporting service
- **Role**: Generate and display reports based on platform data

## 🎯 Use Case Categories

### 1. User Management
### 2. Property Management
### 3. Booking Management
### 4. Payment Processing
### 5. Communication
### 6. Content Management (NEW)
### 7. Analytics and Reporting (NEW)
### 8. Admin Testing (NEW)
### 9. Multilingual Support (NEW)
### 10. User Experience

## 📋 Detailed Use Cases

### UC-1: User Registration and Onboarding

**Use Case ID**: UC-001  
**Use Case Name**: Guest Registration  
**Primary Actor**: Guest  
**Secondary Actor**: Email Service  
**Preconditions**: Guest has valid email address  
**Postconditions**: Guest account created and onboarding is completed  

#### Main Success Scenario
1. Guest navigates to registration page
2. Guest fills in registration form with:
   - Email address
   - Password (minimum 8 characters)
   - First name
   - Last name
   - Phone number (optional)
3. System validates input data
4. System creates user account with "guest" role
5. System sends verification email
6. Guest clicks verification link
7. System activates account
8. System starts onboarding wizard
9. User completes onboarding steps:
   - Welcome and platform introduction
   - Account details and preferences
   - Travel interests and preferences
   - Theme and language selection
10. System marks onboarding as complete
11. System redirects to homepage

#### Alternative Flows
- **A1**: Invalid email format
  - System displays error message
  - Guest corrects email and resubmits
- **A2**: Password too weak
  - System displays password requirements
  - Guest creates stronger password
- **A3**: Email already exists
  - System displays error message
  - Guest uses different email or logs in

#### Exception Flows
- **E1**: Email service unavailable
  - System queues email for later sending
  - System displays warning message
- **E2**: Database connection failure
  - System displays error message
  - Guest retries registration

### UC-2: Property Search and Discovery

**Use Case ID**: UC-002  
**Use Case Name**: Property Search  
**Primary Actor**: Guest  
**Preconditions**: Guest is on homepage or search page  
**Postconditions**: Search results displayed  

#### Main Success Scenario
1. Guest enters search criteria:
   - Destination/location
   - Check-in date
   - Check-out date
   - Number of guests
2. Guest applies additional filters (optional):
   - Price range
   - Property type
   - Amenities
   - Instant booking
3. System validates search parameters
4. System queries database for matching properties
5. System applies availability filtering
6. System returns paginated results
7. Guest views search results

#### Alternative Flows
- **A1**: No results found
  - System displays "no results" message
  - System suggests alternative search criteria
- **A2**: Guest saves search
  - Guest clicks "Save Search"
  - System creates saved search for guest
- **A3**: Guest uses map view
  - Guest switches to map view
  - System displays properties on interactive map

#### Exception Flows
- **E1**: Invalid date range
  - System displays error message
  - Guest corrects dates
- **E2**: Database timeout
  - System displays loading message
  - System retries query

### UC-3: Property Listing Creation

**Use Case ID**: UC-004  
**Use Case Name**: Host Property Listing  
**Primary Actor**: Host  
**Secondary Actor**: File Storage Service  
**Preconditions**: Host is logged in and verified  
**Postconditions**: Property listing created and published  

#### Main Success Scenario
1. Host navigates to "Add Property" page
2. Host enters basic property information:
   - Property name
   - Description
   - Property type
   - Number of bedrooms/bathrooms
   - Maximum guests
3. Host sets pricing:
   - Base nightly rate
   - Cleaning fee
   - Security deposit
4. Host uploads property photos
5. Host sets location and coordinates
6. Host selects amenities and house rules
7. Host sets availability calendar
8. System validates all information
9. System creates property listing
10. System publishes listing (or sends for approval)

#### Alternative Flows
- **A1**: Host saves as draft
  - Host clicks "Save Draft"
  - System saves incomplete listing
- **A2**: Host schedules publication
  - Host sets future publication date
  - System publishes on scheduled date
- **A3**: Admin approval required
  - System sends listing for admin review
  - Admin approves or requests changes

#### Exception Flows
- **E1**: File upload failure
  - System displays error message
  - Host retries upload
- **E2**: Invalid location data
  - System displays error message
  - Host corrects location information

### UC-4: Booking Request Process

**Use Case ID**: UC-003  
**Use Case Name**: Property Booking  
**Primary Actor**: Guest  
**Secondary Actor**: Host, Payment Gateway  
**Preconditions**: Guest is logged in, property is available for selected dates  
**Postconditions**: Booking request created and payment processed  

#### Main Success Scenario
1. Guest selects property and dates
2. Guest enters number of guests
3. System calculates total price:
   - Nightly rate × number of nights
   - Cleaning fee
   - Service fee
   - Taxes
4. Guest reviews booking details
5. Guest enters payment information
6. System processes payment through payment gateway
7. System creates booking record
8. System sends confirmation to guest
9. System notifies host of new booking
10. System updates property availability

#### Alternative Flows
- **A1**: Payment declined
  - System displays payment error
  - Guest enters different payment method
- **A2**: Property no longer available
  - System displays error message
  - Guest selects different dates or property
- **A3**: Guest adds special requests
  - Guest enters message for host
  - System includes message in booking

#### Exception Flows
- **E1**: Payment gateway unavailable
  - System displays error message
  - Guest retries payment
- **E2**: Concurrent booking conflict
  - System displays error message
  - Guest selects different dates

### UC-5: Payment Processing

**Use Case ID**: UC-008  
**Use Case Name**: Payment Processing  
**Primary Actor**: Guest  
**Secondary Actor**: Payment Gateway, Host  
**Preconditions**: Booking is confirmed  
**Postconditions**: Payment processed and funds distributed  

#### Main Success Scenario
1. Guest provides payment information
2. System validates payment method
3. System calculates payment breakdown:
   - Property rental fee
   - Platform service fee
   - Taxes
4. System processes payment through gateway
5. Payment gateway authorizes transaction
6. System holds payment in escrow
7. System sends confirmation to guest
8. System notifies host of payment
9. After stay completion:
   - System releases payment to host
   - System deducts platform fees
   - System sends payout to host

#### Alternative Flows
- **A1**: Payment method declined
  - System displays error message
  - Guest provides alternative payment method
- **A2**: Partial refund required
  - System calculates refund amount
  - System processes partial refund
- **A3**: Dispute resolution
  - System holds payment during dispute
  - Admin mediates and makes decision

#### Exception Flows
- **E1**: Payment gateway unavailable
  - System displays error message
  - Guest retries payment
- **E2**: Insufficient funds
  - System displays error message
  - Guest uses different payment method

### UC-6: Content Management (NEW)

**Use Case ID**: UC-006  
**Use Case Name**: Messaging System  
**Primary Actor**: Guest, Host  
**Secondary Actor**: Email Service  
**Preconditions**: Users are logged in and have a booking relationship  
**Postconditions**: Message sent and delivered  

#### Main Success Scenario
1. User navigates to messages
2. User selects conversation or booking
3. User composes message
4. User optionally attaches files
5. System validates message content
6. System sends message to recipient
7. System stores message in database
8. System sends email notification to recipient
9. System marks message as read when recipient opens

#### Alternative Flows
- **A1**: User blocks sender
  - System prevents message delivery
  - System notifies sender of block
- **A2**: Message contains inappropriate content
  - System flags message for review
  - Admin reviews and takes action
- **A3**: User sets notification preferences
  - System respects notification settings
  - System sends notifications accordingly

#### Exception Flows
- **E1**: Email service unavailable
  - System queues email for later sending
  - Message still delivered in-app
- **E2**: File attachment too large
  - System displays error message
  - User reduces file size or removes attachment

### UC-7: Admin Testing Dashboard (NEW)

**Use Case ID**: UC-007  
**Use Case Name**: Review and Rating  
**Primary Actor**: Guest, Host  
**Preconditions**: Booking is completed  
**Postconditions**: Review published and ratings updated  

#### Main Success Scenario
1. System sends review request after stay completion
2. User navigates to review page
3. User rates overall experience (1-5 stars)
4. User rates specific categories:
   - Cleanliness
   - Communication
   - Check-in
   - Accuracy
   - Location
   - Value
5. User writes detailed review
6. User optionally uploads photos
7. System validates review content
8. System publishes review
9. System updates property/host ratings
10. System notifies other party of new review

#### Alternative Flows
- **A1**: User skips review
  - System allows user to skip
  - System may send reminder later
- **A2**: Review contains inappropriate content
  - System flags for moderation
  - Admin reviews and approves/rejects
- **A3**: User responds to review
  - Host can respond to guest reviews
  - Guest can respond to host reviews

#### Exception Flows
- **E1**: Review period expired
  - System prevents review submission
  - System displays expiration message
- **E2**: User already reviewed
  - System prevents duplicate reviews
  - System allows review editing

### UC-8: Analytics Dashboard (NEW)

**Use Case ID**: UC-010  
**Use Case Name**: Analytics and Reporting  
**Primary Actor**: Admin, Host  
**Preconditions**: User has appropriate access permissions  
**Postconditions**: Reports generated and displayed  

#### Main Success Scenario
1. User navigates to analytics dashboard
2. User selects report type:
   - Booking analytics
   - Revenue reports
   - User activity
   - Property performance
3. User sets date range and filters
4. System queries relevant data
5. System processes and aggregates data
6. System generates visualizations:
   - Charts and graphs
   - Tables and lists
   - Trend analysis
7. System displays reports
8. User can export reports in various formats

#### Alternative Flows
- **A1**: User schedules automated reports
  - User sets report schedule
  - System sends reports via email
- **A2**: User creates custom dashboards
  - User selects preferred metrics
  - System saves dashboard configuration
- **A3**: User compares periods
  - User selects multiple date ranges
  - System displays comparative analysis

#### Exception Flows
- **E1**: Insufficient data
  - System displays message about limited data
  - System suggests broader date range
- **E2**: Data processing timeout
  - System displays loading message
  - System processes in background

### UC-9: Multilingual Content Management (NEW)

**Use Case ID**: UC-009  
**Use Case Name**: Admin User Management  
**Primary Actor**: Admin  
**Preconditions**: Admin is logged in with appropriate permissions  
**Postconditions**: User account status updated  

#### Main Success Scenario
1. Admin navigates to user management dashboard
2. Admin searches for specific user
3. Admin reviews user information:
   - Profile details
   - Activity history
   - Reviews and ratings
   - Reported issues
4. Admin takes action:
   - Verify host account
   - Suspend user account
   - Ban user account
   - Reset user password
5. System updates user status
6. System logs admin action
7. System notifies user of status change

#### Alternative Flows
- **A1**: Admin sends warning message
  - Admin composes warning message
  - System sends message to user
- **A2**: Admin reviews reported content
  - Admin reviews flagged content
  - Admin takes appropriate action
- **A3**: Admin bulk actions
  - Admin selects multiple users
  - Admin applies action to all selected users

#### Exception Flows
- **E1**: User has active bookings
  - System warns admin of active bookings
  - Admin must handle bookings before suspension
- **E2**: Insufficient permissions
  - System prevents action
  - System logs unauthorized attempt

### UC-10: User Profile Management

**Use Case ID**: UC-005  
**Use Case Name**: Booking Management  
**Primary Actor**: Host  
**Secondary Actor**: Guest, Email Service  
**Preconditions**: Host has active property listings  
**Postconditions**: Booking status updated and guest notified  

#### Main Success Scenario
1. Host receives booking notification
2. Host reviews booking details:
   - Guest information
   - Dates and number of guests
   - Guest message
   - Total amount
3. Host checks property availability
4. Host accepts or declines booking
5. If accepted:
   - System updates booking status to "confirmed"
   - System sends confirmation to guest
   - System blocks dates on calendar
6. If declined:
   - System updates booking status to "declined"
   - System sends notification to guest
   - System refunds payment if applicable

#### Alternative Flows
- **A1**: Host sends message to guest
  - Host enters message before accepting/declining
  - System includes message in notification
- **A2**: Host requests modification
  - Host suggests different dates or terms
  - System sends modification request to guest
- **A3**: Host sets instant booking
  - System automatically accepts bookings
  - Host receives notification after acceptance

#### Exception Flows
- **E1**: Property no longer available
  - System automatically declines booking
  - System notifies guest and host
- **E2**: Guest cancels before host responds
  - System updates booking status to "cancelled"
  - System processes refund

### UC-11: Messaging System

**Use Case ID**: UC-006  
**Use Case Name**: Messaging System  
**Primary Actor**: Guest, Host  
**Secondary Actor**: Email Service  
**Preconditions**: Users are logged in and have a booking relationship  
**Postconditions**: Message sent and delivered  

#### Main Success Scenario
1. User navigates to messages
2. User selects conversation or booking
3. User composes message
4. User optionally attaches files
5. System validates message content
6. System sends message to recipient
7. System stores message in database
8. System sends email notification to recipient
9. System marks message as read when recipient opens

#### Alternative Flows
- **A1**: User blocks sender
  - System prevents message delivery
  - System notifies sender of block
- **A2**: Message contains inappropriate content
  - System flags message for review
  - Admin reviews and takes action
- **A3**: User sets notification preferences
  - System respects notification settings
  - System sends notifications accordingly

#### Exception Flows
- **E1**: Email service unavailable
  - System queues email for later sending
  - Message still delivered in-app
- **E2**: File attachment too large
  - System displays error message
  - User reduces file size or removes attachment

### UC-12: Review and Rating System

**Use Case ID**: UC-007  
**Use Case Name**: Review and Rating  
**Primary Actor**: Guest, Host  
**Preconditions**: Booking is completed  
**Postconditions**: Review published and ratings updated  

#### Main Success Scenario
1. System sends review request after stay completion
2. User navigates to review page
3. User rates different aspects:
   - Overall experience
   - Cleanliness
   - Communication
   - Check-in process
   - Accuracy of listing
   - Location
   - Value for money
4. User writes detailed review
5. User submits review
6. System validates review content
7. System publishes review
8. System updates property rating
9. System notifies host of new review
10. Host can respond to review

#### Alternative Flows
- **A1**: Review contains inappropriate content
  - System flags for moderation
  - Admin reviews and approves/rejects
- **A2**: Guest doesn't submit review
  - System sends reminder emails
  - Review window expires after 14 days

### UC-13: Wishlist Management (NEW)

**Use Case ID**: UC-008  
**Use Case Name**: Payment Processing  
**Primary Actor**: Guest  
**Secondary Actor**: Payment Gateway, Host  
**Preconditions**: Booking is confirmed  
**Postconditions**: Payment processed and funds distributed  

#### Main Success Scenario
1. Guest provides payment information
2. System validates payment method
3. System calculates payment breakdown:
   - Property rental fee
   - Platform service fee
   - Taxes
4. System processes payment through gateway
5. Payment gateway authorizes transaction
6. System holds payment in escrow
7. System sends confirmation to guest
8. System notifies host of payment
9. After stay completion:
   - System releases payment to host
   - System deducts platform fees
   - System sends payout to host

#### Alternative Flows
- **A1**: Payment method declined
  - System displays error message
  - Guest provides alternative payment method
- **A2**: Partial refund required
  - System calculates refund amount
  - System processes partial refund
- **A3**: Dispute resolution
  - System holds payment during dispute
  - Admin mediates and makes decision

#### Exception Flows
- **E1**: Payment gateway unavailable
  - System displays error message
  - Guest retries payment
- **E2**: Insufficient funds
  - System displays error message
  - Guest uses different payment method

### UC-14: Admin User Management (NEW)

**Use Case ID**: UC-009  
**Use Case Name**: Admin User Management  
**Primary Actor**: Admin  
**Preconditions**: Admin is logged in with appropriate permissions  
**Postconditions**: User account status updated  

#### Main Success Scenario
1. Admin navigates to user management dashboard
2. Admin searches for specific user
3. Admin reviews user information:
   - Profile details
   - Activity history
   - Reviews and ratings
   - Reported issues
4. Admin takes action:
   - Verify host account
   - Suspend user account
   - Ban user account
   - Reset user password
5. System updates user status
6. System logs admin action
7. System notifies user of status change

#### Alternative Flows
- **A1**: Admin sends warning message
  - Admin composes warning message
  - System sends message to user
- **A2**: Admin reviews reported content
  - Admin reviews flagged content
  - Admin takes appropriate action
- **A3**: Admin bulk actions
  - Admin selects multiple users
  - Admin applies action to all selected users

#### Exception Flows
- **E1**: User has active bookings
  - System warns admin of active bookings
  - Admin must handle bookings before suspension
- **E2**: Insufficient permissions
  - System prevents action
  - System logs unauthorized attempt

### UC-15: System Health Monitoring (NEW)

**Use Case ID**: UC-010  
**Use Case Name**: Analytics and Reporting  
**Primary Actor**: Admin, Host  
**Preconditions**: User has appropriate access permissions  
**Postconditions**: Reports generated and displayed  

#### Main Success Scenario
1. User navigates to analytics dashboard
2. System loads analytics data
3. For Administrators:
   - System displays platform-wide metrics
   - User can view user growth, booking trends, revenue data
   - User can generate custom reports
   - User can export data
4. For Hosts:
   - System displays property-specific metrics
   - User can view booking performance, revenue, guest satisfaction
   - User can analyze guest demographics
5. User can:
   - Filter data by time period
   - View different chart types
   - Drill down into specific metrics
   - Compare performance over time
6. System updates charts in real-time
7. System generates insights and recommendations
8. User can export reports in various formats

#### Alternative Flows
- **A1**: No data available
  - System displays empty state
  - System provides data collection guidance
- **A2**: Large dataset
  - System implements pagination
  - System provides data sampling options

#### Exception Flows
- **E1**: Insufficient data
  - System displays message about limited data
  - System suggests broader date range
- **E2**: Data processing timeout
  - System displays loading message
  - System processes in background

## 🔄 Use Case Relationships

### Dependencies
- UC-1 (Registration) is prerequisite for most other use cases
- UC-3 (Property Creation) is prerequisite for UC-4 (Booking)
- UC-4 (Booking) is prerequisite for UC-5 (Payment)
- UC-5 (Payment) is prerequisite for UC-12 (Review)

### Extensions
- UC-6 (Content Management) extends UC-14 (Admin Management)
- UC-7 (Admin Testing) extends UC-15 (System Monitoring)
- UC-8 (Analytics) extends UC-14 (Admin Management)
- UC-9 (Multilingual) extends all user-facing use cases

### Inclusions
- UC-10 (Profile Management) is included in UC-1 (Registration)
- UC-11 (Messaging) is included in UC-4 (Booking)
- UC-13 (Wishlist) is included in UC-2 (Property Search)

## 📊 Use Case Priority Matrix

| Use Case | Priority | Complexity | Business Value |
|----------|----------|------------|----------------|
| UC-1: Registration | High | Medium | High |
| UC-2: Property Search | High | High | High |
| UC-3: Property Creation | High | High | High |
| UC-4: Booking Process | High | High | High |
| UC-5: Payment Processing | High | High | Critical |
| UC-6: Content Management | Medium | High | Medium |
| UC-7: Admin Testing | Medium | Medium | Medium |
| UC-8: Analytics Dashboard | Medium | High | High |
| UC-9: Multilingual Support | Medium | Medium | Medium |
| UC-10: Profile Management | Low | Low | Medium |
| UC-11: Messaging System | Medium | Medium | Medium |
| UC-12: Review System | Medium | Medium | Medium |
| UC-13: Wishlist Management | Low | Low | Low |
| UC-14: Admin User Management | Medium | Medium | High |
| UC-15: System Monitoring | Medium | Medium | High |

## 🎯 Success Criteria

### Functional Success
- All use cases execute without errors
- User workflows are intuitive and efficient
- System performance meets requirements
- Data integrity is maintained

### User Experience Success
- Users can complete tasks quickly
- Error messages are clear and helpful
- System is accessible to all users
- Mobile experience is optimized

### Business Success
- User registration and retention rates increase
- Booking completion rates improve
- Host satisfaction scores rise
- Platform revenue grows

---

*This use case specification should be reviewed and updated as requirements evolve.*

*Last Updated: June 2025*
*Version: 2.0 - Enhanced with Content Management, Admin Testing, Analytics, and Multilingual Use Cases* 