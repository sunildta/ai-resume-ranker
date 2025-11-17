import { useEffect, useRef, useState } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const Pricing = () => {
  const pricingRef = useRef(null);
  const [hoveredPlan, setHoveredPlan] = useState(null);

  useEffect(() => {
    if (window.gsap && pricingRef.current) {
      window.gsap.fromTo(pricingRef.current, 
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
      );
    }
  }, []);

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
    const baseClasses = "relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 transition-all duration-300 transform";
    const hoverClasses = hoveredPlan === plan.id 
      ? "scale-105 shadow-2xl -translate-y-2 border-purple-500/50" 
      : "hover:scale-105 hover:shadow-2xl hover:-translate-y-2 hover:border-purple-500/50";
    
    if (plan.isPopular) {
      return `${baseClasses} ${hoverClasses} bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-purple-500`;
    }
    
    return `${baseClasses} ${hoverClasses}`;
  };

  const getButtonClasses = (plan) => {
    if (plan.isPopular) {
      return "w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:scale-105 hover:shadow-lg";
    }
    
    const colorMap = {
      blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
    };
    
    return `w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 bg-gradient-to-r ${colorMap[plan.color]} text-white hover:scale-105 hover:shadow-lg`;
  };

  return (
    <div ref={pricingRef} className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Choose Your Perfect{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Plan
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Streamline your hiring process with our AI-powered resume ranking system. 
            Choose the plan that fits your team's needs.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
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
                <h3 className="text-2xl font-bold text-white mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-white">
                    {plan.price}
                  </span>
                  <span className="text-lg text-gray-300">
                    {plan.period}
                  </span>
                </div>
                <p className="text-gray-300">
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
                      <CheckCircleIcon className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0 text-green-400" />
                      <span className="text-gray-300">
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
                  hoveredPlan === plan.id ? 'opacity-5' : ''
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

        {/* Additional Features Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-semibold text-white mb-4">💼 Enterprise Solutions</h3>
            <p className="text-gray-300 mb-6">
              Need a custom solution? We offer flexible pricing and tailored features for large organizations 
              with specific requirements.
            </p>
            <button className="px-8 py-3 border-2 border-purple-500 rounded-lg text-white font-semibold hover:bg-purple-500 transition-all duration-300 hover:scale-105">
              Contact Our Sales Team
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-semibold text-white mb-4">🛡️ Security & Compliance</h3>
            <p className="text-gray-300 mb-6">
              All plans include enterprise-grade security, GDPR compliance, and SOC 2 Type II certification 
              to keep your data safe and secure.
            </p>
            <button className="px-8 py-3 border-2 border-green-500 rounded-lg text-white font-semibold hover:bg-green-500 transition-all duration-300 hover:scale-105">
              Learn More
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-16">
          <h3 className="text-2xl font-semibold text-white mb-6 text-center">Frequently Asked Questions</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Can I change plans anytime?</h4>
              <p className="text-gray-300 mb-4">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
              
              <h4 className="text-lg font-semibold text-white mb-2">Do you offer refunds?</h4>
              <p className="text-gray-300">
                We offer a 30-day money-back guarantee on all plans. No questions asked.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Is there a setup fee?</h4>
              <p className="text-gray-300 mb-4">
                No setup fees. You only pay the monthly subscription fee for your chosen plan.
              </p>
              
              <h4 className="text-lg font-semibold text-white mb-2">What payment methods do you accept?</h4>
              <p className="text-gray-300">
                We accept all major credit cards, PayPal, and wire transfers for enterprise plans.
              </p>
            </div>
          </div>
        </div>

        {/* Money Back Guarantee */}
        <div className="text-center bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-2xl p-8 border border-green-500/20">
          <div className="flex items-center justify-center mb-4">
            <CheckCircleIcon className="h-8 w-8 text-green-400 mr-3" />
            <span className="text-2xl font-semibold text-white">30-Day Money-Back Guarantee</span>
          </div>
          <p className="text-gray-300 text-lg">
            Try any plan risk-free. If you're not completely satisfied, we'll refund your money, no questions asked.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
