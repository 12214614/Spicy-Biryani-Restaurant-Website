import { ChefHat, Award, Heart, Clock } from 'lucide-react';

const features = [
  {
    icon: ChefHat,
    title: 'Expert Chefs',
    description: 'Our master chefs bring decades of authentic Indian cooking expertise'
  },
  {
    icon: Award,
    title: 'Premium Quality',
    description: 'Only the finest ingredients and aged basmati rice in every dish'
  },
  {
    icon: Heart,
    title: 'Made with Love',
    description: 'Traditional recipes passed down through generations'
  },
  {
    icon: Clock,
    title: 'Fresh Daily',
    description: 'Every biryani is prepared fresh to order with no compromises'
  }
];

export default function About() {
  return (
    <section id="about" className="py-20 bg-gradient-to-br from-red-50 via-orange-50 to-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-3xl opacity-20 blur-3xl"></div>
            <img
              src="https://images.pexels.com/photos/1199960/pexels-photo-1199960.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Chef cooking biryani"
              className="relative rounded-3xl shadow-2xl w-full object-cover"
            />
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Authentic Flavors,
                <span className="text-red-600 block">Traditional Methods</span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                At Spicy Biryani, we honor the centuries-old tradition of biryani making.
                Each dish is a celebration of authentic Indian flavors, prepared using the
                time-tested dum pukht method that seals in aromas and creates layers of
                exquisite taste.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Our journey began with a simple mission: to bring the authentic taste of
                Hyderabadi biryani to food lovers everywhere. Today, we're proud to serve
                thousands of happy customers who trust us for an unforgettable dining experience.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                  >
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
