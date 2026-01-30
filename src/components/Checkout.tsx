import { useState } from 'react';
import { X, MapPin, Phone, User, FileText, CreditCard, Wallet, Banknote } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Order, OrderStatus } from '../types/order';
import { supabase } from '../lib/supabase';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderPlaced: (order: Order) => void;
}

export default function Checkout({ isOpen, onClose, onOrderPlaced }: CheckoutProps) {
  const { cartItems, getTotalAmount, clearCart } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    paymentMethod: 'cod',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const orderId = crypto.randomUUID();
    const orderNumber = `ORD-${Date.now().toString().slice(-8)}`;
    const totalAmount = getTotalAmount();

    try {
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          order_number: orderNumber,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          delivery_address: formData.address,
          notes: formData.notes,
          total_amount: totalAmount,
          payment_method: formData.paymentMethod,
          status: 'pending',
        })
        .select()
        .maybeSingle();

      if (orderError) throw orderError;

      const orderItems = cartItems.map(item => ({
        order_id: orderId,
        item_name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      const emailPayload = {
        customerName: formData.name,
        customerEmail: formData.email,
        orderNumber: orderNumber,
        items: cartItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: totalAmount,
        deliveryAddress: formData.address,
        paymentMethod: formData.paymentMethod,
      };

      const smsPayload = {
        customerName: formData.name,
        customerPhone: formData.phone,
        orderNumber: orderNumber,
        totalAmount: totalAmount,
      };

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      Promise.all([
        fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify(emailPayload),
        }),
        fetch(`${supabaseUrl}/functions/v1/send-order-sms`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify(smsPayload),
        }),
      ]).catch(error => console.error('Notification error:', error));

      const order: Order = {
        id: orderId,
        orderNumber: orderNumber,
        customerName: formData.name,
        phone: formData.phone,
        address: formData.address,
        items: cartItems,
        totalAmount: totalAmount,
        status: 'pending' as OrderStatus,
        notes: formData.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      localStorage.setItem('lastOrder', JSON.stringify(order));

      onOrderPlaced(order);
      clearCart();
      setFormData({ name: '', email: '', phone: '', address: '', notes: '', paymentMethod: 'cod' });
      onClose();
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-red-600 to-orange-600 p-6 text-white rounded-t-3xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Complete Your Order</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">Order Summary</h3>
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-red-600">
                    ₹{item.price * item.quantity}
                  </p>
                </div>
              ))}
              <div className="border-t border-orange-200 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-red-600">
                    ₹{getTotalAmount()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Full Name</span>
                </div>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:outline-none transition-colors"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Email Address</span>
                </div>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:outline-none transition-colors"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>Phone Number</span>
                </div>
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:outline-none transition-colors"
                placeholder="+91 9390492316"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Delivery Address</span>
                </div>
              </label>
              <textarea
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:outline-none transition-colors resize-none"
                placeholder="Enter your complete delivery address"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Special Instructions (Optional)</span>
                </div>
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:outline-none transition-colors resize-none"
                placeholder="Any special requests?"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4" />
                  <span>Payment Method</span>
                </div>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                  className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border-2 transition-all ${
                    formData.paymentMethod === 'cod'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <Banknote className="w-5 h-5" />
                  <span className="font-semibold">Cash on Delivery</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: 'upi' })}
                  className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border-2 transition-all ${
                    formData.paymentMethod === 'upi'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <Wallet className="w-5 h-5" />
                  <span className="font-semibold">UPI</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: 'card' })}
                  className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border-2 transition-all ${
                    formData.paymentMethod === 'card'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="font-semibold">Card</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Place Order - ₹{getTotalAmount()}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
