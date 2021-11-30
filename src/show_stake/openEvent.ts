import { log, sleep } from '@kot-shrodingera-team/germes-utils';
import {
  JsFailError,
  // NewUrlError,
} from '@kot-shrodingera-team/germes-utils/errors';

const openEvent = async (): Promise<void> => {
  const uri = worker.EventUrl;
  const event = uri.slice(91, uri.length);
  const eventUrl = `https://sport.${window.germesData.bookmakerName}.ru/SportsBook/GameDetails/${worker.EventId}/?game=${event}&gameId=${worker.EventId}&isLive=true&isSuperTip=false`;

  /* ======================================================================== */
  /*             Если не было попытки перехода на страницу события            */
  /* ======================================================================== */

  if (
    worker.GetSessionData(
      `${window.germesData.bookmakerName}.TransitionToEventPage`
    ) === '0'
  ) {
    if (window.germesData.betFrame.contentDocument.location.href === eventUrl) {
      log('Уже открыто нужное событие', 'steelblue');
      return;
    }
    log(`${window.location.href} !== ${eventUrl}`, 'white', true);
    worker.SetSessionData(
      `${window.germesData.bookmakerName}.TransitionToEventPage`,
      '1'
    );

    if (window.germesData.betFrame) {
      window.germesData.betFrame.contentDocument.location.href = eventUrl;
      await sleep(1000);
    }

    log('Переходим на событие', 'orange');

    await sleep(1000);

    // throw new NewUrlError('Переходим на событие');
    return;
  }

  /* ======================================================================== */
  /*              Если была попытка перехода на страницу события              */
  /* ======================================================================== */

  if (window.location.href === worker.EventUrl) {
    log('Открыли нужное событие', 'steelblue');
    return;
  }
  log(`${window.location.href} !== ${worker.EventUrl}`, 'crimson');
  throw new JsFailError('Не удалось перейти на нужное событие');
};

export default openEvent;
