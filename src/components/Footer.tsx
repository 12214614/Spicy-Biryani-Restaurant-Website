import { Flame, Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Flame className="w-8 h-8 text-red-500" />
              <span className="text-2xl font-bold">Spicy Biryani</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Authentic Indian biryanis crafted with passion, tradition, and the finest ingredients.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#home" className="text-gray-400 hover:text-red-500 transition-colors">Home</a></li>
              <li><a href="#menu" className="text-gray-400 hover:text-red-500 transition-colors">Menu</a></li>
              <li><a href="#about" className="text-gray-400 hover:text-red-500 transition-colors">About</a></li>
              <li><a href="#contact" className="text-gray-400 hover:text-red-500 transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Services</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-red-500 transition-colors">Dine In</a></li>
              <li><a href="#" className="text-gray-400 hover:text-red-500 transition-colors">Takeaway</a></li>
              <li><a href="#" className="text-gray-400 hover:text-red-500 transition-colors">Online Order</a></li>
              <li><a href="#" className="text-gray-400 hover:text-red-500 transition-colors">Catering</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} Spicy Biryani. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
