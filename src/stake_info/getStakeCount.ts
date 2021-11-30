import getStakeCountGenerator from '@kot-shrodingera-team/germes-generators/stake_info/getStakeCount';

const getStakeCount = getStakeCountGenerator({
  stakeSelector: '.stake_item_panel',
  context: () => window.germesData.betFrame.contentDocument,
});

export default getStakeCount;
