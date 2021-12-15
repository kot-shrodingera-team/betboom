import { getElement, log } from '@kot-shrodingera-team/germes-utils';
import {
  JsFailError,
  NewUrlError,
} from '@kot-shrodingera-team/germes-utils/errors';

const goToLive = async (): Promise<void> => {
  const liveLink = await getElement<HTMLElement>(
    // betboom, pinup
    '.js-gtm-click-menu-item--live > a, .nav__link[href="/live"]',
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
};

export default goToLive;
