import requests
import sys
import json
import time
from datetime import datetime

class Iteration3SpecificTester:
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

    def authenticate(self):
        """Login with admin credentials"""
        try:
            response = requests.post(
                f"{self.api_base}/auth/login",
                json={"email": "admin@orderflow.com", "password": "admin123"},
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get('token')
                print("✅ Authentication successful")
                return True
            else:
                print("❌ Authentication failed")
                return False
        except Exception as e:
            print(f"❌ Authentication error: {e}")
            return False

    def test_orders_sorted_ascending(self):
        """Test that orders are returned sorted by created_at ascending (oldest first)"""
        try:
            headers = {'Authorization': f'Bearer {self.token}'}
            response = requests.get(f"{self.api_base}/orders", headers=headers, timeout=10)
            
            if response.status_code == 200:
                orders = response.json()
                if len(orders) >= 2:
                    # Check if orders are sorted by created_at ascending
                    is_sorted = True
                    for i in range(len(orders) - 1):
                        current_date = datetime.fromisoformat(orders[i]['created_at'].replace('Z', '+00:00'))
                        next_date = datetime.fromisoformat(orders[i+1]['created_at'].replace('Z', '+00:00'))
                        if current_date > next_date:
                            is_sorted = False
                            break
                    
                    if is_sorted:
                        self.log_result("Orders Sorted Ascending", True, f"Found {len(orders)} orders correctly sorted oldest first")
                        return True
                    else:
                        self.log_result("Orders Sorted Ascending", False, "Orders not sorted correctly - found newer order before older order")
                        return False
                else:
                    self.log_result("Orders Sorted Ascending", True, f"Only {len(orders)} orders found, sorting cannot be verified but no errors")
                    return True
            else:
                self.log_result("Orders Sorted Ascending", False, f"Failed to get orders: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Orders Sorted Ascending", False, f"Exception: {e}")
            return False

    def test_masa_dropdown_values(self):
        """Test creating orders with masa dropdown values (XS, S, M, L, XL)"""
        # First create a test client
        try:
            headers = {'Authorization': f'Bearer {self.token}', 'Content-Type': 'application/json'}
            
            # Create test client
            client_data = {
                "name": "Test",
                "surname": "MasaUser", 
                "ig_name": "testmasauser"
            }
            client_response = requests.post(f"{self.api_base}/clients", json=client_data, headers=headers, timeout=10)
            
            if client_response.status_code != 200:
                self.log_result("Masa Dropdown Values", False, "Failed to create test client")
                return False
                
            client_id = client_response.json()['id']
            
            # Test each masa value
            masa_values = ['XS', 'S', 'M', 'L', 'XL']
            successful_orders = []
            
            for masa in masa_values:
                order_data = {
                    "client_id": client_id,
                    "total_price": 2500.0,
                    "masa": masa,
                    "notes": f"Test order with masa {masa}"
                }
                
                order_response = requests.post(f"{self.api_base}/orders", json=order_data, headers=headers, timeout=10)
                
                if order_response.status_code == 200:
                    order_result = order_response.json()
                    if order_result.get('masa') == masa:
                        successful_orders.append(masa)
                    
            # Cleanup - delete test orders and client
            orders_response = requests.get(f"{self.api_base}/orders", headers=headers)
            if orders_response.status_code == 200:
                orders = orders_response.json()
                for order in orders:
                    if order.get('client_id') == client_id:
                        requests.delete(f"{self.api_base}/orders/{order['id']}", headers=headers)
            
            requests.delete(f"{self.api_base}/clients/{client_id}", headers=headers)
            
            if len(successful_orders) == len(masa_values):
                self.log_result("Masa Dropdown Values", True, f"Successfully created orders with all masa values: {successful_orders}")
                return True
            else:
                self.log_result("Masa Dropdown Values", False, f"Only {len(successful_orders)}/{len(masa_values)} masa values worked: {successful_orders}")
                return False
                
        except Exception as e:
            self.log_result("Masa Dropdown Values", False, f"Exception: {e}")
            return False

    def test_no_transporti_field_required(self):
        """Test that orders can be created without transporti field (removed feature)"""
        try:
            headers = {'Authorization': f'Bearer {self.token}', 'Content-Type': 'application/json'}
            
            # Create test client
            client_data = {
                "name": "Test",
                "surname": "NoTransporti", 
                "ig_name": "testnoshipping"
            }
            client_response = requests.post(f"{self.api_base}/clients", json=client_data, headers=headers, timeout=10)
            
            if client_response.status_code != 200:
                self.log_result("No Transporti Field Required", False, "Failed to create test client")
                return False
                
            client_id = client_response.json()['id']
            
            # Create order without any shipping/transporti field
            order_data = {
                "client_id": client_id,
                "total_price": 3000.0,
                "masa": "M",
                "notes": "Test order without transporti field"
            }
            
            order_response = requests.post(f"{self.api_base}/orders", json=order_data, headers=headers, timeout=10)
            
            success = order_response.status_code == 200
            
            # Cleanup
            if success:
                order_id = order_response.json()['id']
                requests.delete(f"{self.api_base}/orders/{order_id}", headers=headers)
            requests.delete(f"{self.api_base}/clients/{client_id}", headers=headers)
            
            if success:
                self.log_result("No Transporti Field Required", True, "Order created successfully without transporti field")
                return True
            else:
                self.log_result("No Transporti Field Required", False, f"Failed to create order: {order_response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("No Transporti Field Required", False, f"Exception: {e}")
            return False

    def run_tests(self):
        """Run all iteration 3 specific tests"""
        print("🚀 Starting Iteration 3 Specific Tests...")
        print(f"📡 Backend URL: {self.base_url}")
        print("=" * 60)

        if not self.authenticate():
            print("❌ Authentication failed, cannot continue")
            return False

        print("\n📋 ITERATION 3 CHANGES TESTING")
        
        # Test 1: Orders sorted ascending (oldest first)
        self.test_orders_sorted_ascending()
        
        # Test 2: Masa dropdown values work
        self.test_masa_dropdown_values()
        
        # Test 3: No transporti field required
        self.test_no_transporti_field_required()

        # Final results
        print("\n" + "=" * 60)
        print(f"📊 ITERATION 3 TEST RESULTS")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        success_rate = (self.tests_passed/self.tests_run*100) if self.tests_run > 0 else 0
        print(f"Success Rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = Iteration3SpecificTester()
    success = tester.run_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())