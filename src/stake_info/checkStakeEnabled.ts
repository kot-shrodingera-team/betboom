import checkStakeEnabledGenerator from '@kot-shrodingera-team/germes-generators/stake_info/checkStakeEnabled';
import getStakeCount from './getStakeCount';

// const preCheck = (): boolean => {
//   return true;
// };

const checkStakeEnabled = checkStakeEnabledGenerator({
  // preCheck,
  getStakeCount,
  betCheck: {
    selector: '#betAmountInput',
    errorClasses: [
      {
        className: '.tg__stake_deleted.tg--red-clr',
        message: 'Ставка не активна',
      },
    ],
  },
  errorsCheck: [
    {
      selector:
        '.err_panel_box:not([style="display: none;"])  > .tg_info_message',
      // message: '',
    },
  ],
  context: () => window.germesData.betFrame.contentDocument,
});

export default checkStakeEnabled;
