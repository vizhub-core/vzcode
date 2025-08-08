import React from 'react';

interface EmptyStateProps {
  children: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  children,
}) => {
  return <div className="empty-state">{children}</div>;
};
