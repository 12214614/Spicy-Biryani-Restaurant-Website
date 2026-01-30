import { Star, Flame } from 'lucide-react';

export default function Hero() {
  return (
    <section id="home" className="pt-20 min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-red-100 text-red-700 px-4 py-2 rounded-full">
              <Flame className="w-5 h-5" />
              <span className="font-semibold">Authentic Indian Cuisine</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
              Experience the
              <span className="text-red-600 block mt-2">Spice of India</span>
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed">
              Indulge in aromatic biryanis crafted with passion, premium basmati rice,
              and a perfect blend of traditional spices that'll transport you to the heart of India.
            </p>

            <div className="flex items-center space-x-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-current" />
              ))}
              <span className="ml-3 text-gray-700 font-semibold">4.9/5 (2,450+ reviews)</span>
            </div>

            <div className="flex flex-wrap gap-4">
              <button className="bg-red-600 text-white px-8 py-4 rounded-full hover:bg-red-700 transition-all transform hover:scale-105 font-semibold text-lg shadow-xl">
                View Menu
              </button>
              <button className="bg-white text-red-600 border-2 border-red-600 px-8 py-4 rounded-full hover:bg-red-50 transition-all transform hover:scale-105 font-semibold text-lg shadow-lg">
                Order Online
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-3xl opacity-20 blur-3xl"></div>
            <img
              src="https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Delicious Biryani"
              className="relative rounded-3xl shadow-2xl w-full object-cover aspect-square"
            />
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl">
              <div className="text-center">
                <p className="text-4xl font-bold text-red-600">50+</p>
                <p className="text-gray-600 font-medium">Menu Items</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
