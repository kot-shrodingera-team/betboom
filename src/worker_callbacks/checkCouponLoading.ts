import checkCouponLoadingGenerator from '@kot-shrodingera-team/germes-generators/worker_callbacks/checkCouponLoading';
import {
  log,
  getElement,
  awaiter,
  getRemainingTimeout,
  checkCouponLoadingError,
  checkCouponLoadingSuccess,
  text,
  sendTGBotMessage,
} from '@kot-shrodingera-team/germes-utils';
import { StateMachine } from '@kot-shrodingera-team/germes-utils/stateMachine';
import getCoefficient from '../stake_info/getCoefficient';
// import getParameter from '../stake_info/getParameter';

const loaderSelector = '.tg__loader_cont_coupon.tg--hide';
// const errorSelector = {
//   stakeNoActive: '.stakes_panel .tg__stake_deleted',
//   changeParameters: '.argumentChangeNotification',
//   authError:
//     '.err_panel_box:not([style="display: none;"]) > .tg_info_message::before',
// };
const errorSelector =
  '.err_panel_box:not([style="display: none;"]) > .tg_info_message';
const betPlacedSelector = '.cp_success .congratText';

const asyncCheck = async () => {
  const machine = new StateMachine();
  // const btnClickStake =
  //   window.germesData.betFrame.contentDocument.querySelector<HTMLElement>(
  //     '#favButtons .tg-grid-padding--4:nth-child(5) input'
  //   );

  machine.promises = {
    loader: () =>
      getElement(
        loaderSelector,
        getRemainingTimeout(),
        window.germesData.betFrame.contentDocument
      ),
    // errorParams: () =>
    //   getElement(
    //     errorSelector.changeParameters,
    //     getRemainingTimeout(),
    //     window.germesData.betFrame.contentDocument
    //   ),
    // errorNoActive: () =>
    //   getElement(
    //     errorSelector.stakeNoActive,
    //     getRemainingTimeout(),
    //     window.germesData.betFrame.contentDocument
    //   ),
    error: () =>
      getElement(
        errorSelector,
        getRemainingTimeout(),
        window.germesData.betFrame.contentDocument
      ),
    betPlaced: () =>
      getElement(
        betPlacedSelector,
        getRemainingTimeout(),
        window.germesData.betFrame.contentDocument
      ),
  };

  machine.setStates({
    start: {
      entry: async () => {
        log('Начало обработки ставки', 'steelblue');
      },
    },
    loader: {
      entry: async () => {
        log('Появился индикатор', 'steelblue');
        window.germesData.betProcessingAdditionalInfo = 'индикатор';
        delete machine.promises.loader;
        machine.promises.loaderDissappeared = () =>
          awaiter(
            () =>
              !window.germesData.betFrame.contentDocument.querySelector<HTMLElement>(
                loaderSelector
              ).style.length,
            getRemainingTimeout()
          );
      },
    },
    loaderDissappeared: {
      entry: async () => {
        log('Исчез индикатор', 'steelblue');
        window.germesData.betProcessingAdditionalInfo = null;
        delete machine.promises.loaderDissappeared;
        const stakeCoef = getCoefficient();

        if (stakeCoef !== worker.StakeInfo.Coef) {
          checkCouponLoadingError({
            botMessage: `Коэффициент изменился: ${worker.StakeInfo.Coef} => ${stakeCoef}`,
            informMessage: `Коэффициент изменился: ${worker.StakeInfo.Coef} => ${stakeCoef}`,
          });
          machine.end = true;
          return;
        }
        checkCouponLoadingError({
          botMessage: '???',
        });
        machine.end = true;
      },
    },
    // errorParams: {
    //   entry: async () => {
    //     log('Изменения в параметрах', 'steelblue');
    //     const stakeParameter = getParameter();

    //     window.germesData.betProcessingAdditionalInfo = null;

    //     const acceptButton =
    //       window.germesData.betFrame.contentDocument.querySelector(
    //         '[value="Принять"]'
    //       );

    //     const errorText = text(machine.data.result as Element);

    //     if (stakeParameter !== worker.StakeInfo.Parametr) {
    //       checkCouponLoadingError({
    //         botMessage: `Изменился параметр ставки: ${worker.StakeInfo.Parametr} => ${stakeParameter}`,
    //         informMessage: `Изменился параметр ставки: ${worker.StakeInfo.Parametr} => ${stakeParameter}`,
    //       });
    //       machine.end = true;
    //       return;
    //     }
    //     checkCouponLoadingError({
    //       botMessage: errorText,
    //       informMessage: errorText,
    //     });
    //     machine.end = true;
    //   },
    // },
    // errorNoActive: {
    //   entry: async () => {
    //     window.germesData.betProcessingAdditionalInfo = null;
    //     const errorText = text(machine.data.result as Element);
    //     const checkTextInStake = /не активна/.test(errorText);

    //     if (checkTextInStake) {
    //       checkCouponLoadingError({
    //         botMessage: errorText,
    //         informMessage: errorText,
    //       });
    //     }
    //     machine.end = true;
    //   },
    // },
    error: {
      entry: async () => {
        log('Появилась ошибка', 'steelblue');
        window.germesData.betProcessingAdditionalInfo = null;
        const errorText = text(machine.data.result as HTMLElement);
        log(errorText, 'tomato');
        if (/Изменения в параметрах ставок/i.test(errorText)) {
          checkCouponLoadingError({});
          machine.end = true;
          return;
        }
        worker.Helper.SendInformedMessage(errorText);
        sendTGBotMessage(
          '1786981726:AAE35XkwJRsuReonfh1X2b8E7k9X4vknC_s',
          126302051,
          errorText
        );
        const acceptChangesButton =
          window.germesData.betFrame.contentDocument.querySelector<HTMLElement>(
            '.favAmmButtons [value="Принять"]'
          );
        if (acceptChangesButton) {
          log('Принимаем изменения', 'orange');
          acceptChangesButton.click();
        }
        checkCouponLoadingError({});
        machine.end = true;
      },
    },
    betPlaced: {
      entry: async () => {
        window.germesData.betProcessingAdditionalInfo = null;
        checkCouponLoadingSuccess('Ставка принята');
        machine.end = true;
      },
    },
    timeout: {
      entry: async () => {
        window.germesData.betProcessingAdditionalInfo = null;
        checkCouponLoadingError({
          botMessage: 'Не дождались результата ставки',
          informMessage: 'Не дождались результата ставки',
        });
        machine.end = true;
      },
    },
  });

  machine.start('start');
};

const checkCouponLoading = checkCouponLoadingGenerator({
  asyncCheck,
});

export default checkCouponLoading;
