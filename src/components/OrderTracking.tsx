import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, Truck, ChefHat, X } from 'lucide-react';
import { Order, OrderStatus } from '../types/order';
import { supabase } from '../lib/supabase';

interface OrderTrackingProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

const statusSteps: { status: OrderStatus; label: string; icon: any }[] = [
  { status: 'pending', label: 'Order Placed', icon: Package },
  { status: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { status: 'preparing', label: 'Preparing', icon: ChefHat },
  { status: 'ready', label: 'Ready', icon: Clock },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { status: 'delivered', label: 'Delivered', icon: CheckCircle },
];

export default function OrderTracking({ isOpen, onClose, order }: OrderTrackingProps) {
  const [searchOrderNumber, setSearchOrderNumber] = useState('');
  const [displayOrder, setDisplayOrder] = useState<Order | null>(order);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setDisplayOrder(order);
  }, [order]);

  useEffect(() => {
    if (!displayOrder?.id) return;

    const channel = supabase
      .channel('order-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${displayOrder.id}`,
        },
        (payload) => {
          const updatedOrder = {
            ...displayOrder,
            status: payload.new.status as OrderStatus,
            updatedAt: payload.new.updated_at,
          };
          setDisplayOrder(updatedOrder);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [displayOrder?.id]);

  const handleSearch = async () => {
    if (!searchOrderNumber.trim()) {
      setError('Please enter an order number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', searchOrderNumber.trim())
        .maybeSingle();

      if (orderError) throw orderError;

      if (!orderData) {
        setError('Order not found. Please check your order number.');
        setLoading(false);
        return;
      }

      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderData.id);

      if (itemsError) throw itemsError;

      const foundOrder: Order = {
        id: orderData.id,
        orderNumber: orderData.order_number,
        customerName: orderData.customer_name,
        email: orderData.customer_email,
        phone: orderData.customer_phone,
        address: orderData.delivery_address,
        notes: orderData.notes || '',
        items: itemsData.map(item => ({
          id: item.id,
          name: item.item_name,
          price: Number(item.price),
          quantity: item.quantity,
        })),
        totalAmount: Number(orderData.total_amount),
        paymentMethod: orderData.payment_method,
        status: orderData.status as OrderStatus,
        createdAt: orderData.created_at,
        updatedAt: orderData.updated_at,
      };

      setDisplayOrder(foundOrder);
    } catch (err) {
      console.error('Error searching order:', err);
      setError('Failed to search order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentStatusIndex = statusSteps.findIndex(
    (step) => step.status === displayOrder?.status
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-red-600 to-orange-600 p-6 text-white rounded-t-3xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Track Your Order</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {!displayOrder && (
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Search Your Order</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={searchOrderNumber}
                  onChange={(e) => {
                    setSearchOrderNumber(e.target.value);
                    setError('');
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Enter order number (e.g., ORD-12345678)"
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:outline-none transition-colors"
                  disabled={loading}
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
              {error && (
                <p className="text-red-600 text-sm mt-3">{error}</p>
              )}
            </div>
          )}

          {displayOrder && (
            <>
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      {displayOrder.orderNumber}
                    </h3>
                    <p className="text-gray-600">
                      Ordered on {new Date(displayOrder.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-red-600">
                      ₹{displayOrder.totalAmount}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-orange-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Customer:</span> {displayOrder.customerName}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Phone:</span> {displayOrder.phone}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Address:</span> {displayOrder.address}
                  </p>
                  {displayOrder.notes && (
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Notes:</span> {displayOrder.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-6 text-lg">Order Status</h3>
                <div className="space-y-6">
                  {statusSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted = index <= currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;

                    return (
                      <div key={step.status} className="flex items-start gap-4">
                        <div className="relative">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                              isCompleted
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-400'
                            } ${isCurrent ? 'ring-4 ring-green-200 scale-110' : ''}`}
                          >
                            <Icon className="w-6 h-6" />
                          </div>
                          {index < statusSteps.length - 1 && (
                            <div
                              className={`absolute left-6 top-12 w-0.5 h-8 ${
                                isCompleted ? 'bg-green-500' : 'bg-gray-200'
                              }`}
                            />
                          )}
                        </div>
                        <div className="flex-1 pt-2">
                          <p
                            className={`font-semibold ${
                              isCompleted ? 'text-gray-900' : 'text-gray-400'
                            }`}
                          >
                            {step.label}
                          </p>
                          {isCurrent && (
                            <p className="text-sm text-green-600 font-medium mt-1">
                              Current Status
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">Order Items</h3>
                <div className="space-y-3">
                  {displayOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center bg-white p-4 rounded-xl"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity} × ₹{item.price}
                        </p>
                      </div>
                      <p className="font-bold text-red-600">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center text-sm text-gray-600">
                <p>Need help? Call us at +91 9390492316</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
