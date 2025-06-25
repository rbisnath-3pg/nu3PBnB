"""
Nu3PBnB API Client
A complete Python client for the Nu3PBnB API
"""

import requests
import json
from typing import Dict, List, Optional, Any
from datetime import datetime


class Nu3PBnBAPI:
    def __init__(self, api_key: str, base_url: str = 'http://localhost:3000/api'):
        self.api_key = api_key
        self.base_url = base_url
        self.user_token = None
        self.session = requests.Session()
        self.session.headers.update({
            'X-API-Key': api_key,
            'Content-Type': 'application/json'
        })

    def _request(self, endpoint: str, method: str = 'GET', data: Optional[Dict] = None) -> Dict:
        """Make an API request"""
        url = f"{self.base_url}{endpoint}"
        headers = {}
        
        # Add user token if available
        if self.user_token:
            headers['Authorization'] = f'Bearer {self.user_token}'
        
        try:
            response = self.session.request(
                method=method,
                url=url,
                headers=headers,
                json=data
            )
            
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            print(f"API Request failed: {e}")
            raise

    def set_user_token(self, token: str) -> None:
        """Set user authentication token"""
        self.user_token = token

    def clear_user_token(self) -> None:
        """Clear user authentication token"""
        self.user_token = None

    # ===== AUTHENTICATION METHODS =====

    def register(self, user_data: Dict) -> Dict:
        """Register a new user"""
        data = self._request('/auth/register', method='POST', data=user_data)
        
        if 'token' in data:
            self.set_user_token(data['token'])
        
        return data

    def login(self, credentials: Dict) -> Dict:
        """Login user"""
        data = self._request('/auth/login', method='POST', data=credentials)
        
        if 'token' in data:
            self.set_user_token(data['token'])
        
        return data

    def get_profile(self) -> Dict:
        """Get user profile"""
        return self._request('/auth/profile')

    def update_profile(self, profile_data: Dict) -> Dict:
        """Update user profile"""
        return self._request('/auth/profile', method='PUT', data=profile_data)

    # ===== LISTINGS METHODS =====

    def get_listings(self, params: Optional[Dict] = None) -> Dict:
        """Get all listings with optional filters"""
        if params:
            query_string = '&'.join([f"{k}={v}" for k, v in params.items()])
            endpoint = f"/listings?{query_string}"
        else:
            endpoint = "/listings"
        
        return self._request(endpoint)

    def get_listing(self, listing_id: str) -> Dict:
        """Get a specific listing by ID"""
        return self._request(f"/listings/{listing_id}")

    def create_listing(self, listing_data: Dict) -> Dict:
        """Create a new listing (requires host role)"""
        return self._request('/listings', method='POST', data=listing_data)

    def update_listing(self, listing_id: str, listing_data: Dict) -> Dict:
        """Update a listing (requires host role)"""
        return self._request(f"/listings/{listing_id}", method='PUT', data=listing_data)

    def delete_listing(self, listing_id: str) -> Dict:
        """Delete a listing (requires host role)"""
        return self._request(f"/listings/{listing_id}", method='DELETE')

    def search_listings(self, search_params: Dict) -> Dict:
        """Search listings"""
        query_string = '&'.join([f"{k}={v}" for k, v in search_params.items()])
        return self._request(f"/listings/search?{query_string}")

    def get_popular_listings(self) -> Dict:
        """Get popular listings"""
        return self._request('/listings/popular')

    # ===== BOOKINGS METHODS =====

    def get_bookings(self, params: Optional[Dict] = None) -> Dict:
        """Get user bookings"""
        if params:
            query_string = '&'.join([f"{k}={v}" for k, v in params.items()])
            endpoint = f"/bookings?{query_string}"
        else:
            endpoint = "/bookings"
        
        return self._request(endpoint)

    def create_booking(self, booking_data: Dict) -> Dict:
        """Create a booking request"""
        return self._request('/bookings', method='POST', data=booking_data)

    def update_booking(self, booking_id: str, status: str) -> Dict:
        """Update booking status"""
        return self._request(f"/bookings/{booking_id}", method='PUT', data={'status': status})

    def cancel_booking(self, booking_id: str) -> Dict:
        """Cancel a booking"""
        return self._request(f"/bookings/{booking_id}", method='DELETE')

    # ===== REVIEWS METHODS =====

    def get_listing_reviews(self, listing_id: str) -> Dict:
        """Get reviews for a listing"""
        return self._request(f"/reviews/listing/{listing_id}")

    def create_review(self, review_data: Dict) -> Dict:
        """Create a review"""
        return self._request('/reviews', method='POST', data=review_data)

    def update_review(self, review_id: str, review_data: Dict) -> Dict:
        """Update a review"""
        return self._request(f"/reviews/{review_id}", method='PUT', data=review_data)

    def delete_review(self, review_id: str) -> Dict:
        """Delete a review"""
        return self._request(f"/reviews/{review_id}", method='DELETE')

    # ===== MESSAGES METHODS =====

    def get_messages(self) -> Dict:
        """Get user messages"""
        return self._request('/messages')

    def send_message(self, message_data: Dict) -> Dict:
        """Send a message"""
        return self._request('/messages', method='POST', data=message_data)

    def mark_message_as_read(self, message_id: str) -> Dict:
        """Mark message as read"""
        return self._request(f"/messages/{message_id}/read", method='PUT')

    # ===== PAYMENTS METHODS =====

    def get_payment_methods(self) -> Dict:
        """Get payment methods"""
        return self._request('/payments/methods')

    def process_payment(self, payment_data: Dict) -> Dict:
        """Process a payment"""
        return self._request('/payments/process', method='POST', data=payment_data)

    def get_payment_history(self) -> Dict:
        """Get payment history"""
        return self._request('/payments/history')


def run_examples():
    """Run API client examples"""
    print("🚀 Nu3PBnB API Client Examples\n")

    # Initialize API client
    api = Nu3PBnBAPI('nu3pbnb_api_key_2024')

    try:
        # Example 1: Get all listings
        print("📋 Example 1: Getting all listings...")
        listings = api.get_listings({'limit': 5})
        print(f"Found {len(listings['listings'])} listings\n")

        # Example 2: Search listings
        print("🔍 Example 2: Searching listings...")
        search_results = api.search_listings({
            'location': 'New York',
            'maxPrice': 200
        })
        print(f"Found {len(search_results['listings'])} listings in New York under $200\n")

        # Example 3: Register a new user
        print("👤 Example 3: Registering a new user...")
        new_user = api.register({
            'email': 'testuser@example.com',
            'password': 'password123',
            'firstName': 'Test',
            'lastName': 'User',
            'role': 'guest'
        })
        print(f"Registered user: {new_user['user']['firstName']} {new_user['user']['lastName']}\n")

        # Example 4: Get user profile
        print("👤 Example 4: Getting user profile...")
        profile = api.get_profile()
        print(f"User profile: {profile['user']['email']}\n")

        # Example 5: Get a specific listing
        if listings['listings']:
            first_listing = listings['listings'][0]
            print("🏠 Example 5: Getting specific listing...")
            listing = api.get_listing(first_listing['_id'])
            print(f"Listing: {listing['listing']['title']} - ${listing['listing']['price']}/night\n")

            # Example 6: Get reviews for the listing
            print("⭐ Example 6: Getting listing reviews...")
            reviews = api.get_listing_reviews(first_listing['_id'])
            print(f"Found {len(reviews['reviews'])} reviews\n")

            # Example 7: Create a booking (if user is logged in)
            print("📅 Example 7: Creating a booking request...")
            booking = api.create_booking({
                'listingId': first_listing['_id'],
                'checkIn': '2024-02-15',
                'checkOut': '2024-02-20',
                'guests': 2,
                'totalPrice': 750,
                'message': 'Looking forward to our stay!'
            })
            print(f"Created booking: {booking['booking']['status']}\n")

            # Example 8: Send a message to the host
            print("💬 Example 8: Sending a message...")
            message = api.send_message({
                'recipientId': first_listing['host']['_id'],
                'listingId': first_listing['_id'],
                'content': 'Hi! I\'m interested in your property. Is it available for the dates I requested?'
            })
            print("Message sent successfully\n")

            # Example 9: Get user bookings
            print("📋 Example 9: Getting user bookings...")
            user_bookings = api.get_bookings()
            print(f"User has {len(user_bookings['bookings'])} bookings\n")

            # Example 10: Get payment methods
            print("💳 Example 10: Getting payment methods...")
            payment_methods = api.get_payment_methods()
            print(f"Supported payment methods: {', '.join(payment_methods['supportedMethods'])}\n")

        # Example 11: Get popular listings
        print("🔥 Example 11: Getting popular listings...")
        popular_listings = api.get_popular_listings()
        print(f"Found {len(popular_listings['listings'])} popular listings\n")

        print("✅ All examples completed successfully!")

    except Exception as error:
        print(f"❌ Error running examples: {error}")


if __name__ == "__main__":
    run_examples() 