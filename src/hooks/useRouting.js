import { useNavigate, useLocation } from 'react-router-dom';

export const useRouting = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const goTo = (path) => navigate(path);
  const goToLogin = () => navigate('/login');
  const goToSignup = () => navigate('/signup');

  return {
    navigate,
    location,
    goTo,
    goToLogin,
    goToSignup,
    currentPath: location.pathname,
  };
};
