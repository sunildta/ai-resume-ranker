import { useNavigate } from 'react-router-dom';
import { useShortlist } from '../contexts/ShortlistContext';
import { 
  BriefcaseIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentJobId } = useShortlist();

  const handleShortlistedClick = () => {
    if (currentJobId) {
      navigate(`/dashboard/short-listed/${currentJobId}`);
    } else {
      navigate('/dashboard/job-postings');
    }
  };

  const handleCardClick = (card) => {
    if (card.title === 'Shortlisted') {
      navigate(`/dashboard/shortlisted-resumes`);
    }
    else {
      navigate(card.path);
    }
  };

  const dashboardCards = [
    {
      title: 'Job Postings',
      description: 'Manage and create job postings',
      icon: BriefcaseIcon,
      path: '/dashboard/job-postings',
      
      color: 'from-blue-400 to-blue-600'
    },
    {
      title: ' Upload Resume ',
      description: 'AI-powered resume analysis',
      icon: DocumentTextIcon,
      path: '/dashboard/upload-resume/:jobId',
      
      color: 'from-green-400 to-green-600'
    },
    {
      title: 'Shortlisted',
      description: 'View candidates selected by you',
      icon: UserGroupIcon,
      path: '/dashboard/shortlisted-resumes',
      
      color: 'from-purple-400 to-purple-600'
    },

    {
      title: 'Test Management',
      description: 'Create and manage tests',
      icon: ClipboardDocumentListIcon,
      path: '/dashboard/test-management/:jobId',
      
      color: 'from-orange-400 to-orange-600'
    },
    {
      title: 'Test Results',
      description: 'View test performance',
      icon: ChartBarIcon,
      path: '/dashboard/test-results',
      
      color: 'from-red-400 to-red-600'
    },
    {
      title: 'Hiring Insights',
      description: 'Hiring performance metrics',
      icon: EnvelopeIcon,
      path: '/dashboard/comingsoon',
      
      color: 'from-teal-400 to-teal-600'
    }
    
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Welcome to HR Dashboard
        </h1>
        <p className="text-gray-600 text-lg">
          Manage your recruitment process with AI-powered tools
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {dashboardCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <div
              key={index}
              onClick={() => handleCardClick(card)}
              className="group relative bg-white/40 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105 hover:bg-white/50"
            >
              {/* Shine effect on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10">
                {/* Icon and Count */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} shadow-lg`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-gray-900 transition-colors">
                  {card.title}
                </h3>
                <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
                  {card.description}
                </p>
                
                {/* Arrow indicator */}
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-sm text-gray-500 flex items-center">
                    Click to access 
                    <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white/30 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/dashboard/job-postings')}
            className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-500 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Create Job Posting
          </button>
          <button
            onClick={() => navigate('/dashboard/upload-resume/:jobId')}
            className="bg-gradient-to-r from-green-400 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-500 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Review Resumes
          </button>
          <button
            onClick={() => navigate('/dashboard/test-management/${jobId}')}
            className="bg-gradient-to-r from-purple-400 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-purple-500 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Create Test
          </button>
          <button
            onClick={() => navigate('/dashboard/test-results')}
            className="bg-gradient-to-r from-red-400 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-500 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
