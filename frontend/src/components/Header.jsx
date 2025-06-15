import React from 'react';

const Header = ({ user, onLogout, onToggleSidebar }) => {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  return (
    <header className="bg-white shadow-lg border-t-4 border-red-500 p-4 flex justify-between items-center w-full fixed z-30">
      {/* Left Section: Logo or Project Name */}
      <div className="flex items-center">
        <button
          onClick={onToggleSidebar}
          className="mr-4 text-red-600 text-2xl focus:outline-none border border-red-300 rounded p-1 hover:bg-red-100"
          aria-label="Toggle Sidebar"
        >
          ☰
        </button>
        <h1 className="text-xl font-bold bg-gradient-to-r from-red-800 to-red-300 bg-clip-text text-transparent">
          VProCheck
        </h1>
      </div>

      {/* Right Section: User Information */}
      <div className="relative">
        <div
          className="flex items-center cursor-pointer"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="w-10 h-10 mr-3 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
            {/* Avatar, can be replaced with actual user.avatar */}
            {user.avatar ? (
              <img src={user.avatar} alt="User Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-600 font-semibold">
                {user.displayName.charAt(0)}
              </span>
            )}
          </div>
          <div className="text-right">
            <div className="font-semibold text-gray-800">{user.displayName}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
          <span className="text-red-600 ml-2">▼</span>
        </div>
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg border border-red-200">
            <button
              onClick={onLogout}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-100 hover:text-red-800"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;