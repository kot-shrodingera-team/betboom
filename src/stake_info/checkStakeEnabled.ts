import checkStakeEnabledGenerator from '@kot-shrodingera-team/germes-generators/stake_info/checkStakeEnabled';
import getStakeCount from './getStakeCount';

// const preCheck = (): boolean => {
//   return true;
// };

const checkStakeEnabled = checkStakeEnabledGenerator({
  // preCheck,
  getStakeCount,
  betCheck: {
    selector: '.stake_item_panel',
    errorClasses: [
      {
        className: 'inactive',
        message: 'Ставка не активна',
      },
    ],
  },
  // errorsCheck: [
  //   {
  //     selector: '',
  //     message: '',
  //   },
  // ],
  context: () => window.germesData.sportFrame.contentDocument,
});

export default checkStakeEnabled;
