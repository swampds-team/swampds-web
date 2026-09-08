import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Card = ({ children, className }) => {
  return (
    <div className={twMerge(clsx("bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5", className))}>
      {children}
    </div>
  );
};

export const CardHeader = ({ title, icon: Icon, iconColorClass, action }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      {Icon && <Icon className={twMerge(clsx("w-5 h-5", iconColorClass || "text-slate-500"))} />}
      <h3 className="font-semibold text-slate-700">{title}</h3>
    </div>
    {action && <div>{action}</div>}
  </div>
);
