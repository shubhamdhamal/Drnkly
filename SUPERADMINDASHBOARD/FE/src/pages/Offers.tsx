import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, X, Upload, Code, Eye, EyeOff, Link, Image } from 'lucide-react';

interface Banner {
  id: string;
  image: string;
  title: string;
  isCustom?: boolean;
}

const defaultBanners: Banner[] = [
  {
    id: "old-monk",
    image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?q=80&w=800&auto=format&fit=crop",
    title: "Get OLD MONK Quarter",
  },
  {
    id: "no-service-fee",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop",
    title: "Get the Party Started",
  },
  {
    id: "weekend-vibes",
    image: "https://images.unsplash.com/photo-1516594798947-e65505dbb29d?q=80&w=800&auto=format&fit=crop",
    title: "🎉 Weekend Vibes",
  },
  {
    id: "loyalty-love",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800&auto=format&fit=crop",
    title: "🌟 Loyalty Love",
  },
  {
    id: "pre-book",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop",
    title: "🕒 Pre-book & Save",
  },
  {
    id: "snap-win",
    image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd195?q=80&w=800&auto=format&fit=crop",
    title: "📸 Snap & Win",
  },
  {
    id: "kids-party",
    image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=800&auto=format&fit=crop",
    title: "👶 Kids Party Bonus",
  },
  {
    id: "dj-addon",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=800&auto=format&fit=crop",
    title: "🎧 DJ Add-on Free",
  },
  {
    id: "ladies-special",
    image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?q=80&w=800&auto=format&fit=crop",
    title: "💃 Ladies Special",
  },
  {
    id: "midnight-mania",
    image: "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?q=80&w=800&auto=format&fit=crop",
    title: "🪩 Midnight Mania",
  },
];

const Offers: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>(defaultBanners);
  const [activeBanner, setActiveBanner] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [newBanner, setNewBanner] = useState({ title: '', image: '', code: '' });
  const [addMethod, setAddMethod] = useState<'photo' | 'code' | 'upload'>('photo');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    // Load banners from localStorage
    const savedBanners = localStorage.getItem('customBanners');
    if (savedBanners) {
      const customBanners = JSON.parse(savedBanners);
      setBanners([...defaultBanners, ...customBanners]);
    }

    // Fetch active banner from backend or localStorage
    const fetchActive = async () => {
      try {
        const res = await axios.get('/api/banners');
        setActiveBanner(res.data.activeBannerId);
      } catch (err) {
        // fallback: check localStorage
        const savedActive = localStorage.getItem('activeBanner');
        setActiveBanner(savedActive);
      }
    };
    fetchActive();
  }, []);

  const handleActivate = async (id: string) => {
    setLoading(true);
    try {
      // Call backend to activate this banner
      await axios.post(`/api/banners/activate/${id}`);
      setActiveBanner(id);
      localStorage.setItem('activeBanner', id);
    } catch (err) {
      // fallback: save to localStorage
      setActiveBanner(id);
      localStorage.setItem('activeBanner', id);
    }
    setLoading(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setNewBanner({ ...newBanner, image: '' }); // Clear URL when file is selected
    }
  };

  const handleAddBanner = async () => {
    if (!newBanner.title || (!newBanner.image && !newBanner.code && !selectedFile)) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);
    let bannerToAdd: Banner;

    try {
      if (addMethod === 'code') {
        // Existing code parsing logic
        const imageMatch = newBanner.code.match(/image:\s*["']([^"']+)["']/);
        const titleMatch = newBanner.code.match(/title:\s*["']([^"']+)["']/);
        
        if (!imageMatch || !titleMatch) {
          alert('Invalid code format. Please ensure your code contains image and title properties.');
          setLoading(false);
          return;
        }

        bannerToAdd = {
          id: `custom-${Date.now()}`,
          image: imageMatch[1],
          title: titleMatch[1],
          isCustom: true
        };
      } else if (addMethod === 'upload' && selectedFile) {
        // Handle file upload
        const formData = new FormData();
        formData.append('image', selectedFile);
        
        // Replace with your actual image upload API endpoint
        const response = await axios.post('https://admin.peghouse.in/api/admin/upload-banner', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('superadminToken')}`
          }
        });

        bannerToAdd = {
          id: `custom-${Date.now()}`,
          image: response.data.imageUrl, // Assuming the API returns the uploaded image URL
          title: newBanner.title,
          isCustom: true
        };
      } else {
        // URL input method
        bannerToAdd = {
          id: `custom-${Date.now()}`,
          image: newBanner.image,
          title: newBanner.title,
          isCustom: true
        };
      }

      const updatedBanners = [...banners, bannerToAdd];
      setBanners(updatedBanners);

      // Save custom banners to localStorage
      const customBanners = updatedBanners.filter(b => b.isCustom);
      localStorage.setItem('customBanners', JSON.stringify(customBanners));

      // Reset form
      setNewBanner({ title: '', image: '', code: '' });
      setSelectedFile(null);
      setPreviewUrl('');
      setShowAddModal(false);
      setShowCodeModal(false);
    } catch (error) {
      console.error('Error adding banner:', error);
      alert('Failed to add banner. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBanner = (id: string) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      const updatedBanners = banners.filter(b => b.id !== id);
      setBanners(updatedBanners);

      // Update localStorage
      const customBanners = updatedBanners.filter(b => b.isCustom);
      localStorage.setItem('customBanners', JSON.stringify(customBanners));

      // If deleted banner was active, clear active state
      if (activeBanner === id) {
        setActiveBanner(null);
        localStorage.removeItem('activeBanner');
      }
    }
  };

  const generateBannerCode = (banner: Banner) => {
    return `{
  id: "${banner.id}",
  image: "${banner.image}",
  title: "${banner.title}",
}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Banner Management</h1>
            <p className="text-gray-600">Manage your promotional banners and offers</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
          >
            <Plus size={20} />
            Add Banner
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Banners</h3>
            <p className="text-3xl font-bold text-blue-600">{banners.length}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Active Banner</h3>
            <p className="text-3xl font-bold text-green-600">{activeBanner ? '1' : '0'}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Custom Banners</h3>
            <p className="text-3xl font-bold text-purple-600">{banners.filter(b => b.isCustom).length}</p>
          </div>
        </div>

        {/* Banners Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className={`group relative rounded-xl shadow-lg overflow-hidden border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                activeBanner === banner.id 
                  ? 'border-green-500 ring-4 ring-green-200 shadow-green-200' 
                  : 'border-gray-200 hover:border-blue-400 hover:shadow-blue-200'
              }`}
              style={{ opacity: loading && activeBanner !== banner.id ? 0.6 : 1 }}
            >
              {/* Delete button for custom banners */}
              {banner.isCustom && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteBanner(banner.id);
                  }}
                  className="absolute top-2 right-2 z-10 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              )}

              {/* Banner Image */}
              <div 
                className="w-full h-40 bg-cover bg-center relative"
                style={{ backgroundImage: `url(${banner.image})` }}
                onClick={() => handleActivate(banner.id)}
              >
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300"></div>
                {activeBanner === banner.id && (
                  <div className="absolute top-2 left-2">
                    <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold shadow-lg">
                      Active
                    </span>
                  </div>
                )}
              </div>

              {/* Banner Info */}
              <div className="p-4 bg-white">
                <h2 className="font-semibold text-lg text-center mb-2 text-gray-800 line-clamp-2">
                  {banner.title}
                </h2>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCodeModal(true);
                      setNewBanner({ ...newBanner, code: generateBannerCode(banner) });
                    }}
                    className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors duration-200 flex items-center gap-1"
                  >
                    <Code size={12} />
                    Code
                  </button>
                  {banner.isCustom && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-lg text-xs font-medium">
                      Custom
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Banner Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Add New Banner</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Method Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Add Method</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setAddMethod('photo');
                      setSelectedFile(null);
                      setPreviewUrl('');
                    }}
                    className={`flex-1 p-3 rounded-lg border-2 transition-all duration-200 ${
                      addMethod === 'photo'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Link className="mx-auto mb-2" size={20} />
                    URL
                  </button>
                  <button
                    onClick={() => {
                      setAddMethod('upload');
                      setNewBanner({ ...newBanner, image: '' });
                    }}
                    className={`flex-1 p-3 rounded-lg border-2 transition-all duration-200 ${
                      addMethod === 'upload'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Upload className="mx-auto mb-2" size={20} />
                    Upload
                  </button>
                  <button
                    onClick={() => {
                      setAddMethod('code');
                      setSelectedFile(null);
                      setPreviewUrl('');
                    }}
                    className={`flex-1 p-3 rounded-lg border-2 transition-all duration-200 ${
                      addMethod === 'code'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Code className="mx-auto mb-2" size={20} />
                    Code
                  </button>
                </div>
              </div>

              {addMethod === 'photo' ? (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Banner Title</label>
                    <input
                      type="text"
                      value={newBanner.title}
                      onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter banner title"
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
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
                </>
              ) : addMethod === 'upload' ? (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Banner Title</label>
                    <input
                      type="text"
                      value={newBanner.title}
                      onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter banner title"
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
                    <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
                      <div className="space-y-1 text-center">
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileSelect}
                          id="banner-image"
                        />
                        <label
                          htmlFor="banner-image"
                          className="cursor-pointer"
                        >
                          {selectedFile ? (
                            <div>
                              <img
                                src={previewUrl}
                                alt="Preview"
                                className="mx-auto h-32 w-auto rounded-lg"
                              />
                              <p className="mt-2 text-sm text-gray-500">
                                Click to change image
                              </p>
                            </div>
                          ) : (
                            <div>
                              <Image
                                className="mx-auto h-12 w-12 text-gray-400"
                                aria-hidden="true"
                              />
                              <p className="mt-2 text-sm text-gray-500">
                                Click to upload image
                              </p>
                              <p className="text-xs text-gray-500">
                                PNG, JPG, GIF up to 10MB
                              </p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Banner Code</label>
                  <textarea
                    value={newBanner.code}
                    onChange={(e) => setNewBanner({ ...newBanner, code: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    rows={8}
                    placeholder={`{
  id: "my-banner",
  image: "https://example.com/image.jpg",
  title: "My Custom Banner",
}`}
                  />
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
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? 'Adding...' : 'Add Banner'}
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
                <h2 className="text-2xl font-bold text-gray-800">Banner Code</h2>
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
    </div>
  );
};

export default Offers;