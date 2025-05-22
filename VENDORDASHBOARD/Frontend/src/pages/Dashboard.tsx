import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingBag, TrendingUp, IndianRupeeIcon, CheckCircle, Tag, Plus, X, CheckSquare, Square, AlertTriangle, Percent } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface Product {
  _id: string;
  name: string;
  brand: string;
  price: number;
  category: string;
  alcoholContent?: number;
  stock: number;
  image: string;
}

interface Offer {
  id: string;
  title: string;
  description: string;
  discountPercentage: number;
  isActive: boolean;
  appliedToProducts: string[];
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // States for products and offers
  const [products, setProducts] = useState<Product[]>([]);
  const [alcoholProducts, setAlcoholProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([
    { 
      id: '1', 
      title: 'Weekend Special', 
      description: '10% off on all premium whiskeys',
      discountPercentage: 10,
      isActive: true,
      appliedToProducts: []
    },
    { 
      id: '2', 
      title: 'Happy Hour', 
      description: '15% off on beer between 5-7 PM',
      discountPercentage: 15,
      isActive: false,
      appliedToProducts: []
    },
    { 
      id: '3', 
      title: 'Buy 2 Get 1', 
      description: 'Special deal on wine purchases',
      discountPercentage: 33,
      isActive: false,
      appliedToProducts: []
    },
    { 
      id: '4', 
      title: 'First-Time Discount', 
      description: '5% off on first order',
      discountPercentage: 5,
      isActive: true,
      appliedToProducts: []
    },
    { 
      id: '5', 
      title: 'Bulk Purchase', 
      description: '20% off on orders above ₹2000',
      discountPercentage: 20,
      isActive: false,
      appliedToProducts: []
    },
    { 
      id: '6', 
      title: 'Festive Offer', 
      description: 'Special discounts for the holiday season',
      discountPercentage: 12,
      isActive: true,
      appliedToProducts: []
    },
    { 
      id: '7', 
      title: 'Clearance Sale', 
      description: 'Discounts on selected items to clear inventory',
      discountPercentage: 25,
      isActive: false,
      appliedToProducts: []
    },
    { 
      id: '8', 
      title: 'Member Discount', 
      description: 'Special pricing for loyalty members',
      discountPercentage: 8,
      isActive: true,
      appliedToProducts: []
    },
    { 
      id: '9', 
      title: 'New Year Offer', 
      description: '15% off to celebrate the new year',
      discountPercentage: 15,
      isActive: false,
      appliedToProducts: []
    },
    { 
      id: '10', 
      title: 'Premium Selection', 
      description: '10% off on premium spirits',
      discountPercentage: 10,
      isActive: true,
      appliedToProducts: []
    }
  ]);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showOfferModal, setShowOfferModal] = useState(false);

  // Fetch the products for the logged-in vendor
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const response = await axios.get('https://vendor.peghouse.in/api/vendor/products', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          const allProducts = response.data.products || [];
          setProducts(allProducts);
          
          // Filter only alcohol products
          const alcoholOnly = allProducts.filter((product: Product) => 
            product.category.toLowerCase() === 'drinks' || 
            product.alcoholContent > 0
          );
          setAlcoholProducts(alcoholOnly);
        } else {
          console.error('No token found');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  // Function to toggle product selection
  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  // Function to apply selected offer to products
  const applyOfferToProducts = () => {
    if (!selectedOffer) return;

    // Update the offer with selected products
    const updatedOffers = offers.map(offer => 
      offer.id === selectedOffer.id 
        ? { ...offer, appliedToProducts: selectedProducts, isActive: true } 
        : offer
    );
    
    setOffers(updatedOffers);
    toast.success(`${selectedOffer.title} applied to ${selectedProducts.length} products`);
    setShowOfferModal(false);
    setSelectedOffer(null);
    setSelectedProducts([]);
  };

  // Function to open offer modal with pre-selected offer
  const openOfferModal = (offer: Offer) => {
    setSelectedOffer(offer);
    setSelectedProducts(offer.appliedToProducts);
    setShowOfferModal(true);
  };

  // Function to create a new offer (this would usually involve an API call)
  const createNewOffer = () => {
    const newOffer: Offer = {
      id: Date.now().toString(),
      title: "New Offer",
      description: "Description for new offer",
      discountPercentage: 10,
      isActive: false,
      appliedToProducts: []
    };
    
    setOffers(prev => [...prev, newOffer]);
    openOfferModal(newOffer);
  };

  // Filter top alcohol products by price
  const topAlcoholProducts = [...alcoholProducts]
    .sort((a, b) => b.price - a.price)
    .slice(0, 5);

  const stats = [
    { 
      title: 'Total Sales', 
      value: '₹45,231', 
      icon: IndianRupeeIcon, 
      changeType: 'positive',
      description: 'vs. last month' 
    },
    { 
      title: 'Active Orders', 
      value: '25', 
      icon: ShoppingBag, 
      changeType: 'positive',
      description: 'vs. last week',
      path: '/orders'
    },
    { 
      title: 'Products', 
      value: `${products.length}`, 
      icon: Package,
      changeType: 'neutral',
      description: 'total in inventory',
      path: '/products'
    },
    { 
      title: 'Completed Orders', 
      value: '125', 
      icon: CheckCircle,
      changeType: 'positive',
      description: 'this month',
      path: '/orders?status=completed'
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="w-full sm:w-auto px-4 py-2 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 3 months</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className={`bg-white rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow ${stat.path ? 'cursor-pointer' : ''}`}
              onClick={() => stat.path && navigate(stat.path)}
            >
              <div className="flex items-center justify-between">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs md:text-sm font-medium ${
                  stat.changeType === 'positive' 
                    ? 'bg-green-50 text-green-700' 
                    : stat.changeType === 'negative'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-blue-50 text-blue-700'
                }`}>
                  {stat.changeType === 'positive' && '+3.2%'}
                  {stat.changeType === 'negative' && '-1.4%'}
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
                <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-xs md:text-sm text-gray-500 mt-1">{stat.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Top Alcohol Products */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 md:p-6 border-b">
            <h2 className="text-lg font-semibold">Top Alcohol Products</h2>
            <p className="text-sm text-gray-600 mt-1">Your highest value alcohol products</p>
          </div>
          <div className="divide-y">
            {topAlcoholProducts.map((product, index) => (
              <div key={product._id} className="p-4 md:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={product.image || `https://via.placeholder.com/100?text=${product.name}`} 
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600 mt-1">{product.brand} • {product.alcoholContent || 0}% ABV</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-semibold">₹{product.price}</span>
                        <span className="text-sm text-gray-600">{product.stock} in stock</span>
                      </div>
                    </div>
                    {/* Show active offers for this product */}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {offers
                        .filter(offer => offer.isActive && offer.appliedToProducts.includes(product._id))
                        .map(offer => (
                          <span key={offer.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                            <Percent className="w-3 h-3 mr-1" /> {offer.discountPercentage}% off
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {topAlcoholProducts.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
                <p>No alcohol products found in your inventory</p>
              </div>
            )}
          </div>
        </div>

        {/* Current Offers */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 md:p-6 border-b flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">Active Offers</h2>
              <p className="text-sm text-gray-600 mt-1">Apply discounts to your products</p>
            </div>
            <button 
              onClick={createNewOffer}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> New
            </button>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {offers
              .filter(offer => offer.isActive)
              .map((offer) => (
                <div key={offer.id} className="p-4 md:p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-800">
                          <CheckCircle className="w-4 h-4" />
                        </span>
                        <p className="font-medium">{offer.title}</p>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{offer.description}</p>
                      {offer.appliedToProducts.length > 0 && (
                        <p className="text-xs text-blue-600 mt-1">Applied to {offer.appliedToProducts.length} products</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-green-700">{offer.discountPercentage}% off</span>
                      <button 
                        onClick={() => openOfferModal(offer)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-sm transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            
            {/* Inactive offers section */}
            {offers.some(offer => !offer.isActive) && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <h3 className="font-medium text-sm text-gray-600 mb-2">Inactive Offers</h3>
                <div className="space-y-2">
                  {offers
                    .filter(offer => !offer.isActive)
                    .map((offer) => (
                      <div key={offer.id} className="p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-gray-400" />
                            <p className="font-medium text-sm">{offer.title} <span className="text-gray-500">({offer.discountPercentage}%)</span></p>
                          </div>
                          <button 
                            onClick={() => openOfferModal(offer)}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                          >
                            Activate
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {offers.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
                <p>No offers configured yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Offer Selection Modal */}
      {showOfferModal && selectedOffer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-semibold text-lg">
                {selectedOffer.isActive ? 'Edit Offer' : 'New Offer'}
              </h3>
              <button 
                onClick={() => {
                  setShowOfferModal(false);
                  setSelectedOffer(null);
                  setSelectedProducts([]);
                }}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 border-b">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Offer Title</label>
                  <input 
                    type="text" 
                    value={selectedOffer.title}
                    onChange={(e) => setSelectedOffer({...selectedOffer, title: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input 
                    type="text" 
                    value={selectedOffer.description}
                    onChange={(e) => setSelectedOffer({...selectedOffer, description: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Percentage</label>
                  <input 
                    type="number" 
                    min="1"
                    max="99"
                    value={selectedOffer.discountPercentage}
                    onChange={(e) => setSelectedOffer({...selectedOffer, discountPercentage: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto">
              <h4 className="font-medium mb-2">Select Products for this Offer</h4>
              
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">{selectedProducts.length} of {alcoholProducts.length} products selected</p>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setSelectedProducts(alcoholProducts.map(p => p._id))}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Select All
                  </button>
                  <button 
                    onClick={() => setSelectedProducts([])}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Clear
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {alcoholProducts.map(product => (
                  <div 
                    key={product._id}
                    onClick={() => toggleProductSelection(product._id)}
                    className={`flex items-center p-3 rounded-lg border transition-colors cursor-pointer ${
                      selectedProducts.includes(product._id) 
                        ? 'bg-blue-50 border-blue-300' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="mr-3">
                      {selectedProducts.includes(product._id) ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex items-center flex-1 gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                        <img 
                          src={product.image || `https://via.placeholder.com/100?text=${product.name}`}
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-gray-600">{product.brand}</p>
                      </div>
                      <div className="ml-auto">
                        <p className="font-semibold">₹{product.price}</p>
                        {selectedOffer.discountPercentage > 0 && (
                          <p className="text-xs text-green-600">
                            ₹{Math.round(product.price * (1 - selectedOffer.discountPercentage/100))} after discount
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {alcoholProducts.length === 0 && (
                  <div className="p-4 text-center text-gray-500 border border-dashed rounded-lg">
                    <AlertTriangle className="w-5 h-5 mx-auto mb-2" />
                    <p>No alcohol products found to apply offers</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 sticky bottom-0">
              <button 
                onClick={() => {
                  setShowOfferModal(false);
                  setSelectedOffer(null);
                  setSelectedProducts([]);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={applyOfferToProducts}
                disabled={selectedProducts.length === 0}
                className={`px-4 py-2 rounded-lg text-white ${
                  selectedProducts.length > 0 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-400 cursor-not-allowed'
                } transition-colors`}
              >
                Apply Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;