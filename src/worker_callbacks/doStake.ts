import doStakeGenerator from '@kot-shrodingera-team/germes-generators/worker_callbacks/doStake';
import getCoefficient from '../stake_info/getCoefficient';

// const preCheck = (): boolean => {
//   return true;
// };

// const postCheck = (): boolean => {
//   return true;
// };

const doStake = doStakeGenerator({
  // preCheck,
  doStakeButtonSelector:
    '.favAmmButtons [value="ЗАКЛЮЧИТЬ ПАРИ"], .favAmmButtons [value="СДЕЛАТЬ СТАВКУ"], .favAmmButtons [value="Сделать ставку"]',
  // errorClasses: [
  //   {
  //     className: '',
  //     message: '',
  //   },
  // ],
  disabledCheck: true,
  getCoefficient,
  // postCheck,
  context: () => window.germesData.sportFrame.contentDocument,
});

export default doStake;
