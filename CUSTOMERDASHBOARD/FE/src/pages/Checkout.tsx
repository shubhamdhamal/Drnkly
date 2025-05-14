import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ChevronRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { CartItem } from '../context/CartContext';


function Checkout() {
  const navigate = useNavigate();
  const { items, setItems } = useCart(); // Ensure setItems is available in context
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [phoneError, setPhoneError] = useState('');
  const [formError, setFormError] = useState('');
  const userId = localStorage.getItem('userId');

  // 🛒 Fetch Cart Items from Backend
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await axios.get(`https://peghouse.in/api/cart/${userId}`);
        setItems(res.data.items);
      } catch (err) {
        console.error('Error fetching cart:', err);
      }
    };

    if (userId) fetchCart();
  }, [userId, setItems]);

  const orderTotal = items && items.length
  ? items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  : 0;

  const deliveryCharges = 100.00;
  const platform = 12.00;
  const gst = 5.00;
  const gstAmount = (orderTotal * gst) / 100;
  const total = orderTotal + deliveryCharges +platform + gstAmount;

  // 🧾 Submit Order
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const userId = localStorage.getItem('userId');
    if (!userId) return alert("User not logged in");

    // Ensure all address fields are filled
    if (!address.fullName || !address.phone || !address.street || !address.city || !address.state || !address.pincode) {
      return alert("Please fill in all the fields.");
    }
     // Ensure phone number is exactly 10 digits long
     if (address.phone.length !== 10) {
      setPhoneError("Phone number must be exactly 10 digits.");
      return;
    } else {
      setPhoneError('');
    }
    const allowedPincodes = [
      '411004', '411040', '410506', '410509', '413132', '411032', '411035', '412411', '412205', '412201', 
      '412105', '412211', '412411', '412206', '410507', '411042', '412206', '410401', '411046', '412206', 
      '410501', '410507', '412211', '410505', '412218', '411003', '412408', '411051', '412205', '411042', 
      '412211', '412410', '410502', '413114', '412212', '410502', '412206', '411021', '412401', '412205', 
      '410509', '412207', '412404', '411007', '411027', '411007', '412406', '412402', '412405', '412204', 
      '410501', '411002', '410502', '411045', '411007', '413102', '413133', '413102', '413102', '412206', 
      '411021', '413103', '412206', '413801', '410506', '412108', '413104', '412410', '412303', '412203', 
      '412108', '412209', '413103', '410401', '411042', '413104', '413130', '413105', '410509', '412301', 
      '412301', '413103', '412204', '412205', '412206', '410509', '412402', '411026', '411039', '410501', 
      '412106', '411042', '411042', '411038', '412206', '410513', '411037', '413106', '412301', '413104', 
      '412202', '412411', '412203', '413801', '411003', '412208', '411001', '411031', '410501', '412301', 
      '410506', '410503', '412105', '410513', '410502', '412206', '412114', '412409', '412105', '412211', 
      '412218', '410505', '411019', '411019', '412101', '411005', '412207', '413132', '412213', '411001', 
      '411012', '413801', '413801', '412305', '410505', '412311', '411004', '412213', '412402', '412109', 
      '412101', '412214', '413801', '410502', '413110', '410506', '410508', '412403', '412205', '411043', 
      '412208', '411015', '411041', '413104', '412409', '411015', '410509', '412409', '412301', '410505', 
      '411042', '413102', '411001', '411014', '411003', '412402', '411038', '411004', '412216', '410501', 
      '412203', '412211', '412209', '411007', '410516', '412301', '412405', '412408', '411042', '411001', 
      '411042', '410505', '413120', '412408', '413801', '410502', '412205', '410509', '411016', '412210', 
      '413801', '411016', '410505', '412102', '413102', '412401', '412213', '412104', '411042', '411003', 
      '411028', '411013', '412311', '412206', '412305', '412213', '413106', '413801', '412206', '412208', 
      '410504', '412409', '412306', '411025', '411032', '412210', '413106', '413106', '412101', '410507', 
      '411057', '412106', '410402', '413102', '412213', '411019', '410509', '410504', '412208', '412303', 
      '412303', '412305', '413102', '412206', '410502', '410513', '412201', '412215', '412404', '412107', 
      '410403', '413114', '413105', '413106', '412311', '411017', '413106', '410501', '412205', '413110', 
      '412107', '412202', '410405', '412213', '412206', '412412', '412219', '412106', '410505', '412218', 
      '411002', '412205', '412208', '412206', '412213', '412209', '412306', '410405', '413102', '412210', 
      '412220', '412204', '412206', '413102', '410405', '412206', '410405', '411052', '410506', '411034', 
      '411011', '412107', '412108', '412214', '413133', '413120', '411046', '413104', '412218', '413104', 
      '412203', '412213', '412403', '412205', '412207', '412205', '413130', '411024', '411003', '411003', 
      '411003', '410502', '412301', '411042', '410502', '412214', '410504', '410502', '411042', '413116', 
      '410301', '412106', '412102', '410502', '413105', '412402', '412108', '412205', '412205', '410504', 
      '411048', '412203', '412203', '413114', '412409', '412203', '412205', '410505', '412212', '412301', 
      '412404', '411042', '412412', '412303', '412207', '412108', '412205', '412209', '412108', '411048', 
      '411048', '410509', '412216', '412207', '412202', '412103', '412103', '412303', '411038', '410501', 
      '410505', '411023', '412108', '412201', '410511', '412107', '413104', '413802', '410505', '410501', 
      '412213', '410402', '410512', '412219', '410401', '410509', '410502', '411003', '412406', '413103', 
      '410503', '412103', '411042', '411047', '411030', '410401', '410401', '413110', '413132', '410510', 
      '412201', '412216', '411002', '411019', '413130', '412409', '412219', '410501', '410515', '412206', 
      '412311', '413130', '410405', '412108', '413115', '413115', '412206', '412104', '412218', '413110', 
      '410503', '412409', '412211', '412311', '412305', '411023', '411011', '412107', '412410', '410502', 
      '412213', '412307', '412307', '412213', '412105', '411037', '411057', '411018', '412303', '413102', 
      '413102', '413802', '412220', '411016', '411028', '412304', '412107', '412107', '412105', '413110', 
      '412208', '411036', '411036', '412304', '412306', '411042', '411048', '411008', '411023', '411045', 
      '411001', '412402', '412410', '411002', '411041', '412108', '410405', '412203', '413801', '411030', 
      '410504', '410503', '412213', '412206', '412214', '411052', '412104', '412206', '412303', '411018', 
      '412206', '412409', '412211', '413132', '411031', '412102', '412220', '413120', '410505', '412209', 
      '410504', '410502', '412210', '413114', '412102', '413102', '410502', '412406', '412210', '413114', 
      '410506', '412101', '411042', '412409', '410504', '411044', '412403', '412212', '412203', '410505', 
      '413132', '410505', '412301', '413110', '412303', '412301', '412206', '412107', '412203', '412104', 
      '410504', '412406', '410512', '412409', '412311', '410502', '411009', '411009', '413130', '412206', 
      '412219', '412108', '410406', '412216', '410512', '410509', '412308', '412409', '410503', '412401', 
      '410501', '412408', '413102', '412412', '410504', '412301', '412303', '410505', '411017', '411018', 
      '410504', '412216', '411017', '412305', '411042', '412104', '412206', '410509', '412108', '411019', 
      '411001', '411001', '411002', '411001', '411001', '411005', '410302', '412207', '412214', '413105', 
      '412104', '410505', '410509', '410502', '412104', '412305', '413114', '411020', '411042', '412209', 
      '412211', '410504', '412303', '410501', '411030', '411011', '413130', '412101', '411002', '412206', 
      '413114', '410505', '411042', '412409', '412219', '412107', '412114', '413801', '411030', '411005', 
      '412404', '411001', '412211', '411030', '412109', '412202', '412213', '410515', '412303', '412408', 
      '411037', '412101', '412208', '410505', '412206', '411027', '411042', '413102', '413104', '413104', 
      '413103', '412205', '411028', '412301', '412106', '413133', '412401', '412218', '412404', '411030', 
      '413114', '412108', '413130', '413103', '410506', '412208', '412206', '412202', '412205', '410516', 
      '413801', '413110', '412210', '413102', '412402', '412107', '410505', '410511', '413114', '413102', 
      '412210', '411016', '411005', '410406', '411023', '412205', '412301', '410501', '413116', '412202', 
      '411002', '412105', '412306', '412301', '410502', '413102', '412301', '411022', '412204', '413103', 
      '411021', '411042', '411042', '411037', '412208', '410405', '412106', '412218', '410506', '412208', 
      '410507', '410509', '412409', '412114', '412213', '410502', '412211', '413102', '412205', '412107', 
      '413104', '412104', '412207', '411019', '411019', '412110', '410512', '410509', '412206', '410513', 
      '412402', '412312', '412409', '413104', '412412', '410507', '413102', '413102', '412211', '411042', 
      '410506', '412308', '412202', '410502', '412206', '411023', '412402', '410502', '413106', '412207', 
      '412106', '412106', '412411', '411041', '412206', '410501', '412412', '410503', '412103', '410510', 
      '412211', '412401', '411014', '412216', '412308', '412207', '410504', '412305', '412301', '410505', 
      '410507', '411042', '413120', '412206', '412212', '412209', '412215', '412205', '410501', '412312', 
      '410405', '412212', '412205', '412206', '412206', '412404', '411032', '410507', '411015', '412208', 
      '413120', '412104', '411057', '412306', '410501', '413114', '412207', '412303', '412213', '411040', 
      '411058', '412404', '413105', '412213', '411044', '412214', '412214', '410504', '410502', '410505', 
      '411006', '411001'
    ];
    
    if (!allowedPincodes.includes(address.pincode)) {
      return alert("Sorry! We currently deliver only to selected areas. Please check the pincode.");
    }

        if (address.city.trim().toLowerCase() !== 'pune'.toLowerCase()) {
          return alert("Sorry! We currently deliver only in City (Pune)");
        }
        
  
    try {
      // 🔁 Step 1: Fetch actual cart from backend
      const cartRes = await axios.get(`https://peghouse.in/api/cart/${userId}`);
      const cartItems = cartRes.data.items;
  
      if (!cartItems || cartItems.length === 0) {
        return alert("Your cart is empty!");
      }
  
      // 🛒 Step 2: Format items
      const formattedItems = cartItems.map((item: any) => ({
        productId: item.productId?._id || item.productId || item._id,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity
      }));
  
      const orderTotal = items.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);
      const deliveryCharges = 100;
      const platform = 12;
      const gst = 5;
      const gstAmount = (orderTotal * gst) / 100;
      const totalAmount = orderTotal + deliveryCharges + platform + gstAmount;
      
  
      // 🧾 Step 3: Place order
      const res = await axios.post('https://peghouse.in/api/orders', {
        userId,
        items: formattedItems,
        address,
        totalAmount
      });
  
      localStorage.setItem('latestOrderId', res.data.order._id);
      navigate('/payment');
    } catch (error) {
      console.error("Order failed", error);
      alert("Something went wrong while placing the order");
    }
  };
  
  

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white p-4 flex items-center">
        <ArrowLeft className="cursor-pointer" onClick={() => navigate(-1)} />
        <h1 className="text-xl font-semibold mx-auto">Checkout</h1>
      </div>

      <div className="max-w-3xl mx-auto p-4">
        {/* Delivery Address */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <MapPin className="text-gray-600 mr-2" />
              <h2 className="text-lg font-semibold">Delivery Address</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                    type="tel"
                    value={address.phone}
                    onChange={(e) => {
                      const phone = e.target.value;
                      // Update phone and check if it's valid
                      if (phone.length <= 10) {
                        setAddress({ ...address, phone });
                      }
                    }}
                    className={`w-full px-4 py-3 rounded-lg border ${address.phone.length !== 10 ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                    maxLength={10}
                    placeholder="Enter 10-digit phone number"
                  />
                    {address.phone.length !== 10 && address.phone.length > 0 && (
                    <p className="text-red-500 text-sm">Phone number must be exactly 10 digits.</p>
                  )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
              <input
                type="text"
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
              <input
                type="text"
                value={address.pincode}
                onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
<div className="space-y-4">
  {items.map((item, index) => (
    <div key={index} className="flex items-center justify-between">
      <div className="flex items-center">
        <img 
          src={item.image} 
          alt={item.name}
          className="w-16 h-16 object-cover rounded-lg mr-4"
        />
        <div>
          <h3 className="font-medium">{item.name}</h3>
          <p className="text-gray-600">Quantity: {item.quantity}</p>
        </div>
      </div>
      
      {/* Item Price */}
      <div className="flex flex-col">
        <div className="flex justify-between mb-4">
          <span className="text-gray-600">Item Price</span>
          <span className="text-gray-900 font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
        </div>

        {/* Service Fee (35%) only for Drinks */}
        {item.category === "Drinks" && (
          <div className="flex justify-between mb-4">
            <span className="text-gray-600">Service Fee (35%)</span>
            <span className="text-gray-900 font-medium">₹{((item.price * item.quantity) * 0.35).toFixed(2)}</span>
          </div>
        )}

        {/* Total (Item + Service Fee if Drinks) */}
        <div className="flex justify-between mb-6">
          <span className="text-gray-600">Total (Item + Service Fee)</span>
          <span className="text-gray-900 font-medium">
            ₹{(
              item.category === "Drinks" 
              ? (item.price * item.quantity) * 1.35 
              : item.price * item.quantity
            ).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  ))}
</div>


          <div className="border-t mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-gray-600">
               <span>Subtotal</span>
    <span>₹{
      items.reduce((total, item) => total + (item.price * item.quantity * 1.35), 0).toFixed(2)
    }</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span>₹{deliveryCharges.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Platform Fee</span>
              <span>₹{platform.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>GST (18%)</span> 
              <span>₹{((orderTotal) * 0.18).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg pt-2">
              <span>Total</span>
              <span>₹{(orderTotal + 100 + 12 + (orderTotal) * 0.18).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Proceed to Payment Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <span>Proceed to Payment</span>
          <ChevronRight className="ml-2" />
        </button>
      </div>
    </div>
  );
}

export default Checkout;