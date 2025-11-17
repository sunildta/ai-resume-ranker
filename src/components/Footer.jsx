import { useEffect, useRef } from 'react';
import { useRouting } from '../hooks/useRouting';

const Footer = () => {
  const { goTo } = useRouting();
  const footerRef = useRef(null);
  const socialRef = useRef([]);

  const socialLinks = [
    { name: 'Twitter', icon: '🐦', href: '#' },
    { name: 'LinkedIn', icon: '💼', href: '#' },
    { name: 'GitHub', icon: '🐙', href: '#' },
    { name: 'Email', icon: '✉️', href: '#' }
  ];

  useEffect(() => {
    if (window.gsap && window.ScrollTrigger) {
      // Animate footer on scroll
      window.gsap.fromTo(footerRef.current, 
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 90%",
            end: "bottom 10%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Animate social icons
      socialRef.current.forEach((social, index) => {
        if (social) {
          window.gsap.set(social, { scale: 1 });
          
          social.addEventListener('mouseenter', () => {
            window.gsap.to(social, { scale: 1.2, duration: 0.3, ease: "power2.out" });
          });
          
          social.addEventListener('mouseleave', () => {
            window.gsap.to(social, { scale: 1, duration: 0.3, ease: "power2.out" });
          });
        }
      });
    }
  }, []);

  return (
    <footer ref={footerRef} className="bg-black/30 backdrop-blur-sm border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[wheat]">
                 AI Resume Ranker
              </span>
            </h3>
            <p className="text-gray-300 mb-6 max-w-md">
              Revolutionizing the hiring process with intelligent resume analysis and automated shortlisting.
            </p>
            
            {/* Social Media Icons */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  ref={(el) => (socialRef.current[index] = el)}
                  href={social.href}
                  className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-xl hover:bg-white/20 transition-all duration-300 cursor-pointer"
                  title={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => goTo('/')}
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => goTo('/about')}
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                >
                  About
                </button>
              </li>
              <li>
                <button 
                  onClick={() => goTo('/contact')}
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => goTo('/privacy')}
                  className="text-gray-300 hover:text-white transition-colors duration-300"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 pt-8 mt-8 text-center">
          <p className="text-gray-400">
            © 2025 Resume Ranker. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
