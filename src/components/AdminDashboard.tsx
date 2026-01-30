import { useState, useEffect } from 'react';
import { LogOut, Package, Clock, CheckCircle, Truck, ChefHat, XCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface OrderItem {
  id: string;
  item_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  notes: string;
  total_amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  order_items?: OrderItem[];
}

interface AdminDashboardProps {
  onLogout: () => void;
}

const statusOptions = [
  { value: 'pending', label: 'Pending', icon: Clock, color: 'bg-yellow-500' },
  { value: 'confirmed', label: 'Confirmed', icon: CheckCircle, color: 'bg-blue-500' },
  { value: 'preparing', label: 'Preparing', icon: ChefHat, color: 'bg-purple-500' },
  { value: 'out_for_delivery', label: 'Out for Delivery', icon: Truck, color: 'bg-orange-500' },
  { value: 'delivered', label: 'Delivered', icon: Package, color: 'bg-green-500' },
  { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'bg-red-500' },
];

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      if (ordersData) {
        const ordersWithItems = await Promise.all(
          ordersData.map(async (order) => {
            const { data: items } = await supabase
              .from('order_items')
              .select('*')
              .eq('order_id', order.id);

            return { ...order, order_items: items || [] };
          })
        );

        setOrders(ordersWithItems);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('admin-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            fetchOrders();
          } else if (payload.eventType === 'UPDATE') {
            setOrders((prevOrders) =>
              prevOrders.map((order) =>
                order.id === payload.new.id
                  ? { ...order, ...payload.new }
                  : order
              )
            );
            if (selectedOrder?.id === payload.new.id) {
              setSelectedOrder((prev) => prev ? { ...prev, ...payload.new } : null);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (data) {
        setOrders(orders.map(order =>
          order.id === orderId ? { ...order, status: newStatus, updated_at: data.updated_at } : order
        ));

        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus, updated_at: data.updated_at });
        }
      }

      alert('Order status updated successfully!');
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status');
    }
  };

  const getStatusInfo = (status: string) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0];
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50">
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-red-100 mt-1">Manage your orders</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchOrders}
              className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-12 h-12 text-red-600 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl shadow-lg">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No orders yet</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">All Orders ({orders.length})</h2>
              {orders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer ${
                      selectedOrder?.id === order.id ? 'ring-4 ring-red-500' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{order.order_number}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className={`${statusInfo.color} text-white px-3 py-1 rounded-full flex items-center space-x-1 text-sm`}>
                        <StatusIcon className="w-4 h-4" />
                        <span>{statusInfo.label}</span>
                      </div>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600 mb-3">
                      <p><span className="font-semibold">Customer:</span> {order.customer_name}</p>
                      <p><span className="font-semibold">Phone:</span> {order.customer_phone}</p>
                      <p><span className="font-semibold">Payment:</span> {order.payment_method.toUpperCase()}</p>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                      <span className="text-sm text-gray-600">Total Amount</span>
                      <span className="text-2xl font-bold text-red-600">₹{order.total_amount}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedOrder && (
              <div className="lg:sticky lg:top-6 h-fit">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6">
                    <h2 className="text-2xl font-bold">Order Details</h2>
                    <p className="text-red-100">{selectedOrder.order_number}</p>
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6">
                      <h3 className="font-bold text-gray-900 mb-3">Customer Information</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-semibold">Name:</span> {selectedOrder.customer_name}</p>
                        <p><span className="font-semibold">Email:</span> {selectedOrder.customer_email}</p>
                        <p><span className="font-semibold">Phone:</span> {selectedOrder.customer_phone}</p>
                        <p><span className="font-semibold">Address:</span> {selectedOrder.delivery_address}</p>
                        {selectedOrder.notes && (
                          <p><span className="font-semibold">Notes:</span> {selectedOrder.notes}</p>
                        )}
                        <p><span className="font-semibold">Payment:</span> {selectedOrder.payment_method.toUpperCase()}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 mb-3">Order Items</h3>
                      <div className="space-y-2">
                        {selectedOrder.order_items?.map((item) => (
                          <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                            <div>
                              <p className="font-semibold text-gray-900">{item.item_name}</p>
                              <p className="text-sm text-gray-600">Qty: {item.quantity} × ₹{item.price}</p>
                            </div>
                            <p className="font-bold text-red-600">₹{item.quantity * item.price}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                        <span className="text-lg font-semibold">Total</span>
                        <span className="text-2xl font-bold text-red-600">₹{selectedOrder.total_amount}</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 mb-3">Update Order Status</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {statusOptions.map((status) => {
                          const StatusIcon = status.icon;
                          return (
                            <button
                              key={status.value}
                              onClick={() => updateOrderStatus(selectedOrder.id, status.value)}
                              className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl transition-all ${
                                selectedOrder.status === status.value
                                  ? `${status.color} text-white`
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                              }`}
                            >
                              <StatusIcon className="w-5 h-5" />
                              <span className="font-semibold text-sm">{status.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
