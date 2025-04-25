import React, { useState } from 'react';
import { DollarSign, Percent, CreditCard } from 'lucide-react';

function PaymentSettings() {
  const [commissionType, setCommissionType] = useState<'fixed' | 'percentage'>('percentage');
  const [commissionValue, setCommissionValue] = useState(15);
  const [enableFee, setEnableFee] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('default');
  const [saveSummary, setSaveSummary] = useState<string | null>(null);

  const baseAmount = 1000;

  const calculatedCommission =
    commissionType === 'fixed'
      ? commissionValue
      : (baseAmount * commissionValue) / 100;

  const discounts: Record<string, number> = {
    default: 0,
    paypal: 2,
    stripe: 1.5,
    credit: 3,
    bank: 0.5,
    check: 1,
    cod: 0, // ✅ Cash on Delivery added
  };

  const selectedDiscount = discounts[paymentMethod];
  const discountedAmount = baseAmount - (baseAmount * selectedDiscount) / 100;

  const handleSave = () => {
    const summary = `
Commission Type: ${commissionType}
Commission Value: ${commissionValue}${commissionType === 'percentage' ? '%' : ' ₹'}
Fee Slabs Enabled: ${enableFee ? 'Yes' : 'No'}
Payment Method: ${formatMethodName(paymentMethod)}
Discount: ${selectedDiscount}%
Discounted Amount on ₹${baseAmount}: ₹${discountedAmount.toFixed(2)}
Commission on ₹${baseAmount}: ₹${calculatedCommission.toFixed(2)}
    `;
    console.log(summary);
    setSaveSummary(summary.trim());
  };

  const formatMethodName = (method: string) => {
    if (method === 'cod') return 'Cash on Delivery';
    return method.charAt(0).toUpperCase() + method.slice(1);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Payment & Commission Settings</h2>
      <div className="bg-white rounded-lg shadow p-6">
        {/* Commission Settings */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Vendor Commissions</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Commission Type</label>
            <div className="flex space-x-4">
              <button
                onClick={() => setCommissionType('fixed')}
                className={`px-4 py-2 rounded-lg flex items-center ${
                  commissionType === 'fixed' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <DollarSign size={20} className="mr-2" />
                Fixed
              </button>
              <button
                onClick={() => setCommissionType('percentage')}
                className={`px-4 py-2 rounded-lg flex items-center ${
                  commissionType === 'percentage' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Percent size={20} className="mr-2" />
                Percentage
              </button>
            </div>
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Commission Value</label>
            <div className="flex items-center">
              <input
                type="range"
                min="0"
                max="100"
                value={commissionValue}
                onChange={(e) => setCommissionValue(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="ml-4 min-w-[4rem] text-center">
                {commissionValue}{commissionType === 'percentage' ? '%' : ' ₹'}
              </span>
            </div>
          </div>

          <p className="text-sm mt-2 text-blue-700">
            Commission on ₹{baseAmount} = ₹{calculatedCommission.toFixed(2)}
          </p>
        </div>

        {/* Fee Slabs */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Fee Slabs</h3>
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={enableFee}
                onChange={() => setEnableFee(!enableFee)}
              />
              <div className={`w-10 h-6 bg-gray-200 rounded-full shadow-inner ${enableFee ? 'bg-blue-500' : ''}`}></div>
              <div className={`absolute w-4 h-4 bg-white rounded-full shadow top-1 left-1 transition ${enableFee ? 'transform translate-x-4' : ''}`}></div>
            </div>
            <span className="ml-3">Enable Fee Slabs</span>
          </label>
        </div>

        {/* Payment Methods with Discount */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
          <div className="space-y-2">
            {Object.keys(discounts).map((method) => {
              const methodName = formatMethodName(method);
              return (
                <label key={method} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="payment"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="flex items-center">
                      <CreditCard size={20} className="mr-2" />
                      {methodName}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {discounts[method] > 0 ? `-${discounts[method]}%` : 'No discount'}
                  </span>
                </label>
              );
            })}
          </div>

          {/* Live Discount Preview */}
          <p className="text-sm text-green-600 mt-2">
            Discount on ₹{baseAmount}: ₹{(baseAmount * selectedDiscount / 100).toFixed(2)} → ₹{discountedAmount.toFixed(2)}
          </p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>

        {/* Save Summary Output */}
        {saveSummary && (
          <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm whitespace-pre-wrap text-gray-800">
            <strong className="block mb-2 text-blue-600">Saved Settings:</strong>
            {saveSummary}
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentSettings;
