import { useEffect, useRef } from 'react';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import HowItWorksSection from '../components/HowItWorksSection';

const Home = () => {
  const homeRef = useRef(null);

  useEffect(() => {
    if (window.gsap && homeRef.current) {
      window.gsap.fromTo(homeRef.current, 
        { opacity: 0 },
        { opacity: 1, duration: 1, ease: "power2.out" }
      );
    }
  }, []);

  return (
    <div ref={homeRef} className="pt-16">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
    </div>
  );
};

export default Home;
