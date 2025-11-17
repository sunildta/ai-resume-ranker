import { useEffect, useRef } from 'react';

const FeaturesSection = () => {
  const sectionRef = useRef(null);
  const featuresRef = useRef([]);

  const features = [
    {
      icon: '📄',
      title: 'Resume Parsing',
      description: 'Advanced AI algorithms extract and analyze key information from resumes in multiple formats.'
    },
    {
      icon: '🎯',
      title: 'Smart Shortlisting',
      description: 'Intelligent ranking system matches candidates to job requirements with precision scoring.'
    },
    {
      icon: '🤖',
      title: 'Test Automation',
      description: 'Automated skill assessments and coding challenges streamline the evaluation process.'
    },
    {
      icon: '✉️',
      title: 'AI Email Drafting',
      description: 'Generate personalized communication templates for candidate outreach and follow-ups.'
    }
  ];

  useEffect(() => {
    if (window.gsap && window.ScrollTrigger) {
      // Animate features on scroll
      featuresRef.current.forEach((feature, index) => {
        if (feature) {
          window.gsap.fromTo(feature, 
            { y: 100, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: "power2.out",
              delay: index * 0.2,
              scrollTrigger: {
                trigger: feature,
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
              }
            }
          );
        }
      });
    }
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Powerful Features for{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Modern Hiring
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Our AI-powered platform revolutionizes the way you discover, evaluate, and hire top talent
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              ref={(el) => (featuresRef.current[index] = el)}
              className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 text-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 border border-gray-200 dark:border-gray-700 shadow-lg"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
