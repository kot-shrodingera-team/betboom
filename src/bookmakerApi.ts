import compareNameBKByLink from './helpers/compareBKByLink';

declare global {
  interface GermesData {
    betFrame: HTMLIFrameElement;
  }
  // interface Window {}
}

export const clearGermesData = (): void => {
  if (window.germesData && window.germesData.updateManualDataIntervalId) {
    clearInterval(window.germesData.updateManualDataIntervalId);
  }
  window.germesData = {
    bookmakerName: compareNameBKByLink(),
    minimumStake: undefined,
    maximumStake: undefined,
    doStakeTime: undefined,
    betProcessingStep: undefined,
    betProcessingAdditionalInfo: undefined,
    betProcessingTimeout: 50000,
    stakeDisabled: undefined,
    stopBetProcessing: () => {
      window.germesData.betProcessingStep = 'error';
      window.germesData.stakeDisabled = true;
    },
    updateManualDataIntervalId: undefined,
    stopUpdateManualData: undefined,
    manualMaximumStake: undefined,
    manualCoefficient: undefined,
    manualParameter: undefined,
    manualStakeEnabled: undefined,

    betFrame: document.querySelector<HTMLIFrameElement>(
      '#sport_div_iframe > iframe'
    ),
  };
};

export default {};
