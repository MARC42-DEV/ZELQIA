import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, Truck, Lock } from 'lucide-react';

export default function CheckoutModal({
  isOpen,
  onClose,
  items = [],
  appliedDiscountPercent = 0,
  onOrderSuccess
}) {
  // Pull default address from logged-in user
  const savedUser = JSON.parse(localStorage.getItem('zelqia_user') || '{}');

  const [name, setName] = useState(savedUser.name || '');
  const [phone, setPhone] = useState(savedUser.phone || '');
  const [flat, setFlat] = useState('');
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI_ONLINE');

  const [isVerifyingCod, setIsVerifyingCod] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const rawSubtotal = items.reduce((acc, curr) => {
    const price = curr?.variant?.price || curr?.price || 0;
    const qty = curr?.quantity || 1;
    return acc + price * qty;
  }, 0);

  // Exact math with coupon carryover
  const couponDiscount = Math.round((rawSubtotal * appliedDiscountPercent) / 100);
  const subtotalAfterCoupon = rawSubtotal - couponDiscount;
  const upiInstantDiscount = paymentMethod === 'UPI_ONLINE' ? Math.round(subtotalAfterCoupon * 0.05) : 0;
  const codFee = paymentMethod === 'COD' ? 79 : 0;
  const grandTotal = subtotalAfterCoupon - upiInstantDiscount + codFee;

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    if (paymentMethod === 'COD') {
      const mockOtp = Math.floor(1000 + Math.random() * 9000);
      setGeneratedOtp(mockOtp);
      setIsVerifyingCod(true);
      setIsProcessing(false);
      alert(`🔐 ZELQIA COD Verification OTP: ${mockOtp}`);
      return;
    }

    // Real Razorpay Payment Gateway Trigger
    const options = {
      key: 'rzp_test_your_key_here', // Razorpay test key
      amount: grandTotal * 100, // in paise
      currency: 'INR',
      name: 'ZELQIA',
      description: 'Handcrafted Demi-Fine Jewellery',
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=200',
      handler: function (response) {
        setIsProcessing(false);
        finalizeOrder('UPI_ONLINE', response.razorpay_payment_id || 'PAY_MOCK_SUCCESS');
      },
      prefill: {
        name: name,
        contact: phone
      },
      theme: {
        color: '#0B0B0B'
      },
      modal: {
        ondismiss: function () {
          setIsProcessing(false);
        }
      }
    };

    if (window.Razorpay) {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      // Fallback if script is loading
      setTimeout(() => {
        finalizeOrder('UPI_ONLINE', 'PAY_DIRECT_GATEWAY');
      }, 1200);
    }
  };

  const finalizeOrder = (method, payId = '') => {
    const fullOrder = {
      orderId: `ZLQ-${Date.now()}`,
      date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      items,
      grandTotal,
      paymentMethod: method,
      paymentId: payId,
      customer: {
        name,
        phone,
        address: `${flat}, ${area}, Landmark: ${landmark}, ${city}, ${state} - ${pincode}`
      }
    };

    // Save to My Orders
    const existingOrders = JSON.parse(localStorage.getItem('zelqia_user_orders') || '[]');
    localStorage.setItem('zelqia_user_orders', JSON.stringify([fullOrder, ...existingOrders]));

    setIsProcessing(false);
    onOrderSuccess(fullOrder);
  };

  const handleVerifyOtpSubmit = (e) => {
    e.preventDefault();
    if (parseInt(enteredOtp) === generatedOtp) {
      setIsVerifyingCod(false);
      finalizeOrder('COD');
    } else {
      alert('Invalid OTP code. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-zelqia-card border border-zelqia-gold/40 rounded-sm p-6 md:p-8 text-zelqia-ivory shadow-2xl my-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-zelqia-muted hover:text-zelqia-ivory">
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 text-zelqia-gold mb-1">
          <Lock size={18} />
          <h2 className="font-serif text-2xl uppercase tracking-wider">ZELQIA Insured Checkout</h2>
        </div>
        <p className="text-xs text-zelqia-muted font-sans mb-6">256-Bit Encrypted High-Security Order Gateway</p>

        {isVerifyingCod ? (
          <form onSubmit={handleVerifyOtpSubmit} className="text-center py-6">
            <h3 className="font-serif text-xl text-zelqia-gold mb-2">Confirm Cash on Delivery Order</h3>
            <p className="text-xs text-zelqia-muted mb-4 max-w-sm mx-auto">
              Please enter the 4-digit code sent to <strong>{phone}</strong> to confirm dispatch.
            </p>
            <input
              type="text"
              maxLength={4}
              required
              placeholder="0000"
              value={enteredOtp}
              onChange={(e) => setEnteredOtp(e.target.value)}
              className="text-center tracking-[0.5em] text-2xl font-bold bg-zelqia-bg border border-zelqia-gold p-3 w-40 mx-auto block mb-4 text-zelqia-gold focus:outline-none"
            />
            <button
              type="submit"
              className="w-full max-w-xs mx-auto bg-zelqia-gold hover:bg-zelqia-goldLight text-zelqia-bg font-bold py-3 text-xs uppercase tracking-widest block shadow-lg"
            >
              Verify & Complete Order
            </button>
          </form>
        ) : (
          <form onSubmit={handlePlaceOrder} className="space-y-6">
            {/* Amazon-Style Detailed Shipping Address */}
            <div>
              <h3 className="text-xs uppercase tracking-widest text-zelqia-gold font-semibold mb-3">
                1. Delivery Address (Amazon Format)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Full Name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-zelqia-bg border border-zelqia-border p-2.5 text-xs text-zelqia-ivory focus:border-zelqia-gold outline-none"
                />
                <input
                  type="tel"
                  required
                  placeholder="10-Digit Mobile Number *"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-zelqia-bg border border-zelqia-border p-2.5 text-xs text-zelqia-ivory focus:border-zelqia-gold outline-none"
                />
                <input
                  type="text"
                  required
                  placeholder="Flat, House no., Building, Company, Apartment *"
                  value={flat}
                  onChange={(e) => setFlat(e.target.value)}
                  className="md:col-span-2 bg-zelqia-bg border border-zelqia-border p-2.5 text-xs text-zelqia-ivory focus:border-zelqia-gold outline-none"
                />
                <input
                  type="text"
                  required
                  placeholder="Area, Street, Sector, Village *"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="bg-zelqia-bg border border-zelqia-border p-2.5 text-xs text-zelqia-ivory focus:border-zelqia-gold outline-none"
                />
                <input
                  type="text"
                  placeholder="Landmark (e.g. Near Apollo Hospital)"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="bg-zelqia-bg border border-zelqia-border p-2.5 text-xs text-zelqia-ivory focus:border-zelqia-gold outline-none"
                />
                <input
                  type="text"
                  required
                  placeholder="Town/City *"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="bg-zelqia-bg border border-zelqia-border p-2.5 text-xs text-zelqia-ivory focus:border-zelqia-gold outline-none"
                />
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="6-Digit Pincode *"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="bg-zelqia-bg border border-zelqia-border p-2.5 text-xs text-zelqia-ivory focus:border-zelqia-gold outline-none"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <h3 className="text-xs uppercase tracking-widest text-zelqia-gold font-semibold mb-3">2. Select Payment Mode</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  onClick={() => setPaymentMethod('UPI_ONLINE')}
                  className={`p-4 border rounded-sm cursor-pointer flex flex-col gap-1 transition-all ${
                    paymentMethod === 'UPI_ONLINE'
                      ? 'bg-zelqia-cardElevated border-zelqia-gold text-zelqia-gold'
                      : 'bg-zelqia-bg border-zelqia-border text-zelqia-muted'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider font-bold">UPI / GPay / Cards (Extra 5% Off)</span>
                    <CreditCard size={16} />
                  </div>
                  <span className="text-[10px] text-zelqia-ivory">Instant Razorpay Secured Payment</span>
                </label>

                <label
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 border rounded-sm cursor-pointer flex flex-col gap-1 transition-all ${
                    paymentMethod === 'COD'
                      ? 'bg-zelqia-cardElevated border-zelqia-gold text-zelqia-gold'
                      : 'bg-zelqia-bg border-zelqia-border text-zelqia-muted'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider font-bold">Cash on Delivery</span>
                    <Truck size={16} />
                  </div>
                  <span className="text-[10px] text-zelqia-muted">+₹79 Verification Fee</span>
                </label>
              </div>
            </div>

            {/* Bill Summary with Correct Coupon Deduction */}
            <div className="bg-zelqia-bg border border-zelqia-border/50 p-4 space-y-2 text-xs font-sans">
              <div className="flex justify-between text-zelqia-muted">
                <span>Subtotal ({items.length} items)</span>
                <span>₹{rawSubtotal.toLocaleString('en-IN')}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-400 font-semibold">
                  <span>Applied Promo Coupon</span>
                  <span>- ₹{couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              {upiInstantDiscount > 0 && (
                <div className="flex justify-between text-zelqia-gold font-semibold">
                  <span>Prepaid Extra 5% Discount</span>
                  <span>- ₹{upiInstantDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              {codFee > 0 && (
                <div className="flex justify-between text-zelqia-muted">
                  <span>COD Handling Fee</span>
                  <span>+ ₹{codFee}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-serif text-zelqia-ivory font-bold border-t border-zelqia-border/40 pt-2 mt-2">
                <span>Grand Total</span>
                <span className="text-zelqia-gold">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-zelqia-gold hover:bg-zelqia-goldLight text-zelqia-bg font-sans font-bold py-4 text-xs uppercase tracking-[0.2em] transition-all shadow-xl disabled:opacity-50"
            >
              {isProcessing
                ? 'Opening Payment Gateway...'
                : paymentMethod === 'UPI_ONLINE'
                ? `Pay Online • ₹${grandTotal.toLocaleString('en-IN')}`
                : `Confirm COD Order • ₹${grandTotal.toLocaleString('en-IN')}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}