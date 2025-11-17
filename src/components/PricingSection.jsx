import { useState } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const PricingSection = () => {
  const [hoveredPlan, setHoveredPlan] = useState(null);

  const pricingPlans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '$29',
      period: '/month',
      description: 'Perfect for small teams and startups',
      features: [
        'Up to 50 resume reviews per month',
        'Basic AI analysis',
        'Email support',
        'Standard templates',
        'Basic analytics'
      ],
      buttonText: 'Get Started',
      isPopular: false,
      color: 'blue'
    },
    {
      id: 'professional',
      name: 'Professional',
      price: '$79',
      period: '/month',
      description: 'Most popular choice for growing companies',
      features: [
        'Up to 200 resume reviews per month',
        'Advanced AI analysis with scoring',
        'Priority email & chat support',
        'Custom templates',
        'Advanced analytics & reporting',
        'Team collaboration tools',
        'API access'
      ],
      buttonText: 'Start Free Trial',
      isPopular: true,
      color: 'purple'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$199',
      period: '/month',
      description: 'For large organizations with advanced needs',
      features: [
        'Unlimited resume reviews',
        'Custom AI model training',
        '24/7 dedicated support',
        'White-label solutions',
        'Advanced integrations',
        'Custom reporting',
        'SSO & security features',
        'Dedicated account manager'
      ],
      buttonText: 'Contact Sales',
      isPopular: false,
      color: 'green'
    }
  ];

  const getCardClasses = (plan) => {
    const baseClasses = "relative p-8 rounded-2xl transition-all duration-300 transform";
    const hoverClasses = hoveredPlan === plan.id 
      ? "scale-105 shadow-2xl -translate-y-2" 
      : "hover:scale-105 hover:shadow-2xl hover:-translate-y-2";
    
    if (plan.isPopular) {
      return `${baseClasses} ${hoverClasses} bg-gradient-to-br from-purple-600 to-blue-600 text-white border-2 border-purple-500`;
    }
    
    return `${baseClasses} ${hoverClasses} bg-white border-2 border-gray-200 shadow-lg hover:border-${plan.color}-500`;
  };

  const getButtonClasses = (plan) => {
    if (plan.isPopular) {
      return "w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 bg-white text-purple-600 hover:bg-gray-100 hover:scale-105";
    }
    
    return `w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 bg-${plan.color}-600 text-white hover:bg-${plan.color}-700 hover:scale-105 hover:shadow-lg`;
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Perfect Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Streamline your hiring process with our AI-powered resume ranking system. 
            Choose the plan that fits your team's needs.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={getCardClasses(plan)}
              onMouseEnter={() => setHoveredPlan(plan.id)}
              onMouseLeave={() => setHoveredPlan(null)}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className={`text-2xl font-bold mb-2 ${plan.isPopular ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className={`text-5xl font-bold ${plan.isPopular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-lg ${plan.isPopular ? 'text-purple-100' : 'text-gray-500'}`}>
                    {plan.period}
                  </span>
                </div>
                <p className={`${plan.isPopular ? 'text-purple-100' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
              </div>

              {/* Features List */}
              <div className="mb-8">
                <ul className="space-y-4">
                  {plan.features.map((feature, index) => (
                    <li 
                      key={index} 
                      className="flex items-start"
                      style={{
                        transform: hoveredPlan === plan.id ? 'translateX(8px)' : 'translateX(0)',
                        transition: 'transform 0.3s ease'
                      }}
                    >
                      <CheckCircleIcon 
                        className={`h-5 w-5 mt-0.5 mr-3 flex-shrink-0 ${
                          plan.isPopular ? 'text-green-400' : 'text-green-500'
                        }`} 
                      />
                      <span className={`${plan.isPopular ? 'text-purple-100' : 'text-gray-700'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <button className={getButtonClasses(plan)}>
                {plan.buttonText}
              </button>

              {/* Animated Background Effect */}
              <div 
                className={`absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 ${
                  hoveredPlan === plan.id ? 'opacity-10' : ''
                }`}
                style={{
                  background: `linear-gradient(45deg, ${
                    plan.color === 'blue' ? '#3B82F6, #1D4ED8' :
                    plan.color === 'purple' ? '#8B5CF6, #7C3AED' :
                    '#10B981, #059669'
                  })`
                }}
              />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-6">
            Need a custom solution? We offer flexible pricing for enterprise needs.
          </p>
          <button className="px-8 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:border-purple-500 hover:text-purple-600 transition-all duration-300 hover:scale-105">
            Contact Our Sales Team
          </button>
        </div>

        {/* Money Back Guarantee */}
        <div className="text-center mt-12 p-6 bg-green-50 rounded-xl border-2 border-green-200">
          <div className="flex items-center justify-center mb-2">
            <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2" />
            <span className="text-green-800 font-semibold">30-Day Money-Back Guarantee</span>
          </div>
          <p className="text-green-700">
            Try any plan risk-free. If you're not satisfied, we'll refund your money, no questions asked.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
