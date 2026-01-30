import { Flame, Star, Info } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { MenuItem } from '../types/order';
import NutritionInfo from './NutritionInfo';

const menuItems: MenuItem[] = [
  {
    id: 1,
    name: 'Hyderabadi Dum Biryani',
    description: 'Aromatic basmati rice layered with tender marinated meat, slow-cooked to perfection',
    price: 349,
    image: 'https://images.pexels.com/photos/12737543/pexels-photo-12737543.jpeg?auto=compress&cs=tinysrgb&w=600',
    spicy: 3,
    rating: 4.9,
    calories: 450,
    protein: 28,
    carbs: 52,
    fat: 12,
    fiber: 2,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false
  },
  {
    id: 2,
    name: 'Chicken Tikka Biryani',
    description: 'Smoky grilled chicken tikka pieces mixed with fragrant saffron rice',
    price: 299,
    image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=600',
    spicy: 2,
    rating: 4.8,
    calories: 420,
    protein: 30,
    carbs: 48,
    fat: 10,
    fiber: 1.5,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false
  },
  {
    id: 3,
    name: 'Mutton Dum Biryani',
    description: 'Premium mutton marinated in yogurt and spices, cooked with aged basmati',
    price: 399,
    image: 'https://images.pexels.com/photos/3434523/pexels-photo-3434523.jpeg?auto=compress&cs=tinysrgb&w=600',
    spicy: 3,
    rating: 4.9,
    calories: 520,
    protein: 32,
    carbs: 50,
    fat: 18,
    fiber: 2,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false
  },
  {
    id: 4,
    name: 'Paneer Biryani',
    description: 'Cottage cheese cubes with aromatic rice, perfect for vegetarian lovers',
    price: 249,
    image: 'https://images.pexels.com/photos/5410400/pexels-photo-5410400.jpeg?auto=compress&cs=tinysrgb&w=600',
    spicy: 2,
    rating: 4.7,
    calories: 420,
    protein: 18,
    carbs: 54,
    fat: 14,
    fiber: 3,
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false
  },
  {
    id: 5,
    name: 'Prawn Biryani',
    description: 'Succulent prawns cooked with coastal spices and premium rice',
    price: 449,
    image: 'https://images.pexels.com/photos/262959/pexels-photo-262959.jpeg?auto=compress&cs=tinysrgb&w=600',
    spicy: 3,
    rating: 4.8,
    calories: 480,
    protein: 35,
    carbs: 46,
    fat: 15,
    fiber: 2,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false
  },
  {
    id: 6,
    name: 'Vegetable Biryani',
    description: 'Mixed vegetables with aromatic herbs and basmati rice',
    price: 199,
    image: 'https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg?auto=compress&cs=tinysrgb&w=600',
    spicy: 1,
    rating: 4.6,
    calories: 380,
    protein: 12,
    carbs: 56,
    fat: 10,
    fiber: 5,
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: false
  }
];

export default function Menu() {
  const { addToCart } = useCart();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  return (
    <>
      {selectedItem && (
        <NutritionInfo item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
      <section id="menu" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-red-100 text-red-700 px-4 py-2 rounded-full mb-4">
              <Flame className="w-5 h-5" />
              <span className="font-semibold">Our Specialties</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Signature Biryanis
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Each biryani is carefully crafted with authentic spices and premium ingredients
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="relative overflow-hidden aspect-square">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span className="font-semibold text-gray-900">{item.rating}</span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                    <div className="flex space-x-1">
                      {[...Array(item.spicy)].map((_, i) => (
                        <Flame key={i} className="w-4 h-4 text-red-600 fill-current" />
                      ))}
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 leading-relaxed">{item.description}</p>

                  {item.calories && (
                    <div className="bg-orange-50 rounded-lg px-3 py-2 mb-4 text-center border border-orange-200">
                      <p className="text-sm font-semibold text-orange-700">{item.calories} kcal</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => addToCart(item)}
                      className="flex-1 bg-red-600 text-white px-6 py-2.5 rounded-full hover:bg-red-700 transition-all transform hover:scale-105 font-medium shadow-md"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="bg-blue-100 text-blue-600 hover:bg-blue-200 p-2.5 rounded-full transition-all font-medium shadow-md"
                    >
                      <Info className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex gap-1 mt-3">
                    {item.isVegetarian && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">Veg</span>
                    )}
                    {item.isVegan && (
                      <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-semibold">Vegan</span>
                    )}
                    {item.isGlutenFree && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">GF</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
