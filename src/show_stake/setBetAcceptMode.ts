import { getElement, log } from '@kot-shrodingera-team/germes-utils';
import { JsFailError } from '@kot-shrodingera-team/germes-utils/errors';

const setBetAcceptMode = async (): Promise<void> => {
  const context = window.germesData.betFrame.contentDocument;

  const acceptChangesLabel = context.querySelector<HTMLLabelElement>(
    '.coupChbContainer > :not(.agreeToOddChange) > label.tg__chb_lbl'
  );
  const acceptChangesLabelCheckboxIcon =
    acceptChangesLabel.querySelector('.tg__checkbox_ico');
  if (
    !acceptChangesLabelCheckboxIcon.classList.contains('checked') &&
    !acceptChangesLabelCheckboxIcon.classList.contains('unchecked')
  ) {
    throw new JsFailError(
      'Не удалось определить состояние режима принятия ставки'
    );
  }

  if (window.location.hostname === 'pin-up.ru') {
    const acceptBetterOddsLabel = context.querySelector<HTMLLabelElement>(
      '.coupChbContainer > .agreeToOddChange > label.tg__chb_lbl'
    );
    const acceptBetterOddsCheckboxIcon =
      acceptBetterOddsLabel.querySelector('.tg__checkbox_ico');
    if (
      !acceptBetterOddsCheckboxIcon.classList.contains('checked') &&
      !acceptBetterOddsCheckboxIcon.classList.contains('unchecked')
    ) {
      throw new JsFailError(
        'Не удалось определить состояние режима принятия ставки с повышением коэффициента'
      );
    }

    if (
      acceptChangesLabelCheckboxIcon.classList.contains('checked') &&
      acceptBetterOddsCheckboxIcon.classList.contains('unchecked')
    ) {
      throw new JsFailError(
        'Не удалось определить состояние режима принятия ставки (принимаются изменения, но не принимается повышение)'
      );
    }

    if (worker.StakeAcceptRuleShoulder === 0) {
      if (
        acceptChangesLabelCheckboxIcon.classList.contains('unchecked') &&
        acceptBetterOddsCheckboxIcon.classList.contains('unchecked')
      ) {
        log(
          'Уже выбран режим принятия только с исходным коэффициентом',
          'steelblue'
        );
        return;
      }
      log('Выбираем режим принятия только с исходным коэффициентом', 'orange');
      if (acceptChangesLabelCheckboxIcon.classList.contains('checked')) {
        acceptChangesLabel.click();
        // Хотя если кликнуть acceptBetterOddsLabel, то оба чекбокса отключаются
      } else {
        acceptBetterOddsLabel.click();
      }
      return;
    }
    if (worker.StakeAcceptRuleShoulder === 1) {
      if (
        acceptChangesLabelCheckboxIcon.classList.contains('unchecked') &&
        acceptBetterOddsCheckboxIcon.classList.contains('checked')
      ) {
        log('Уже выбран режим принятия повышением коэффициента', 'steelblue');
        return;
      }
      log('Выбираем режим принятия с повышением коэффициента', 'orange');
      if (acceptChangesLabelCheckboxIcon.classList.contains('unchecked')) {
        acceptBetterOddsLabel.click();
      } else {
        acceptChangesLabel.click();
        const acceptBetterOddsCheckboxIconUnchecked = await getElement(
          '.coupChbContainer > .agreeToOddChange > label.tg__chb_lbl .tg__checkbox_ico.unchecked'
        );
        if (!acceptBetterOddsCheckboxIconUnchecked) {
          throw new JsFailError(
            'Не дождались снятия галочки о приёме ставок с повышением коэффициента'
          );
        }
        context
          .querySelector<HTMLLabelElement>(
            '.coupChbContainer > .agreeToOddChange > label.tg__chb_lbl'
          )
          .click();
      }
      return;
    }
    if (worker.StakeAcceptRuleShoulder === 2) {
      if (acceptChangesLabelCheckboxIcon.classList.contains('checked')) {
        log(
          'Уже выбран режим принятия с любым изменением коэффициента',
          'steelblue'
        );
        return;
      }
      log('Выбираем режим принятия с любым изменением коэффициента', 'orange');
      acceptChangesLabel.click();
      return;
    }
  }
  if (worker.StakeAcceptRuleShoulder === 0) {
    if (acceptChangesLabelCheckboxIcon.classList.contains('unchecked')) {
      log(
        'Уже выбран режим принятия только с исходным коэффициентом',
        'steelblue'
      );
      return;
    }
    log('Выбираем режим принятия только с исходным коэффициентом', 'orange');
    acceptChangesLabel.click();
    return;
  }
  if (worker.StakeAcceptRuleShoulder === 1) {
    throw new JsFailError(
      'На BetBoom нет режима принятия ставок с повышением коэффициента'
    );
  }
  if (worker.StakeAcceptRuleShoulder === 2) {
    if (acceptChangesLabelCheckboxIcon.classList.contains('checked')) {
      log(
        'Уже выбран режим принятия с любым изменением коэффициента',
        'steelblue'
      );
      return;
    }
    log('Выбираем режим принятия с любым изменением коэффициента', 'orange');
    acceptChangesLabel.click();
  }
};

export default setBetAcceptMode;
