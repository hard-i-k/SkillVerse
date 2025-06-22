import React from 'react';

const Avatar = React.forwardRef(({ className = '', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}
      {...props}
    />
  );
});

const AvatarImage = React.forwardRef(({ className = '', ...props }, ref) => {
  return (
    <img
      ref={ref}
      className={`aspect-square h-full w-full ${className}`}
      {...props}
    />
  );
});

const AvatarFallback = React.forwardRef(({ className = '', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`flex h-full w-full items-center justify-center rounded-full bg-muted ${className}`}
      {...props}
    />
  );
});

Avatar.displayName = 'Avatar';
AvatarImage.displayName = 'AvatarImage';
AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarImage, AvatarFallback }; 