import React from 'react';

const RiskBadge = ({ score }) => {
  let colorClass = 'bg-accentGreen/15 text-accentGreen border-accentGreen/30';
  let label = 'Low Risk';

  if (score > 66) {
    colorClass = 'bg-accentRed/15 text-accentRed border-accentRed/30';
    label = 'High Risk';
  } else if (score > 33) {
    colorClass = 'bg-accentYellow/15 text-accentYellow border-accentYellow/30';
    label = 'Medium Risk';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold border ${colorClass}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
      {label} ({score}%)
    </span>
  );
};

export default RiskBadge;
