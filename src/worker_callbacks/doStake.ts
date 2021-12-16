import doStakeGenerator from '@kot-shrodingera-team/germes-generators/worker_callbacks/doStake';
import { log } from '@kot-shrodingera-team/germes-utils';
import getCoefficient from '../stake_info/getCoefficient';

const preCheck = (): boolean => {
  const acceptButton = document.querySelector<HTMLElement>('.tg__accept');
  if (acceptButton) {
    log('Принимаем изменения. Ставку не делаем', 'orange');
    acceptButton.click();
    return false;
  }
  return true;
};

// const postCheck = (): boolean => {
//   return true;
// };

const doStake = doStakeGenerator({
  preCheck,
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
