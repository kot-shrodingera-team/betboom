import { getElement, log } from '@kot-shrodingera-team/germes-utils';
import {
  JsFailError,
  NewUrlError,
} from '@kot-shrodingera-team/germes-utils/errors';

const goToLive = async (): Promise<void> => {
  if (window.location.hostname === 'pin-up.ru') {
    const liveLink = await getElement<HTMLElement>(
      '.nav__link[href="/live"]',
      5000
    );
    if (!liveLink) {
      throw new JsFailError('Не найдена кнопка перехода на Live');
    }

    if (liveLink.classList.contains('nav__link--active')) {
      log('Уже открыт Live', 'cadetblue', true);
    } else {
      liveLink.click();
      throw new NewUrlError('Переходим на Live');
    }
  } else {
    const liveLink = await getElement<HTMLElement>(
      '.js-gtm-click-menu-item--live > a',
      5000
    );
    if (window.location.pathname.startsWith('/sport')) {
      log('Уже открыт Live', 'cadetblue', true);
    } else {
      liveLink.click();
      throw new NewUrlError('Переходим на Live');
    }
  }
};

export default goToLive;
