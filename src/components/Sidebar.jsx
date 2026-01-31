import { NavLink, useLocation } from 'react-router-dom';
import { useShortlist } from '../contexts/ShortlistContext';

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HomeIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const { currentJobId } = useShortlist();

  // Menu items with explicit basePath for highlighting
  const menuItems = [
    { path: '/dashboard', basePath: '/dashboard', name: 'Dashboard', icon: HomeIcon, end: true },
    { path: '/dashboard/job-postings', basePath: '/dashboard/job-postings', name: 'Job Postings', icon: BriefcaseIcon },
    {
      path: currentJobId ? `/dashboard/upload-resume/${currentJobId}` : '/dashboard/upload-resume/:jobId',
      basePath: '/dashboard/upload-resume',
      name: 'Upload-resume',
      icon: DocumentTextIcon
    },
    {
      path: currentJobId ? `/dashboard/test-management/${currentJobId}` : '/dashboard/test-management/:jobId',
      basePath: '/dashboard/test-management',
      name: 'Test Management',
      icon: ClipboardDocumentListIcon
    },
    { path: '/dashboard/test-results', basePath: '/dashboard/test-results', name: 'Test Results', icon: ChartBarIcon },
    { path: '/dashboard/admin-users', basePath: '/dashboard/admin-users', name: 'Admin Users', icon: UserGroupIcon },
  ];

  // Custom active link classes (works for dynamic jobId and query params)
  const linkClasses = (basePath, isActive, exact = false) => {
    const match = exact
      ? location.pathname === basePath
      : location.pathname.startsWith(basePath);
    return `flex items-center py-3 px-4 rounded-lg transition-all duration-200 group ${match || isActive
        ? 'bg-blue-600 text-white shadow-lg'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`;
  };

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-72'} min-h-screen bg-[#1e1e2f] text-white transition-all duration-300 ease-in-out relative`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-purple-600 text-white rounded-full p-1.5 shadow-lg hover:bg-blue-700 transition-colors duration-200 z-10"
      >
        {isCollapsed ? (
          <ChevronRightIcon className="h-4 w-4" />
        ) : (
          <ChevronLeftIcon className="h-4 w-4" />
        )}
      </button>

      <div className="p-6 flex flex-col min-h-screen">
        {/* Header */}
        <div className="mb-8">
          {!isCollapsed ? (
            <h2 className="text-xl font-bold text-white">HR Dashboard</h2>
          ) : (
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-sm">HR</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <div key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) => linkClasses(item.basePath, isActive, item.name === 'Dashboard')}
                  title={isCollapsed ? item.name : ''}
                >
                  <IconComponent className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0`} />
                  {!isCollapsed && (
                    <span className="font-medium truncate">{item.name}</span>
                  )}
                </NavLink>

                {/* Insert Shortlisted buttons after Upload-resume */}
                {item.name === 'Upload-resume' && (
                  <div className="mt-2 space-y-2">
                    {/* Shortlisting Resumes */}
                    <NavLink
                      to={currentJobId ? `/dashboard/short-listed/${currentJobId}` : '/dashboard/short-listed/:jobId'}
                      className={({ isActive }) => linkClasses('/dashboard/short-listed', isActive)}
                      title={isCollapsed ? 'Shortlisted' : ''}
                    >
                      <UserGroupIcon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0`} />
                      {!isCollapsed && (
                        <span className="font-medium truncate">Shortlisting Resumes</span>
                      )}
                    </NavLink>

                    {/* Shortlisted Resumes */}
                    <NavLink
                      to={currentJobId ? `/dashboard/shortlisted-resumes?jobId=${currentJobId}` : '/dashboard/shortlisted-resumes'}
                      className={({ isActive }) => linkClasses('/dashboard/shortlisted-resumes', isActive)}
                      title={isCollapsed ? 'Selected Resumes' : ''}
                    >
                      <DocumentTextIcon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0`} />
                      {!isCollapsed && (
                        <span className="font-medium truncate">Shortlisted Resumes</span>
                      )}
                    </NavLink>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="mt-auto pt-8">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-xs text-gray-400 text-center">AI Resume Ranker</p>
              <p className="text-xs text-gray-500 text-center mt-1">Dashboard v1.0</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
