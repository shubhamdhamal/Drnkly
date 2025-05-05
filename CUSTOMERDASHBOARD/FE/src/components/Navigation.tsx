import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  ShoppingBag,
  ShoppingCart,
  User,
  Clock,
  ChevronRight,
} from 'lucide-react';



interface NavigationProps {
  isChatOpen: boolean;
  setIsChatOpen: (value: boolean) => void;
}

const Navigation: React.FC<NavigationProps> = ({ isChatOpen, setIsChatOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const hiddenPaths = ['/', '/signup', '/login', '/verify-age'];
  const [showPopup, setShowPopup] = useState(false);
  const [agreeChecked, setAgreeChecked] = useState(false);
  const [nextRoute, setNextRoute] = useState<string | null>(null);

  if (hiddenPaths.includes(location.pathname)) return null;

  const handleNavClick = (path: string) => {
    if (path === 'chat') {
      setIsChatOpen(true);
      return;
    }

    setAgreeChecked(false);
    setNextRoute(path);
    setShowPopup(true);
  };

  const agreeAndGo = () => {
    if (!agreeChecked) {
      alert("कृपया अटी आणि शर्ती वाचून स्वीकारा.");
      return;
    }
    if (nextRoute) {
      navigate(nextRoute);
      setShowPopup(false);
      setNextRoute(null);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Terms Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <ChevronRight className="h-6 w-6 transform rotate-180 mr-2" />
              <h2 className="text-2xl font-bold">Terms & Regulations</h2>
            </div>

            <section className="mb-6">
              <h3 className="text-xl text-red-600 font-semibold mb-2">
                Terms & Conditions
              </h3>
              <p className="text-sm text-gray-700 mb-4">
              1. Age Verification & Legal Drinking Age:The customer must confirm they are 21 years or older (Hard Liquor Prohibited) or 25 years or older (for All liquor) as per Maharashtra excise rules.Age verification via government ID (Aadhaar, PAN, Driving License, Passport) is mandatory before delivery.  </p>
              <p className="text-sm text-gray-700 mb-4">
              2. Prohibition of Sale to Intoxicated Persons:Liquor will not be delivered to anyone who appears intoxicated at the time of delivery.            </p>
              <p className="text-sm text-gray-700 mb-4">
              3. Prohibition of Sale in Dry Areas:Liquor cannot be sold or delivered in dry areas (where prohibition is enforced). The customer must confirm their delivery location is not in a dry zone.            </p>
            
              <p className="text-sm text-gray-700 mb-4">
              4. Restricted Timings for Sale & Delivery:Liquor delivery is allowed only during permitted hours (typically 11 AM to 11 PM in most areas, subject to local regulations).          </p>
              <p className="text-sm text-gray-700 mb-4">
              5. Quantity Restrictions:Customers cannot purchase beyond the permissible limit (e.g., 3 liters of IMFL or 9 liters of beer per person per transaction). Bulk purchases may require additional permits.          </p>
              <p className="text-sm text-gray-700 mb-4">
              6. No Resale or Supply to Minors:The customer must agree not to resell liquor and not to supply it to minors (under 21/25).         </p>
              <p className="text-sm text-gray-700 mb-4">
              7. Valid ID Proof Required at Delivery:The delivery agent will verify the customer’s original ID at the time of delivery. If ID is not provided, the order will be cancelled. </p> 
              <p className="text-sm text-gray-700 mb-4">
              8. No Returns or Refunds for Sealed Liquor Bottles:Once liquor is sold, returns or refunds are not permitted unless the product is damaged/spoiled (as per excise rules).
              </p>
             <p className="text-sm text-gray-700 mb-4">
             9. Compliance with Local Municipal & Police Regulations:The customer must ensure that liquor consumption at their location complies with local laws (e.g., no consumption in public places).</p>
             <p className="text-sm text-gray-700 mb-4">
             10. Liability Disclaimer:The business is not responsible for misuse, overconsumption, or illegal resale by the customer.</p>
<p className="text-sm text-gray-700 mb-4">
11. Right to Refuse Service
      The business reserves the right to cancel orders if:
            The customer fails age verification.
            The delivery location is in a dry area or restricted zone.
            Suspicion of fraudulent activity.</p>
<p className="text-sm text-gray-700 mb-4">
             12. Data Privacy & Use of Customer Information:Customer ID and personal data will be stored as per excise department requirements and may be shared with authorities if required.
</p>
<p className="text-sm text-gray-700 mb-4">
13. Mandatory Compliance with Maharashtra Excise Laws:The customer agrees that the sale is governed by the Maharashtra Prohibition Act, 1949, and any violation may lead to legal action.</p>
            </section>

            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Declaration:</h3>
              <input
                type="text"
                placeholder="Liquor License No. (if any)"
                className="w-full px-3 py-2 border border-gray-300 rounded mb-3"
              />
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={agreeChecked}
                  onChange={(e) => setAgreeChecked(e.target.checked)}
                  className="mt-1"
                />
                <label className="text-sm text-gray-700">
                  I confirm I’m of legal age and agree to all terms above.
                </label>
              </div>
              <button
                onClick={agreeAndGo}
                className="mt-4 bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"
              >
                AGREE AND CONTINUE
              </button>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-red-600 mb-2">
                Government Rules & Excise Acts
              </h3>
              <p className="text-sm text-gray-700">
                ✔ Maharashtra: Age 21 <br />
                ✔ Delhi: Age 25 <br />
                ✔ Karnataka: Age 21 <br />
                ✔ Tamil Nadu: Only TASMAC allowed <br />
                ✔ Gujarat: Alcohol banned <br />
                ✔ Telangana: Excise Act applies <br />
              </p>
            </section>

            <section className="mt-6">
              <p className="text-lg text-red-600 font-semibold">
                🚭 तुमच्या कुटुंबासाठी मद्यपान आणि धूम्रपान सोडा🚯 – आरोग्य हाच खरा धन आहे ❤🍀
              </p>
            </section>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 z-40">
        <div className="max-w-lg mx-auto px-4 py-2 flex justify-between items-center">
          <NavButton
            icon={<Home size={24} />}
            label="Home"
            isActive={isActive('/dashboard')}
            onClick={() => handleNavClick('/dashboard')}
          />
          <NavButton
            icon={<ShoppingBag size={24} />}
            label="Products"
            isActive={isActive('/products')}
            onClick={() => handleNavClick('/products')}
          />
          <NavButton
            icon={<ShoppingCart size={24} />}
            label="Cart"
            isActive={isActive('/cart')}
            onClick={() => handleNavClick('/cart')}
          />
          <NavButton
            icon={<Clock size={24} />}
            label="Orders"
            isActive={isActive('/order-history')}
            onClick={() => handleNavClick('/order-history')}
          />
          <NavButton
            icon={<User size={24} />}
            label="Profile"
            isActive={isActive('/profile')}
            onClick={() => handleNavClick('/profile')}
          />
        </div>
        <div className="py-1 text-center text-red-500 text-sm font-semibold">
        🚭 तुमच्या कुटुंबासाठी मद्यपान आणि धूम्रपान सोडा 🚯
        </div>
      </nav>


    </>
  );
};

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center px-3 py-2 ${
      isActive ? 'text-blue-600' : 'text-gray-600'
    }`}
  >
    {icon}
    <span className="text-xs">{label}</span>
  </button>
);

export default Navigation;