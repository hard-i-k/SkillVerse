import React from "react";

export const Textarea = React.forwardRef((props, ref) => {
  return (
    <textarea
      ref={ref}
      rows={4}
      {...props}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
    />
  );
});

Textarea.displayName = "Textarea";
