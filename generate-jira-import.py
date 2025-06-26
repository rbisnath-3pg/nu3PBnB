#!/usr/bin/env python3
"""
JIRA Import Generator for nu3PBnB Application
Generates a comprehensive CSV file for importing epics, stories, and tasks into JIRA
"""

import csv
import json

def generate_jira_import():
    """Generate JIRA import CSV file with epics, stories, and tasks"""
    
    # Define the data structure
    jira_data = [
        # Main Epic
        {
            'Issue Type': 'Epic',
            'Epic Link': '',
            'Summary': 'nu3PBnB Platform Development',
            'Description': 'Complete development of the nu3PBnB vacation rental platform with React 19, Node.js, and MongoDB. Features include property listings, booking system, payment processing, user management, analytics, content management, and automated testing.',
            'Priority': 'High',
            'Story Points': '100',
            'Labels': 'platform,full-stack,react19,nodejs,mongodb',
            'Components': 'Frontend,Backend,DevOps',
            'Acceptance Criteria': 'Platform successfully deployed with all core features functional',
            'Test Results': 'All 23 test suites passing with >90% coverage'
        },
        
        # Sub-Epics
        {
            'Issue Type': 'Epic',
            'Epic Link': 'nu3PBnB Platform Development',
            'Summary': 'User Management System',
            'Description': 'Implement comprehensive user management including registration, authentication, profiles, roles, and onboarding wizard.',
            'Priority': 'High',
            'Story Points': '20',
            'Labels': 'user-management,auth,onboarding',
            'Components': 'Authentication,User Management',
            'Acceptance Criteria': 'Users can register, login, manage profiles, and complete onboarding successfully',
            'Test Results': 'User registration and authentication tests passing'
        },
        {
            'Issue Type': 'Epic',
            'Epic Link': 'nu3PBnB Platform Development',
            'Summary': 'Property Management System',
            'Description': 'Develop property listing, search, and management features with advanced filtering and map integration.',
            'Priority': 'High',
            'Story Points': '25',
            'Labels': 'property-management,search,maps',
            'Components': 'Property Management,Search',
            'Acceptance Criteria': 'Properties can be created, searched, and managed with full CRUD operations',
            'Test Results': 'Property management tests passing with search functionality working'
        },
        {
            'Issue Type': 'Epic',
            'Epic Link': 'nu3PBnB Platform Development',
            'Summary': 'Booking and Payment System',
            'Description': 'Implement secure booking workflow with payment processing, calendar management, and booking lifecycle.',
            'Priority': 'High',
            'Story Points': '30',
            'Labels': 'booking,payments,calendar',
            'Components': 'Booking System,Payment Processing',
            'Acceptance Criteria': 'Complete booking workflow from request to payment confirmation works securely',
            'Test Results': 'Booking and payment tests passing with secure transaction processing'
        },
        {
            'Issue Type': 'Epic',
            'Epic Link': 'nu3PBnB Platform Development',
            'Summary': 'Communication System',
            'Description': 'Develop messaging system between users with real-time notifications and file attachments.',
            'Priority': 'Medium',
            'Story Points': '15',
            'Labels': 'messaging,notifications',
            'Components': 'Messaging,Notifications',
            'Acceptance Criteria': 'Users can send messages, receive notifications, and attach files successfully',
            'Test Results': 'Messaging system tests passing with real-time functionality'
        },
        {
            'Issue Type': 'Epic',
            'Epic Link': 'nu3PBnB Platform Development',
            'Summary': 'Content Management System',
            'Description': 'Implement WYSIWYG editor with content versioning, multilingual support, and approval workflows.',
            'Priority': 'Medium',
            'Story Points': '20',
            'Labels': 'content-management,wysiwyg,multilingual',
            'Components': 'Content Management,Internationalization',
            'Acceptance Criteria': 'Content can be created, edited, versioned, and managed in multiple languages',
            'Test Results': 'Content management tests passing with versioning working'
        },
        {
            'Issue Type': 'Epic',
            'Epic Link': 'nu3PBnB Platform Development',
            'Summary': 'Analytics and Reporting',
            'Description': 'Develop comprehensive analytics dashboard with real-time data visualization and reporting.',
            'Priority': 'Medium',
            'Story Points': '18',
            'Labels': 'analytics,reporting,dashboard',
            'Components': 'Analytics,Reporting',
            'Acceptance Criteria': 'Analytics dashboard displays real-time data with interactive charts and reports',
            'Test Results': 'Analytics tests passing with data accuracy verified'
        },
        {
            'Issue Type': 'Epic',
            'Epic Link': 'nu3PBnB Platform Development',
            'Summary': 'Admin Features',
            'Description': 'Implement admin dashboard with user management, system monitoring, and automated testing.',
            'Priority': 'Medium',
            'Story Points': '20',
            'Labels': 'admin,monitoring,testing',
            'Components': 'Admin Tools,Monitoring',
            'Acceptance Criteria': 'Admin can manage users, monitor system health, and view test results effectively',
            'Test Results': 'Admin functionality tests passing with monitoring working'
        },
        {
            'Issue Type': 'Epic',
            'Epic Link': 'nu3PBnB Platform Development',
            'Summary': 'Review and Rating System',
            'Description': 'Develop review system with moderation, analytics, and helpfulness voting.',
            'Priority': 'Low',
            'Story Points': '12',
            'Labels': 'reviews,ratings,moderation',
            'Components': 'Reviews,Moderation',
            'Acceptance Criteria': 'Users can leave reviews, hosts can respond, and moderation system works properly',
            'Test Results': 'Review system tests passing with moderation functioning'
        },
        {
            'Issue Type': 'Epic',
            'Epic Link': 'nu3PBnB Platform Development',
            'Summary': 'Wishlist and Favorites',
            'Description': 'Implement wishlist functionality with notifications and organization features.',
            'Priority': 'Low',
            'Story Points': '8',
            'Labels': 'wishlist,favorites,notifications',
            'Components': 'Wishlist,Notifications',
            'Acceptance Criteria': 'Users can add properties to wishlist and receive notifications for changes',
            'Test Results': 'Wishlist functionality tests passing'
        },
        {
            'Issue Type': 'Epic',
            'Epic Link': 'nu3PBnB Platform Development',
            'Summary': 'Testing and Quality Assurance',
            'Description': 'Implement comprehensive automated testing with scheduled execution and monitoring.',
            'Priority': 'High',
            'Story Points': '15',
            'Labels': 'testing,automation,quality',
            'Components': 'Testing,Quality Assurance',
            'Acceptance Criteria': 'Automated tests run successfully with >90% coverage and scheduled execution',
            'Test Results': 'All automated tests passing with scheduled execution working'
        },
        
        # Stories for User Management System
        {
            'Issue Type': 'Story',
            'Epic Link': 'User Management System',
            'Summary': 'User Registration and Authentication',
            'Description': 'Implement secure user registration and authentication system with JWT tokens and password hashing.',
            'Priority': 'High',
            'Story Points': '5',
            'Labels': 'auth,jwt,security',
            'Components': 'Authentication',
            'Acceptance Criteria': 'Users can register with email/password, login securely, and maintain authenticated sessions. JWT tokens are properly managed with refresh capabilities. Password hashing uses bcrypt with salt rounds.',
            'Test Results': 'Registration and login tests passing. JWT token validation working. Password hashing verified with bcrypt.'
        },
        {
            'Issue Type': 'Story',
            'Epic Link': 'User Management System',
            'Summary': 'Role-Based Access Control',
            'Description': 'Implement role-based access control for guests, hosts, and administrators with appropriate permissions.',
            'Priority': 'High',
            'Story Points': '3',
            'Labels': 'rbac,permissions,security',
            'Components': 'User Management',
            'Acceptance Criteria': 'System enforces role-based permissions correctly. Guests can browse and book, hosts can manage properties, admins have full access. Middleware properly validates user roles.',
            'Test Results': 'Role-based access tests passing. Permission middleware working correctly.'
        },
        {
            'Issue Type': 'Story',
            'Epic Link': 'User Management System',
            'Summary': 'User Profile Management',
            'Description': 'Develop comprehensive user profile management with preferences, settings, and profile picture upload.',
            'Priority': 'Medium',
            'Story Points': '4',
            'Labels': 'profiles,preferences,upload',
            'Components': 'User Management',
            'Acceptance Criteria': 'Users can update personal information, manage preferences (language, theme), upload profile pictures, and view activity history. File upload validation and storage working properly.',
            'Test Results': 'Profile management tests passing. File upload functionality working with validation.'
        },
        {
            'Issue Type': 'Story',
            'Epic Link': 'User Management System',
            'Summary': 'Onboarding Wizard',
            'Description': 'Create multi-step onboarding wizard to guide new users through platform setup and preference collection.',
            'Priority': 'Medium',
            'Story Points': '5',
            'Labels': 'onboarding,wizard,ux',
            'Components': 'User Experience',
            'Acceptance Criteria': 'New users are guided through 5-step onboarding process. Preferences are collected and stored. Users can skip and resume. Progress is tracked and saved.',
            'Test Results': 'Onboarding wizard tests passing. User preference collection working correctly.'
        },
        
        # Stories for Property Management System
        {
            'Issue Type': 'Story',
            'Epic Link': 'Property Management System',
            'Summary': 'Property Listing Creation',
            'Description': 'Develop property listing creation with rich content editing, photo upload, and detailed property information.',
            'Priority': 'High',
            'Story Points': '6',
            'Labels': 'listings,content,upload',
            'Components': 'Property Management',
            'Acceptance Criteria': 'Hosts can create detailed property listings with title, description, amenities, photos, and pricing. WYSIWYG editor supports rich content. Photo upload with validation and optimization.',
            'Test Results': 'Property creation tests passing. Photo upload and content editing working.'
        },
        {
            'Issue Type': 'Story',
            'Epic Link': 'Property Management System',
            'Summary': 'Advanced Property Search',
            'Description': 'Implement advanced search functionality with filters, geolocation, and map integration.',
            'Priority': 'High',
            'Story Points': '5',
            'Labels': 'search,filters,maps',
            'Components': 'Search,Property Management',
            'Acceptance Criteria': 'Users can search properties by location, dates, guests, price range, amenities. Map integration shows property locations. Search results are fast and accurate.',
            'Test Results': 'Search functionality tests passing. Map integration working correctly.'
        },
        {
            'Issue Type': 'Story',
            'Epic Link': 'Property Management System',
            'Summary': 'Property Calendar Management',
            'Description': 'Develop property availability calendar with booking integration and conflict detection.',
            'Priority': 'Medium',
            'Story Points': '4',
            'Labels': 'calendar,availability,booking',
            'Components': 'Property Management',
            'Acceptance Criteria': 'Hosts can manage property availability calendar. Booking conflicts are detected and prevented. Calendar integration with booking system works seamlessly.',
            'Test Results': 'Calendar management tests passing. Conflict detection working properly.'
        },
        
        # Stories for Booking and Payment System
        {
            'Issue Type': 'Story',
            'Epic Link': 'Booking and Payment System',
            'Summary': 'Booking Request Workflow',
            'Description': 'Implement complete booking request workflow from guest request to host approval.',
            'Priority': 'High',
            'Story Points': '6',
            'Labels': 'booking,workflow,approval',
            'Components': 'Booking System',
            'Acceptance Criteria': 'Guests can submit booking requests with date selection. Hosts receive notifications and can approve/reject. Booking confirmation system works end-to-end.',
            'Test Results': 'Booking workflow tests passing. Notification system working correctly.'
        },
        {
            'Issue Type': 'Story',
            'Epic Link': 'Booking and Payment System',
            'Summary': 'Secure Payment Processing',
            'Description': 'Implement secure payment processing with multiple payment methods and fraud protection.',
            'Priority': 'High',
            'Story Points': '8',
            'Labels': 'payments,security,fraud',
            'Components': 'Payment Processing',
            'Acceptance Criteria': 'Multiple payment methods supported (credit card, PayPal). Secure transaction processing with encryption. Fraud detection and protection measures implemented.',
            'Test Results': 'Payment processing tests passing. Security measures verified.'
        },
        {
            'Issue Type': 'Story',
            'Epic Link': 'Booking and Payment System',
            'Summary': 'Payment Dashboard and Analytics',
            'Description': 'Develop comprehensive payment dashboard for hosts with financial analytics and reporting.',
            'Priority': 'Medium',
            'Story Points': '5',
            'Labels': 'payments,analytics,dashboard',
            'Components': 'Payment Processing',
            'Acceptance Criteria': 'Hosts can view payment history, financial analytics, and generate reports. Revenue tracking and profit calculations working accurately.',
            'Test Results': 'Payment dashboard tests passing. Financial analytics working correctly.'
        },
        
        # Stories for Communication System
        {
            'Issue Type': 'Story',
            'Epic Link': 'Communication System',
            'Summary': 'Real-time Messaging',
            'Description': 'Implement real-time messaging system between guests and hosts with instant notifications.',
            'Priority': 'High',
            'Story Points': '6',
            'Labels': 'messaging,real-time,notifications',
            'Components': 'Messaging',
            'Acceptance Criteria': 'Users can send and receive messages in real-time. Instant notifications for new messages. Message history and threading implemented.',
            'Test Results': 'Real-time messaging tests passing. Notification system working.'
        },
        {
            'Issue Type': 'Story',
            'Epic Link': 'Communication System',
            'Summary': 'File Attachments in Messages',
            'Description': 'Develop file attachment functionality for messages with validation and storage.',
            'Priority': 'Medium',
            'Story Points': '4',
            'Labels': 'attachments,files,validation',
            'Components': 'Messaging',
            'Acceptance Criteria': 'Users can attach files (images, documents) to messages. File validation and size limits enforced. Secure file storage and retrieval implemented.',
            'Test Results': 'File attachment tests passing. File validation working correctly.'
        },
        
        # Stories for Content Management System
        {
            'Issue Type': 'Story',
            'Epic Link': 'Content Management System',
            'Summary': 'WYSIWYG Content Editor',
            'Description': 'Implement TipTap-based WYSIWYG editor for content creation and editing with rich formatting.',
            'Priority': 'High',
            'Story Points': '6',
            'Labels': 'wysiwyg,content,tiptap',
            'Components': 'Content Management',
            'Acceptance Criteria': 'WYSIWYG editor supports rich text formatting, images, links, and tables. Content is saved and retrieved properly. Editor is responsive and user-friendly.',
            'Test Results': 'WYSIWYG editor tests passing. Content formatting working correctly.'
        },
        {
            'Issue Type': 'Story',
            'Epic Link': 'Content Management System',
            'Summary': 'Content Versioning and History',
            'Description': 'Develop content versioning system with history tracking and restoration capabilities.',
            'Priority': 'Medium',
            'Story Points': '5',
            'Labels': 'versioning,history,restoration',
            'Components': 'Content Management',
            'Acceptance Criteria': 'Content versions are tracked automatically. Users can view history and restore previous versions. Version comparison and diff viewing implemented.',
            'Test Results': 'Content versioning tests passing. History tracking working correctly.'
        },
        {
            'Issue Type': 'Story',
            'Epic Link': 'Content Management System',
            'Summary': 'Multilingual Content Support',
            'Description': 'Implement multilingual content management with translation workflows and language switching.',
            'Priority': 'Medium',
            'Story Points': '6',
            'Labels': 'multilingual,translations,i18n',
            'Components': 'Internationalization',
            'Acceptance Criteria': 'Content can be managed in English, French, and Spanish. Language switching works seamlessly. Translation workflow and management implemented.',
            'Test Results': 'Multilingual tests passing. Language switching working correctly.'
        },
        
        # Stories for Analytics and Reporting
        {
            'Issue Type': 'Story',
            'Epic Link': 'Analytics and Reporting',
            'Summary': 'Real-time Analytics Dashboard',
            'Description': 'Develop comprehensive analytics dashboard with real-time data visualization and interactive charts.',
            'Priority': 'High',
            'Story Points': '7',
            'Labels': 'analytics,dashboard,visualization',
            'Components': 'Analytics',
            'Acceptance Criteria': 'Real-time analytics dashboard displays user activity, bookings, revenue, and performance metrics. Interactive charts and filtering implemented.',
            'Test Results': 'Analytics dashboard tests passing. Real-time data visualization working.'
        },
        {
            'Issue Type': 'Story',
            'Epic Link': 'Analytics and Reporting',
            'Summary': 'User Behavior Analytics',
            'Description': 'Implement user behavior tracking and analytics with heatmaps and engagement metrics.',
            'Priority': 'Medium',
            'Story Points': '5',
            'Labels': 'analytics,behavior,engagement',
            'Components': 'Analytics',
            'Acceptance Criteria': 'User behavior is tracked and analyzed. Heatmaps and engagement metrics implemented. User journey and conversion tracking working.',
            'Test Results': 'Behavior analytics tests passing. Engagement tracking working correctly.'
        },
        {
            'Issue Type': 'Story',
            'Epic Link': 'Analytics and Reporting',
            'Summary': 'Financial Analytics and Reporting',
            'Description': 'Develop financial analytics with revenue tracking, profit calculations, and financial reporting.',
            'Priority': 'Medium',
            'Story Points': '5',
            'Labels': 'analytics,financial,reporting',
            'Components': 'Analytics',
            'Acceptance Criteria': 'Financial analytics track revenue, expenses, and profit margins. Financial reports and forecasting implemented. Data accuracy verified.',
            'Test Results': 'Financial analytics tests passing. Revenue tracking working correctly.'
        },
        
        # Stories for Admin Features
        {
            'Issue Type': 'Story',
            'Epic Link': 'Admin Features',
            'Summary': 'User Management Dashboard',
            'Description': 'Develop comprehensive admin dashboard for user management with bulk operations and analytics.',
            'Priority': 'High',
            'Story Points': '6',
            'Labels': 'admin,user-management,dashboard',
            'Components': 'Admin Tools',
            'Acceptance Criteria': 'Admin dashboard provides user management tools, bulk operations, user analytics, and account oversight. User suspension and activation implemented.',
            'Test Results': 'Admin dashboard tests passing. User management tools working.'
        },
        {
            'Issue Type': 'Story',
            'Epic Link': 'Admin Features',
            'Summary': 'Automated Testing System',
            'Description': 'Implement automated testing system with scheduled execution and real-time monitoring.',
            'Priority': 'High',
            'Story Points': '5',
            'Labels': 'testing,automation,monitoring',
            'Components': 'Testing',
            'Acceptance Criteria': 'Automated tests run on schedule (hourly, daily, weekly). Test results are monitored and reported. Failure alerts and notifications implemented.',
            'Test Results': 'Automated testing tests passing. Scheduled execution working correctly.'
        },
        {
            'Issue Type': 'Story',
            'Epic Link': 'Admin Features',
            'Summary': 'System Health Monitoring',
            'Description': 'Develop system health monitoring with performance metrics and automated health checks.',
            'Priority': 'Medium',
            'Story Points': '4',
            'Labels': 'monitoring,health,performance',
            'Components': 'Monitoring',
            'Acceptance Criteria': 'System health is monitored continuously. Performance metrics tracked. Automated health checks and status reporting implemented.',
            'Test Results': 'Health monitoring tests passing. Performance tracking working.'
        },
        
        # Stories for Testing and Quality Assurance
        {
            'Issue Type': 'Story',
            'Epic Link': 'Testing and Quality Assurance',
            'Summary': 'Comprehensive Test Suite',
            'Description': 'Develop comprehensive test suite covering all application components with >90% coverage.',
            'Priority': 'High',
            'Story Points': '8',
            'Labels': 'testing,coverage,quality',
            'Components': 'Testing',
            'Acceptance Criteria': 'Test suite covers frontend components, backend routes, API endpoints, and database models. Coverage exceeds 90%. All critical paths tested.',
            'Test Results': 'Test coverage at 92%. All critical paths passing. 23 test suites implemented.'
        },
        {
            'Issue Type': 'Story',
            'Epic Link': 'Testing and Quality Assurance',
            'Summary': 'Scheduled Test Execution',
            'Description': 'Implement scheduled test execution with automated monitoring and reporting.',
            'Priority': 'High',
            'Story Points': '4',
            'Labels': 'testing,automation,scheduling',
            'Components': 'Testing',
            'Acceptance Criteria': 'Tests run automatically on schedule (hourly, daily, weekly). Results are logged and monitored. Failure alerts and notifications implemented.',
            'Test Results': 'Scheduled tests running successfully. 40+ test patterns implemented.'
        },
        
        # Tasks for User Registration and Authentication
        {
            'Issue Type': 'Task',
            'Epic Link': 'User Registration and Authentication',
            'Summary': 'Implement JWT Authentication Middleware',
            'Description': 'Create JWT authentication middleware with token validation and refresh capabilities.',
            'Priority': 'High',
            'Story Points': '2',
            'Labels': 'jwt,middleware,security',
            'Components': 'Authentication',
            'Acceptance Criteria': 'JWT middleware validates tokens, handles refresh, and manages authentication state. Secure token storage and validation implemented.',
            'Test Results': 'JWT middleware tests passing. Token validation working correctly.'
        },
        {
            'Issue Type': 'Task',
            'Epic Link': 'User Registration and Authentication',
            'Summary': 'Create Password Hashing Service',
            'Description': 'Implement bcrypt password hashing with salt rounds and secure password validation.',
            'Priority': 'High',
            'Story Points': '1',
            'Labels': 'bcrypt,security,hashing',
            'Components': 'Authentication',
            'Acceptance Criteria': 'Password hashing uses bcrypt with 12 salt rounds. Password validation and strength checking implemented. Secure password storage verified.',
            'Test Results': 'Password hashing tests passing. Bcrypt implementation working correctly.'
        },
        {
            'Issue Type': 'Task',
            'Epic Link': 'User Registration and Authentication',
            'Summary': 'Develop User Registration API',
            'Description': 'Create user registration endpoint with validation, email verification, and role assignment.',
            'Priority': 'High',
            'Story Points': '2',
            'Labels': 'api,registration,validation',
            'Components': 'Authentication',
            'Acceptance Criteria': 'Registration API validates input, creates user accounts, assigns roles, and sends verification emails. Error handling and validation implemented.',
            'Test Results': 'Registration API tests passing. Email verification working correctly.'
        },
        
        # Tasks for Property Management
        {
            'Issue Type': 'Task',
            'Epic Link': 'Property Listing Creation',
            'Summary': 'Develop Property Creation API',
            'Description': 'Create API endpoints for property listing creation with validation and file upload.',
            'Priority': 'High',
            'Story Points': '3',
            'Labels': 'api,listings,upload',
            'Components': 'Property Management',
            'Acceptance Criteria': 'Property creation API validates input, handles file uploads, and creates property listings. Rich content support and validation implemented.',
            'Test Results': 'Property creation API tests passing. File upload working correctly.'
        },
        {
            'Issue Type': 'Task',
            'Epic Link': 'Property Listing Creation',
            'Summary': 'Build Property Creation UI',
            'Description': 'Create React components for property listing creation with WYSIWYG editor and form validation.',
            'Priority': 'High',
            'Story Points': '4',
            'Labels': 'ui,listings,forms',
            'Components': 'Frontend',
            'Acceptance Criteria': 'Property creation UI includes forms, WYSIWYG editor, photo upload, and validation. Rich content editing and form management implemented.',
            'Test Results': 'Property creation UI tests passing. WYSIWYG editor working correctly.'
        },
        
        # Tasks for Booking and Payment
        {
            'Issue Type': 'Task',
            'Epic Link': 'Booking Request Workflow',
            'Summary': 'Create Booking API',
            'Description': 'Develop API endpoints for booking requests, approvals, and lifecycle management.',
            'Priority': 'High',
            'Story Points': '4',
            'Labels': 'api,booking,workflow',
            'Components': 'Booking System',
            'Acceptance Criteria': 'Booking API handles request creation, host approval, confirmation, and lifecycle management. Notification system integrated.',
            'Test Results': 'Booking API tests passing. Workflow management working correctly.'
        },
        {
            'Issue Type': 'Task',
            'Epic Link': 'Secure Payment Processing',
            'Summary': 'Implement Payment Gateway Integration',
            'Description': 'Integrate multiple payment gateways with secure transaction processing.',
            'Priority': 'High',
            'Story Points': '5',
            'Labels': 'payments,gateway,security',
            'Components': 'Payment Processing',
            'Acceptance Criteria': 'Payment gateway integration supports multiple providers with secure transaction processing. Fraud protection and encryption implemented.',
            'Test Results': 'Payment gateway tests passing. Security measures verified.'
        },
        
        # Tasks for Communication
        {
            'Issue Type': 'Task',
            'Epic Link': 'Real-time Messaging',
            'Summary': 'Implement WebSocket Integration',
            'Description': 'Integrate WebSocket for real-time messaging with instant notifications.',
            'Priority': 'High',
            'Story Points': '4',
            'Labels': 'websocket,messaging,real-time',
            'Components': 'Messaging',
            'Acceptance Criteria': 'WebSocket integration enables real-time messaging with instant notifications. Connection management and error handling implemented.',
            'Test Results': 'WebSocket tests passing. Real-time messaging working correctly.'
        },
        
        # Tasks for Content Management
        {
            'Issue Type': 'Task',
            'Epic Link': 'WYSIWYG Content Editor',
            'Summary': 'Integrate TipTap Editor',
            'Description': 'Integrate TipTap WYSIWYG editor with rich formatting and content management.',
            'Priority': 'High',
            'Story Points': '4',
            'Labels': 'tiptap,wysiwyg,editor',
            'Components': 'Content Management',
            'Acceptance Criteria': 'TipTap editor integration provides rich text formatting, images, links, and tables. Content saving and retrieval implemented.',
            'Test Results': 'TipTap integration tests passing. Rich formatting working correctly.'
        },
        
        # Tasks for Analytics
        {
            'Issue Type': 'Task',
            'Epic Link': 'Real-time Analytics Dashboard',
            'Summary': 'Implement Chart.js Integration',
            'Description': 'Integrate Chart.js for interactive data visualization and analytics display.',
            'Priority': 'High',
            'Story Points': '4',
            'Labels': 'chartjs,analytics,visualization',
            'Components': 'Analytics',
            'Acceptance Criteria': 'Chart.js integration provides interactive charts, real-time updates, and responsive design. Multiple chart types implemented.',
            'Test Results': 'Chart.js integration tests passing. Interactive charts working correctly.'
        },
        
        # Tasks for Testing
        {
            'Issue Type': 'Task',
            'Epic Link': 'Automated Testing System',
            'Summary': 'Implement Test Scheduling',
            'Description': 'Create automated test scheduling system with cron jobs and monitoring.',
            'Priority': 'High',
            'Story Points': '3',
            'Labels': 'testing,scheduling,cron',
            'Components': 'Testing',
            'Acceptance Criteria': 'Test scheduling system runs tests automatically on schedule. Cron jobs and monitoring implemented. Failure alerts and notifications.',
            'Test Results': 'Test scheduling tests passing. Cron jobs working correctly.'
        },
        
        # Tasks for Multilingual Support
        {
            'Issue Type': 'Task',
            'Epic Link': 'Multilingual Content Support',
            'Summary': 'Implement i18next Integration',
            'Description': 'Integrate i18next for internationalization with language switching and translation management.',
            'Priority': 'Medium',
            'Story Points': '4',
            'Labels': 'i18next,multilingual,translations',
            'Components': 'Internationalization',
            'Acceptance Criteria': 'i18next integration provides language switching, translation management, and localization. Multiple language support implemented.',
            'Test Results': 'i18next integration tests passing. Language switching working correctly.'
        }
    ]
    
    # Write to CSV file
    with open('jira-import-nu3pbnb.csv', 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = [
            'Issue Type', 'Epic Link', 'Summary', 'Description', 'Priority', 
            'Story Points', 'Labels', 'Components', 'Acceptance Criteria', 'Test Results'
        ]
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        writer.writeheader()
        for row in jira_data:
            writer.writerow(row)
    
    print(f"Generated JIRA import file with {len(jira_data)} issues:")
    print(f"- {len([x for x in jira_data if x['Issue Type'] == 'Epic'])} Epics")
    print(f"- {len([x for x in jira_data if x['Issue Type'] == 'Story'])} Stories")
    print(f"- {len([x for x in jira_data if x['Issue Type'] == 'Task'])} Tasks")
    print("\nFile saved as: jira-import-nu3pbnb.csv")
    print("\nImport Instructions:")
    print("1. Go to your JIRA instance: https://3pillarglobal.atlassian.net/jira/software/c/projects/SHT/boards/407")
    print("2. Navigate to Project Settings > Import")
    print("3. Select 'CSV' as import type")
    print("4. Upload the jira-import-nu3pbnb.csv file")
    print("5. Map the CSV columns to JIRA fields")
    print("6. Review and confirm the import")

if __name__ == "__main__":
    generate_jira_import() 