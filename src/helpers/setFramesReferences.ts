import { getElement, log, awaiter } from '@kot-shrodingera-team/germes-utils';
import { JsFailError } from '@kot-shrodingera-team/germes-utils/errors';

const setFramesReference = async (): Promise<void> => {
  const sportFrame = await getElement<HTMLIFrameElement>(
    '#sport_div_iframe > iframe'
  );

  if (!sportFrame) {
    throw new JsFailError('Не найден основной фрейм');
  }
  log('Есть основной фрейм', 'cadetblue', true);
  window.germesData.sportFrame = sportFrame;

  const documentAppeared = await awaiter(
    () => {
      return (
        sportFrame.contentWindow.location.href !== 'about:blank' &&
        sportFrame.contentDocument &&
        sportFrame.contentDocument.body
      );
    },
    35000,
    100
  );
  if (!documentAppeared) {
    throw new JsFailError('Не дождались появления документа основного фрейма');
  }
  log('Появился документ основного фрейма', 'cadetblue', true);
};

export default setFramesReference;
