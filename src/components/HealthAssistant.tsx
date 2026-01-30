import { X, Loader, Lightbulb } from 'lucide-react';
import { CartItem } from '../types/order';
import { useState, useEffect } from 'react';

interface HealthAssistantProps {
  items: CartItem[];
  onClose: () => void;
}

interface NutritionTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export default function HealthAssistant({ items, onClose }: HealthAssistantProps) {
  const [loading, setLoading] = useState(true);
  const [suggestion, setSuggestion] = useState('');
  const [totals, setTotals] = useState<NutritionTotals>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const analyzeNutrition = async () => {
      try {
        const cartItems = items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          calories: item.calories || 0,
          protein: item.protein || 0,
          carbs: item.carbs || 0,
          fat: item.fat || 0,
          fiber: item.fiber || 0,
        }));

        const calculatedTotals = cartItems.reduce(
          (acc, item) => ({
            calories: acc.calories + item.calories * item.quantity,
            protein: acc.protein + item.protein * item.quantity,
            carbs: acc.carbs + item.carbs * item.quantity,
            fat: acc.fat + item.fat * item.quantity,
            fiber: acc.fiber + item.fiber * item.quantity,
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
        );

        setTotals(calculatedTotals);

        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/nutrition-ai-analysis`;

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            items: cartItems,
            preferences: [],
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get AI analysis');
        }

        const data = await response.json();
        setSuggestion(data.suggestion || 'Unable to generate suggestions');
      } catch (err) {
        console.error('Error analyzing nutrition:', err);
        setError('Unable to analyze nutrition. Please try again.');
        setSuggestion('Unable to generate health suggestions at this moment.');
      } finally {
        setLoading(false);
      }
    };

    analyzeNutrition();
  }, [items]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-start">
          <div className="flex items-start space-x-3">
            <Lightbulb className="w-6 h-6 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold">Health Assistant</h2>
              <p className="text-blue-100 text-sm mt-1">AI-Powered Nutrition Analysis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-1 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <p className="text-gray-700 text-sm font-semibold mb-3">Your Order Summary</p>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm text-gray-700">
                  <span>{item.quantity}x {item.name}</span>
                  <span className="font-medium text-blue-600">
                    {item.calories ? `${item.calories * item.quantity} cal` : 'N/A'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
              <p className="text-gray-600 text-xs font-medium">Total Calories</p>
              <p className="text-xl font-bold text-orange-600 mt-1">
                {totals.calories}
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-gray-600 text-xs font-medium">Protein</p>
              <p className="text-xl font-bold text-blue-600 mt-1">
                {totals.protein.toFixed(1)}g
              </p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
              <p className="text-gray-600 text-xs font-medium">Carbs</p>
              <p className="text-xl font-bold text-yellow-600 mt-1">
                {totals.carbs.toFixed(1)}g
              </p>
            </div>

            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
              <p className="text-gray-600 text-xs font-medium">Fat</p>
              <p className="text-xl font-bold text-red-600 mt-1">
                {totals.fat.toFixed(1)}g
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <p className="text-gray-600 text-xs font-medium">Fiber</p>
              <p className="text-xl font-bold text-green-600 mt-1">
                {totals.fiber.toFixed(1)}g
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <p className="text-gray-600 text-xs font-medium">Items</p>
              <p className="text-xl font-bold text-purple-600 mt-1">
                {items.reduce((sum, item) => sum + item.quantity, 0)}
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-blue-600" />
              <span>AI Health Insights</span>
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader className="w-6 h-6 text-blue-600 animate-spin mr-2" />
                <span className="text-gray-600">Analyzing your order...</span>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 text-sm">
                {error}
              </div>
            ) : (
              <div className="bg-blue-50 text-gray-700 p-4 rounded-lg border border-blue-200 leading-relaxed">
                {suggestion}
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
