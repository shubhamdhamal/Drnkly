import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, MapPin, Wine, Store, FileCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import FileUpload from '../components/FileUpload';

interface UploadedFiles {
  license?: File;
  id?: File;
}

const Registration: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFiles>({});
  const categories = ['Wine', 'Whiskey', 'Vodka'];
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'rejected'>('pending');
  const [vendorId, setVendorId] = useState<string>('');

  // New form state fields
  const [businessName, setBusinessName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: ''
  });

  useEffect(() => {
    if (!vendorId) return;

    const fetchStatus = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/vendor/status/${vendorId}`);
        setVerificationStatus(res.data.verificationStatus);
      } catch (err) {
        console.error('Error fetching vendor status:', err);
      }
    };

    fetchStatus();
  }, [vendorId]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleFileUpload = (type: keyof UploadedFiles) => (file: File) => {
    setUploadedFiles(prev => ({
      ...prev,
      [type]: file
    }));
  };

  const handlePrevious = async () => {
    if (step === 4) {
      const registrationData = {
        businessName,
        businessEmail,
        businessPhone,
        password,
        location,
        productCategories: selectedCategories,
      };
  
      console.log('📦 Sending to backend:', registrationData); // ✅ DEBUG this
  
      try {
        const res = await axios.post('http://localhost:5000/api/vendor/register', registrationData);
        setVendorId(res.data.vendorId);
        setStep(step + 1);
      } catch (error) {
        console.error('❌ Error registering vendor:', error);
      }
    } else {
      setStep(step - 1);
    }
  };
  
  const handleRegistration = async () => {
    const registrationData = {
      businessName,
      businessEmail,
      businessPhone,
      password,
      location,
      productCategories: selectedCategories,
    };
  
    try {
      console.log('📦 Sending to backend:', registrationData);
      const res = await axios.post('http://localhost:5000/api/vendor/register', registrationData);
      setVendorId(res.data.vendorId);
      setStep(5); // move to verification step
    } catch (error) {
      console.error('❌ Error registering vendor:', error);
    }
  };
  

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Business Information</h2>
            <Input label="Business Name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Enter your business name" required />
            <Input label="Business Email" type="email" value={businessEmail} onChange={(e) => setBusinessEmail(e.target.value)} placeholder="Enter your business email" required />
            <Input label="Business Phone" type="tel" value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} placeholder="Enter your business phone" required />
            <Input label="Create Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter a strong password" required />
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Document Upload</h2>
            <FileUpload label="Shop License" icon={<FileCheck className="w-12 h-12" />} accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload('license')} description={''} />
            <FileUpload label="ID Proof" icon={<Upload className="w-12 h-12" />} accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload('id')} description={''} />
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Location Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Address Line 1" value={location.addressLine1} onChange={(e) => setLocation({ ...location, addressLine1: e.target.value })} placeholder="Street address" required />
              <Input label="Address Line 2" value={location.addressLine2} onChange={(e) => setLocation({ ...location, addressLine2: e.target.value })} placeholder="Apartment, suite, etc." />
              <Input label="City" value={location.city} onChange={(e) => setLocation({ ...location, city: e.target.value })} placeholder="Enter city" required />
              <Input label="State" value={location.state} onChange={(e) => setLocation({ ...location, state: e.target.value })} placeholder="Enter state" required />
              <Input label="Postal Code" value={location.postalCode} onChange={(e) => setLocation({ ...location, postalCode: e.target.value })} placeholder="Enter postal code" required />
              <Button type="button" variant="secondary" icon={<MapPin className="w-5 h-5" />} className="mt-6">Use Current Location</Button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Product Categories</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map(category => (
                <button key={category} type="button" onClick={() => handleCategoryToggle(category)} className={`p-4 rounded-lg border-2 flex items-center gap-3 transition-colors ${selectedCategories.includes(category) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <Wine className="w-5 h-5" />
                  <span>{category}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Verification Status</h2>
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-yellow-800">Application Under Review</h3>
                    <p className="text-sm text-yellow-600 mt-1">Our team is reviewing your application. This usually takes 1-2 business days.</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    verificationStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : verificationStatus === 'verified'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {verificationStatus}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (step === 4) {
      const registrationData = {
        businessName,
        businessEmail,
        businessPhone,
        password,
        location,
        productCategories: selectedCategories,
      };
  
      console.log("🚀 Submitting vendor data:", JSON.stringify(registrationData, null, 2));
  
      try {
        const res = await axios.post('http://localhost:5000/api/vendor/register', registrationData);
        console.log("✅ Success:", res.data);
        setVendorId(res.data.vendorId);
        setStep(5);
      } catch (error: any) {
        console.error('❌ Registration failed:', error.response?.data || error.message);
      }
    } else if (step < 5) {
      setStep(step + 1);
    } else if (verificationStatus === 'verified') {
      navigate('/login');
    }
  };
  
  

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <Store className="w-12 h-12 mx-auto text-blue-600" />
            <h1 className="text-3xl font-bold mt-4">Vendor Registration</h1>
            <p className="text-gray-600 mt-2">Complete your profile to start selling</p>
          </div>
          <div className="flex justify-between mb-8 relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2" />
            <div className="absolute top-1/2 left-0 h-1 bg-blue-500 -translate-y-1/2 transition-all duration-300" style={{ width: `${((step - 1) / 4) * 100}%` }} />
            {[1, 2, 3, 4, 5].map(stepNumber => (
              <div key={stepNumber} className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${step >= stepNumber ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-gray-300 text-gray-500'}`}>
                <span className="text-sm">{stepNumber}</span>
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="space-y-8">
            {renderStep()}
            <div className="flex justify-between pt-6 border-t">
  {step > 1 && (
    <Button
      type="button"
      variant="secondary"
      onClick={() => setStep(step - 1)}
    >
      Previous
    </Button>
  )}

  <div className="flex flex-col">
    <Button
      type="submit"
      disabled={step === 5 && verificationStatus !== 'verified'}
      className={step === 1 ? 'w-full' : 'ml-auto'}
    >
      {step === 5 ? 'Complete Registration' : 'Continue'}
    </Button>
    {step === 5 && verificationStatus !== 'verified' && (
      <p className="text-sm text-red-600 mt-2">
        Admin approval is required to proceed.
      </p>
    )}
  </div>
</div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Registration;