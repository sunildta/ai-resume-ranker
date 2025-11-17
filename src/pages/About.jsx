import { useEffect, useRef } from 'react';

const About = () => {
  const aboutRef = useRef(null);

  useEffect(() => {
    if (window.gsap && aboutRef.current) {
      window.gsap.fromTo(aboutRef.current, 
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
      );
    }
  }, []);

  return (
    <div ref={aboutRef} className="pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            About{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Resume Ranker
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We're transforming the hiring landscape with cutting-edge AI technology
          </p>
        </div>

        <div className="space-y-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-4">Our Mission</h2>
            <p className="text-gray-300 leading-relaxed">
              At AI Resume Ranker, we believe that finding the right talent shouldn't be a time-consuming, 
              bias-prone process. Our mission is to revolutionize hiring by providing intelligent, 
              automated solutions that help companies identify the best candidates quickly and fairly.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-4">Our Technology</h2>
            <p className="text-gray-300 leading-relaxed">
              Powered by advanced natural language processing and machine learning algorithms, 
              our platform analyzes resumes with unprecedented accuracy. We extract key skills, 
              experience levels, and qualifications to provide comprehensive candidate insights.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-4">Why Choose Us</h2>
            <p className="text-gray-300 leading-relaxed">
              Our solution reduces hiring time by up to 70%, eliminates unconscious bias, 
              and ensures you never miss qualified candidates. Join thousands of companies 
              who trust AI Resume Ranker to streamline their hiring process.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
