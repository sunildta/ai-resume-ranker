import { useEffect, useRef } from 'react';
import { useRouting } from '../hooks/useRouting';


const HowItWorksSection = () => {
  const sectionRef = useRef(null);
  const stepsRef = useRef([]);
  const { goTo } = useRouting(); 

  const steps = [
    {
      step: '01',
      title: 'Upload Resumes',
      description: 'Simply drag and drop resumes or import from your existing database. Our system supports multiple formats.',
      icon: '📤'
    },
    {
      step: '02',
      title: 'AI Analysis',
      description: 'Our advanced AI algorithms parse and analyze each resume, extracting key skills and qualifications.',
      icon: '🔍'
    },
    {
      step: '03',
      title: 'Smart Ranking',
      description: 'Candidates are automatically ranked based on job requirements with detailed scoring and insights.',
      icon: '⭐'
    },
    {
      step: '04',
      title: 'Connect & Hire',
      description: 'Reach out to top candidates with AI-generated personalized messages and streamline your hiring.',
      icon: '🤝'
    }
  ];

  useEffect(() => {
    if (window.gsap && window.ScrollTrigger) {
      // Animate steps on scroll
      stepsRef.current.forEach((step, index) => {
        if (step) {
          window.gsap.fromTo(step, 
            { x: index % 2 === 0 ? -100 : 100, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: step,
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
    <section ref={sectionRef} className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            How It{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Get started in minutes with our intuitive, AI-powered hiring platform
          </p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500 opacity-30"></div>

          {steps.map((stepData, index) => (
            <div
              key={index}
              ref={(el) => (stepsRef.current[index] = el)}
              className={`relative flex items-center mb-16 ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              {/* Step content */}
              <div className={`w-full md:w-5/12 ${
                index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'
              }`}>
                <div className="bg-white dark:bg-gray-700 rounded-2xl p-8 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-300 shadow-lg">
                  <div className="flex items-center mb-4">
                    <span className="text-3xl mr-4">{stepData.icon}</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">{stepData.step}</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">{stepData.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{stepData.description}</p>
                </div>
              </div>

              {/* Timeline dot */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-4 border-gray-200 dark:border-gray-600 z-10"></div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <button onClick={() => goTo('/signup')} 
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
            Get Started Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
