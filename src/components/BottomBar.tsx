import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Dumbbell, ClipboardList, FormInput, User } from 'lucide-react';

const BottomBar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Navigation items
  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/exercises', icon: Dumbbell, label: 'Exercises' },
    { path: '/nutrition', icon: ClipboardList, label: 'Nutrition' },
    { path: '/questionnaires', icon: FormInput, label: 'Forms' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <nav className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          // Check if current path matches this nav item
          const isActive = currentPath === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
                isActive ? 'text-blue-500' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <item.icon size={24} className={`mb-1 ${isActive ? 'stroke-blue-500' : 'stroke-current'}`} />
              <span className={`text-xs ${isActive ? 'font-medium' : 'font-normal'}`}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomBar;