import { useEffect, useRef } from 'react';

const HeroSection = () => {
  const heroRef = useRef(null);
  const headingRef = useRef(null);
  const subtextRef = useRef(null);
  const ctaRef = useRef(null);
  const statsRef = useRef(null);
  const aiElementsRef = useRef([]);
  const floatingDocsRef = useRef([]);

  useEffect(() => {
    const runAnimations = () => {
      if (window.gsap) {
        console.log('GSAP found, running animations');
        const tl = window.gsap.timeline();

        // Main content animations
        tl.fromTo(headingRef.current,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: "power2.out" }
        )
        .fromTo(subtextRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
          "-=0.4"
        )
        .fromTo(ctaRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
          "-=0.2"
        )
        .fromTo(statsRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
          "-=0.2"
        );

        // Animate floating documents with staggered entrance
        floatingDocsRef.current.forEach((doc, index) => {
          if (doc) {
            console.log(`Animating document ${index}`);
            window.gsap.fromTo(doc,
              { y: -50, opacity: 0, rotation: -10 },
              {
                y: 0,
                opacity: 1,
                rotation: 0,
                duration: 1.2,
                ease: "power2.out",
                delay: 0.5 + index * 0.2
              }
            );

            // Continuous floating animation
            window.gsap.to(doc, {
              y: "-=20",
              duration: 3,
              ease: "power1.inOut",
              yoyo: true,
              repeat: -1,
              delay: index * 0.5
            });
          }
        });

        // Animate AI elements with pulsing effect (updated)
        aiElementsRef.current.forEach((element, index) => {
          if (element) {
            console.log(`Animating AI element ${index}`);
            window.gsap.fromTo(element,
              { scale: 0.8, opacity: 0.3, rotation: 0 },
              {
                scale: 1,
                opacity: 0.8,
                rotation: 360,
                duration: 1.5,
                ease: "back.out(1.7)",
                delay: 0.8 + index * 0.3
              }
            );

            // Continuous subtle rotation
            window.gsap.to(element, {
              rotation: "+=360",
              duration: 8,
              ease: "none",
              repeat: -1,
              delay: index * 1
            });

            // Subtle pulsing (no disappear)
            window.gsap.to(element, {
              scale: 1.05,
              opacity: 0.7,
              duration: 2.5,
              ease: "power1.inOut",
              yoyo: true,
              repeat: -1,
              delay: index * 0.7
            });
          }
        });
      } else {
        console.log('GSAP not found, retrying...');
        setTimeout(runAnimations, 100);
      }
    };

    runAnimations();
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center justify-center py-20 bg-gradient-to-b from-transparent to-gray-50/50 dark:from-transparent dark:to-gray-900/50">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] dark:bg-[linear-gradient(to_right,#222_1px,transparent_1px),linear-gradient(to_bottom,#222_1px,transparent_1px)] opacity-25"></div>

      {/* Floating AI Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* AI Brain Circuit */}
        <div
          ref={el => aiElementsRef.current[0] = el}
          className="absolute top-20 left-10 w-16 h-16 opacity-20 text-blue-500"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </div>

        {/* Floating Documents */}
        <div
          ref={el => floatingDocsRef.current[0] = el}
          className="absolute top-32 right-16 w-12 h-12 opacity-30 text-purple-500"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        </div>

        <div
          ref={el => floatingDocsRef.current[1] = el}
          className="absolute bottom-40 left-20 w-10 h-10 opacity-25 text-indigo-500"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        </div>

        {/* AI Nodes */}
        <div
          ref={el => aiElementsRef.current[1] = el}
          className="absolute top-40 right-32 w-8 h-8 opacity-20 text-blue-400"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1l3 6h6l-5 4 2 7-6-4-6 4 2-7-5-4h6z" />
          </svg>
        </div>

        <div
          ref={el => aiElementsRef.current[2] = el}
          className="absolute bottom-32 right-20 w-6 h-6 opacity-15 text-purple-400"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="2" />
            <path d="M13,2.05L13,4.05C17.39,4.59 20.5,8.58 19.96,12.97C19.5,16.61 16.64,19.5 12.97,19.96C8.58,20.5 4.59,17.39 4.05,13H2.05C2.56,18.16 6.84,22 12,22C17.52,22 22,17.52 22,12C22,6.84 18.16,2.56 13,2.05V2.05Z" />
          </svg>
        </div>

        {/* More floating documents */}
        <div
          ref={el => floatingDocsRef.current[2] = el}
          className="absolute top-60 left-32 w-8 h-8 opacity-20 text-blue-300"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8 lg:space-y-12">
          {/* Main Heading */}
          <div ref={headingRef} className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
              Hire Smarter with
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent font-extrabold"> AI-Driven </span>
              Resume Shortlisting
            </h1>
          </div>

          {/* Subtext */}
          <p ref={subtextRef} className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Leverage advanced AI technology to efficiently analyze resumes, eliminate bias,
            and identify top talent that aligns with your organization's needs.
          </p>

          

          {/* Stats Section */}
          <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 mt-12 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">85%</div>
              <div className="text-gray-600 dark:text-gray-300 mt-2">Time Saved in Resume Screening</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">98%</div>
              <div className="text-gray-600 dark:text-gray-300 mt-2">Accuracy in Candidate Matching</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">50%</div>
              <div className="text-gray-600 dark:text-gray-300 mt-2">Reduction in Hiring Costs</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
