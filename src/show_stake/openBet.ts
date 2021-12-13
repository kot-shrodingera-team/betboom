import {
  getElement,
  log,
  repeatingOpenBet,
  text,
} from '@kot-shrodingera-team/germes-utils';
import { JsFailError } from '@kot-shrodingera-team/germes-utils/errors';
import getStakeCount from '../stake_info/getStakeCount';
import clearCoupon from './clearCoupon';

const openBet = async (): Promise<void> => {
  /* ======================================================================== */
  /*                              Очистка купона                              */
  /* ======================================================================== */

  const couponCleared = await clearCoupon();
  if (!couponCleared) {
    throw new JsFailError('Не удалось очистить купон');
  }

  /* ======================================================================== */
  /*                      Формирование данных для поиска                      */
  /* ======================================================================== */

  const { sId: betId } = JSON.parse(worker.BetId);
  const betSelector = `[data-stake-id*="${betId}"]`;
  log(`betSelector = "${betSelector}"`, 'white', true);

  /* ======================================================================== */
  /*                               Поиск ставки                               */
  /* ======================================================================== */

  const bet = await getElement<HTMLElement>(
    betSelector,
    5000,
    window.germesData.sportFrame.contentDocument
  );
  if (!bet) {
    throw new JsFailError('Ставка не найдена');
  }
  log('Ставка найдена', 'cadetblue', true);

  /* ======================================================================== */
  /*           Открытие ставки, проверка, что ставка попала в купон           */
  /* ======================================================================== */

  const openingAction = async () => {
    bet.click();
  };
  await repeatingOpenBet(openingAction, getStakeCount, 5, 1000, 50);

  /* ======================================================================== */
  /*                    Вывод информации об открытой ставке                   */
  /* ======================================================================== */

  const eventNameSelector = '.stake_item_panel .coupon_sport_name_container';
  const marketNameSelector = '.stake_item_panel .st_name';
  // const betNameSelector = '';

  const eventNameElement =
    window.germesData.sportFrame.contentDocument.querySelector(
      eventNameSelector
    );
  const marketNameElement =
    window.germesData.sportFrame.contentDocument.querySelector(
      marketNameSelector
    );
  // const betNameElement = document.querySelector(betNameSelector);

  if (!eventNameElement) {
    throw new JsFailError('Не найдено событие открытой ставки');
  }
  if (!marketNameElement) {
    throw new JsFailError('Не найден маркет открытой ставки');
  }
  // if (!betNameElement) {
  //   throw new JsFailError('Не найдена роспись открытой ставки');
  // }

  const eventName = text(eventNameElement);
  const marketName = text(marketNameElement);
  // const betName = text(betNameElement);

  // log(`Открыта ставка\n${eventName}\n${marketName}\n${betName}`, 'steelblue');
  log(`Открыта ставка\n${eventName}\n${marketName}`, 'steelblue');
};

export default openBet;
