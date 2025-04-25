import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wine, ArrowRight, AlertCircle } from 'lucide-react';
import axios from 'axios';

function SignUp() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showInfo, setShowInfo] = useState(false); // This controls the visibility of the info modal
  const [showTermsModal, setShowTermsModal] = useState(false); // Modal for Terms & Conditions
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });

  const [extraData, setExtraData] = useState({
    state: '',
    city: '',
    dob: '',
    aadhaar: '',
    idProof: null as File | null,
    selfDeclaration: false,
  });

  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');

  const allowedAlcoholStates: Record<string, string[]> = {
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur'],
    'Goa': ['Panaji', 'Margao'],
    'Karnataka': ['Bengaluru', 'Mysuru', 'Mangalore'],
    'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai'],
    'Telangana': ['Hyderabad', 'Warangal'],
    'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur'],
    'West Bengal': ['Kolkata', 'Howrah', 'Durgapur'],
    'Delhi': ['New Delhi', 'Dwarka', 'Rohini'],
    'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar'],
    'Haryana': ['Gurgaon', 'Faridabad', 'Panipat'],
    'Rajasthan': ['Jaipur', 'Udaipur', 'Jodhpur'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Varanasi'],
    'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior'],
    'Odisha': ['Bhubaneswar', 'Cuttack', 'Puri'],
    'Himachal Pradesh': ['Shimla', 'Manali', 'Dharamshala'],
    'Assam': ['Guwahati', 'Dibrugarh', 'Silchar'],
    'Chhattisgarh': ['Raipur', 'Bilaspur', 'Durg'],
    'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad'],
    'Uttarakhand': ['Dehradun', 'Haridwar', 'Nainital'],
    'Jammu & Kashmir': ['Srinagar', 'Jammu'],
    'Ladakh': ['Leh', 'Kargil'],
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if the user agreed to the terms and conditions
    if (!agreed) {
      setError('Please agree to the terms and conditions');
      return;
    }

    // Prepare the data for submission (including file upload)
    const finalData = new FormData();
    Object.entries(formData).forEach(([key, val]) => finalData.append(key, val));
    Object.entries(extraData).forEach(([key, val]) =>
      key === 'idProof'
        ? val && finalData.append(key, val as Blob)
        : finalData.append(key, String(val))
    );

    try {
      // Submit the form data to the backend
      const res = await axios.post('http://localhost:5000/api/auth/signup', finalData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log(res.data);

      // After successful submission, show the Info Modal and set the submitted state
      setIsSubmitted(true);
      setShowInfo(true); // Show the modal
      setTimeout(() => navigate('/login'), 4000); // Redirect to the login page after 4 seconds
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto bg-white shadow rounded-full flex items-center justify-center">
            <Wine size={28} className="text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold mt-4">User Registration</h2>
          <p className="text-sm text-gray-500">Step {step} of 4</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 text-red-700 px-4 py-2 rounded flex items-center">
            <AlertCircle className="mr-2" /> <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <>
              <div>
                <label>State</label>
                <select
                  className="w-full border px-3 py-2 rounded"
                  value={extraData.state}
                  onChange={(e) =>
                    setExtraData({ ...extraData, state: e.target.value, city: '' })
                  }
                >
                  <option value="">-- Select State --</option>
                  {Object.keys(allowedAlcoholStates).map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>City</label>
                <select
                  className="w-full border px-3 py-2 rounded"
                  value={extraData.city}
                  onChange={(e) =>
                    setExtraData({ ...extraData, city: e.target.value })
                  }
                  disabled={!extraData.state}
                >
                  <option value="">-- Select City --</option>
                  {extraData.state &&
                    allowedAlcoholStates[extraData.state].map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                </select>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label>DOB</label>
                <input
                  type="date"
                  className="w-full border px-3 py-2 rounded"
                  value={extraData.dob}
                  onChange={(e) =>
                    setExtraData({ ...extraData, dob: e.target.value })
                  }
                />
              </div>
              <div>
                <label>Aadhaar Number</label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Enter Aadhaar"
                  value={extraData.aadhaar}
                  onChange={(e) =>
                    setExtraData({ ...extraData, aadhaar: e.target.value })
                  }
                />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <label>ID Proof (Upload)</label>
                <input
                  type="file"
                  className="w-full"
                  onChange={(e) =>
                    setExtraData({
                      ...extraData,
                      idProof: e.target.files?.[0] || null,
                    })
                  }
                />
              </div>
              <div className="mt-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={extraData.selfDeclaration}
                    onChange={() =>
                      setExtraData({
                        ...extraData,
                        selfDeclaration: !extraData.selfDeclaration,
                      })
                    }
                  />
                  <span>I declare the above information is correct</span>
                </label>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div>
                <label>Name</label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label>Email</label>
                <input
                  type="email"
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label>Mobile</label>
                <input
                  type="tel"
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Mobile Number"
                  value={formData.mobile}
                  onChange={(e) =>
                    setFormData({ ...formData, mobile: e.target.value })
                  }
                />
              </div>
              <div>
                <label>Password</label>
                <input
                  type="password"
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
              <div>
                <label>Confirm Password</label>
                <input
                  type="password"
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                />
              </div>

              {/* Terms Modal Trigger */}
              <div className="mt-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={agreed}
                    readOnly
                    onClick={() => setShowTermsModal(true)} // Open terms modal
                  />
                  <span className="cursor-pointer text-sm text-gray-800">
                    I agree to the <span className="text-blue-600 underline">Terms & Conditions</span>
                  </span>
                </label>
              </div>

              {/* ✅ Show message only after Submit */}
              {isSubmitted && (
                <p
                  className="text-sm text-green-700 font-medium mt-4 cursor-pointer hover:underline"
                  onClick={() => setShowInfo(true)}
                >
                  ✅ Account will be verified within 24 hours
                </p>
              )}
            </>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Back
              </button>
            )}
            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="ml-auto px-4 py-2 bg-orange-500 text-white rounded flex items-center space-x-1"
              >
                <span>Continue</span>
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                type="submit"
                className="ml-auto px-4 py-2 bg-green-600 text-white rounded"
              >
                Submit
              </button>
            )}
          </div>
        </form>

        {/* ✅ Info Modal */}
        {showInfo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-80 text-center shadow-xl">
              <h3 className="text-lg font-semibold mb-2">Verification Process</h3>
              <p className="text-sm text-gray-600">
                Your account and uploaded documents will be reviewed. You’ll receive confirmation mail if everything is valid.
              </p>
              <button
                onClick={() => setShowInfo(false)}
                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                Got it
              </button>
            </div>
          </div>
        )}

        {/* ✅ Terms Modal */}
        {showTermsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full text-left overflow-y-auto max-h-[90vh]">
              <h2 className="text-lg font-bold mb-2 text-center">Terms & Conditions (English)</h2>
              <p className="text-sm text-gray-700 mb-4">
                By accessing and using this website, you acknowledge and affirm that you are at least 21 years of age, or meet the minimum legal drinking age applicable in your state, as mandated by the governing State Excise Laws. For example, in Maharashtra and Karnataka, the minimum drinking age is 21, while in states like Delhi it is 25.
              </p>
              <p className="text-sm text-gray-700 mb-4">
                You understand that the purchase, possession, or consumption of alcohol without meeting this minimum age is a punishable offense under the relevant Prohibition and Excise Acts, and by continuing, you take full responsibility for complying with such laws.
              </p>
              <p className="text-sm text-gray-700 mb-4">
                If you are accessing this platform on behalf of a business or licensed establishment, or for purposes involving resale or bulk purchases, you are required to hold a valid liquor license issued by the applicable State Excise Department.
              </p>
              <h3 className="text-sm text-gray-700 mb-4"><strong>Government Rules & Excise Acts:</strong></h3>
              <ul className="list-disc pl-5">
                <li>✔ Maharashtra: Age 21</li>
                <li>✔ Delhi: Age 25</li>
                <li>✔ Karnataka: Age 21</li>
                <li>✔ Tamil Nadu: Only TASMAC allowed</li>
                <li>✔ Gujarat: Alcohol banned</li>
                <li>✔ Telangana: Excise Act applies</li>
              </ul>
              <p className="text-sm text-gray-700 mb-4">
                🚭 तुमच्या कुटुंबासाठी मद्यपान आणि धूम्रपान सोडा – आरोग्य हाच खरा धन आहे ❤️🍀
              </p>
              <div className="text-center">
                <button
                  onClick={() => {
                    setAgreed(true);
                    setShowTermsModal(false);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded mr-2"
                >
                  Agree & Continue
                </button>
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-black px-6 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SignUp;
