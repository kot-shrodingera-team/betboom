import getStakeInfoValueGenerator, {
  stakeInfoValueReadyGenerator,
} from '@kot-shrodingera-team/germes-generators/stake_info/getStakeInfoValue';
import { StakeInfoValueOptions } from '@kot-shrodingera-team/germes-generators/stake_info/types';
import { awaiter, getElement } from '@kot-shrodingera-team/germes-utils';
import { JsFailError } from '@kot-shrodingera-team/germes-utils/errors';
import { clearStakeSum } from '../worker_callbacks/setStakeSum';
import getBalance from './getBalance';
import getCurrentSum from './getCurrentSum';

// export const maximumStakeSelector = '';

export const updateMaximumStake = async (): Promise<void> => {
  clearStakeSum();
  const sumCleared = await awaiter(() => getCurrentSum() === 0);
  if (!sumCleared) {
    throw new JsFailError('Не удалось очистить поле ввода суммы ставки');
  }
  const maxStakeButton = await getElement<HTMLElement>(
    '.betAmountRow .tg__btn-coupon',
    5000,
    window.germesData.betFrame.contentDocument
  );
  if (!maxStakeButton) {
    throw new JsFailError('Не найдена кнопка максимума');
  }
  maxStakeButton.click();

  const newMaxStake = await awaiter(() => getCurrentSum());
  if (!newMaxStake) {
    throw new JsFailError('Максимальная ставка не появилась');
  }

  window.germesData.maximumStake = newMaxStake;
  clearStakeSum();
};

const maximumStakeOptions: StakeInfoValueOptions = {
  name: 'maximumStake',
  fixedValue: () => getBalance(),
  // valueFromText: {
  //   text: {
  //     // getText: () => '',
  //     selector: maximumStakeSelector,
  //     context: () => document,
  //   },
  //   replaceDataArray: [
  //     {
  //       searchValue: '',
  //       replaceValue: '',
  //     },
  //   ],
  //   removeRegex: /[\s,']/g,
  //   matchRegex: /(\d+(?:\.\d+)?)/,
  //   errorValue: 0,
  // },
  // zeroValues: [],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // modifyValue: (value: number, extractType: string) => value,
  // disableLog: false,
};

const getMaximumStake = getStakeInfoValueGenerator(maximumStakeOptions);

export const maximumStakeReady =
  stakeInfoValueReadyGenerator(maximumStakeOptions);

export default getMaximumStake;
