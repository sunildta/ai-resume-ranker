import { useEffect, useRef } from 'react';

const Privacy = () => {
  const privacyRef = useRef(null);

  useEffect(() => {
    if (window.gsap && privacyRef.current) {
      window.gsap.fromTo(privacyRef.current, 
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
      );
    }
  }, []);

  return (
    <div ref={privacyRef} className="pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Privacy <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Policy</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Read our privacy policy to understand how we handle your data
          </p>
        </div>

        <div className="space-y-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-4">Information We Collect</h2>
            <p className="text-gray-300 leading-relaxed">
              We collect various types of information to provide and improve our service to you. This includes personal
              data, usage data, and cookies.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-4">How We Use Information</h2>
            <p className="text-gray-300 leading-relaxed">
              We use collected data to provide and maintain our services, notify you about changes, allow participation in
              interactive features, and improve customer support.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-4">Data Security</h2>
            <p className="text-gray-300 leading-relaxed">
              We prioritize the security of your data with established procedures and security protocols to protect your
              information from unauthorized access or disclosure.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-4">Your Rights</h2>
            <p className="text-gray-300 leading-relaxed">
              You have the right to access, update, or delete the personal information we have on you. You can also
              withdraw consent for data processing or object to its use.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;

