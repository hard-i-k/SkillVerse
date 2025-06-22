import React from 'react';

export const Input = ({ label, error, isDarkMode, icon, ...props }) => {
  const modeClasses = isDarkMode 
    ? 'bg-gray-900/50 border-gray-700 placeholder-gray-500 text-white focus:border-blue-500' 
    : 'bg-white/70 border-gray-300 placeholder-gray-400 text-gray-900 focus:border-blue-500';

  return (
    <div className="w-full relative">
      {label && (
        <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && <div className="absolute left-3 text-gray-400">{icon}</div>}
        <input
          className={`w-full py-3 rounded-lg border transition-all duration-300
            ${modeClasses}
            ${error ? 'border-red-500' : ''}
            focus:ring-2 focus:ring-blue-500/30 focus:outline-none
            ${icon ? 'pl-10 pr-4' : 'px-4'}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export const TextArea = ({ label, error, isDarkMode, ...props }) => {
  const modeClasses = isDarkMode 
    ? 'bg-gray-900/50 border-gray-700 placeholder-gray-500 text-white focus:border-blue-500' 
    : 'bg-white/70 border-gray-300 placeholder-gray-400 text-gray-900 focus:border-blue-500';

  return (
    <div className="w-full">
      {label && (
        <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {label}
        </label>
      )}
      <textarea
        className={`w-full px-4 py-3 rounded-lg border transition-all duration-300
          ${modeClasses}
          ${error ? 'border-red-500' : ''}
          focus:ring-2 focus:ring-blue-500/30 focus:outline-none min-h-[120px]`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export const Select = ({ label, options, error, isDarkMode, ...props }) => {
  const modeClasses = isDarkMode 
    ? 'bg-gray-900/50 border-gray-700 text-white focus:border-blue-500' 
    : 'bg-white/70 border-gray-300 text-gray-900 focus:border-blue-500';
    
  return (
    <div className="w-full">
      {label && (
        <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {label}
        </label>
      )}
      <select
        className={`w-full px-4 py-3 rounded-lg border appearance-none transition-all duration-300
          ${modeClasses}
          ${error ? 'border-red-500' : ''}
          focus:ring-2 focus:ring-blue-500/30 focus:outline-none`}
        {...props}
      >
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value} 
            className={isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export const Button = ({ children, variant = 'primary', className, ...props }) => {
  const variants = {
    primary: `bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg`,
    secondary: `bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white`,
    danger: `bg-red-600 hover:bg-red-700 text-white`,
  };
  
  return (
    <button
      className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center
        ${variants[variant]}
        focus:ring-4 focus:ring-blue-500/30 focus:outline-none
        disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`p-8 rounded-2xl transition-all duration-300 bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}; 