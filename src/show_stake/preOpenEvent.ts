import {
  checkBookerHost,
  checkCurrency,
  log,
  text,
} from '@kot-shrodingera-team/germes-utils';
import {
  NewUrlError,
  JsFailError,
} from '@kot-shrodingera-team/germes-utils/errors';
import getSiteCurrency from '../helpers/getSiteCurrency';
import goToLive from '../helpers/goToLive';
import setFramesReference from '../helpers/setFramesReferences';
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
  /*                              Переход на лайв                             */
  /* ======================================================================== */

  await goToLive();
  await setFramesReference();

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
    window.germesData.sportFrame.contentDocument.location.reload();
    throw new JsFailError(
      'Ошибка проверки индентификации. Требуется перезагрузить страницу'
    );
  }

  /* ======================================================================== */
  /*                             Закрывание квиза                             */
  /* ======================================================================== */

  const quizCloseButton = document.querySelector<HTMLElement>(
    '.popup-quiz .popup__header-close'
  );
  if (quizCloseButton) {
    log('Закрываем квиз', 'orange');
    quizCloseButton.click();
  }

  const popupContent =
    window.germesData.sportFrame.contentDocument.querySelector(
      '.popup-wrapper-content .tg__modal_heading'
    );
  if (popupContent) {
    const popupContentText = text(popupContent);
    if (
      /Вы вышли из системы! Пожалуйста, перезагрузите страницу/.test(
        popupContentText
      )
    ) {
      log(popupContentText, 'tomato');
      worker.Islogin = false;
      throw new JsFailError('Пропала авторизация');
    }
  }

  /* ======================================================================== */
  /*                              Очистка купона                              */
  /* ======================================================================== */

  if (getStakeCount() !== 0) {
    const couponCleared = await clearCoupon();
    if (!couponCleared) {
      throw new JsFailError('Не удалось очистить купон');
    }
  }
};

export default preOpenEvent;
