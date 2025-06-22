import React from "react";
import classNames from "classnames";

export const Input = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      {...props}
      className={classNames(
        "w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200",
        "bg-white text-gray-900 placeholder-gray-500",
        "dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400",
        "dark:focus:ring-purple-400 dark:focus:border-transparent",
        className
      )}
    />
  );
});

Input.displayName = "Input";
