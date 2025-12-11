// File: /src/components/Navbar.jsx
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';

const Navbar = () => {
    const { token } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    if (!token) return null;

    return (
        <nav className="glass-effect sticky top-0 z-50 border-b border-white/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center space-x-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                            <span className="text-white text-xl font-bold">📚</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                StudyNowAI
                            </h1>
                            <p className="text-xs text-gray-500">Smart Learning Companion</p>
                        </div>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-1">
                        <Link
                            to="/dashboard"
                            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${isActive('/dashboard')
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                }`}
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/schedules"
                            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${isActive('/schedules')
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                }`}
                        >
                            Schedules
                        </Link>
                        <Link
                            to="/study-plan"
                            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${isActive('/study-plan')
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                }`}
                        >
                            Progress
                        </Link>
                        <Link
                            to="/subjects"
                            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${isActive('/subjects')
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                }`}
                        >
                            Subjects
                        </Link>
                        <Link
                            to="/topics"
                            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${isActive('/topics')
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                }`}
                        >
                            Topics
                        </Link>
                        <Link
                            to="/settings"
                            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${isActive('/settings')
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                }`}
                        >
                            Settings
                        </Link>
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center space-x-4">
                        <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span>Online</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="btn-danger text-sm px-4 py-2"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden border-t border-white/20">
                <div className="flex justify-around py-2">
                    <Link
                        to="/dashboard"
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/dashboard')
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-blue-50'
                            }`}
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/schedules"
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/schedules')
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-blue-50'
                            }`}
                    >
                        Schedules
                    </Link>
                    <Link
                        to="/study-plan"
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/study-plan')
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-blue-50'
                            }`}
                    >
                        Progress
                    </Link>
                    <Link
                        to="/subjects"
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/subjects')
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-blue-50'
                            }`}
                    >
                        Subjects
                    </Link>
                    <Link
                        to="/topics"
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/topics')
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-blue-50'
                            }`}
                    >
                        Topics
                    </Link>
                    <Link
                        to="/settings"
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/settings')
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-blue-50'
                            }`}
                    >
                        Settings
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
