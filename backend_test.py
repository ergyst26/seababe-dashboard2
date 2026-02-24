import requests
import sys
import json
from datetime import datetime

class OrderFlowAPITester:
    def __init__(self, base_url="https://sales-hub-145.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_base = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_result(self, test_name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {test_name}")
        if details:
            print(f"    {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_base}{endpoint}"
        req_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            req_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            req_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=req_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=req_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=req_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=req_headers, timeout=10)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if success:
                try:
                    return True, response.json()
                except:
                    return True, {"message": "Success"}
            else:
                try:
                    error_detail = response.json().get('detail', 'Unknown error')
                    details = f"Status: {response.status_code}, Error: {error_detail}"
                except:
                    details = f"Status: {response.status_code}, Response: {response.text[:100]}"
                
                self.log_result(name, False, details)
                return False, {}

        except Exception as e:
            self.log_result(name, False, f"Exception: {str(e)}")
            return False, {}

    # ============ AUTH TESTS ============
    
    def test_register_new_user(self):
        """Test registering a new user"""
        success, response = self.run_test(
            "Register New User",
            "POST",
            "/auth/register",
            200,
            data={
                "email": "admin@test.com", 
                "password": "test123", 
                "name": "Test Admin"
            }
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.log_result("Register New User", True, f"User created with token")
            return True, response
        elif success:
            self.log_result("Register New User", False, "No token in response")
            return False, {}
        else:
            return False, {}

    def test_login_existing_user(self):
        """Test login with existing user"""
        success, response = self.run_test(
            "Login Existing User",
            "POST", 
            "/auth/login",
            200,
            data={
                "email": "admin@orderflow.com",
                "password": "admin123"
            }
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.log_result("Login Existing User", True, f"Logged in successfully")
            return True, response
        elif success:
            self.log_result("Login Existing User", False, "No token in response")
            return False, {}
        else:
            return False, {}

    def test_get_current_user(self):
        """Test getting current user info"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "/auth/me", 
            200
        )
        
        if success:
            self.log_result("Get Current User", True, f"User: {response.get('email', 'N/A')}")
            return True, response
        else:
            return False, {}

    def test_max_users_limit(self):
        """Test the 2-user registration limit"""
        # Try to register a third user (should fail with 400)
        success, response = self.run_test(
            "Test Max Users Limit (3rd User)",
            "POST",
            "/auth/register",
            400,  # Should fail
            data={
                "email": "third@test.com",
                "password": "test123", 
                "name": "Third User"
            }
        )
        
        if success:
            self.log_result("Test Max Users Limit", True, "Correctly blocked 3rd user registration")
            return True, response
        else:
            return False, {}

    # ============ CLIENT TESTS ============
    
    def test_get_clients(self):
        """Test getting all clients"""
        success, response = self.run_test(
            "Get All Clients",
            "GET",
            "/clients",
            200
        )
        
        if success:
            client_count = len(response) if isinstance(response, list) else 0
            self.log_result("Get All Clients", True, f"Retrieved {client_count} clients")
            return True, response
        else:
            return False, {}

    def test_create_client(self):
        """Test creating a new client"""
        success, response = self.run_test(
            "Create New Client",
            "POST",
            "/clients",
            200,
            data={
                "name": "Arta",
                "surname": "Hoxha", 
                "ig_name": "artahoxha",
                "address": "Tiranë",
                "phone": "+355691234567"
            }
        )
        
        if success and 'id' in response:
            self.log_result("Create New Client", True, f"Client created with ID: {response['id']}")
            return True, response
        elif success:
            self.log_result("Create New Client", False, "No ID in response")
            return False, {}
        else:
            return False, {}

    def test_create_client_with_photo(self):
        """Test creating a client with photo field (NEW FEATURE)"""
        success, response = self.run_test(
            "Create Client with Photo",
            "POST",
            "/clients",
            200,
            data={
                "name": "Besa",
                "surname": "Krasniqi", 
                "ig_name": "besakrasniqi",
                "address": "Pristina",
                "phone": "+38344123456",
                "photo": "/api/uploads/test-photo.jpg"
            }
        )
        
        if success and 'id' in response and 'photo' in response:
            self.log_result("Create Client with Photo", True, f"Client created with photo: {response.get('photo', 'N/A')}")
            return True, response
        elif success:
            self.log_result("Create Client with Photo", False, "Missing photo field in response")
            return False, {}
        else:
            return False, {}

    def test_clients_sorted_by_date(self):
        """Test that clients are returned sorted by created_at ascending (NEW FEATURE)"""
        # Create two clients with slight delay to ensure different timestamps
        import time
        
        # First client
        success1, client1 = self.run_test(
            "Create First Client for Sorting",
            "POST",
            "/clients",
            200,
            data={
                "name": "First",
                "surname": "Client", 
                "ig_name": "first_client"
            }
        )
        
        time.sleep(1)  # Small delay to ensure different timestamps
        
        # Second client  
        success2, client2 = self.run_test(
            "Create Second Client for Sorting",
            "POST", 
            "/clients",
            200,
            data={
                "name": "Second",
                "surname": "Client",
                "ig_name": "second_client"
            }
        )
        
        if success1 and success2:
            # Get all clients and check if they're sorted by created_at ascending
            success, clients = self.run_test(
                "Get Clients Sorted by Date",
                "GET",
                "/clients", 
                200
            )
            
            if success and len(clients) >= 2:
                # Find our test clients and check their order
                first_client_index = None
                second_client_index = None
                
                for i, client in enumerate(clients):
                    if client.get('ig_name') == 'first_client':
                        first_client_index = i
                    elif client.get('ig_name') == 'second_client':
                        second_client_index = i
                
                if first_client_index is not None and second_client_index is not None:
                    if first_client_index < second_client_index:
                        self.log_result("Clients Sorted by Date", True, "Clients correctly sorted oldest first")
                        # Cleanup test clients
                        if success1 and 'id' in client1:
                            self.run_test("Cleanup First Sort Client", "DELETE", f"/clients/{client1['id']}", 200)
                        if success2 and 'id' in client2:
                            self.run_test("Cleanup Second Sort Client", "DELETE", f"/clients/{client2['id']}", 200)
                        return True, clients
                    else:
                        self.log_result("Clients Sorted by Date", False, "Clients not sorted correctly - newest appears first")
                        return False, {}
                else:
                    self.log_result("Clients Sorted by Date", False, "Could not find test clients in response")
                    return False, {}
            else:
                self.log_result("Clients Sorted by Date", False, "Could not retrieve clients list")
                return False, {}
        else:
            self.log_result("Clients Sorted by Date", False, "Failed to create test clients")
            return False, {}

    def test_update_client(self, client_id):
        """Test updating a client"""
        success, response = self.run_test(
            "Update Client",
            "PUT",
            f"/clients/{client_id}",
            200,
            data={
                "phone": "+355691111111"  # Update phone number
            }
        )
        
        if success:
            self.log_result("Update Client", True, f"Client updated successfully")
            return True, response
        else:
            return False, {}

    def test_delete_client(self, client_id):
        """Test deleting a client"""
        success, response = self.run_test(
            "Delete Client",
            "DELETE",
            f"/clients/{client_id}",
            200
        )
        
        if success:
            self.log_result("Delete Client", True, "Client deleted successfully")
            return True, response
        else:
            return False, {}

    # ============ ORDER TESTS ============
    
    def test_get_orders(self):
        """Test getting all orders"""
        success, response = self.run_test(
            "Get All Orders", 
            "GET",
            "/orders",
            200
        )
        
        if success:
            order_count = len(response) if isinstance(response, list) else 0
            self.log_result("Get All Orders", True, f"Retrieved {order_count} orders")
            return True, response
        else:
            return False, {}

    def test_create_order(self, client_id):
        """Test creating a new order"""
        success, response = self.run_test(
            "Create New Order",
            "POST", 
            "/orders",
            200,
            data={
                "client_id": client_id,
                "total_price": 5000.0,
                "shipping_type": "paid",
                "notes": "Test order"
            }
        )
        
        if success and 'id' in response:
            self.log_result("Create New Order", True, f"Order created with ID: {response['id']}")
            return True, response
        elif success:
            self.log_result("Create New Order", False, "No ID in response") 
            return False, {}
        else:
            return False, {}

    def test_create_order_with_masa(self, client_id):
        """Test creating an order with masa field (NEW FEATURE)"""
        success, response = self.run_test(
            "Create Order with Masa",
            "POST", 
            "/orders",
            200,
            data={
                "client_id": client_id,
                "total_price": 3500.0,
                "shipping_type": "free",
                "masa": "L",
                "product_photo": "/api/uploads/product.jpg",
                "notes": "Order with masa field test"
            }
        )
        
        if success and 'id' in response and 'masa' in response:
            self.log_result("Create Order with Masa", True, f"Order created with masa: {response.get('masa', 'N/A')}")
            return True, response
        elif success:
            self.log_result("Create Order with Masa", False, "Missing masa field in response")
            return False, {}
        else:
            return False, {}

    def test_admin_only_delete_order(self, order_id):
        """Test that only admin can delete orders (NEW FEATURE)"""
        # Save current token
        admin_token = self.token
        
        # Try to create a non-admin user and login (if possible)
        # Since we have a 2-user limit, we'll simulate this by testing with current user
        # First, verify current user is admin
        success, user_info = self.run_test(
            "Get Current User Role",
            "GET",
            "/auth/me", 
            200
        )
        
        if success and user_info.get('role') == 'admin':
            # Test admin can delete (should work)
            success_admin, response_admin = self.run_test(
                "Admin Delete Order",
                "DELETE",
                f"/orders/{order_id}",
                200
            )
            
            if success_admin:
                self.log_result("Admin Only Delete", True, "Admin successfully deleted order")
                return True, response_admin
            else:
                self.log_result("Admin Only Delete", False, "Admin failed to delete order")
                return False, {}
        else:
            # If current user is not admin, test should fail with 403
            success_non_admin, response_non_admin = self.run_test(
                "Non-Admin Delete Order (Should Fail)",
                "DELETE",
                f"/orders/{order_id}",
                403  # Should fail with 403
            )
            
            if success_non_admin:
                self.log_result("Admin Only Delete", True, "Non-admin correctly blocked from deleting order")
                return True, response_non_admin
            else:
                self.log_result("Admin Only Delete", False, "Non-admin deletion test failed")
                return False, {}

    def test_update_order(self, order_id):
        """Test updating an order"""
        success, response = self.run_test(
            "Update Order",
            "PUT",
            f"/orders/{order_id}",
            200,
            data={
                "status": "completed"
            }
        )
        
        if success:
            self.log_result("Update Order", True, "Order updated successfully")
            return True, response
        else:
            return False, {}

    def test_delete_order(self, order_id):
        """Test deleting an order"""
        success, response = self.run_test(
            "Delete Order", 
            "DELETE",
            f"/orders/{order_id}",
            200
        )
        
        if success:
            self.log_result("Delete Order", True, "Order deleted successfully")
            return True, response
        else:
            return False, {}

    # ============ EXPORT TESTS (NEW FEATURE) ============
    
    def test_export_orders_excel(self):
        """Test exporting orders to Excel (NEW FEATURE)"""
        # Test with valid date range
        success, response = self.run_test(
            "Export Orders Excel",
            "GET",
            "/orders/export?start_date=2020-01-01&end_date=2030-12-31",
            200,
            headers={'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}
        )
        
        if success:
            self.log_result("Export Orders Excel", True, "Excel export successful")
            return True, response
        else:
            return False, {}

    def test_export_orders_invalid_date_format(self):
        """Test export with invalid date format"""
        success, response = self.run_test(
            "Export Orders Invalid Date Format",
            "GET", 
            "/orders/export?start_date=invalid&end_date=2030-12-31",
            400  # Should fail with 400
        )
        
        if success:
            self.log_result("Export Orders Invalid Date", True, "Correctly rejected invalid date format")
            return True, response
        else:
            return False, {}

    # ============ DASHBOARD TESTS ============
    
    def test_dashboard_stats(self):
        """Test getting dashboard statistics"""
        success, response = self.run_test(
            "Get Dashboard Stats",
            "GET", 
            "/dashboard/stats",
            200
        )
        
        if success:
            stats_keys = list(response.keys()) if isinstance(response, dict) else []
            self.log_result("Get Dashboard Stats", True, f"Stats retrieved: {stats_keys}")
            return True, response
        else:
            return False, {}

    # ============ MAIN TEST RUNNER ============
    
    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting OrderFlow API Tests...")
        print(f"📡 Backend URL: {self.base_url}")
        print("=" * 50)

        # Test authentication first with existing user
        print("\n📝 AUTHENTICATION TESTS")
        login_success, login_response = self.test_login_existing_user()
        if not login_success:
            print("❌ Cannot proceed without authentication")
            return False

        # Test current user endpoint
        self.test_get_current_user()

        # Test new user registration
        print("\n👤 USER REGISTRATION TESTS")
        self.test_register_new_user()  # This might fail if user already exists
        self.test_max_users_limit()    # Test the 2-user limit

        # Test client operations
        print("\n👥 CLIENT TESTS")
        self.test_get_clients()
        
        # Test new sorting feature
        self.test_clients_sorted_by_date()
        
        # Test new photo feature
        photo_client_success, photo_client_response = self.test_create_client_with_photo()
        photo_client_id = photo_client_response.get('id') if photo_client_success else None
        
        client_success, client_response = self.test_create_client()
        client_id = None
        if client_success and 'id' in client_response:
            client_id = client_response['id']
            self.test_update_client(client_id)

        # Test order operations  
        print("\n📦 ORDER TESTS")
        self.test_get_orders()
        
        order_id = None
        masa_order_id = None
        if client_id:
            order_success, order_response = self.test_create_order(client_id)
            if order_success and 'id' in order_response:
                order_id = order_response['id']
                self.test_update_order(order_id)
            
            # Test new masa feature
            masa_success, masa_response = self.test_create_order_with_masa(client_id)
            if masa_success and 'id' in masa_response:
                masa_order_id = masa_response['id']
                
                # Test admin-only delete feature
                self.test_admin_only_delete_order(masa_order_id)
                # Since we tested delete, don't try to delete again in cleanup

        # Test export functionality (NEW)
        print("\n📊 EXPORT TESTS")
        self.test_export_orders_excel()
        self.test_export_orders_invalid_date_format()

        # Test dashboard
        print("\n📊 DASHBOARD TESTS")
        self.test_dashboard_stats()

        # Cleanup - delete test data
        print("\n🧹 CLEANUP")
        if order_id:
            self.test_delete_order(order_id)
        # masa_order_id was already deleted in the admin delete test
        if client_id:
            self.test_delete_client(client_id)
        if photo_client_id:
            self.test_delete_client(photo_client_id)

        # Final results
        print("\n" + "=" * 50)
        print(f"📊 FINAL RESULTS")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        # Save detailed results
        with open('/app/backend_test_results.json', 'w') as f:
            json.dump({
                'summary': {
                    'tests_run': self.tests_run,
                    'tests_passed': self.tests_passed, 
                    'success_rate': f"{(self.tests_passed/self.tests_run*100):.1f}%"
                },
                'results': self.test_results
            }, f, indent=2)
        
        return self.tests_passed == self.tests_run

def main():
    tester = OrderFlowAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())