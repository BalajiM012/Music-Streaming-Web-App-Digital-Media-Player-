import React from "react";
import "./EmptyState.css";

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
}) => {
  return (
    <div className="empty-state">
      {Icon && (
        <div className="empty-state-icon">
          <Icon size={64} />
        </div>
      )}
      <h2 className="empty-state-title">{title}</h2>
      {description && (
        <p className="empty-state-description">{description}</p>
      )}
      {action && actionLabel && (
        <button className="empty-state-action" onClick={action}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

