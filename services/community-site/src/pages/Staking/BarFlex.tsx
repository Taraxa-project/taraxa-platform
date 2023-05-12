import React from 'react';

interface BarFlexProps {
  communityDelegated: number;
  selfDelegated: number;
  availableDelegation: number;
}
export const BarFlex = ({
  communityDelegated,
  selfDelegated,
  availableDelegation,
}: BarFlexProps) => {
  let cdParsed = communityDelegated;
  let sdParsed = selfDelegated;
  let adParsed = availableDelegation;
  if (cdParsed + sdParsed + adParsed > 100) {
    /**
     * Highest number = 100 - sum of lowest numbers
     */
    if (cdParsed >= sdParsed && cdParsed >= adParsed) cdParsed = 100 - (sdParsed + adParsed);
    if (sdParsed >= cdParsed && sdParsed >= adParsed) sdParsed = 100 - (cdParsed + adParsed);
    if (adParsed >= cdParsed && adParsed >= sdParsed) adParsed = 100 - (sdParsed + cdParsed);
  }
  return (
    <div className="barFlex">
      <div
        className="percentageAmount"
        style={{
          width: `${cdParsed}%`,
        }}
      >
        <div className="barPercentage" style={{ background: '#15AC5B' }} />
      </div>
      <div
        className="percentageAmount"
        style={{
          width: `${sdParsed}%`,
        }}
      >
        <div className="barPercentage" style={{ background: '#8E8E8E' }} />
      </div>
      <div
        className="percentageAmount"
        style={{
          width: `${adParsed}%`,
        }}
      >
        <div className="barPercentage" style={{ background: '#48BDFF' }} />
      </div>
    </div>
  );
};
