import React from 'react';

const DropdownMenu = ({ children }) => {
  return <div className="relative">{children}</div>;
};

// ✅ Fixed: Avoid nested <button> when `asChild` is true
const DropdownMenuTrigger = React.forwardRef(({ children, asChild, ...props }, ref) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { ref, ...props });
  }

  return (
    <button
      ref={ref}
      className="focus:outline-none"
      {...props}
    >
      {children}
    </button>
  );
});

const DropdownMenuContent = React.forwardRef(({ children, className = '', align = 'center', ...props }, ref) => {
  const alignment = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0'
  };

  return (
    <div
      ref={ref}
      className={`absolute mt-2 min-w-[8rem] rounded-md border bg-popover p-1 text-popover-foreground shadow-md ${alignment[align]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

const DropdownMenuItem = React.forwardRef(({ children, className = '', asChild, ...props }, ref) => {
  const Comp = asChild ? 'div' : 'button';

  return (
    <Comp
      ref={ref}
      className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </Comp>
  );
});

// Display names for debugging
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';
DropdownMenuContent.displayName = 'DropdownMenuContent';
DropdownMenuItem.displayName = 'DropdownMenuItem';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
};

export const DropdownMenuSeparator = ({ className }) => (
  <div className={`h-px bg-gray-600 ${className}`} />
);
