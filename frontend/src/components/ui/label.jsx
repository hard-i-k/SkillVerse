import React from "react";
import classNames from "classnames";

export const Label = ({ children, className, ...props }) => {
  return (
    <label
      {...props}
      className={classNames(
        "block text-sm font-medium text-gray-700 mb-1",
        className
      )}
    >
      {children}
    </label>
  );
};
