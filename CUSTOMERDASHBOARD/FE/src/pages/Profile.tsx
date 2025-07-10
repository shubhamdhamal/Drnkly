import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Edit2,
  FileText,
  LogOut,
  MapPin,
  MessageCircle,
  Send,
  Shield,
  ShoppingBag,
  User,
  Wine,
  X,
  Navigation
} from 'lucide-react';

// Define Message interface to fix the error
interface Message {
  text: string;
  isBot: boolean;
}

// Define FAQ data to fix the errors
const FAQ_DATA = [
  {
    q: "shop timings|दुकान वेळ|timing|वेळ",
    a: "Our shop is open from 10 AM to 1 AM every day.\nआमचं दुकान दररोज सकाळी १० ते रात्री १ वाजेपर्यंत उघडं असतं."
  },
  {
    q: "location|address|दुकान कुठे|पत्ता",
    a: "We have multiple stores across the city. Please check your nearest store using the location selector.\nशहरात आमची अनेक दुकाने आहेत. कृपया लोकेशन सिलेक्टर वापरून तुमच्या जवळचं दुकान तपासा."
  },
  {
    q: "brands|ब्रँड्स|विकता",
    a: "We offer a wide selection of premium brands including:\n\n🥃 Whiskey: Jack Daniel's, Glenfiddich, Chivas Regal\n🍷 Wine: Sula, Grover, Jacob's Creek\n🍺 Beer: Kingfisher, Heineken, Corona\n\nआम्ही प्रीमियम ब्रँड्सची विस्तृत निवड देतो."
  },
  {
    q: "delivery|डिलिव्हरी|होम डिलिव्हरी",
    a: "Yes, we offer home delivery! 🚚\n\n• Delivery Hours: 10 AM to 1 AM\n• Minimum Order: ₹500\n• Free delivery on orders above ₹500\n\nहो, आम्ही होम डिलिव्हरी देतो! 🚚"
  },
  {
    q: "payment|पेमेंट|payment methods|पैसे",
    a: "We accept multiple payment methods:\n\n💳 Credit/Debit Cards\n📱 UPI (GPay, PhonePe)\n💰 Cash on Delivery\n\nआम्ही विविध पेमेंट पद्धती स्वीकारतो."
  },
  {
    q: "age|वय|legal age|कायदेशीर वय",
    a: "Legal drinking age is 21 years. Valid ID proof is mandatory.\n\nकायदेशीर वय २१ वर्षे आहे. वैध ओळखपत्र आवश्यक आहे."
  },
  {
    q: "offers|ऑफर|discount|सूट",
    a: "🎉 Current Offers:\n\n• 10% off on premium whiskey\n• Buy 2 get 1 free on selected wines\n• Special weekend discounts\n\nCheck our app regularly for new offers!"
  },
  {
    q: "return|refund|परतावा|रिफंड",
    a: "Returns accepted only for damaged or incorrect products within 24 hours.\n\nनुकसान झालेल्या किंवा चुकीच्या प्रॉडक्टसाठी २४ तासांच्या आत परतावा स्वीकारला जातो."
  },
  {
    q: "hello|hi|hey|नमस्कार|हाय",
    a: "Hello! 👋 Welcome to Liquor Shop. How can I help you today?\n\nनमस्कार! 👋 लिकर शॉपमध्ये आपले स्वागत आहे. मी आपली कशी मदत करू शकतो?"
  },
  {
    q: "bye|goodbye|thank|धन्यवाद|बाय",
    a: "Thank you for chatting with us! 🙏 Have a great day!\n\nचॅट केल्याबद्दल धन्यवाद! 🙏 आपला दिवस चांगला जावो!"
  }
];

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [balance, setBalance] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState('pune, Maharashtra');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: '',
    phone: '',
    address: '',
    location: {
      latitude: null,
      longitude: null,
    }
  });
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  
  // Add missing state variables
  const [addresses, setAddresses] = useState<{id: string, address: string, city: string, pincode: string, type: string}[]>([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    address: '',
    city: '',
    pincode: '',
    type: 'Home'
  });
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [editAddressData, setEditAddressData] = useState({
    address: '',
    city: '',
    pincode: '',
    type: 'Home'
  });

  useEffect(() => {
  if (showAddAddress) {
    getLiveLocation();
  }
}, [showAddAddress]);

  // Fetch user profile data using useEffect
  useEffect(() => {
    

  const fetchUserProfile = async () => {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const response = await axios.get(`https://peghouse.in/api/users/${userId}`);
    const user = response.data;

    // ✅ Extract location from user
    const latitude = user?.location?.latitude;
    const longitude = user?.location?.longitude;

    console.log("🌍 User coordinates from DB:", { latitude, longitude });

    let resolvedAddress = user.address || '';

    // ✅ If coordinates are available, get address
    if (latitude && longitude) {
      const geoRes = await axios.get(`https://peghouse.in/api/addresses/from-coordinates`, {
        params: { latitude, longitude, userId }
      });
      resolvedAddress = geoRes.data.address || resolvedAddress;
      console.log("📍 Resolved address from coordinates:", resolvedAddress);
    }

    setUserInfo({
      name: user.name,
      phone: user.mobile,
      address: resolvedAddress,
      location: {
        latitude,
        longitude
      },
      city: user.city,        // Fetch the city
      state: user.state,      // Fetch the state
      dob: user.dob,          // Fetch the date of birth
      idProof: user.idProof,  // Fetch the ID proof
      selfDeclaration: user.selfDeclaration, // Fetch self-declaration status
      status: user.status     // Fetch the user’s status
    });
  } catch (error) {
    console.error('❌ Failed to fetch profile:', error);
  }
};

fetchUserProfile();


  fetchUserProfile();
}, []);


  // Add this just below userInfo fetch in useEffect
  const fetchSavedAddresses = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await axios.get(`https://peghouse.in/api/addresses/${userId}`);
      const saved = response.data;

      // Format into same shape you're using
      const formatted = saved.map((addr: any) => ({
        id: addr._id,
        address: addr.address,
        city: addr.city,
        pincode: addr.pincode,
        type: addr.type || 'Other'
      }));

      setAddresses(prev => {
        // Avoid duplication with profile address (primary)
        const nonPrimary = formatted.filter((a: any) => a.type !== 'Primary');
        return [
          { id: 'primary', address: userInfo.address, city: '', pincode: '', type: 'Primary' },
          ...nonPrimary
        ];
      });
    } catch (err) {
      console.error('❌ Failed to fetch addresses:', err);
    }
  };

  useEffect(() => {
    fetchSavedAddresses();
  }, [userInfo.address]);



  // Empty dependency array ensures this effect runs only once
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { 
      text: "Hello! 👋 Welcome to Liquor Shop. How can I help you today?\n\nनमस्कार! लिकर शॉपमध्ये आपले स्वागत आहे. मी आपली कशी मदत करू शकतो?", 
      isBot: true 
    },
    { 
      text: "You can ask me about:\n\n🕒 Shop timings\n🚚 Delivery\n💳 Payment methods\n🎁 Offers\n📜 Age requirements\n\nकृपया विचारा:\n\n🕒 दुकानाची वेळ\n🚚 डिलिव्हरी\n💳 पेमेंट\n🎁 ऑफर्स\n📜 वय आवश्यकता", 
      isBot: true 
    }
  ]);
  const [chatInput, setChatInput] = useState('');

  // The click handler for navigating to the Order History page
  const handleOrdersClick = () => {
    navigate('/order-history');  // Navigate to the OrderHistory page
  };

  const locations = [
    'Mumbai, Maharashtra',
    'Delhi, NCR',
    'Bangalore, Karnataka',
    'Pune, Maharashtra',
    'Hyderabad, Telangana'
  ];

  const handleAddBalance = () => {
    
  };
  
  const handleRateOrder = () => {
    alert('Rating system will be implemented here');
  };
  
  const handleLogout = () => {
    // Clear any stored user info (optional but recommended)
    localStorage.removeItem('userId');
    localStorage.removeItem('authToken');  // if you're using tokens
    
    // Navigate to Login page
    navigate('/login');
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    setShowLocationDropdown(false);
  };

  // Improve the input handling to ensure continuous typing
  const handleUserInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Get cursor position before update
    const cursorPosition = e.target.selectionStart;
  
    // For phone, validate only digits but don't interrupt typing
    if (name === 'phone') {
      // Allow only digits but don't restrict length during typing
      const digitsOnly = value.replace(/\D/g, '');
      
      // Update the state with digits only
      setUserInfo(prevState => ({
        ...prevState,
        [name]: digitsOnly
      }));
      
      // Use setTimeout to restore cursor position after state update
      setTimeout(() => {
        if (phoneInputRef.current) {
          phoneInputRef.current.focus();
          if (cursorPosition !== null) {
            // Adjust cursor position if characters were removed
            const newPosition = Math.min(cursorPosition, digitsOnly.length);
            phoneInputRef.current.setSelectionRange(newPosition, newPosition);
          }
        }
      }, 0);
      
      return;
    }
  
    // Update the state for other fields
    setUserInfo(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleSaveChanges = async () => {
    if (userInfo.phone.length !== 10) {
      alert('Mobile number must be exactly 10 digits.');
      return;
    }
  
    try {
      const userId = localStorage.getItem('userId');
      
      // Show loading indicator
      const saveButton = document.getElementById('saveProfileButton');
      if (saveButton) {
        saveButton.textContent = 'Saving...';
        saveButton.setAttribute('disabled', 'true');
      }
      
      const response = await axios.put(
        `https://peghouse.in/api/users/profile/${userId}`,
        userInfo
      );
      
      // Update the userInfo state with the response data
      setUserInfo(response.data);
      setIsEditing(false); // Save successful, now exit editing mode
      
      // Show success message
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      // Reset button state
      const saveButton = document.getElementById('saveProfileButton');
      if (saveButton) {
        saveButton.textContent = 'Save Profile';
        saveButton.removeAttribute('disabled');
      }
    }
  };

  const generateAIResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    // Check for greetings or thanks first
    const isGreeting = /\b(hello|hi|hey|नमस्कार|हाय)\b/i.test(lowerInput);
    const isFarewell = /\b(bye|goodbye|thank|धन्यवाद|बाय)\b/i.test(lowerInput);

    let matchedFAQ;
    if (isGreeting) {
      matchedFAQ = FAQ_DATA.find(faq => faq.q.includes("hello"));
    } else if (isFarewell) {
      matchedFAQ = FAQ_DATA.find(faq => faq.q.includes("bye"));
    } else {
      // Look for matching FAQ
      matchedFAQ = FAQ_DATA.find(faq => 
        faq.q.split('|').some(keyword => lowerInput.includes(keyword))
      );
    }

    if (matchedFAQ) {
      return matchedFAQ.a;
    }

    // Generate contextual response if no direct match
    if (lowerInput.includes('price') || lowerInput.includes('cost')) {
      return "Prices vary by brand and size. Please check our app or visit the store for current prices.\n\nकिंमती ब्रँड आणि साइझनुसार बदलतात. कृपया सध्याच्या किमतींसाठी आमचा ऍप तपासा किंवा स्टोरला भेट द्या.";
    }

    if (lowerInput.includes('cancel') || lowerInput.includes('रद्द')) {
      return "Orders can be cancelled within 5 minutes of placing them. Contact our support team for assistance.\n\nऑर्डर केल्यानंतर ५ मिनिटांच्या आत रद्द करता येतील. मदतीसाठी आमच्या सपोर्ट टीमशी संपर्क साधा.";
    }

    // Default response with suggestions
    return "I'm not quite sure about that. Here are some topics I can help you with:\n\n" +
           "• Shop timings and location\n" +
           "• Delivery information\n" +
           "• Payment methods\n" +
           "• Current offers\n" +
           "• Age requirements\n\n" +
           "You can also reach our support team at 1800-XXX-XXXX 📞";
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const userMessage = { text: chatInput, isBot: false };
    setChatMessages(prev => [...prev, userMessage]);

    // Generate AI response
    const aiResponse = generateAIResponse(chatInput);

    setTimeout(() => {
      setChatMessages(prev => [...prev, { text: aiResponse, isBot: true }]);
    }, 500);

    setChatInput('');
  };

  const BalanceSection = () => {
    return (
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-indigo-50">
        <div className="flex items-center justify-between py-4 px-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <span className="ml-4 text-lg font-medium">Drnkly Wallet</span>
          </div>
          <ChevronRight className="h-6 w-6 text-indigo-400" />
        </div>
  
        {/* Available Balance Display */}
        <div className="mt-6 px-6 bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-lg">Available Balance:</p>
          <div className="flex items-center">
            <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">₹{balance}</p>
            <button 
              onClick={handleAddBalance}
              className="ml-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
            >
              Add Money
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Additional state for product navigation
  const [productDetails, setProductDetails] = useState({
    whiskey: { id: "whiskey-123", name: "Premium Whiskey", discount: "20% OFF", image: "https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg" },
    wine: { id: "wine-456", name: "Red Wine", offer: "Buy 2 Get 1", image: "https://images.pexels.com/photos/3089663/pexels-photo-3089663.jpeg" },
    beer: { id: "beer-789", name: "Craft Beer", tag: "New Arrival", image: "https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg" }
  });

  // Handle product click
  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  // Card component for menu items - now styled like product cards
  interface MenuCardProps {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    onClick: () => void;
  }

  const MenuCard = ({ icon, title, subtitle, onClick }: MenuCardProps) => (
    <div 
      className="flex-shrink-0 w-40 bg-white rounded-lg p-3 border border-gray-200 shadow-md cursor-pointer hover:bg-gray-50 hover:shadow-lg transition-all"
      onClick={onClick}
    >
      <div className="w-full h-32 mb-2 bg-gray-50 rounded-lg p-2 flex items-center justify-center border border-gray-200">
        {icon}
      </div>
      <p className="font-medium text-center text-gray-800">{title}</p>
      <p className="text-sm text-indigo-600 text-center">{subtitle}</p>
    </div>
  );

  // Handle address input changes
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add new address
  const addNewAddress = async () => {
    if (newAddress.address && newAddress.city && newAddress.pincode) {
      try {
        const userId = localStorage.getItem('userId');
        const res = await axios.post('https://peghouse.in/api/addresses', {
          userId,
          ...newAddress
        });

        const saved = res.data.address;

setAddresses(prev => [...prev, {
  id: saved._id,
  address: saved.address,
  city: saved.city,
  pincode: saved.pincode,
  type: saved.type
}]);


        // Reset form
        setNewAddress({
          address: '',
          city: '',
          pincode: '',
          type: 'Home'
        });
        setShowAddAddress(false);
        alert('Address saved successfully!');
      } catch (err) {
        console.error('❌ Failed to save address:', err);
        alert('Failed to save address. Please try again.');
      }
    } else {
      alert('Please fill all required fields');
    }
  };



  // Get live location function
  const getLiveLocation = () => {
    if ('geolocation' in navigator) {
      // Show loading state
      const locationButton = document.getElementById('locationButton') as HTMLButtonElement;
      if (locationButton) {
        locationButton.innerHTML = '<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>';
        locationButton.disabled = true;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          try {
            // Get address from coordinates using reverse geocoding
            const userId = localStorage.getItem('userId');

const response = await axios.get(`https://peghouse.in/api/addresses/from-coordinates`, {
  params: { latitude, longitude, userId } // ✅ Include userId
});


            const addressData = response.data;
            
            // Update the form with the resolved address
            setNewAddress(prev => ({
              ...prev,
              address: addressData.address || '',
              city: addressData.city || '',
              pincode: addressData.pincode || ''
            }));

            alert('Location detected successfully! Please review and save.');
          } catch (error) {
            console.error('Failed to get address from coordinates:', error);
            alert('Location detected but could not get address details. Please fill manually.');
          } finally {
            // Reset button state
            if (locationButton) {
              locationButton.innerHTML = '<MapPin className="w-4 h-4" />';
              locationButton.disabled = false;
            }
          }
        },
        (error) => {
          console.error('Location error:', error);
          let errorMessage = 'Unable to get your location.';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
          }
          
          alert(errorMessage);
          
          // Reset button state
          const locationButton = document.getElementById('locationButton') as HTMLButtonElement;
          if (locationButton) {
            locationButton.innerHTML = '<MapPin className="w-4 h-4" />';
            locationButton.disabled = false;
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      alert('Location is not supported by your browser.');
    }
  };

  // Delete address
  const deleteAddress = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this address?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`https://peghouse.in/api/addresses/${id}`);
      setAddresses(prev => prev.filter(addr => addr.id !== id));
      alert("Address deleted successfully.");
    } catch (err) {
      console.error("❌ Failed to delete address:", err);
      alert("Failed to delete address. Please try again.");
    }
  };



  // Edit address functionality
  const handleEditAddress = (address: any) => {
    setEditingAddress(address.id);
    setEditAddressData({
      address: address.address,
      city: address.city,
      pincode: address.pincode,
      type: address.type
    });
  };

const updateAddress = async () => {
  if (editingAddress && editAddressData.address && editAddressData.city && editAddressData.pincode) {
    try {
      const res = await axios.put(`https://peghouse.in/api/addresses/${editingAddress}`, editAddressData);

      // Update local state with returned address
      setAddresses(prev => prev.map(addr =>
        addr.id === editingAddress
          ? { ...addr, ...res.data.address }  // Make sure `res.data.address` contains updated fields
          : addr
      ));

      setEditingAddress(null);
      alert('Address updated successfully!');
    } catch (err) {
      console.error('❌ Failed to update address:', err);
      alert('Failed to update address. Please try again.');
    }
  }
};


  // Sync profile address to addresses list
  useEffect(() => {
    if (userInfo.address) {
      setAddresses(prev => {
        // If already present as primary, don't add again
        if (prev.length > 0 && prev[0].type === 'Primary') {
          // Update if changed
          if (prev[0].address !== userInfo.address) {
            const updated = [...prev];
            updated[0] = { ...updated[0], address: userInfo.address };
            return updated;
          }
          return prev;
        }
        // Add as first address
        return [
          { id: 'primary', address: userInfo.address, city: '', pincode: '', type: 'Primary' },
          ...prev.filter(addr => addr.id !== 'primary')
        ];
      });
    }
  }, [userInfo.address]);

  const Header = () => {
    const navigate = useNavigate();

    return (
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between py-3 px-4">
            <div className="flex items-center space-x-8">
              <div 
                className="flex items-center cursor-pointer"
                onClick={() => navigate('/dashboard')}
              >
                <img
                  src="/finallogo.png"
                  alt="Drnkly Logo"
                  className="h-16 md:h-20 lg:h-24 mx-auto object-contain"
                />
              </div>

              <div className="relative group">
                <button 
                  onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                  className="flex items-center text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="hidden md:inline">{selectedLocation}</span>
                  <span className="md:hidden">Location</span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </button>
                
                {showLocationDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 animate-fadeIn">
                    {locations.map((location) => (
                      <button
                        key={location}
                        onClick={() => handleLocationSelect(location)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        {location}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
         
            
            <div className="flex items-center space-x-6">
              <button className="flex flex-col items-center text-gray-700 hover:text-indigo-600 transition-colors">
                <User className="h-6 w-6" />
                <span className="text-xs mt-1">Profile</span>
              </button>
              <button
                onClick={() => setIsChatOpen(true)}
                className="flex flex-col items-center text-gray-700 hover:text-indigo-600 transition-colors relative"
              >
                <MessageCircle className="h-6 w-6" />
                <span className="text-xs mt-1">Chat</span>
                <span className="absolute -top-1 -right-1 bg-indigo-500 rounded-full w-4 h-4 flex items-center justify-center text-xs text-white">
                  1
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  };

  const ProfileHeader = () => {
  return (
    <div className="bg-white text-gray-800 p-6 border-b border-gray-100 rounded-t-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center shadow-sm border border-gray-100">
            <span className="text-gray-700 text-3xl font-semibold">
              {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : ''}
            </span>
          </div>
          {isEditing ? (
            <form 
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
              onSubmit={(e) => {
                e.preventDefault();
                if (userInfo.phone.length === 10) {
                  handleSaveChanges();
                }
              }}
            >
              <div className="mb-3">
                <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={userInfo.name}
                  onChange={handleUserInfoChange}
                  className="block w-full rounded border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Name"
                  autoComplete="name"
                  autoFocus
                />
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={userInfo.phone}
                  onChange={handleUserInfoChange}
                  className="block w-full rounded border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Phone"
                  autoComplete="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  ref={phoneInputRef}
                />
                {userInfo.phone && userInfo.phone.length !== 10 && (
                  <p className="text-red-500 text-sm mt-1">
                    Mobile number must be exactly 10 digits.
                  </p>
                )}
              </div>
              <input
                id="address"
                type="text"
                name="address"
                value={userInfo.address}
                onChange={handleUserInfoChange}
                className="block w-full rounded border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Address"
                autoComplete="street-address"
              />
              <div className="mt-4">
                <button
                  id="saveProfileButton"
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors w-full"
                  disabled={userInfo.phone.length !== 10}
                >
                  Save Profile
                </button>
                <button
                  type="button"
                  className="mt-2 text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors w-full"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{userInfo.name}</h2>
              <p className="text-gray-600 text-lg">{userInfo.phone}</p>
              <p className="text-gray-600 text-base mt-1">{userInfo.address}</p>
              <p className="text-gray-600 text-base mt-1">{userInfo.city}, {userInfo.state}</p>
              <p className="text-gray-600 text-base mt-1">Date of Birth: {new Date(userInfo.dob).toLocaleDateString()}</p>
              <div className="mt-2 flex items-center">
                <span className="bg-green-500 w-2 h-2 rounded-full mr-2"></span>
                <span className="text-xs text-gray-500">Verified User</span>
              </div>
            </div>
          )}
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-700 hover:text-indigo-600 transition-colors flex items-center"
          >
            <Edit2 className="w-5 h-5 mr-2" />
            <span className="font-medium">Edit Profile</span>
          </button>
        )}
      </div>
    </div>
  );
};


  // Card component for the main menu options
  type FeatureCardProps = {
    icon: React.ReactNode;
    title: string;
    onClick: () => void;
  };

  const FeatureCard = ({ icon, title, onClick }: FeatureCardProps) => (
    <div 
      className="flex-1 bg-white p-4 rounded-lg shadow-md border border-gray-200 cursor-pointer hover:shadow-lg hover:bg-gray-50 transition-all min-w-[110px]"
      onClick={onClick}
    >
      <div className="flex flex-col items-center text-center">
        <div className="p-3 bg-gray-50 rounded-full mb-3 shadow-sm">
          {icon}
        </div>
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        return (
          <div className="p-6 bg-white">
            <div className="flex items-center mb-6">
              <button 
                onClick={() => setActiveTab('profile')}
                className="mr-3 hover:bg-gray-50 p-2 rounded-full transition-colors"
              >
                <ChevronRight className="h-6 w-6 transform rotate-180" />
              </button>
              <h2 className="text-2xl font-semibold text-gray-800">Your Orders</h2>
            </div>
            {/* Orders content */}
          </div>
        );
      case 'terms':
        return (
          <div className="p-6 bg-white">
            <div className="flex items-center mb-6">
              <button 
                onClick={() => setActiveTab('profile')} 
                className="mr-3 hover:bg-gray-50 p-2 rounded-full transition-colors"
              >
                <ChevronRight className="h-6 w-6 transform rotate-180" />
              </button>
              <h2 className="text-2xl font-semibold text-gray-800">Terms & Conditions</h2>
            </div>
            <div className="space-y-6 overflow-y-auto max-h-[70vh] text-gray-700">
              <section>
                <h3 className="text-xl font-semibold mb-3">Terms & Conditions:</h3>
                <ul className="space-y-4 text-gray-700">
                  <li>
                    <p><strong>1. Age Verification & Legal Drinking Age:</strong> The customer must confirm they are 21 years or older (Hard Liquor Prohibited) or 25 years or older (for All liquor) as per Maharashtra excise rules. Age verification via government ID (Aadhaar, PAN, Driving License, Passport) is mandatory before delivery.</p>
                  </li>
                  
                  <li>
                    <p><strong>2. Prohibition of Sale to Intoxicated Persons:</strong> Liquor will not be delivered to anyone who appears intoxicated at the time of delivery.</p>
                  </li>
                  
                  <li>
                    <p><strong>3. Prohibition of Sale in Dry Areas:</strong> Liquor cannot be sold or delivered in dry areas (where prohibition is enforced). The customer must confirm their delivery location is not in a dry zone.</p>
                  </li>
                  
                  <li>
                    <p><strong>4. Restricted Timings for Sale & Delivery:</strong> Liquor delivery is allowed only during permitted hours (typically 11 AM to 11 PM in most areas, subject to local regulations).</p>
                  </li>
                  
                  <li>
                    <p><strong>5. Quantity Restrictions:</strong> Customers cannot purchase beyond the permissible limit (e.g., 3 liters of IMFL or 9 liters of beer per person per transaction). Bulk purchases may require additional permits.</p>
                  </li>
                  
                  <li>
                    <p><strong>6. No Resale or Supply to Minors:</strong> The customer must agree not to resell liquor and not to supply it to minors (under 21/25).</p>
                  </li>
                  
                  <li>
                    <p><strong>7. Valid ID Proof Required at Delivery:</strong> The delivery agent will verify the customer's original ID at the time of delivery. If ID is not provided, the order will be cancelled.</p>
                  </li>
                </ul>
              </section>
            </div>
          </div>
        );
      case 'addresses':
        return (
          <div className="p-6 bg-white">
            <div className="flex items-center mb-6">
              <button 
                onClick={() => setActiveTab('profile')} 
                className="mr-3 hover:bg-gray-50 p-2 rounded-full transition-colors"
              >
                <ChevronRight className="h-6 w-6 transform rotate-180" />
              </button>
              <h2 className="text-2xl font-semibold text-gray-800">My Addresses</h2>
            </div>

            {addresses.length === 0 && !showAddAddress ? (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
                <p className="text-gray-500 mb-4">No addresses saved yet</p>
                <button 
                  onClick={() => setShowAddAddress(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Add New Address
                </button>
              </div>
            ) : (
              <>
                {addresses.map(addr => (
                  <div key={addr.id} className="bg-white p-4 mb-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            addr.type === 'Primary' ? 'bg-green-100 text-green-800' : 'bg-indigo-100 text-indigo-800'
                          }`}>
                            {addr.type === 'Primary' ? 'Profile Address' : addr.type}
                          </span>
                        </div>
                        <p className="text-gray-800 font-medium">{addr.address}</p>
                        {(addr.city || addr.pincode) && (
                          <p className="text-gray-600">{addr.city} {addr.pincode && `- ${addr.pincode}`}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEditAddress(addr)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Edit2 size={16} />
                        </button>
                        {addr.type !== 'Primary' && (
                          <button 
                            onClick={() => deleteAddress(addr.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {showAddAddress ? (
                  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-4">
                    <h3 className="font-semibold text-lg mb-4 text-gray-800">Add New Address</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">Address Type</label>
                        <select
                          name="type"
                          value={newAddress.type}
                          onChange={handleAddressChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="Home">Home</option>
                          <option value="Work">Work</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">Full Address</label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            name="address"
                            value={newAddress.address}
                            onChange={handleAddressChange}
                            placeholder="Flat/House No., Building, Street"
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <button
                            id="locationButton"
                            type="button"
                            onClick={getLiveLocation}
                            className="bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center"
                            title="Get current location"
                          >
                            <MapPin className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">City</label>
                        <input
                          type="text"
                          name="city"
                          value={newAddress.city}
                          onChange={handleAddressChange}
                          placeholder="City"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">PIN Code</label>
                        <input
                          type="text"
                          name="pincode"
                          value={newAddress.pincode}
                          onChange={handleAddressChange}
                          placeholder="PIN Code"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="flex space-x-3 pt-2">
                        <button
                          onClick={addNewAddress}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Save Address
                        </button>
                        <button
                          onClick={() => setShowAddAddress(false)}
                          className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setShowAddAddress(true)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                    >
                      <span className="mr-2">+</span> Add New Address
                    </button>
                    <button
                      type="button"
                      className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                      title="Add address using current location"
                      onClick={() => {
                        setShowAddAddress(true);
                        setTimeout(() => { getLiveLocation(); }, 100); // Wait for form to open
                      }}
                    >
                      <MapPin className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Edit Address Modal */}
                {editingAddress && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Edit Address</h2>
                        <button
                          onClick={() => setEditingAddress(null)}
                          className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          <X size={24} />
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-1">Address Type</label>
                          <select
                            value={editAddressData.type}
                            onChange={(e) => setEditAddressData(prev => ({ ...prev, type: e.target.value }))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="Home">Home</option>
                            <option value="Work">Work</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-1">Full Address</label>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={editAddressData.address}
                              onChange={(e) => setEditAddressData(prev => ({ ...prev, address: e.target.value }))}
                              placeholder="Flat/House No., Building, Street"
                              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                // For edit mode, we'll update the editAddressData
                                if ('geolocation' in navigator) {
                                  navigator.geolocation.getCurrentPosition(
                                    async (position) => {
                                      const latitude = position.coords.latitude;
                                      const longitude = position.coords.longitude;

                                      try {
                                        const response = await axios.get(`https://peghouse.in/api/addresses/reverse-geocode/location`, {
                                          params: { latitude, longitude }
                                        });

                                        const addressData = response.data;
                                        
                                        setEditAddressData(prev => ({
                                          ...prev,
                                          address: addressData.address || '',
                                          city: addressData.city || '',
                                          pincode: addressData.pincode || ''
                                        }));

                                        alert('Location detected successfully! Please review and update.');
                                      } catch (error) {
                                        console.error('Failed to get address from coordinates:', error);
                                        alert('Location detected but could not get address details. Please fill manually.');
                                      }
                                    },
                                    (error) => {
                                      console.error('Location error:', error);
                                      alert('Unable to get your location. Please enable location access.');
                                    }
                                  );
                                } else {
                                  alert('Location is not supported by your browser.');
                                }
                              }}
                              className="bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center"
                              title="Get current location"
                            >
                              <Navigation className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-1">City</label>
                          <input
                            type="text"
                            value={editAddressData.city}
                            onChange={(e) => setEditAddressData(prev => ({ ...prev, city: e.target.value }))}
                            placeholder="City"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm font-medium mb-1">PIN Code</label>
                          <input
                            type="text"
                            value={editAddressData.pincode}
                            onChange={(e) => setEditAddressData(prev => ({ ...prev, pincode: e.target.value }))}
                            placeholder="PIN Code"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="flex space-x-3 pt-2">
                          <button
                            onClick={updateAddress}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            Update Address
                          </button>
                          <button
                            onClick={() => setEditingAddress(null)}
                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );
      case 'privacy':
        return (
          <div className="p-6 bg-white">
            <div className="flex items-center mb-6">
              <button 
                onClick={() => setActiveTab('profile')} 
                className="mr-3 hover:bg-gray-50 p-2 rounded-full transition-colors"
              >
                <ChevronRight className="h-6 w-6 transform rotate-180" />
              </button>
              <h2 className="text-2xl font-semibold text-gray-800">Government Rules</h2>
            </div>
            <div className="space-y-6 overflow-y-auto max-h-[70vh] text-gray-700">
              <section>
                <h3 className="text-xl font-semibold mb-3">Government Rules & Regulations</h3>
                <ul className="space-y-4 text-gray-700">
                  <li>
                    <p><strong>1. Age Verification & Legal Drinking Age:</strong> The customer must confirm they are 21 years or older (Hard Liquor Prohibited) or 25 years or older (for All liquor) as per Maharashtra excise rules.</p>
                  </li>
                  
                  <li>
                    <p><strong>2. Prohibition of Sale to Intoxicated Persons:</strong> Liquor will not be delivered to anyone who appears intoxicated at the time of delivery.</p>
                  </li>
                  
                  <li>
                    <p><strong>3. Prohibition of Sale in Dry Areas:</strong> Liquor cannot be sold or delivered in dry areas (where prohibition is enforced).</p>
                  </li>
                  
                  <li>
                    <p><strong>4. Restricted Timings for Sale & Delivery:</strong> Liquor delivery is allowed only during permitted hours (typically 11 AM to 11 PM in most areas).</p>
                  </li>
                  
                  <li>
                    <p><strong>5. State-Wise Legal Drinking Age:</strong></p>
                    <ul className="list-disc pl-5 mt-2 mb-2">
                      <li>Maharashtra: Age 21</li>
                      <li>Delhi: Age 25</li>
                      <li>Karnataka: Age 21</li>
                      <li>Gujarat: Alcohol banned</li>
                    </ul>
                  </li>
                </ul>
              </section>
            </div>
          </div>
        );
      case 'about':
        return (
          <div className="p-6 bg-white">
            <div className="flex items-center mb-6">
              <button 
                onClick={() => setActiveTab('profile')} 
                className="mr-3 hover:bg-gray-50 p-2 rounded-full transition-colors"
              >
                <ChevronRight className="h-6 w-6 transform rotate-180" />
              </button>
              <h2 className="text-2xl font-semibold text-gray-800">About Us</h2>
            </div>
            <div className="space-y-6 overflow-y-auto max-h-[70vh] text-gray-700">
              <section>
                <div className="mb-6">
                  <img 
                    src="/finallogo.png" 
                    alt="Drnkly Logo" 
                    className="h-24 object-contain mx-auto mb-4" 
                  />
                </div>
                <p className="text-gray-700 mb-4">
                  Drnkly is Pune's premier alcohol delivery platform, designed to bring your favorite drinks directly to your doorstep with just a few taps. We believe in responsible drinking and convenient access to quality beverages.
                </p>
                <p className="text-gray-700 mb-4">
                  Our mission is to provide a safe, legal, and convenient way for adults to purchase alcoholic beverages while strictly adhering to government regulations and promoting responsible consumption.
                </p>
              </section>
            </div>
          </div>
        );
      case 'blog':
        return (
          <div className="p-6 bg-white">
            <div className="flex items-center mb-6">
              <button 
                onClick={() => setActiveTab('profile')} 
                className="mr-3 hover:bg-gray-50 p-2 rounded-full transition-colors"
              >
                <ChevronRight className="h-6 w-6 transform rotate-180" />
              </button>
              <h2 className="text-2xl font-semibold text-gray-800">Blog</h2>
            </div>
            <div className="space-y-6 overflow-y-auto max-h-[70vh] text-gray-700">
              {/* Blog content */}
              <section>
                <div className="w-full h-48 bg-gray-200 rounded-xl mb-6 flex items-center justify-center">
                  <BookOpen size={64} className="text-indigo-600" />
                </div>
                
                <h3 className="text-xl font-bold mb-4">Peg House Pune: Where Your Favorite Peg Is Just a Click Away</h3>
                
                <p className="text-gray-700 mb-6">
                  Let's be honest—nobody enjoys the last-minute booze run. Whether it's a house party, a chill evening, or a "just because" moment, Peg House is here to make your liquor experience smoother than your favorite scotch. From beer home delivery to premium whisky and quirky breezers flavours, we're redefining how Pune drinks.
                </p>
                
                <div className="w-full h-48 bg-gray-200 rounded-xl mb-6 flex items-center justify-center">
                  <Wine size={64} className="text-indigo-600" />
                </div>
                
                <h3 className="text-lg font-semibold mb-2">Whisky Brands in India with Price List</h3>
                <p className="mb-4">
                  Pune's whisky lovers, rejoice! Peg House offers a wide selection of both Indian and imported whisky brands.
                </p>
                
                <h3 className="text-lg font-semibold mb-2">Vodka Magic: From Magic Moments to More</h3>
                <p className="mb-4">
                  At Peg House, you'll find an amazing variety of vodka brands. One of the bestsellers? Magic Moments Vodka.
                </p>
                
                <button
                  onClick={() => navigate('/blog')}
                  className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Read Full Article
                </button>
              </section>
            </div>
          </div>
        );
      default:
        return (
          <>
            <ProfileHeader />
            
            {/* Main Feature Cards */}
            <div className="p-4 bg-white">
              <div className="flex flex-wrap gap-4 justify-between sm:flex-nowrap">
                <FeatureCard 
                  icon={<ShoppingBag size={24} className="text-indigo-600" />}
                  title="My Orders"
                  onClick={handleOrdersClick}
                />
                <FeatureCard 
                  icon={<MapPin size={24} className="text-indigo-600" />}
                  title="My Addresses"
                  onClick={() => setActiveTab('addresses')}
                />
                <FeatureCard 
                  icon={<MessageCircle size={24} className="text-indigo-600" />}
                  title="Support"
                  onClick={() => setIsChatOpen(true)}
                />
              </div>
            </div>
            
            {/* Menu items as cards */}
            <div className="p-4 bg-white border-t border-gray-100">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">More Information</h3>
              <div className="flex overflow-x-auto space-x-4 pb-4">
                <MenuCard 
                  icon={<FileText size={40} className="text-indigo-600" />}
                  title="Terms & Conditions" 
                  subtitle="Important Info"
                  onClick={() => setActiveTab('terms')}
                />
                <MenuCard 
                  icon={<Shield size={40} className="text-indigo-600" />}
                  title="Government Rules" 
                  subtitle="Legal Info"
                  onClick={() => setActiveTab('privacy')}
                />
                <MenuCard 
                  icon={<User size={40} className="text-indigo-600" />}
                  title="About Us" 
                  subtitle="Our Story"
                  onClick={() => setActiveTab('about')}
                />
                <MenuCard 
                  icon={<BookOpen size={40} className="text-indigo-600" />}
                  title="Blog" 
                  subtitle="Latest Articles"
                  onClick={() => setActiveTab('blog')}
                />
              </div>
            </div>
            
            <div className="p-6 flex justify-center bg-white">
              <button 
                onClick={handleLogout}
                className="flex items-center text-white font-medium bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Log Out
              </button>
            </div>
          </>
        );
    }
  };

  useEffect(() => {
    // Check if user skipped login
    const isSkipped = localStorage.getItem('isSkippedLogin');
    if (isSkipped) {
      navigate('/login'); // Redirect to login if user hasn't logged in
      return;
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {renderContent()}
        </div>
      </div>

      {isChatOpen && (
        <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-lg shadow-lg flex flex-col z-50 border border-gray-100 animate-fadeIn">
          <div className="p-4 bg-white text-gray-800 rounded-t-lg flex justify-between items-center border-b border-gray-100">
            <div className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-2 text-indigo-600" />
              <h3 className="font-semibold">Drnkly Support</h3>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="hover:text-indigo-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.isBot
                      ? 'bg-gray-50 text-gray-800 border border-gray-100'
                      : 'bg-indigo-600 text-white'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-100">
            <div className="flex space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your question..."
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                onClick={handleSendMessage}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

function setFullAddress(arg0: any) {
  throw new Error('Function not implemented.');
}
function setCity(arg0: any) {
  throw new Error('Function not implemented.');
}

