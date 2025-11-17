import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useRouting } from '../hooks/useRouting';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { goTo } = useRouting();
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef(null);
  const { currentUser, signOut: firebaseSignOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Check if we're on a dashboard page
  const isDashboard = location.pathname.startsWith('/dashboard');

  useEffect(() => {
    if (window.gsap && navRef.current) {
      window.gsap.fromTo(
        navRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power2.out' }
      );
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOutClick = async () => {
    try {
      setIsDropdownOpen(false);
      await firebaseSignOut();
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Privacy', path: '/privacy' },
    { name: 'Pricing', path: '/pricing' }
  ];

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-all duration-300 ${
        isDashboard 
          ? 'bg-white/20 border-gray-300/30 shadow-lg' 
          : 'bg-black/20 border-white/10'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => goTo('/')}
              className={`flex items-center space-x-3 font-bold text-xl transition-colors duration-300 ${
                isDashboard
                  ? 'text-gray-800 hover:text-purple-600'
                  : 'text-white hover:text-purple-300'
              }`}
            >
              <span className={`bg-gradient-to-r from-blue-500 via-blue-700 to-purple-700 bg-clip-text text-transparent  font-Copperplate Gothic  tracking-wide text-2xl
              ${isDashboard ? '' : ''}`}>AI Resume Ranker</span>
    
    

    
            </button>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navLinks.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-lg'
                        : isDashboard
                        ? 'text-gray-700 hover:bg-gray-200/50 hover:text-gray-900'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`flex items-center space-x-3 rounded-lg px-3 py-2 transition-all duration-300 ${
                    isDashboard
                      ? 'text-gray-800 hover:bg-gray-200/50'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      className="w-8 h-8 rounded-full border-2 border-white/20"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                      {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium">
                    {currentUser.displayName || currentUser.email.split('@')[0]}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isDropdownOpen ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg backdrop-blur-md border ${
                    isDashboard 
                      ? 'bg-white/90 border-gray-200/50' 
                      : 'bg-white/10 border-white/20'
                  }`}>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate('/dashboard');
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                          isDashboard
                            ? 'text-gray-800 hover:bg-gray-100'
                            : 'text-white hover:bg-white/10'
                        }`}
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={handleSignOutClick}
                        className={`w-full text-left px-4 py-2 text-sm text-red-500 transition-colors duration-200 ${
                          isDashboard
                            ? 'hover:bg-gray-100'
                            : 'hover:bg-white/10'
                        }`}
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => goTo('/login')}
                  className={`font-medium py-2 px-4 border border-transparent rounded-md transition-all duration-300 ${
                    isDashboard
                      ? 'text-gray-800 hover:border-gray-400'
                      : 'text-white hover:border-gray-300'
                  }`}
                >
                  Log In
                </button>
                <button
                  onClick={() => goTo('/signup')}
                  className="bg-gradient-to-r from-blue-400 to-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:from-blue-500 hover:to-blue-700 transition-all duration-300"
                >
                  Sign up
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className={isDashboard ? 'text-gray-700 hover:text-gray-900' : 'text-gray-300 hover:text-white'}>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
