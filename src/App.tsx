import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Flame, ShoppingBag, Package } from 'lucide-react';
import { CartProvider, useCart } from './context/CartContext';
import Hero from './components/Hero';
import Menu from './components/Menu';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import OrderTracking from './components/OrderTracking';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { Order } from './types/order';

function MainApp() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const { getTotalItems } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderPlaced = (order: Order) => {
    setCurrentOrder(order);
    setIsTrackingOpen(true);
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };

  const totalItems = getTotalItems();

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed w-full bg-white/95 backdrop-blur-sm shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-2">
              <Flame className="w-8 h-8 text-red-600" />
              <span className="text-2xl font-bold text-gray-900">Spicy Biryani</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#home" className="text-gray-700 hover:text-red-600 transition-colors font-medium">Home</a>
              <a href="#menu" className="text-gray-700 hover:text-red-600 transition-colors font-medium">Menu</a>
              <a href="#about" className="text-gray-700 hover:text-red-600 transition-colors font-medium">About</a>
              <a href="#contact" className="text-gray-700 hover:text-red-600 transition-colors font-medium">Contact</a>
              <button
                onClick={handleAdminClick}
                className="text-gray-700 hover:text-red-600 transition-colors font-medium"
              >
                Admin
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsTrackingOpen(true)}
                className="relative p-2.5 text-gray-700 hover:text-red-600 transition-colors"
                title="Track Order"
              >
                <Package className="w-6 h-6" />
              </button>
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative bg-red-600 text-white px-6 py-2.5 rounded-full hover:bg-red-700 transition-all transform hover:scale-105 font-medium shadow-lg flex items-center space-x-2"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Cart</span>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <Hero />
      <Menu />
      <About />
      <Contact />
      <Footer />

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
      />
      <Checkout
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderPlaced={handleOrderPlaced}
      />
      <OrderTracking
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        order={currentOrder}
      />
    </div>
  );
}

function AdminApp() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const adminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    setIsAdminLoggedIn(adminLoggedIn);
  }, []);

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    navigate('/');
  };

  if (!isAdminLoggedIn) {
    return <AdminLogin onLogin={handleAdminLogin} />;
  }

  return <AdminDashboard onLogout={handleAdminLogout} />;
}

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainApp />} />
          <Route path="/admin" element={<AdminApp />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
