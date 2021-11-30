import {
  checkBookerHost,
  checkCurrency,
  log,
} from '@kot-shrodingera-team/germes-utils';
import {
  NewUrlError,
  JsFailError,
} from '@kot-shrodingera-team/germes-utils/errors';
import getSiteCurrency from '../helpers/getSiteCurrency';
import checkAuth, { authStateReady } from '../stake_info/checkAuth';
import { balanceReady, updateBalance } from '../stake_info/getBalance';
import getStakeCount from '../stake_info/getStakeCount';
import clearCoupon from './clearCoupon';

const preOpenEvent = async (): Promise<void> => {
  /* ======================================================================== */
  /*                     Проверка адреса открытой страницы                    */
  /* ======================================================================== */

  if (!checkBookerHost()) {
    log('Открыта не страница конторы (или зеркала)', 'crimson');
    log(`${window.location.host} !== ${worker.BookmakerMainUrl}`, 'crimson');
    window.location.href = new URL(worker.BookmakerMainUrl).href;
    throw new NewUrlError('Открываем страницу БК');
  }

  /* ======================================================================== */
  /*                             Проверка раздела                             */
  /* ======================================================================== */

  if (window.location.hostname === 'pin-up.ru') {
    if (!/^\/live/.test(window.location.pathname)) {
      window.location.pathname = '/live';
      throw new NewUrlError('Переходим в раздел Live');
    }
  } else if (!/^\/sport\/live/.test(window.location.pathname)) {
    window.location.pathname = '/sport/live';
    throw new NewUrlError('Переходим в раздел Live');
  }

  /* ======================================================================== */
  /*                 Проверка авторизации и обновление баланса                */
  /* ======================================================================== */

  await authStateReady();
  worker.Islogin = checkAuth();
  worker.JSLogined();
  if (!worker.Islogin) {
    throw new JsFailError('Нет авторизации');
  }
  log('Есть авторизация', 'steelblue');
  await balanceReady();
  updateBalance();

  /* ======================================================================== */
  /*                              Проверка валюты                             */
  /* ======================================================================== */

  const siteCurrency = getSiteCurrency();
  checkCurrency(siteCurrency);

  /* ======================================================================== */
  /*                                    ???                                   */
  /* ======================================================================== */

  const popupSelectors = {
    ident: '.js-registration_not_complete_popup[style]',
    bgPopup: '.fader[style]',
  };
  const popupIdentif = document.querySelector<HTMLElement>(
    popupSelectors.ident
  );
  const popupBg = document.querySelector<HTMLElement>(popupSelectors.bgPopup);

  if (popupIdentif && popupBg) {
    window.germesData.betFrame.contentDocument.location.reload();
    throw new JsFailError(
      'Ошибка проверки индентификации. Требуется перезагрузить страницу'
    );
  }

  if (getStakeCount() !== 0) {
    const couponCleared = await clearCoupon();
    if (!couponCleared) {
      throw new JsFailError('Не удалось очистить купон');
    }
  }
};

export default preOpenEvent;
