import checkCouponLoadingGenerator from '@kot-shrodingera-team/germes-generators/worker_callbacks/checkCouponLoading';
import {
  getWorkerParameter,
  getElement,
  getRemainingTimeout,
  sleep,
  log,
  awaiter,
  text,
  sendTGBotMessage,
} from '@kot-shrodingera-team/germes-utils';
import {
  sendErrorMessage,
  betProcessingError,
  betProcessingCompltete,
} from '@kot-shrodingera-team/germes-utils/betProcessing';
import { StateMachine } from '@kot-shrodingera-team/germes-utils/stateMachine';

const loaderSelector = '.tg__loader_cont_coupon.tg--hide:not([style])';
const errorSelector =
  '.err_panel_box:not([style="display: none;"]) > .tg_info_message';
const betPlacedSelector = '.cp_success .congratText';

const loaderNotAppearedTimeout = getWorkerParameter<number>(
  'betProcessingStartDelay',
  'number'
);
const noResultAfterLoaderDisappearedTimeout =
  getWorkerParameter<number>(
    'betProcessingLoaderDissapearMaxDelay',
    'number'
  ) || 3000;

const asyncCheck = async () => {
  const machine = new StateMachine();
  const context = window.germesData.sportFrame.contentDocument;

  machine.promises = {
    loader: () => getElement(loaderSelector, getRemainingTimeout(), context),
    ...(loaderNotAppearedTimeout
      ? { loaderNotAppeared: sleep(loaderNotAppearedTimeout) }
      : {}),
    error: () => getElement(errorSelector, getRemainingTimeout(), context),
    betPlaced: () =>
      getElement(betPlacedSelector, getRemainingTimeout(), context),
  };

  machine.setStates({
    start: {
      entry: async () => {
        log('Начало обработки ставки', 'steelblue');
      },
    },
    loaderNotAppeared: {
      entry: async () => {
        const message = `Индикатор или результат не появился в течении ${loaderNotAppearedTimeout} мс`;
        log(message, 'crimson');
        sendErrorMessage(message);
        betProcessingError(machine);
      },
    },
    loader: {
      entry: async () => {
        log('Появился индикатор', 'steelblue');
        window.germesData.betProcessingAdditionalInfo = 'индикатор';
        delete machine.promises.loader;
        delete machine.promises.loaderNotAppeared;
        machine.promises.loaderDissappeared = () =>
          awaiter(
            () => context.querySelector(loaderSelector) === null,
            getRemainingTimeout()
          );
      },
    },
    loaderDissappeared: {
      entry: async () => {
        log('Исчез индикатор', 'steelblue');
        window.germesData.betProcessingAdditionalInfo = null;
        delete machine.promises.loaderDissappeared;
        machine.promises.noResultAfterLoaderDisappeared = () =>
          sleep(noResultAfterLoaderDisappearedTimeout);
      },
    },
    error: {
      entry: async () => {
        log('Появилась ошибка', 'steelblue');
        window.germesData.betProcessingAdditionalInfo = undefined;
        const errorText = text(<HTMLElement>machine.data.result);
        log(errorText, 'tomato');
        if (/Изменения в параметрах ставок/i.test(errorText)) {
          const acceptButton =
            document.querySelector<HTMLElement>('.tg__accept');
          if (acceptButton) {
            log('Принимаем изменения', 'orange');
            acceptButton.click();
          }
        } else if (/Изменения в параметрах ставок/i.test(errorText)) {
          //
        } else {
          sendErrorMessage(errorText);
          sendTGBotMessage(
            '1786981726:AAE35XkwJRsuReonfh1X2b8E7k9X4vknC_s',
            126302051,
            errorText
          );
        }
        betProcessingError(machine);
      },
    },
    betPlaced: {
      entry: async () => {
        window.germesData.betProcessingAdditionalInfo = undefined;
        betProcessingCompltete(machine);
      },
    },
    timeout: {
      entry: async () => {
        window.germesData.betProcessingAdditionalInfo = undefined;
        const message = 'Не дождались результата ставки';
        log(message, 'crimson');
        sendErrorMessage(message);
        betProcessingError(machine);
      },
    },
  });

  machine.start('start');
};

const checkCouponLoading = checkCouponLoadingGenerator({
  asyncCheck,
});

export default checkCouponLoading;
