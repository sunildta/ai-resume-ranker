import React, { useEffect, useState } from "react";

const ComingSoon = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Delay showing the popup slightly for smooth animation
    const timer = setTimeout(() => {
      setShow(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="relative h-screen w-full bg-no-repeat flex items-center justify-center"
      style={{
        backgroundImage: "url('/Ways AI Is Improving HR Recruitment Process.jpg')",
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundColor: '#f8fafc'
      }}
    >
      {show && (
        <div
          className={`
            backdrop-blur-lg bg-white/30 border border-white/40 
            rounded-3xl shadow-2xl px-16 py-12 text-center 
            transform transition-all duration-700 ease-out
            ${show ? "opacity-100 scale-100" : "opacity-0 scale-90"}
          `}
          >
            <h1 className="text-5xl font-bold text-blue-900 drop-shadow-2xl mb-6">
              Available Soon
            </h1>
            <p className="text-red-600 text-xl drop-shadow-lg font-medium">
              This feature is coming soon. Stay tuned!
            </p>
        </div>
      )}
    </div>
  );
};

export default ComingSoon;
