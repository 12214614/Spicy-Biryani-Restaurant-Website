import { X } from 'lucide-react';
import { MenuItem } from '../types/order';

interface NutritionInfoProps {
  item: MenuItem;
  onClose: () => void;
}

export default function NutritionInfo({ item, onClose }: NutritionInfoProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{item.name}</h2>
            <p className="text-red-100 text-sm mt-1">Nutritional Information</p>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-1 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4">
            <p className="text-gray-600 text-sm mb-2">Per Serving</p>
            <p className="text-3xl font-bold text-red-600">
              {item.calories || 'N/A'} <span className="text-lg text-gray-600">kcal</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <p className="text-gray-600 text-sm font-medium">Protein</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {item.protein || 0}
                <span className="text-sm text-gray-600">g</span>
              </p>
            </div>

            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
              <p className="text-gray-600 text-sm font-medium">Carbs</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {item.carbs || 0}
                <span className="text-sm text-gray-600">g</span>
              </p>
            </div>

            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <p className="text-gray-600 text-sm font-medium">Fat</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {item.fat || 0}
                <span className="text-sm text-gray-600">g</span>
              </p>
            </div>

            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <p className="text-gray-600 text-sm font-medium">Fiber</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {item.fiber || 0}
                <span className="text-sm text-gray-600">g</span>
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-bold text-gray-900 mb-3">Dietary Information</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${item.isVegetarian ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className="text-gray-700 text-sm">
                  {item.isVegetarian ? '✓ Vegetarian' : '✗ Non-Vegetarian'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${item.isVegan ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className="text-gray-700 text-sm">
                  {item.isVegan ? '✓ Vegan' : '✗ Non-Vegan'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${item.isGlutenFree ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className="text-gray-700 text-sm">
                  {item.isGlutenFree ? '✓ Gluten-Free' : '✗ Contains Gluten'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <p className="text-gray-700 text-sm leading-relaxed">
              This nutritional information is based on a standard serving. Actual values may vary based on preparation and portion size.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-red-600 text-white font-semibold py-3 rounded-xl hover:bg-red-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
