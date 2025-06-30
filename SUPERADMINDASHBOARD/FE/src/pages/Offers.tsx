import axios from 'axios';
import { CheckCircle2, Code, Edit, Eye, Gift, Image as ImageIcon, Percent, Plus, ShoppingCart, Upload, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

// Types
interface Banner {
  id: string;
  image: string;
  title: string;
  description?: string;
  discount?: string;
  couponCode?: string;
  isCustom?: boolean;
  category?: 'banner' | 'offer';
}

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  volume: number;
  category: string;
  brand: string;
  alcoholContent?: number;
  description?: string;
}

interface AppliedOffer {
  offerId: string;
  productIds: string[];
  offerDetails: Banner;
}

// Default Data
const defaultBanners: Banner[] = [
  {
    id: "old-monk",
    image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?q=80&w=800&auto=format&fit=crop",
    title: "Get OLD MONK Quarter",
    category: 'banner'
  },
  {
    id: "no-service-fee",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop",
    title: "Get the Party Started",
    category: 'banner'
  },
  {
    id: "weekend-vibes",
    image: "https://images.unsplash.com/photo-1516594798947-e65505dbb29d?q=80&w=800&auto=format&fit=crop",
    title: "🎉 Weekend Vibes",
    category: 'banner'
  },
  {
    id: "loyalty-love",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800&auto=format&fit=crop",
    title: "🌟 Loyalty Love",
    category: 'banner'
  },
  {
    id: "pre-book",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop",
    title: "🕒 Pre-book & Save",
    category: 'banner'
  },
  {
    id: "snap-win",
    image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd195?q=80&w=800&auto=format&fit=crop",
    title: "📸 Snap & Win",
    category: 'banner'
  },
  {
    id: "kids-party",
    image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=800&auto=format&fit=crop",
    title: "👶 Kids Party Bonus",
    category: 'banner'
  },
  {
    id: "dj-addon",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=800&auto=format&fit=crop",
    title: "🎧 DJ Add-on Free",
    category: 'banner'
  },
  {
    id: "ladies-special",
    image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?q=80&w=800&auto=format&fit=crop",
    title: "💃 Ladies Special",
    category: 'banner'
  },
  {
    id: "midnight-mania",
    image: "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?q=80&w=800&auto=format&fit=crop",
    title: "🪩 Midnight Mania",
    category: 'banner'
  }
];

const defaultOffers: Banner[] = [
  {
    id: "weekend-special",
    image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?q=80&w=800&auto=format&fit=crop",
    title: "Weekend Special",
    description: "10% off on all premium whiskeys",
    discount: "10% off",
    category: 'offer'
  },
  {
    id: "happy-hour",
    image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?q=80&w=800&auto=format&fit=crop",
    title: "Happy Hour",
    description: "15% off on beer between 5-7 PM",
    discount: "15% off",
    category: 'offer'
  },
  {
    id: "buy-2-get-1",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800&auto=format&fit=crop",
    title: "Buy 2 Get 1",
    description: "Special deal on wine purchases",
    discount: "33% off",
    category: 'offer'
  },
  {
    id: "first-time-discount",
    image: "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?q=80&w=800&auto=format&fit=crop",
    title: "First-Time Discount",
    description: "5% off on first order",
    discount: "5% off",
    category: 'offer'
  },
  {
    id: "festive-offer",
    image: "https://images.unsplash.com/photo-1516594798947-e65505dbb29d?q=80&w=800&auto=format&fit=crop",
    title: "Festive Offer",
    description: "Special discounts for the holiday season",
    discount: "12% off",
    category: 'offer'
  },
  {
    id: "member-discount",
    image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?q=80&w=800&auto=format&fit=crop",
    title: "Member Discount",
    description: "Special pricing for loyalty members",
    discount: "8% off",
    category: 'offer'
  },
  {
    id: "premium-selection",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop",
    title: "Premium Selection",
    description: "10% off on premium spirits",
    discount: "10% off",
    category: 'offer'
  },
  {
    id: "bulk-purchase",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop",
    title: "Bulk Purchase",
    description: "20% off on orders above ₹2000",
    discount: "20% off",
    couponCode: "BULK20",
    category: 'offer'
  },
  {
    id: "clearance-sale",
    image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd195?q=80&w=800&auto=format&fit=crop",
    title: "Clearance Sale",
    description: "Discounts on selected items to clear inventory",
    discount: "25% off",
    couponCode: "CLEAR25",
    category: 'offer'
  },
  {
    id: "new-year-offer",
    image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=800&auto=format&fit=crop",
    title: "New Year Offer",
    description: "15% off to celebrate the new year",
    discount: "15% off",
    couponCode: "NEWYEAR15",
    category: 'offer'
  }
];

const Offers: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([...defaultBanners, ...defaultOffers]);
  const [activeBanners, setActiveBanners] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActiveModal, setShowActiveModal] = useState(false);
  const [showApplyOfferModal, setShowApplyOfferModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Banner | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [appliedOffers, setAppliedOffers] = useState<AppliedOffer[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [newBanner, setNewBanner] = useState({ 
    title: '', 
    image: '', 
    code: '', 
    description: '', 
    discount: '', 
    couponCode: '',
    category: 'banner' as 'banner' | 'offer'
  });
  const [activeTab, setActiveTab] = useState<'banners' | 'offers'>('banners');
  const [addMethod, setAddMethod] = useState<'photo' | 'code' | 'upload'>('photo');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Dynamically generate product categories from products array
  const productCategories = Array.from(
    products.reduce((acc, p) => {
      if (!acc.has(p.category)) {
        acc.set(p.category, {
          id: p.category,
          name: p.category.charAt(0).toUpperCase() + p.category.slice(1),
          icon:
            p.category.toLowerCase() === 'drinks' ? '🍺' :
            p.category.toLowerCase() === 'cigarette' ? '🚬' :
            p.category.toLowerCase() === 'snacks' ? '🍿' :
            p.category.toLowerCase() === 'soft drinks' ? '🥤' :
            p.category.toLowerCase() === 'food' ? '🍽️' :
            '🛒'
        });
      }
      return acc;
    }, new Map()).values()
  );

  useEffect(() => {
    // Load banners from localStorage
    const savedBanners = localStorage.getItem('customBanners');
    if (savedBanners) {
      const customBanners = JSON.parse(savedBanners);
      setBanners([...defaultBanners, ...defaultOffers, ...customBanners]);
    }

    // Load applied offers
    const savedAppliedOffers = localStorage.getItem('appliedOffers');
    if (savedAppliedOffers) {
      setAppliedOffers(JSON.parse(savedAppliedOffers));
    }

    // Fetch active banners
    fetchActiveBanners();
    // Fetch ALL products including food, immediately on mount
    fetchAllProducts();
  }, []);

  const fetchActiveBanners = async () => {
    try {
      const res = await axios.get('/api/banners');
      setActiveBanners(res.data.activeBannerIds || []);
    } catch (err) {
      const savedActive = localStorage.getItem('activeBanners');
      if (savedActive) {
        setActiveBanners(JSON.parse(savedActive));
      }
    }
  };

  const fetchAllProducts = async () => {
    try {
      const res = await axios.get('https://peghouse.in/api/products');
      // Handle both array and object response
      const productsArray = Array.isArray(res.data) ? res.data : res.data.products;
      setProducts(productsArray);
      console.log('Fetched products:', productsArray.length, 'products');
      const foodProducts = productsArray.filter((p: Product) => p.category && p.category.toLowerCase() === 'food');
      console.log('Food products found:', foodProducts.length);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const handleToggleActive = async (id: string) => {
    setLoading(true);
    try {
      let updatedActiveBanners: string[];
      
      if (activeBanners.includes(id)) {
        updatedActiveBanners = activeBanners.filter(bannerId => bannerId !== id);
        await axios.post(`/api/banners/deactivate/${id}`);
      } else {
        updatedActiveBanners = [...activeBanners, id];
        await axios.post(`/api/banners/activate/${id}`);
      }
      
      setActiveBanners(updatedActiveBanners);
      localStorage.setItem('activeBanners', JSON.stringify(updatedActiveBanners));
      
      const activeItems = banners.filter(b => updatedActiveBanners.includes(b.id));
      localStorage.setItem('customerActiveBanners', JSON.stringify(activeItems));
      
      const selectedItem = banners.find(b => b.id === id);
      if (selectedItem) {
        const action = updatedActiveBanners.includes(id) ? 'activated' : 'deactivated';
        alert(`${selectedItem.category === 'offer' ? 'Offer' : 'Banner'} "${selectedItem.title}" has been ${action} on customer dashboard!`);
      }
    } catch (err) {
      // Fallback for when API fails
      let updatedActiveBanners: string[];
      
      if (activeBanners.includes(id)) {
        updatedActiveBanners = activeBanners.filter(bannerId => bannerId !== id);
      } else {
        updatedActiveBanners = [...activeBanners, id];
      }
      
      setActiveBanners(updatedActiveBanners);
      localStorage.setItem('activeBanners', JSON.stringify(updatedActiveBanners));
      
      const activeItems = banners.filter(b => updatedActiveBanners.includes(b.id));
      localStorage.setItem('customerActiveBanners', JSON.stringify(activeItems));
      
      const selectedItem = banners.find(b => b.id === id);
      if (selectedItem) {
        const action = updatedActiveBanners.includes(id) ? 'activated' : 'deactivated';
        alert(`${selectedItem.category === 'offer' ? 'Offer' : 'Banner'} "${selectedItem.title}" has been ${action} on customer dashboard!`);
      }
    }
    setLoading(false);
  };

  const handleApplyOffer = (offer: Banner) => {
    setSelectedOffer(offer);
    setSelectedProducts([]);
    setShowApplyOfferModal(true);
  };

  const handleProductToggle = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleCategoryToggle = (categoryId: string) => {
    const categoryProducts = products
      .filter(p => p.category.toLowerCase() === categoryId.toLowerCase())
      .map(p => p._id);
    
    const allSelected = categoryProducts.every(id => selectedProducts.includes(id));
    
    if (allSelected) {
      // Remove all products from this category
      setSelectedProducts(prev => prev.filter(id => !categoryProducts.includes(id)));
    } else {
      // Add all products from this category
      setSelectedProducts(prev => [...new Set([...prev, ...categoryProducts])]);
    }
  };

  const confirmApplyOffer = () => {
    if (!selectedOffer || selectedProducts.length === 0) {
      alert('Please select at least one product to apply the offer');
      return;
    }

    const newAppliedOffer: AppliedOffer = {
      offerId: selectedOffer.id,
      productIds: selectedProducts,
      offerDetails: selectedOffer
    };

    // Remove any existing application of this offer
    const updatedAppliedOffers = appliedOffers.filter(ao => ao.offerId !== selectedOffer.id);
    updatedAppliedOffers.push(newAppliedOffer);

    setAppliedOffers(updatedAppliedOffers);
    localStorage.setItem('appliedOffers', JSON.stringify(updatedAppliedOffers));

    alert(`Offer "${selectedOffer.title}" has been applied to ${selectedProducts.length} products!`);
    setShowApplyOfferModal(false);
    setSelectedOffer(null);
    setSelectedProducts([]);
  };

  const removeAppliedOffer = (offerId: string) => {
    const updatedAppliedOffers = appliedOffers.filter(ao => ao.offerId !== offerId);
    setAppliedOffers(updatedAppliedOffers);
    localStorage.setItem('appliedOffers', JSON.stringify(updatedAppliedOffers));
    alert('Offer removed from products!');
  };

  const getProductsByCategory = (categoryId: string) => {
    return products.filter(p => p.category.toLowerCase() === categoryId.toLowerCase());
  };

  const isProductSelected = (productId: string) => {
    return selectedProducts.includes(productId);
  };

  const isCategoryFullySelected = (categoryId: string) => {
    const categoryProducts = getProductsByCategory(categoryId);
    return categoryProducts.length > 0 && categoryProducts.every(p => selectedProducts.includes(p._id));
  };

  const isCategoryPartiallySelected = (categoryId: string) => {
    const categoryProducts = getProductsByCategory(categoryId);
    return categoryProducts.some(p => selectedProducts.includes(p._id)) && !isCategoryFullySelected(categoryId);
  };

  const handleDeactivateAll = async () => {
    if (window.confirm('Are you sure you want to deactivate all banners and offers?')) {
      setLoading(true);
      try {
        await axios.post('/api/banners/deactivate-all');
        setActiveBanners([]);
        localStorage.setItem('activeBanners', JSON.stringify([]));
        localStorage.removeItem('customerActiveBanners');
        alert('All banners and offers have been deactivated!');
      } catch (err) {
        setActiveBanners([]);
        localStorage.setItem('activeBanners', JSON.stringify([]));
        localStorage.removeItem('customerActiveBanners');
        alert('All banners and offers have been deactivated!');
      }
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    setUploadError('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post('https://admin.peghouse.in/api/admin/upload-banner', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setNewBanner({ ...newBanner, image: res.data.url });
    } catch (err) {
      setUploadError('Failed to upload image.');
    }
    setUploading(false);
  };

  const handleAddBanner = () => {
    if (!newBanner.title || (!newBanner.image && !newBanner.code)) {
      alert('Please fill all required fields');
      return;
    }

    if (addMethod === 'code') {
      try {
        const imageMatch = newBanner.code.match(/image:\s*["']([^"']+)["']/);
        const titleMatch = newBanner.code.match(/title:\s*["']([^"']+)["']/);
        const descriptionMatch = newBanner.code.match(/description:\s*["']([^"']+)["']/);
        const discountMatch = newBanner.code.match(/discount:\s*["']([^"']+)["']/);
        const couponMatch = newBanner.code.match(/couponCode:\s*["']([^"']+)["']/);
        
        if (!imageMatch || !titleMatch) {
          alert('Invalid code format. Please ensure your code contains image and title properties.');
          return;
        }

        const bannerData = {
          image: imageMatch[1],
          title: titleMatch[1],
          description: descriptionMatch ? descriptionMatch[1] : '',
          discount: discountMatch ? discountMatch[1] : '',
          couponCode: couponMatch ? couponMatch[1] : '',
          category: newBanner.category
        };

        const bannerToAdd: Banner = {
          id: `custom-${Date.now()}`,
          image: bannerData.image,
          title: bannerData.title,
          description: bannerData.description,
          discount: bannerData.discount,
          couponCode: bannerData.couponCode,
          category: bannerData.category,
          isCustom: true
        };

        const updatedBanners = [...banners, bannerToAdd];
        setBanners(updatedBanners);

        const customBanners = updatedBanners.filter(b => b.isCustom);
        localStorage.setItem('customBanners', JSON.stringify(customBanners));
      } catch (error) {
        alert('Error parsing code. Please check the format.');
        return;
      }
    } else {
      const bannerToAdd: Banner = {
        id: `custom-${Date.now()}`,
        image: newBanner.image,
        title: newBanner.title,
        description: newBanner.description,
        discount: newBanner.discount,
        couponCode: newBanner.couponCode,
        category: newBanner.category,
        isCustom: true
      };

      const updatedBanners = [...banners, bannerToAdd];
      setBanners(updatedBanners);

      const customBanners = updatedBanners.filter(b => b.isCustom);
      localStorage.setItem('customBanners', JSON.stringify(customBanners));
    }

    setNewBanner({
      title: '',
      image: '',
      code: '',
      description: '',
      discount: '',
      couponCode: '',
      category: 'banner'
    });
    setShowAddModal(false);
  };

  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setNewBanner({
      title: banner.title,
      image: banner.image,
      description: banner.description || '',
      discount: banner.discount || '',
      couponCode: banner.couponCode || '',
      category: banner.category || 'banner',
      code: ''
    });
    setShowEditModal(true);
  };

  const handleUpdateBanner = (bannerData: any) => {
    if (!editingBanner) return;

    const updatedBanners = banners.map(b => 
      b.id === editingBanner.id 
        ? {
            ...b,
            title: bannerData.title,
            image: bannerData.image,
            description: bannerData.description,
            discount: bannerData.discount,
            couponCode: bannerData.couponCode,
            category: bannerData.category
          }
        : b
    );

    setBanners(updatedBanners);

    if (editingBanner.isCustom) {
      const customBanners = updatedBanners.filter(b => b.isCustom);
      localStorage.setItem('customBanners', JSON.stringify(customBanners));
    }

    if (activeBanners.includes(editingBanner.id)) {
      const activeItems = updatedBanners.filter(b => activeBanners.includes(b.id));
      localStorage.setItem('customerActiveBanners', JSON.stringify(activeItems));
    }

    setShowEditModal(false);
    setEditingBanner(null);
  };

  const handleDeleteBanner = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      const updatedBanners = banners.filter(b => b.id !== id);
      setBanners(updatedBanners);

      const customBanners = updatedBanners.filter(b => b.isCustom);
      localStorage.setItem('customBanners', JSON.stringify(customBanners));

      if (activeBanners.includes(id)) {
        const updatedActiveBanners = activeBanners.filter(bannerId => bannerId !== id);
        setActiveBanners(updatedActiveBanners);
        localStorage.setItem('activeBanners', JSON.stringify(updatedActiveBanners));
        
        const activeItems = updatedBanners.filter(b => updatedActiveBanners.includes(b.id));
        localStorage.setItem('customerActiveBanners', JSON.stringify(activeItems));
      }
    }
  };

  const generateBannerCode = (banner: Banner) => {
    return `{
  id: "${banner.id}",
  image: "${banner.image}",
  title: "${banner.title}",${banner.description ? `
  description: "${banner.description}",` : ''}${banner.discount ? `
  discount: "${banner.discount}",` : ''}${banner.couponCode ? `
  couponCode: "${banner.couponCode}",` : ''}
  category: "${banner.category || 'banner'}"
}`;
  };

  const filteredItems = banners.filter(item => 
    activeTab === 'banners' ? item.category === 'banner' : item.category === 'offer'
  );

  const activeItems = banners.filter(item => activeBanners.includes(item.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Banner & Offers Management</h1>
            <p className="text-gray-600">Manage your promotional banners and special offers</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowActiveModal(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <CheckCircle2 size={20} />
              View Active ({activeBanners.length})
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <Plus size={20} />
              Add {activeTab === 'banners' ? 'Banner' : 'Offer'}
            </button>
          </div>
        </div>

        {/* Applied Offers Summary */}
        {appliedOffers.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Applied Offers ({appliedOffers.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {appliedOffers.map((appliedOffer) => (
                <div key={appliedOffer.offerId} className="border rounded-lg p-4 bg-green-50">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-green-800">{appliedOffer.offerDetails.title}</h4>
                    <button
                      onClick={() => removeAppliedOffer(appliedOffer.offerId)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <p className="text-sm text-green-600 mb-2">{appliedOffer.offerDetails.description}</p>
                  <div className="text-xs text-gray-600">
                    Applied to {appliedOffer.productIds.length} products
                  </div>
                  {appliedOffer.offerDetails.discount && (
                    <div className="text-sm font-semibold text-green-700 mt-1">
                      {appliedOffer.offerDetails.discount}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex mb-8">
          <button
            onClick={() => setActiveTab('banners')}
            className={`px-6 py-3 rounded-l-xl font-semibold transition-all duration-300 ${
              activeTab === 'banners'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Eye size={20} />
              Banners ({banners.filter(b => b.category === 'banner').length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('offers')}
            className={`px-6 py-3 rounded-r-xl font-semibold transition-all duration-300 ${
              activeTab === 'offers'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Gift size={20} />
              Offers ({banners.filter(b => b.category === 'offer').length})
            </div>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Items</h3>
            <p className="text-3xl font-bold text-blue-600">{banners.length}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Active Items</h3>
            <p className="text-3xl font-bold text-green-600">{activeBanners.length}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Active Banners</h3>
            <p className="text-3xl font-bold text-blue-600">{activeBanners.filter(id => banners.find(b => b.id === id)?.category === 'banner').length}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Active Offers</h3>
            <p className="text-3xl font-bold text-green-600">{activeBanners.filter(id => banners.find(b => b.id === id)?.category === 'offer').length}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Applied Offers</h3>
            <p className="text-3xl font-bold text-orange-600">{appliedOffers.length}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Products</h3>
            <p className="text-3xl font-bold text-purple-600">{products.length}</p>
          </div>
        </div>

        {/* Control Panel */}
        {activeBanners.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Active Items Control</h3>
                <p className="text-gray-600">You have {activeBanners.length} active items on customer dashboard</p>
              </div>
              <button
                onClick={handleDeactivateAll}
                className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors duration-200 font-semibold"
              >
                Deactivate All
              </button>
            </div>
          </div>
        )}

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`group relative rounded-xl shadow-lg overflow-hidden border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                activeBanners.includes(item.id)
                  ? 'border-green-500 ring-4 ring-green-200 shadow-green-200' 
                  : 'border-gray-200 hover:border-blue-400 hover:shadow-blue-200'
              }`}
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              {/* Delete button for custom items */}
              {item.isCustom && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteBanner(item.id);
                  }}
                  className="absolute top-2 right-2 z-10 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              )}

              {/* Edit button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditBanner(item);
                }}
                className="absolute top-2 left-2 z-10 bg-blue-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-blue-600"
              >
                <Edit size={16} />
              </button>

              {/* Item Image */}
              <div 
                className="w-full h-40 bg-cover bg-center relative"
                style={{ backgroundImage: `url(${item.image})` }}
                onClick={() => handleToggleActive(item.id)}
              >
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300"></div>
                {activeBanners.includes(item.id) && (
                  <div className="absolute top-2 left-2">
                    <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold shadow-lg">
                      Active
                    </span>
                  </div>
                )}
                {item.discount && (
                  <div className="absolute bottom-2 right-2">
                    <span className="px-2 py-1 bg-red-500 text-white rounded-lg text-xs font-bold shadow-lg">
                      {item.discount}
                    </span>
                  </div>
                )}
                
                {/* Toggle Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-30">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleActive(item.id);
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                      activeBanners.includes(item.id)
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {activeBanners.includes(item.id) ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>

              {/* Item Info */}
              <div className="p-4 bg-white">
                <h2 className="font-semibold text-lg text-center mb-1 text-gray-800 line-clamp-2">
                  {item.title}
                </h2>
                {item.description && (
                  <p className="text-sm text-gray-600 text-center mb-2 line-clamp-2">
                    {item.description}
                  </p>
                )}
                {item.couponCode && (
                  <div className="text-center mb-2">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                      Coupon: {item.couponCode}
                    </span>
                  </div>
                )}
                <div className="flex justify-center gap-2 flex-wrap">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCodeModal(true);
                      setNewBanner({ ...newBanner, code: generateBannerCode(item) });
                    }}
                    className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors duration-200 flex items-center gap-1"
                  >
                    <Code size={12} />
                    Code
                  </button>
                  {item.category === 'offer' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyOffer(item);
                      }}
                      className="px-3 py-1 bg-orange-100 text-orange-600 rounded-lg text-xs font-medium hover:bg-orange-200 transition-colors duration-200 flex items-center gap-1"
                    >
                      <ShoppingCart size={12} />
                      Apply
                    </button>
                  )}
                  {item.isCustom && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-lg text-xs font-medium">
                      Custom
                    </span>
                  )}
                  {item.category === 'offer' && (
                    <span className="px-3 py-1 bg-green-100 text-green-600 rounded-lg text-xs font-medium flex items-center gap-1">
                      <Percent size={10} />
                      Offer
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Apply Offer Modal */}
      {showApplyOfferModal && selectedOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Apply Offer: {selectedOffer.title}</h2>
                <p className="text-gray-600">{selectedOffer.description}</p>
                {selectedOffer.discount && (
                  <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {selectedOffer.discount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowApplyOfferModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Loading state for products */}
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <svg className="animate-spin h-8 w-8 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                <p className="text-gray-500 text-lg">Loading products...</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-4">
                    Selected Products: {selectedProducts.length} | Total Products Available: {products.length}
                  </p>
                  <div className="flex gap-3 mb-4">
                    <button
                      onClick={() => {
                        const allProductIds = products.map(p => p._id);
                        setSelectedProducts(allProductIds);
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Select All ({products.length})
                    </button>
                    <button
                      onClick={() => setSelectedProducts([])}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={confirmApplyOffer}
                      disabled={selectedProducts.length === 0}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Apply Offer
                    </button>
                  </div>
                </div>

                {/* Product Categories */}
                <div className="space-y-6">
                  {productCategories.map((category) => {
                    const categoryProducts = getProductsByCategory(category.id);
                    if (categoryProducts.length === 0) return null;

                    return (
                      <div key={category.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{category.icon}</span>
                            <h3 className="text-lg font-semibold text-gray-800">
                              {category.name} ({categoryProducts.length} products)
                            </h3>
                          </div>
                          <button
                            onClick={() => handleCategoryToggle(category.id)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                              isCategoryFullySelected(category.id)
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : isCategoryPartiallySelected(category.id)
                                ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                                : 'bg-green-500 text-white hover:bg-green-600'
                            }`}
                          >
                            {isCategoryFullySelected(category.id)
                              ? 'Remove All'
                              : isCategoryPartiallySelected(category.id)
                              ? 'Select All'
                              : 'Select All'
                            }
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {categoryProducts.map((product) => (
                            <div
                              key={product._id}
                              className={`border rounded-lg p-3 cursor-pointer transition-all ${
                                isProductSelected(product._id)
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => handleProductToggle(product._id)}
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-12 h-12 object-contain bg-white rounded"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'https://via.placeholder.com/150?text=' + encodeURIComponent(product.name);
                                  }}
                                />
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm truncate">{product.name}</h4>
                                  <p className="text-xs text-gray-600">{product.brand}</p>
                                  <p className="text-sm font-semibold text-green-600">₹{product.price}</p>
                                  {product.volume && (
                                    <p className="text-xs text-blue-600">{product.volume}ml</p>
                                  )}
                                </div>
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                  isProductSelected(product._id)
                                    ? 'bg-green-500 border-green-500'
                                    : 'border-gray-300'
                                }`}>
                                  {isProductSelected(product._id) && (
                                    <CheckCircle2 size={12} className="text-white" />
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center mt-8">
                  <p className="text-gray-600">
                    {selectedProducts.length} products selected out of {products.length} total products
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowApplyOfferModal(false)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmApplyOffer}
                      disabled={selectedProducts.length === 0}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Apply Offer
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Active Items Modal */}
      {showActiveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Active Items on Customer Dashboard</h2>
              <button
                onClick={() => setShowActiveModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {activeItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {activeItems.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 bg-gray-50">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                    )}
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.category === 'offer' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.category === 'offer' ? 'Offer' : 'Banner'}
                      </span>
                      {item.discount && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                          {item.discount}
                        </span>
                      )}
                    </div>
                    {item.couponCode && (
                      <div className="mt-2">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                          Code: {item.couponCode}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No active items on customer dashboard</p>
                <p className="text-gray-400 text-sm mt-2">Click on any banner or offer to activate it</p>
              </div>
            )}

            <div className="flex justify-between items-center mt-6">
              <p className="text-gray-600">
                Total Active: {activeItems.length} items
              </p>
              <div className="flex gap-3">
                {activeBanners.length > 0 && (
                  <button
                    onClick={handleDeactivateAll}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                  >
                    Deactivate All
                  </button>
                )}
                <button
                  onClick={() => setShowActiveModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Add New {activeTab === 'banners' ? 'Banner' : 'Offer'}</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Category Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Type</label>
              <div className="flex gap-4">
                <button
                  onClick={() => setNewBanner({ ...newBanner, category: 'banner' })}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all duration-200 ${
                    newBanner.category === 'banner'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Eye className="mx-auto mb-2" size={20} />
                  Banner
                </button>
                <button
                  onClick={() => setNewBanner({ ...newBanner, category: 'offer' })}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all duration-200 ${
                    newBanner.category === 'offer'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Gift className="mx-auto mb-2" size={20} />
                  Offer
                </button>
              </div>
            </div>

            {/* Method Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Add Method</label>
              <div className="flex gap-4">
                <button
                  onClick={() => setAddMethod('photo')}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all duration-200 ${
                    addMethod === 'photo'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Upload className="mx-auto mb-2" size={20} />
                  Form
                </button>
                <button
                  onClick={() => setAddMethod('code')}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all duration-200 ${
                    addMethod === 'code'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Code className="mx-auto mb-2" size={20} />
                  Code
                </button>
                <button
                  onClick={() => setAddMethod('upload')}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all duration-200 ${
                    addMethod === 'upload'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <ImageIcon className="mx-auto mb-2" size={20} />
                  Upload
                </button>
              </div>
            </div>

            {addMethod === 'photo' ? (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={newBanner.title}
                    onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter title"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image URL *</label>
                  <input
                    type="url"
                    value={newBanner.image}
                    onChange={(e) => setNewBanner({ ...newBanner, image: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                  {newBanner.image && (
                    <div className="mt-3">
                      <img
                        src={newBanner.image}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
                {newBanner.category === 'offer' && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={newBanner.description}
                        onChange={(e) => setNewBanner({ ...newBanner, description: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="Offer description"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Discount</label>
                      <input
                        type="text"
                        value={newBanner.discount}
                        onChange={(e) => setNewBanner({ ...newBanner, discount: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 10% off"
                      />
                    </div>
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Coupon Code</label>
                      <input
                        type="text"
                        value={newBanner.couponCode}
                        onChange={(e) => setNewBanner({ ...newBanner, couponCode: e.target.value.toUpperCase() })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., SAVE20"
                      />
                    </div>
                  </>
                )}
              </>
            ) : addMethod === 'code' ? (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Code</label>
                <textarea
                  value={newBanner.code}
                  onChange={(e) => setNewBanner({ ...newBanner, code: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  rows={10}
                  placeholder={`{
  id: "my-item",
  image: "https://example.com/image.jpg",
  title: "My Title",
  description: "Description here",
  discount: "10% off",
  couponCode: "CODE10",
  category: "${newBanner.category}"
}`}
                />
              </div>
            ) : (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  disabled={uploading}
                />
                {uploading && <div className="text-blue-500 mt-2">Uploading...</div>}
                {uploadError && <div className="text-red-500 mt-2">{uploadError}</div>}
                {newBanner.image && (
                  <div className="mt-3">
                    <img
                      src={newBanner.image}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="mb-4 mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={newBanner.title}
                    onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter title"
                  />
                </div>
                {newBanner.category === 'offer' && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={newBanner.description}
                        onChange={(e) => setNewBanner({ ...newBanner, description: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="Offer description"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Discount</label>
                      <input
                        type="text"
                        value={newBanner.discount}
                        onChange={(e) => setNewBanner({ ...newBanner, discount: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 10% off"
                      />
                    </div>
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Coupon Code</label>
                      <input
                        type="text"
                        value={newBanner.couponCode}
                        onChange={(e) => setNewBanner({ ...newBanner, couponCode: e.target.value.toUpperCase() })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., SAVE20"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddBanner}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Add {newBanner.category === 'banner' ? 'Banner' : 'Offer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingBanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Edit {editingBanner.category === 'banner' ? 'Banner' : 'Offer'}</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                value={newBanner.title}
                onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter title"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Image URL *</label>
              <input
                type="url"
                value={newBanner.image}
                onChange={(e) => setNewBanner({ ...newBanner, image: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            {editingBanner.category === 'offer' && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newBanner.description}
                    onChange={(e) => setNewBanner({ ...newBanner, description: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Offer description"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount</label>
                  <input
                    type="text"
                    value={newBanner.discount}
                    onChange={(e) => setNewBanner({ ...newBanner, discount: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 10% off"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Coupon Code</label>
                  <input
                    type="text"
                    value={newBanner.couponCode}
                    onChange={(e) => setNewBanner({ ...newBanner, couponCode: e.target.value.toUpperCase() })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., SAVE20"
                  />
                </div>
              </>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateBanner(newBanner)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Code View Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Item Code</h2>
              <button
                onClick={() => setShowCodeModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-6">
              <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                <code>{newBanner.code}</code>
              </pre>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(newBanner.code);
                  alert('Code copied to clipboard!');
                }}
                className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                Copy Code
              </button>
              <button
                onClick={() => setShowCodeModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Offers;
