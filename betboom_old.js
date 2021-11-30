if (typeof worker === 'undefined') {
  window.location.reload();
}

// eslint-disable-next-line max-classes-per-file
class JsFailError extends Error {
  constructor(message) {
      super(message);
      Object.setPrototypeOf(this, JsFailError.prototype);
  }
}
class NewUrlError extends Error {
  constructor(message) {
      super(message);
      Object.setPrototypeOf(this, NewUrlError.prototype);
  }
}

/**
* Promise, который резолвится, когда появляется нужный элемент в DOM, используется MutationObserver
* @param selector Селектор, используемый в функции querySelector
* @param rejectTime Таймаут в мс, если 0, то таймаута нет, по умолчанию 5000
* @param context Котекст для выполнения метода querySelector и на который вешается MutationObserver, по умолчанию document
* @returns Если элемент найден, он и возвращается, иначе null
*/
const getElement = async (selector, rejectTime = 5000, context = document) => {
  return new Promise((resolve /* , reject */) => {
      let element = context.querySelector(selector);
      if (element) {
          resolve(element);
          return;
      }
      const observerConfig = { childList: true, subtree: true, attributes: true };
      const mutationObserver = new MutationObserver((mutations, observer) => {
          element = context.querySelector(selector);
          if (element) {
              resolve(element);
              observer.disconnect();
          }
      });
      if (rejectTime > 0) {
          setTimeout(() => {
              if (element === null) {
                  resolve(element);
                  mutationObserver.disconnect();
              }
          }, rejectTime);
      }
      mutationObserver.observe(context, observerConfig);
  });
};
/**
* Promise, который повторяет колбэк и резолвится, когда значение колбэка truthy
* @param condition Колбэк, который выполняется
* @param timeout Таймаут повторения колбэков в мс, по умолчанию 5000
* @param interval Интервал повторения колбэков, по умолчанию 50
* @param truthyValue Возвращаемое значение, если колбэк вернул truthy результат, если этот параметр null, то возвращаемое значение равно результату колбэка, по умолчанию null
* @param falsyValue Возвращаемое значение, если колбэк не вернул truthy результат за заданное время, по умолчанию null
* @returns Если результат колбэка стал truthy за заданное время, и аргумент truthyValue равен null, то он (результат колбэка) и возвращается.
* Если же результат колбэка так и не стал truthy за заданное время, то возвращается falsyValue
*/
const awaiter = async (condition, timeout = 5000, interval = 50, truthyValue = null, falsyValue = null) => {
  return new Promise((resolve /* , reject */) => {
      const startTime = Date.now();
      const check = () => {
          const result = condition();
          if (result) {
              if (truthyValue === null) {
                  resolve(result);
              }
              else {
                  resolve(truthyValue);
              }
          }
          else if (Date.now() - startTime > timeout) {
              resolve(falsyValue);
          }
          else {
              setTimeout(check, interval);
          }
      };
      check();
  });
};
/**
* Promise, который резолвится через время, то есть ожидание
* @param msec Время ожидания в мс
*/
const sleep = (msec) => new Promise((resolve) => setTimeout(resolve, msec));
// interface AnyEventInit extends EventInit {
//   [key: string]: unknown;
// }
/**
* Инициализация события для элемента DOM
* @param element Элемент DOM, который является target для события
* @param eventName Имя события
* @param EventClass Класс события, по умолчанию Event
*/
const fireEvent = (element, eventName, EventClass = Event) => {
  const event = new EventClass(eventName, { bubbles: true });
  element.dispatchEvent(event);
};
/**
* Проверка версии бота
* @param version Версия бота, относительно которой проверяем
* @returns Если версия равна или новее той, относительно которой проверяем, возвращается true, иначе false
*/
const minVersion = (version) => {
  const stripZerosRegex = /(\.0+)+$/;
  const botSegments = worker.BotVer.replace(stripZerosRegex, '').split('.');
  const refSegments = version.replace(stripZerosRegex, '').split('.');
  for (let i = 0; i < Math.min(botSegments.length, refSegments.length); i += 1) {
      const diff = Number(botSegments[i]) - Number(refSegments[i]);
      if (diff < 0) {
          return false;
      }
      if (diff > 0) {
          return true;
      }
  }
  return true;
};
/**
* Проверка соответствия текущего открытого хоста указанному хосту бк в настройках бота,
* www. вначале хостов не учитываются, проверяется только то, что текущий хост оканчивается хостом в настройках, потому что по факту могут быть добавлены поддомены
* @returns Если хост соответствует, возвращается true, иначе false
*/
const checkBookerHost = () => {
  const bookmakerHost = new URL(worker.BookmakerMainUrl).host.replace(/^www\./, '');
  return window.location.host.replace(/^www\./, '').endsWith(bookmakerHost);
};
/**
* Формирование RGB значений из текстового названия цвета
* @param color CSS-цвет в текстовом формате
* @returns Массив из трёх RGB значений
*/
const getRgbFromColorName = (color) => {
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.fillStyle = color;
  const match = ctx.fillStyle.match(/#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})/);
  if (match) {
      return [
          parseInt(match[1], 16),
          parseInt(match[2], 16),
          parseInt(match[3], 16),
      ];
  }
  return [255, 255, 255];
};
/**
* Вывод в
* @param time
* @returns
*/
const timeString = (time) => {
  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const seconds = String(time.getSeconds()).padStart(2, '0');
  const miliseconds = String(time.getMilliseconds()).padStart(3, '0');
  return `${hours}:${minutes}:${seconds}.${miliseconds}`;
};
/**
* Вывод сообщения в лог бк в боте и в консоль браузера
* @param message Текст сообщения
* @param color Цвет текста, по умолчанию белый
* @param dev Выводить сообщение только при включённом Dev режиме бота, по умолчанию false
*/
const log = (message, color = 'white', dev = false) => {
  if (dev && !worker.Dev) {
      return;
  }
  if (minVersion('0.1.814.4')) {
      worker.Helper.WriteLineRGB(message, ...getRgbFromColorName(color));
  }
  else {
      worker.Helper.WriteLine(message);
  }
  const timestamp = timeString(new Date());
  const string = `%c${timestamp}: %c${message}`;
  const consoleObject = window.consoleCopy ? window.consoleCopy : console;
  if (consoleObject.groupCollapsed && consoleObject.groupEnd) {
      consoleObject.groupCollapsed(string, 'font-weight: bold; color: blue', `color: ${color}; background: #252525; padding: 0 5px`);
      if (consoleObject.trace) {
          consoleObject.trace();
      }
      consoleObject.groupEnd();
  }
  else {
      consoleObject.log(string, 'font-weight: bold; color: blue', `color: ${color}; background: #252525; padding: 0 5px`);
      if (consoleObject.trace) {
          consoleObject.trace();
      }
  }
};
/**
* Формарование строки с информацией о ставке (событие, роспись, сумма, коэффициент)
* @returns Итоговая строка
*/
const stakeInfoString = () => {
  return (`Событие: ${worker.TeamOne} vs ${worker.TeamTwo}\n` +
      `Ставка: ${worker.BetName}\n` +
      `Сумма: ${worker.StakeInfo.Summ}\n` +
      `Коэффициент: ${worker.StakeInfo.Coef}`);
};
/**
* "Нативный" ввод, используя методы нажатия клавиш клавиатуры
* @param inputElement Целевой элемент
* @param text Текст для ввода
* @param type Тип события нажатия на клавишу (KeyDown или KeyPress), по умолчанию KeyDown
*/
const nativeInput = (inputElement, text, type = 'KeyDown') => {
  const keyFunction = type === 'KeyDown'
      ? Api.DomEventsHelper.KeyDown
      : Api.DomEventsHelper.KeyPress;
  while (inputElement.value) {
      const oldValue = inputElement.value;
      keyFunction(8);
      const newValue = inputElement.value;
      if (!newValue) {
          break;
      }
      else if (oldValue === newValue) {
          log(`Ошибка нативного ввода: Не удалось очистить поле ввода. Значение не изменилось (${newValue})`);
          return;
      }
  }
  [...text].forEach((char) => {
      if (inputElement !== window.document.activeElement) {
          inputElement.focus();
      }
      const charCode = (() => {
          switch (char) {
              case '.':
                  return 190;
              case ',':
                  return 188;
              default:
                  return char.charCodeAt(0);
          }
      })();
      keyFunction(charCode);
  });
};
/**
* Значение поля из параметров Worker в настройках бк в боте
* @param key Название поля
* @returns Если есть данное поле, возвращается его значение, иначе null
*/
const getWorkerParameter = (key, type = 'boolean') => {
  try {
      const workerParameters = worker.WorkerParameters && worker.WorkerParameters.startsWith('{')
          ? JSON.parse(worker.WorkerParameters)
          : {};
      const forkData = worker.BetId && worker.BetId.startsWith('{')
          ? JSON.parse(worker.BetId)
          : null;
      const forkParameters = forkData && forkData.workerParameters;
      const parameters = { ...workerParameters, ...forkParameters };
      if (!(key in parameters)) {
          return undefined;
      }
      const value = parameters[key];
      if (typeof value !== type) {
          log(`Тип параметра ${key} не равен ${type}. Обратитесь в ТП`, 'crimson');
          return undefined;
      }
      return value;
  }
  catch (e) {
      log(e.message, 'red');
      return undefined;
  }
};
/**
* Повторение попытки открытия ставки
* @param openingAction Функция открытия ставки
* @param getStakeCount Функция определения количества ставок в купоне
* @param maxTryCount Максимальное количество попыток, по умолчанию 5
* @param betAddedCheckTimeout Таймаут проверки попадания ставки в купон, по умолчанию 1000
* @param betAddedCheckInterval Интервал между проверками попадания ставки в купон, по умолчанию 50
*/
const repeatingOpenBet = async (openingAction, getStakeCount, maxTryCount = 5, betAddedCheckTimeout = 1000, betAddedCheckInterval = 50) => {
  for (let i = 1; i <= maxTryCount; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await openingAction();
      // eslint-disable-next-line no-await-in-loop
      const betAdded = await awaiter(() => getStakeCount() === 1, betAddedCheckTimeout, betAddedCheckInterval);
      if (!betAdded) {
          if (i === maxTryCount) {
              throw new JsFailError('Ставка так и не попала в купон');
          }
          log(`Ставка не попала в купон (попытка ${i})`, 'steelblue');
      }
      else {
          log('Ставка попала в купон', 'steelblue');
          break;
      }
  }
};
const checkCouponLoadingError = async (options) => {
  if (options.botMessage) {
      log(options.botMessage, 'crimson');
  }
  if (options.informMessage) {
      worker.Helper.SendInformedMessage(`В ${window.germesData.bookmakerName} произошла ошибка принятия ставки:\n` +
          `${options.informMessage}\n` +
          `${stakeInfoString()}`);
  }
  if (options.reopen) {
      try {
          window.germesData.betProcessingStep = 'reopen';
          await options.reopen.openBet();
          log('Ставка успешно переоткрыта', 'green');
          window.germesData.betProcessingStep = 'reopened';
      }
      catch (reopenError) {
          if (reopenError instanceof JsFailError) {
              log(reopenError.message, 'red');
          }
          else {
              log(reopenError.message, 'red');
          }
      }
  }
  window.germesData.betProcessingStep = 'error';
};
const checkCouponLoadingSuccess = (message) => {
  if (message !== undefined) {
      log(message, 'steelblue');
  }
  window.germesData.betProcessingStep = 'success';
};
const getRemainingTimeout = (maximum) => {
  const result = window.germesData.betProcessingTimeout -
      (new Date().getTime() - window.germesData.doStakeTime.getTime());
  if (maximum !== undefined &&
      window.germesData.betProcessingTimeout > maximum) {
      return maximum;
  }
  return result;
};
const trim = (string, short = false) => {
  if (short) {
      return string.trim();
  }
  return string
      .replace(/(^[^\S\n]+|[^\S\n]+$)/gm, '') // удаление пробельных символов (кроме переносов) из начал и концов строк
      .replace(/[^\S\n]+/g, ' ') // "сжимание" последовательностей пробельных символов (кроме переносов) до одного пробела
      .replace(/\n+/g, '\n') // "сжимание" последовтельностей переносов до одного переноса
      .replace(/^\n+|\n+$/g, ''); // удаление переносов строк вначале и в конце строки
};
const text = (element, short = false) => {
  if (!element) {
      return undefined;
  }
  if (element.constructor.name === 'HTMLInputElement') {
      return trim(element.value, short);
  }
  return trim(element.textContent, short);
};
const multiAwaiter = async (promises) => {
  let resultKey = null;
  const flaggedPromises = Object.keys(promises).map(async (key) => {
      const result = typeof promises[key] === 'function'
          ? await promises[key]()
          : await promises[key];
      resultKey = key;
      return result;
  });
  const result = await Promise.race(flaggedPromises);
  return {
      result,
      key: resultKey,
  };
};

/**
* Генератор колбэка getStakeInfo (сбор информации о ставке)
*/
const getStakeInfoGenerator = (options) => () => {
  if (worker.GetSessionData(`${window.germesData.bookmakerName}.ShowStake`) ===
      '1') {
      log('Купон переоткрывается', 'tan');
      return;
  }
  if (options.reShowStake) {
      if (options.reShowStake.isNeeded()) {
          log('Переоткрываем купон', 'orange');
          options.reShowStake.showStake();
          worker.StakeInfo.IsEnebled = false;
          return;
      }
  }
  if (options.preAction) {
      options.preAction();
  }
  worker.StakeInfo.Auth = options.checkAuth();
  if (!worker.StakeInfo.Auth) {
      return;
  }
  worker.StakeInfo.IsEnebled = options.checkStakeEnabled();
  if (!worker.StakeInfo.IsEnebled) {
      return;
  }
  worker.StakeInfo.StakeCount = options.getStakeCount();
  worker.StakeInfo.Balance = options.getBalance();
  worker.StakeInfo.MinSumm = options.getMinimumStake();
  worker.StakeInfo.MaxSumm = options.getMaximumStake();
  worker.StakeInfo.Summ = options.getCurrentSum();
  worker.StakeInfo.Coef = options.getCoefficient();
  worker.StakeInfo.Parametr = options.getParameter();
  const message = `Информация о ставке:\n` +
      `Авторизация: ${worker.StakeInfo.Auth ? 'Есть' : 'Нет'}\n` +
      `Баланс: ${worker.StakeInfo.Balance}\n` +
      `Ставок в купоне: ${worker.StakeInfo.StakeCount}\n` +
      `Ставка доступна:  ${worker.StakeInfo.IsEnebled ? 'Да' : 'Нет'}\n` +
      `Лимиты: ${worker.StakeInfo.MinSumm} - ${worker.StakeInfo.MaxSumm}\n` +
      `Текущая сумма в купоне: ${worker.StakeInfo.Summ}\n` +
      `Коэффициент: ${worker.StakeInfo.Coef}\n` +
      `Параметр: ${worker.StakeInfo.Parametr}`;
  log(message, 'lightgrey');
};

/**
* Генератор функции ожидания готовности определения авторизации
*
* Ожидает появления элемента наличия или отсутствия авторизации
* @returns Асинхронная функция, которая возвращает true, если есть готовность определения авторизации, иначе false
* - timeout - Таймаут проверки, по умолчанию 5000
*/
const authStateReadyGenerator = (options) => async (timeout = 5000) => {
  if (getWorkerParameter('fakeAuth')) {
      return;
  }
  const context = options.context ? options.context() : document;
  await Promise.race([
      getElement(options.noAuthElementSelector, timeout, context),
      getElement(options.authElementSelector, timeout, context),
  ]);
  const noAuthElement = context.querySelector(options.noAuthElementSelector);
  const authElement = context.querySelector(options.authElementSelector);
  if (options.maxDelayAfterNoAuthElementAppeared && noAuthElement) {
      log(`Появился элемент отсутсвия авторизации, ожидаем элемент наличия авторизации`, 'cadetblue', true);
      const authElementWaited = await getElement(options.authElementSelector, options.maxDelayAfterNoAuthElementAppeared, context);
      if (authElementWaited) {
          log(`Появился элемент наличия авторизации`, 'cadetblue', true);
      }
      else {
          log(`Элемент наличия авторизации не появился`, 'cadetblue', true);
      }
      return;
  }
  if (noAuthElement) {
      log(`Появился элемент отсутствия авторизации`, 'cadetblue', true);
  }
  else if (authElement) {
      log(`Появился элемент наличия авторизации`, 'cadetblue', true);
  }
  else {
      log(`Не найден элемент наличия или отсутствия авторизации`, 'crimson', true);
  }
};
/**
* Генератор функции определения авторизации
* @returns Функция, которая возвращает true, если есть авторизация, иначе false
*/
const checkAuthGenerator = (options) => () => {
  if (getWorkerParameter('fakeAuth')) {
      return true;
  }
  const context = options.context ? options.context() : document;
  const authElement = context.querySelector(options.authElementSelector);
  return Boolean(authElement);
};

const noAuthElementSelector = '.auth__btn.btn';
const authElementSelector = '.header__control.control-account';
const authStateReady = authStateReadyGenerator({
  noAuthElementSelector,
  authElementSelector,
  maxDelayAfterNoAuthElementAppeared: 500,
  context: () => document,
});
const checkAuth = checkAuthGenerator({
  authElementSelector,
  context: () => document,
});
const clickLinkHandler = async () => {
  const link = await getElement('.menu__item > a[href="/sport"]');
  if (!link || document.location.href.match(/\/sport/)) {
      return false;
  }
  link.click();
  return true;
};

/**
* Генератор функции получения количества ставок в купоне
* @returns Функция, которая возвращает количество ставок в купоне
*/
const getStakeCountGenerator = (options) => () => {
  if (getWorkerParameter('fakeStakeCount') ||
      getWorkerParameter('fakeOpenStake')) {
      return 1;
  }
  const context = options.context ? options.context() : document;
  return context.querySelectorAll(options.stakeSelector).length;
};

const getStakeCount = getStakeCountGenerator({
  stakeSelector: '.stake_item_panel',
  context: () => window.germesData.betFrame.contentDocument,
});

const defaultNumberRegex = /(\d+(?:\.\d+)?)/;
const defaultRemoveRegex = /[\s,']/g;

const getStakeInfoValueGenerator = (options) => () => {
  if (options.name === 'balance') {
      if (getWorkerParameter('fakeBalance', 'number') ||
          getWorkerParameter('fakeAuth')) {
          const fakeBalance = getWorkerParameter('fakeBalance', 'number');
          if (fakeBalance !== undefined) {
              return fakeBalance;
          }
          return 100000;
      }
  }
  else if (options.name === 'coefficient') {
      if (getWorkerParameter('fakeCoefficient') ||
          getWorkerParameter('fakeOpenStake')) {
          const coefficient = Number(JSON.parse(worker.ForkObj).coefficient);
          if (Number.isNaN(coefficient)) {
              return 0;
          }
          return coefficient;
      }
  }
  else if (options.name === 'currentSum') {
      if (getWorkerParameter('fakeCurrentSum', 'number') ||
          getWorkerParameter('fakeOpenStake')) {
          const fakeCurrentSum = getWorkerParameter('fakeCurrentSum', 'number');
          if (fakeCurrentSum !== undefined) {
              return fakeCurrentSum;
          }
          return 0;
      }
  }
  else if (options.name === 'maximumStake') {
      if (getWorkerParameter('fakeMaximumStake', 'number') ||
          getWorkerParameter('fakeAuth') ||
          getWorkerParameter('fakeOpenStake')) {
          const fakeMaximumStake = getWorkerParameter('fakeMaximumStake', 'number');
          if (fakeMaximumStake !== undefined) {
              return fakeMaximumStake;
          }
          return 100000;
      }
      if (window.germesData.maximumStake !== undefined) {
          return window.germesData.maximumStake;
      }
  }
  else if (options.name === 'minimumStake') {
      if (getWorkerParameter('fakeMinimumStake', 'number') ||
          getWorkerParameter('fakeAuth') ||
          getWorkerParameter('fakeOpenStake')) {
          const fakeMinimumStake = getWorkerParameter('fakeMinimumStake', 'number');
          if (fakeMinimumStake !== undefined) {
              return fakeMinimumStake;
          }
          return 100000;
      }
      if (window.germesData.minimumStake !== undefined) {
          return window.germesData.minimumStake;
      }
  }
  let preliminaryValue = 0;
  let extractType = '';
  if ('fixedValue' in options) {
      preliminaryValue = options.fixedValue();
      extractType = 'fixed';
  }
  else {
      const valueFromTextOptions = options.valueFromText;
      let valueText = '';
      if ('getText' in valueFromTextOptions.text) {
          valueText = valueFromTextOptions.text.getText();
      }
      else {
          const context = valueFromTextOptions.text.context
              ? valueFromTextOptions.text.context()
              : document;
          const valueElement = context.querySelector(valueFromTextOptions.text.selector);
          if (!valueElement) {
              if (options.disableLog !== true) {
                  log(`Не найден элемент ${options.name}`, 'crimson');
              }
              return valueFromTextOptions.errorValue;
          }
          valueText = text(valueElement);
      }
      if (valueFromTextOptions.replaceDataArray) {
          valueFromTextOptions.replaceDataArray.forEach((replaceData) => {
              valueText = valueText.replace(replaceData.searchValue, replaceData.replaceValue);
          });
      }
      const removeRegex = valueFromTextOptions.removeRegex
          ? valueFromTextOptions.removeRegex
          : defaultRemoveRegex;
      valueText = valueText.replace(removeRegex, '');
      if (!options.zeroValues || !options.zeroValues.includes(valueText)) {
          const matchRegex = valueFromTextOptions.matchRegex
              ? valueFromTextOptions.matchRegex
              : defaultNumberRegex;
          const minimumStakeMatch = valueText.match(matchRegex);
          if (!minimumStakeMatch) {
              if (options.disableLog !== true) {
                  log(`Непонятный формат элемента ${options.name}: "${valueText}"`, 'crimson');
              }
              return valueFromTextOptions.errorValue;
          }
          preliminaryValue = Number(minimumStakeMatch[1]);
      }
      extractType = 'text';
  }
  if (options.modifyValue) {
      return options.modifyValue(preliminaryValue, extractType);
  }
  return preliminaryValue;
};
const stakeInfoValueReadyGenerator = (options) => async (timeout = 5000, interval = 100) => {
  const modifiedOptions = {
      ...options,
      valueFromText: {
          ...options.valueFromText,
          errorValue: null,
      },
      disableLog: true,
  };
  const modifiedGetStakeInfoValue = getStakeInfoValueGenerator(modifiedOptions);
  const valueLoaded = await awaiter(() => {
      return modifiedGetStakeInfoValue() !== null;
  }, timeout, interval);
  return Boolean(valueLoaded);
};

const balanceSelector = '.amount';
const balanceOptions = {
  name: 'balance',
  // fixedValue: () => 0,
  valueFromText: {
      text: {
          // getText: () => '',
          selector: balanceSelector,
          context: () => document,
      },
      replaceDataArray: [
          {
              searchValue: '',
              replaceValue: '',
          },
      ],
      removeRegex: /[\s,']/g,
      matchRegex: /(\d+(?:\.\d+)?)/,
      errorValue: 0,
  },
  zeroValues: [],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  modifyValue: (value, extractType) => value,
  disableLog: false,
};
const getBalance = getStakeInfoValueGenerator(balanceOptions);
const balanceReady = stakeInfoValueReadyGenerator(balanceOptions);
const updateBalance = () => {
  worker.JSBalanceChange(getBalance());
};

/**
* Генератор функции проверки доступности ставки
* @returns Функция, которая возвращает true, если ставка доступна, иначе false
*/
const checkStakeEnabledGenerator = (options) => () => {
  if (getWorkerParameter('fakeStakeEnabled') ||
      getWorkerParameter('fakeOpenStake')) {
      return true;
  }
  if (window.germesData.stakeDisabled) {
      log('Ставка недоступна [forced]', 'crimson');
      return false;
  }
  const context = options.context ? options.context() : document;
  if (options.preCheck && !options.preCheck()) {
      return false;
  }
  const stakeCount = options.getStakeCount();
  if (stakeCount !== 1) {
      log(`Ошибка проверки доступности ставки: в купоне не 1 ставка (${stakeCount})`, 'crimson');
      return false;
  }
  if (options.betCheck) {
      const betElement = context.querySelector(options.betCheck.selector);
      if (!betElement) {
          log('Ошибка проверки доступности ставки: не найдена ставка в купоне', 'crimson');
          return false;
      }
      if (options.betCheck.errorClasses) {
          const errorClass = options.betCheck.errorClasses.find(({ className }) => {
              return [...betElement.classList].includes(className);
          });
          if (errorClass) {
              log(`Ставка недоступна${errorClass.message ? ` (${errorClass.message})` : ''}`, 'crimson');
              return false;
          }
      }
  }
  if (options.errorsCheck) {
      const errorCheck = options.errorsCheck.find(({ selector }) => {
          return Boolean(context.querySelector(selector));
      });
      if (errorCheck) {
          log(`Ставка недоступна${errorCheck.message ? ` (${errorCheck.message})` : ''}`, 'crimson');
          return false;
      }
  }
  return true;
};

const preCheck$2 = () => {
  return true;
};
const checkStakeEnabled = checkStakeEnabledGenerator({
  preCheck: preCheck$2,
  getStakeCount,
  betCheck: {
      selector: '#betAmountInput',
      errorClasses: [
          {
              className: '',
              message: '',
          },
      ],
  },
  errorsCheck: [
      {
          selector: '.tg__stake_deleted.tg--red-clr',
          message: 'Ставка не активна',
      },
  ],
  context: () => window.germesData.betFrame.contentDocument,
});

const coefficientSelector = '.tg__coupon_factor';
const coefficientOptions = {
  name: 'coefficient',
  // fixedValue: () => 0,
  valueFromText: {
      text: {
          // getText: () => '',
          selector: coefficientSelector,
          context: () => window.germesData.betFrame.contentDocument,
      },
      replaceDataArray: [
          {
              searchValue: '',
              replaceValue: '',
          },
      ],
      removeRegex: /[\s,']/g,
      matchRegex: /(\d+(?:\.\d+)?)/,
      errorValue: 0,
  },
  zeroValues: [],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  modifyValue: (value, extractType) => value,
  disableLog: false,
};
const getCoefficient = getStakeInfoValueGenerator(coefficientOptions);

const getParameter = () => {
  if (getWorkerParameter('fakeParameter') ||
      getWorkerParameter('fakeOpenStake')) {
      const parameter = Number(JSON.parse(worker.ForkObj).param);
      if (Number.isNaN(parameter)) {
          return -66;
      }
      return parameter;
  }
  const marketNameSelector = '.stake_item_panel .st_name';
  const betNameSelector = '.stake_item_panel .st_name';
  const marketNameElement = window.germesData.betFrame.contentDocument.querySelector(marketNameSelector);
  const betNameElement = window.germesData.betFrame.contentDocument.querySelector(betNameSelector);
  if (!marketNameElement) {
      log('Не найден маркет ставки', 'crimson');
      return -9998;
  }
  if (!betNameElement) {
      log('Не найдена роспись ставки', 'crimson');
      return -9997;
  }
  const marketName = text(marketNameElement);
  const betName = text(betNameElement);
  if (marketName === 'Draw No Bet') {
      return 0;
  }
  const parameterRegex = /\(([+-]?\d+(?:\.\d+)?)\)$/;
  const parameterMatch = betName.match(parameterRegex);
  if (parameterMatch) {
      return Number(parameterMatch[1]);
  }
  return -6666;
};

// export const minimumStakeSelector = '.err_panel_box  > .tg_info_message';
const minimumStakeOptions = {
  name: 'minimumStake',
  fixedValue: () => 10,
  // valueFromText: {
  //   text: {
  //     // getText: () => '',
  //     selector: minimumStakeSelector,
  //     context: () => document.querySelector('#sport_iframe_1').contentDocument,
  //   },
  //   replaceDataArray: [
  //     {
  //       searchValue: '',
  //       replaceValue: '',
  //     },
  //   ],
  //   removeRegex: /[\s,']/g,
  //   matchRegex: /(\d+(?:\.\d+)?)/,
  //   errorValue: 0,
  // },
  // zeroValues: [],
  // // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // modifyValue: (value: number, extractType: string) => value,
  // disableLog: false,
};
const getMinimumStake = getStakeInfoValueGenerator(minimumStakeOptions);

// export const maximumStakeSelector = '';
const maximumStakeRefresh = async () => {
  window.germesData.betFrame.contentDocument
      .querySelector('form .tg__btn.tg__btn-coupon')
      .click();
  await sleep(700);
  const maxbetElement = window.germesData.betFrame.contentDocument.querySelector('#betAmountInput');
  const inputValue = maxbetElement.value.match(/(\d+(?:,\d+)?)/);
  window.germesData.maximumStake = Number(inputValue[0].replace(',', ''));
  maxbetElement.value = '0';
};
const maximumStakeOptions = {
  name: 'maximumStake',
  fixedValue: () => window.germesData.maximumStake,
  // valueFromText: {
  //   text: {
  //     // getText: () => '',
  //     selector: maximumStakeSelector,
  //     context: () => document.getElementById('sport_iframe_1').contentDocument,
  //   },
  //   replaceDataArray: [
  //     {
  //       searchValue: '',
  //       replaceValue: '',
  //     },
  //   ],
  //   removeRegex: /[\s,']/g,
  //   matchRegex: /(\d+(?:\.\d+)?)/,
  //   errorValue: 0,
  // },
  zeroValues: [],
  modifyValue: (value) => value,
  disableLog: false,
};
const getMaximumStake = getStakeInfoValueGenerator(maximumStakeOptions);

const sumInputSelector = '.tg_input_coupon_amount';
const currentSumOptions = {
  name: 'currentSum',
  // fixedValue: () => 0,
  valueFromText: {
      text: {
          // getText: () => '',
          selector: sumInputSelector,
          context: () => window.germesData.betFrame.contentDocument,
      },
      replaceDataArray: [
          {
              searchValue: '',
              replaceValue: '',
          },
      ],
      removeRegex: /[\s,']/g,
      matchRegex: /(\d+(?:\.\d+)?)/,
      errorValue: 0,
  },
  zeroValues: [''],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  modifyValue: (value, extractType) => value,
  disableLog: false,
};
const getCurrentSum = getStakeInfoValueGenerator(currentSumOptions);

const showStakeGenerator = (options) => async () => {
  if (getWorkerParameter('fakeOpenStake')) {
      log('[fake] Ставка открыта', 'green');
      worker.JSStop();
      return;
  }
  worker.SetSessionData(`${window.germesData.bookmakerName}.ShowStake`, '1');
  options.clearGermesData();
  try {
      log(`Открываем ставку:\n${worker.TeamOne} vs ${worker.TeamTwo}\n${worker.BetName}`, 'steelblue');
      await options.preOpenEvent();
      await options.openEvent();
      await options.preOpenBet();
      await options.openBet();
      await options.setBetAcceptMode();
      log('Ставка успешно открыта', 'green');
      worker.SetSessionData(`${window.germesData.bookmakerName}.ShowStake`, '0');
      worker.JSStop();
  }
  catch (error) {
      if (error instanceof JsFailError) {
          log(error.message, 'red');
          worker.SetSessionData(`${window.germesData.bookmakerName}.ShowStake`, '0');
          worker.JSFail();
      }
      else if (error instanceof NewUrlError) {
          log(error.message, 'orange');
      }
      else {
          // Любая другая ошибка
          log('Скрипт вызвал исключение. Если часто повторяется, обратитесь в ТП', 'red');
          log(error.message, 'red');
          worker.SetSessionData(`${window.germesData.bookmakerName}.ShowStake`, '0');
          worker.JSFail();
          throw error;
      }
  }
};

const clearGermesData = () => {
  window.germesData = {
      bookmakerName: 'BetBoom',
      minimumStake: undefined,
      maximumStake: undefined,
      betProcessingStep: undefined,
      betProcessingAdditionalInfo: undefined,
      doStakeTime: undefined,
      betProcessingTimeout: 50000,
      stakeDisabled: undefined,
      betFrame: document.querySelector('#sport_iframe_1'),
      stopBetProcessing: () => {
          window.germesData.betProcessingStep = 'error';
          window.germesData.stakeDisabled = true;
      },
  };
};

/**
* Генератор функции очистки купона
*
* Проверяет, что купон пуст, если нет, очищает купон
* - Если есть apiClear, используется эта функция
* - Если в купоне 1 ставка:
* -- Используется clearSingleSelector, если определён, иначе clearAllSelector
* - Если в купоне 1+ ставок:
* -- Используется clearAllSelector, если определён, иначе clearSingleSelector (для каждой ставки)
* @returns Асинхронная функция, которая возвращает true, если очистка купона успешна, иначе false
*/
const clearCouponGenerator = (options) => async () => {
  if (!options.apiClear &&
      !options.clearSingleSelector &&
      !options.clearAllSelector) {
      log('Ошибка функции очистки купона. Обратитесь в ТП', 'crimson');
      return false;
  }
  if (options.preCheck) {
      const result = await options.preCheck();
      if (!result) {
          return false;
      }
  }
  const context = options.context ? options.context() : document;
  const stakeCount = options.getStakeCount();
  if (stakeCount !== 0) {
      log('Купон не пуст. Очищаем', 'orange');
      if (options.apiClear) {
          options.apiClear();
      }
      else if (stakeCount === 1) {
          log('что то есть');
          if (options.clearSingleSelector) {
              const clearSingleButton = context.querySelector(options.clearSingleSelector);
              if (!clearSingleButton) {
                  log('Не найдена кнопка удаления ставки из купона', 'crimson');
                  return false;
              }
              fireEvent(clearSingleButton, 'click');
          }
          else {
              const clearAllButton = context.querySelector(options.clearAllSelector);
              if (!clearAllButton) {
                  log('Не найдена кнопка очистки купона', 'crimson');
                  return false;
              }
              fireEvent(clearAllButton, 'click');
          }
      }
      else if (options.clearAllSelector) {
          const clearAllButton = context.querySelector(options.clearAllSelector);
          if (!clearAllButton) {
              log('Не найдена кнопка очистки купона', 'crimson');
              return false;
          }
          fireEvent(clearAllButton, 'click');
      }
      else {
          const clearSingleButtons = [
              ...context.querySelectorAll(options.clearSingleSelector),
          ];
          if (clearSingleButtons.length === 0) {
              log('Не найдены кнопки удаления ставок из купона', 'crimson');
              return false;
          }
          clearSingleButtons.forEach((button) => fireEvent(button, 'click'));
      }
      const couponCleared = Boolean(await awaiter(() => options.getStakeCount() === 0));
      if (!couponCleared) {
          log('Не удалось очистить купон', 'crimson');
          return false;
      }
      log('Купон очищен', 'cadetblue', true);
      if (options.postCheck) {
          const result = await options.postCheck();
          if (!result) {
              return false;
          }
      }
  }
  log('Купон пуст', 'cadetblue', true);
  return true;
};

const preCheck$1 = async () => {
  return true;
};
const apiClear = () => {
  window.germesData.betFrame.contentDocument
      .querySelector('.ms_panel .btn_delete')
      .click();
};
const postCheck$1 = async () => {
  return true;
};
const clearCoupon = clearCouponGenerator({
  preCheck: preCheck$1,
  getStakeCount,
  apiClear,
  // clearSingleSelector: '.ms_panel .btn_delete',
  clearAllSelector: '.ms_panel .btn_delete',
  postCheck: postCheck$1,
  context: () => window.germesData.betFrame.contentDocument,
});

const openBet = async () => {
  const couponCleared = await clearCoupon();
  if (!couponCleared) {
      throw new JsFailError('Не удалось очистить купон');
  }
  // Получение данных из меты
  const { sId: betId } = JSON.parse(worker.BetId);
  // Формирование данных для поиска
  const betSelector = `[data-stake-id*="${betId}"]`;
  log(`betSelector = "${betSelector}"`, 'white', true);
  // Поиск ставки
  const bet = await getElement(betSelector, 5000, window.germesData.betFrame.contentDocument);
  if (!bet) {
      throw new JsFailError('Ставка не найдена');
  }
  // Открытие ставки, проверка, что ставка попала в купон
  const openingAction = async () => {
      bet.click();
  };
  await repeatingOpenBet(openingAction, getStakeCount, 5, 1000, 50);
  await maximumStakeRefresh();
  const eventNameSelector = '.stake_item_panel .coupon_sport_name_container';
  const marketNameSelector = '.stake_item_panel .st_name';
  const eventNameElement = window.germesData.betFrame.contentDocument.querySelector(eventNameSelector);
  const marketNameElement = window.germesData.betFrame.contentDocument.querySelector(marketNameSelector);
  if (!eventNameElement) {
      throw new JsFailError('Не найдено событие открытой ставки');
  }
  if (!marketNameElement) {
      throw new JsFailError('Не найден маркет открытой ставки');
  }
  const eventName = text(eventNameElement);
  const marketName = text(marketNameElement);
  log(`Открыта ставка\n${eventName}\n${marketName}`, 'steelblue');
};

const openEvent = async () => {
  const eventUrl = `https://sport.betboom.ru/SportsBook/GameDetails/${worker.EventId}?gameId=${worker.EventId}`;
  if (window.location.href === eventUrl) {
      log('Уже открыто нужное событие', 'steelblue');
      return;
  }
  log(`${window.location.href} !== ${eventUrl}`, 'white', true);
  if (window.germesData.betFrame) {
      window.germesData.betFrame.contentDocument.location.href = eventUrl;
  }
  log('Переходим на событие', 'orange');
  await sleep(1000);
};

const preOpenBet = async () => { };

const preOpenEvent = async () => {
  if (!checkBookerHost()) {
      log('Открыта не страница конторы (или зеркала)', 'crimson');
      window.location.href = new URL(worker.BookmakerMainUrl).href;
      log(`${window.location.href}`, 'orange');
      throw new NewUrlError('Открываем страницу БК');
  }
  await clickLinkHandler();
  await authStateReady();
  worker.Islogin = checkAuth();
  worker.JSLogined();
  if (!worker.Islogin) {
      throw new JsFailError('Нет авторизации');
  }
  log('Есть авторизация', 'steelblue');
  await clearCoupon();
  await balanceReady();
  updateBalance();
};

const setBetAcceptMode = async () => {
  const acceptClickLabel = window.germesData.betFrame.contentDocument.querySelector('.coupChbContainer .tg__chb .tg__chb_lbl');
  const acceptInputCheckbox = window.germesData.betFrame.contentDocument.querySelector('.coupChbContainer input[type="checkbox"]');
  if (worker.StakeAcceptRuleShoulder === 0) {
      if (acceptInputCheckbox.checked) {
          log('Режим с текущим коэфициентом. Снимаем согласие изменения коэфициента', 'orange');
          acceptClickLabel.click();
      }
      else if (!acceptInputCheckbox.checked) {
          log('Режим с текущим коэфициентом', 'green');
      }
  }
  else if (worker.StakeAcceptRuleShoulder === 1) {
      if (acceptInputCheckbox.checked) {
          log('Режим с повышением коэфициента в данной конторе ОТСУТСТВУЕТ!  Снимаем согласие изменения коэфициента', 'orange');
          acceptClickLabel.click();
      }
      else if (!acceptInputCheckbox.checked) {
          log('Режим с повышением коэфициента в данной конторе ОТСУТСТВУЕТ!', 'orange');
      }
  }
  else if (worker.StakeAcceptRuleShoulder === 2) {
      if (!acceptInputCheckbox.checked) {
          log('Режим принятия ставок с любым изменением коэфициента - Ставим согласие изменения коэфициента', 'orange');
          acceptClickLabel.click();
      }
      else if (acceptInputCheckbox.checked) {
          log('Режим принятия ставок с любым изменением коэфициента', 'green');
      }
  }
};

const showStake = showStakeGenerator({
  clearGermesData,
  preOpenEvent,
  openEvent,
  preOpenBet,
  openBet,
  setBetAcceptMode,
});

const isReShowStakeNeeded = () => {
  return false;
};
const preAction = () => { };
const getStakeInfo = getStakeInfoGenerator({
  reShowStake: {
      isNeeded: isReShowStakeNeeded,
      showStake,
  },
  preAction,
  checkAuth,
  getBalance,
  getStakeCount,
  getMinimumStake,
  getMaximumStake,
  getCurrentSum,
  checkStakeEnabled,
  getCoefficient,
  getParameter,
});

const nativeInputValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
/**
* Ввод данных в React-элемент
* @param element целевой элемент
* @param value Вводимое значение
*/
const setReactInputValue = (element, value) => {
  if (element) {
      nativeInputValueSetter.call(element, value);
      fireEvent(element, 'input');
  }
  // const lastValue = element.value;
  // element.value = value;
  // const tracker = element._valueTracker;
  // if (tracker) {
  //   tracker.setValue(lastValue);
  // }
  // element.dispatchEvent(inputEvent);
};

/**
* Генератор колбэка setStakeSum (ввод суммы ставки)
* @returns Функция, которая возвращает true, если ввод суммы ставки успешен, иначе false
* - sum - вводимая сумма ставки
*/
const setStakeSumGenerator = (options) => (sum) => {
  if (getWorkerParameter('fakeDoStake')) {
      log(`[fake] Вводим сумму ставки: "${sum}"`, 'orange');
      return true;
  }
  const context = options.context ? options.context() : document;
  log(`Вводим сумму ставки: "${sum}"`, 'orange');
  if (sum > worker.StakeInfo.Balance) {
      log('Ошибка ввода суммы ставки: вводимая сумма больше баланса', 'crimson');
      return false;
  }
  if (sum > worker.StakeInfo.MaxSumm) {
      log('Ошибка ввода суммы ставки: вводимая сумма больше максимальной ставки', 'crimson');
      return false;
  }
  const inputElement = context.querySelector(options.sumInputSelector);
  if (!inputElement) {
      log('Поле ввода ставки не найдено', 'crimson');
      return false;
  }
  let falseOnSumChangeCheck = false;
  if (options.alreadySetCheck) {
      const currentSumMatch = inputElement.value.match(/(\d+(?:\.\d+)?)/);
      if (currentSumMatch && Number(currentSumMatch[0]) === sum) {
          log('Уже введена нужная сумма', 'steelblue');
          return true;
      }
      if (options.alreadySetCheck.falseOnSumChange) {
          falseOnSumChangeCheck = true;
      }
  }
  if (options.preInputCheck && !options.preInputCheck(sum)) {
      return false;
  }
  if (options.inputType === 'nativeInput') {
      nativeInput(inputElement, String(sum));
  }
  else if (options.inputType === 'react') {
      setReactInputValue(inputElement, sum);
  }
  else {
      inputElement.value = String(sum);
      if (options.fireEventNames) {
          options.fireEventNames.forEach((eventName) => {
              fireEvent(inputElement, eventName);
          });
      }
      else {
          fireEvent(inputElement, 'input');
      }
  }
  if (falseOnSumChangeCheck) {
      log('Задержка после изменения суммы в купоне', 'orange');
      return false;
  }
  worker.StakeInfo.Summ = sum;
  return true;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const preInputCheck = (sum) => {
  return true;
};
const setStakeSum = setStakeSumGenerator({
  sumInputSelector,
  alreadySetCheck: {
      falseOnSumChange: false,
  },
  preInputCheck,
  inputType: 'fireEvent',
  fireEventNames: ['input'],
  context: () => window.germesData.betFrame.contentDocument,
});

/**
* Генератор колбэка doStake (попытка ставки)
* @returns Функция, которая возвращает true, если попытка ставки успешна, иначе false
*/
const doStakeGenerator = (options) => () => {
  if (getWorkerParameter('fakeDoStake')) {
      log('[fake] Делаем ставку', 'orange');
      return true;
  }
  const context = options.context ? options.context() : document;
  log('Делаем ставку', 'orange');
  if (options.preCheck && !options.preCheck()) {
      return false;
  }
  const stakeButton = context.querySelector(options.doStakeButtonSelector);
  if (!stakeButton) {
      log('Не найдена кнопка "Сделать ставку"', 'crimson');
      return false;
  }
  const actualCoefficient = options.getCoefficient();
  log(`Коэффициент перед ставкой: "${actualCoefficient}"`, 'steelblue');
  if (actualCoefficient < worker.StakeInfo.Coef) {
      log('Коэффициент перед ставкой упал', 'crimson');
      return false;
  }
  if (options.errorClasses) {
      const errorClass = options.errorClasses.find(({ className }) => {
          return [...stakeButton.classList].includes(className);
      });
      if (errorClass) {
          log(`Кнопка ставки недоступна${errorClass.message ? ` (${errorClass.message})` : ''}`, 'crimson');
          return false;
      }
  }
  if (options.disabledCheck) {
      if (stakeButton.disabled) {
          log('Кнопка ставки недоступна', 'crimson');
          return false;
      }
  }
  if (options.postCheck && !options.postCheck()) {
      return false;
  }
  window.germesData.doStakeTime = new Date();
  log(`Время ставки: ${timeString(window.germesData.doStakeTime)}`, 'steelblue');
  stakeButton.click();
  window.germesData.betProcessingStep = 'beforeStart';
  return true;
};

const preCheck = () => {
  return true;
};
const postCheck = () => {
  return true;
};
const doStake = doStakeGenerator({
  preCheck,
  doStakeButtonSelector: '#favButtons .tg-grid-padding--4:nth-child(5) input',
  errorClasses: [
      {
          className: '',
          message: '',
      },
  ],
  disabledCheck: false,
  getCoefficient,
  postCheck,
  context: () => window.germesData.betFrame.contentDocument,
});

/**
* Генератор колбэка checkCouponLoading (проверка статуса обработки ставки)
* @returns Функция, которая возвращает true, если ставка ещё обрабатывается, иначе false
*/
const checkCouponLoadingGenerator = (options) => () => {
  if (getWorkerParameter('fakeDoStake')) {
      log('[fake] Обработка ставки завершена', 'orange');
      return false;
  }
  const now = new Date();
  const { doStakeTime } = window.germesData;
  const timePassedSinceDoStake = now.getTime() - doStakeTime.getTime();
  const timeout = window.germesData.betProcessingTimeout
      ? window.germesData.betProcessingTimeout + 10000
      : 50000;
  if (timePassedSinceDoStake > timeout) {
      const message = `В ${window.germesData.bookmakerName} очень долгое принятие ставки\n` +
          `Бот засчитает ставку как НЕ принятую\n` +
          `${stakeInfoString()}\n` +
          `Пожалуйста, проверьте самостоятельно. Если всё плохо - пишите в ТП`;
      worker.Helper.SendInformedMessage(message);
      log(`Слишком долгая обработка (> ${timeout / 1000}), считаем ставку непринятой`, 'crimson');
      return false;
  }
  const step = window.germesData.betProcessingStep;
  const additionalInfo = window.germesData.betProcessingAdditionalInfo
      ? ` (${window.germesData.betProcessingAdditionalInfo})`
      : '';
  switch (step) {
      case 'beforeStart':
          options.asyncCheck();
          window.germesData.betProcessingStep = 'waitingForLoaderOrResult';
          return true;
      case 'error':
      case 'success':
      case 'reopened':
          log(`Обработка ставки завершена${additionalInfo}`, 'orange');
          // log(step, 'orange', true);
          return false;
      case 'reopen':
          log(`Переоткрытие купона${additionalInfo}`, 'tan');
          return true;
      default:
          log(`Обработка ставки${additionalInfo}`, 'tan');
          // log(step, 'tan', true);
          return true;
  }
};

class StateMachine {
  constructor() {
      this.setStates = (states) => {
          this.states = states;
      };
      this.changeState = async (newState) => {
          const statesNames = Object.keys(this.states);
          if (!statesNames.includes(newState)) {
              throw new Error(`No new state ${newState} in states [${statesNames}]`);
          }
          this.state = newState;
          if ('entry' in this.states[this.state]) {
              this.states[this.state].entry();
          }
          if (!this.states[this.state].final) {
              this.data = await multiAwaiter(this.promises);
              if (this.data.key === null) {
                  await this.changeState('timeout');
              }
              else {
                  await this.changeState(this.data.key);
              }
          }
      };
      this.start = async (initialState) => {
          await this.changeState(initialState);
      };
  }
}

const loaderSelector = '.tg__loader_cont_coupon.tg--hide';
const errorSelector = {
  changeParameters: '.argumentChangeNotification',
  stakeNoActive: '.tg__stake_deleted.tg--red-clr',
};
const betPlacedSelector = '.cp_success';
const asyncCheck = async () => {
  const machine = new StateMachine();
  machine.promises = {
      loader: () => getElement(loaderSelector, getRemainingTimeout(), window.germesData.betFrame.contentDocument),
      errorParams: () => getElement(errorSelector.changeParameters, getRemainingTimeout(), window.germesData.betFrame.contentDocument),
      errorNoActive: () => getElement(errorSelector.stakeNoActive, getRemainingTimeout(), window.germesData.betFrame.contentDocument),
      betPlaced: () => getElement(betPlacedSelector, getRemainingTimeout(), window.germesData.betFrame.contentDocument),
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
              // machine.promises.loaderDissappeared = () =>
              //   awaiter(
              //     () =>
              //       !window.germesData.betFrame.contentDocument.querySelector<HTMLElement>(
              //         loaderSelector
              //       ).style.length,
              //     getRemainingTimeout()
              //   );
          },
      },
      // loaderDissappeared: {
      //   entry: async () => {
      //     log('Исчез индикатор', 'steelblue');
      //     window.germesData.betProcessingAdditionalInfo = null;
      //     await sleep(200);
      //     btn.click();
      //   },
      //   final: true,
      // },
      errorParams: {
          entry: async () => {
              log('Ошибка в параметрах', 'steelblue');
              const stakeParameter = getParameter();
              const stakeCoef = getCoefficient();
              window.germesData.betProcessingAdditionalInfo = null;
              const errorText = text(machine.data.result);
              if (stakeParameter !== worker.StakeInfo.Parametr) {
                  checkCouponLoadingError({
                      botMessage: `Изменился параметр ставки`,
                      informMessage: `Изменился параметр ставки`,
                  });
              }
              else if (stakeParameter !== worker.StakeInfo.Parametr &&
                  stakeCoef !== worker.StakeInfo.Coef) {
                  checkCouponLoadingError({
                      botMessage: `Изменился параметр и коэффициент ставки`,
                      informMessage: `Изменился параметр и коэффициент ставки`,
                  });
              }
              else {
                  checkCouponLoadingError({
                      botMessage: errorText,
                      informMessage: errorText,
                  });
              }
          },
          final: true,
      },
      errorNoActive: {
          entry: async () => {
              log('Появилась ошибка ставки', 'tomato');
              window.germesData.betProcessingAdditionalInfo = null;
              const errorText = text(machine.data.result);
              if (/не активна/.test(errorText)) {
                  checkCouponLoadingError({
                      botMessage: errorText,
                      informMessage: errorText,
                  });
              }
          },
          final: true,
      },
      betPlaced: {
          entry: async () => {
              window.germesData.betProcessingAdditionalInfo = null;
              checkCouponLoadingSuccess('Ставка принята');
          },
          final: true,
      },
      timeout: {
          entry: async () => {
              window.germesData.betProcessingAdditionalInfo = null;
              checkCouponLoadingError({
                  botMessage: 'Не дождались результата ставки',
                  informMessage: 'Не дождались результата ставки',
              });
          },
          final: true,
      },
  });
  machine.start('start');
};
const checkCouponLoading = checkCouponLoadingGenerator({
  asyncCheck,
});

/**
* Генератор колбэка checkStakeStatus (определение результата ставки)
* @returns Функция, которая возвращает true, если ставка принята, иначе false
*/
const checkStakeStatusGenerator = (options) => () => {
  if (getWorkerParameter('fakeDoStake')) {
      log('[fake] Ставка принята', 'green');
      return true;
  }
  if (window.germesData.betProcessingStep === 'success') {
      log('Ставка принята', 'green');
      options.updateBalance();
      return true;
  }
  log('Ставка не принята', 'red');
  return false;
};

const checkStakeStatus = checkStakeStatusGenerator({
  updateBalance,
});

const getCoefValueStakeBtn = () => {
  const { sId: betId } = JSON.parse(worker.BetId);
  const stakeBtn = window.germesData.betFrame.contentDocument.querySelector(`.Decimal[data-stake-id*="${betId}"]`);
  const stakeCoefNumberValue = Number(stakeBtn.innerText);
  return stakeCoefNumberValue;
};
// const getResultCoefficientText = (): string => {
//   return null;
// };
// const getResultCoefficient = getCoefficientGenerator({
//   coefficientSelector: '',
//   getCoefficientText: getResultCoefficientText,
//   replaceDataArray: [
//     {
//       searchValue: '',
//       replaceValue: '',
//     },
//   ],
//   removeRegex: /[\s,']/g,
//   coefficientRegex: /(\d+(?:\.\d+)?)/,
//   context: () => document,
// });
const afterSuccesfulStake = async () => {
  if (getWorkerParameter('fakeDoStake')) {
      return;
  }
  log('Обновление итогового коэффициента', 'steelblue');
  await sleep(700);
  const resultCoefficient = getCoefValueStakeBtn();
  if (resultCoefficient !== worker.StakeInfo.Coef) {
      log(`Коеффициент изменился: ${worker.StakeInfo.Coef} => ${resultCoefficient}`, 'orange');
      worker.StakeInfo.Coef = resultCoefficient;
      return;
  }
  log('Коеффициент не изменился', 'lightblue');
};

var version = "1.0.0";

const fastLoad = async () => {
  if (worker.GetSessionData(`${window.germesData.bookmakerName}.ShowStake`) ===
      '1') {
      log('Предыдущее переоткрытие купона незавершено', 'red');
      worker.SetSessionData(`${window.germesData.bookmakerName}.ShowStake`, '0');
      worker.JSFail();
      window.location.reload();
      return;
  }
  log(`Быстрая загрузка (${version})`, 'steelblue');
  showStake();
};

/**
* Генератор функции проверки и вызова авторизации
*/
const initializeGenerator = (options) => async () => {
  if (worker.LoginTry > 3) {
      log('Превышен лимит попыток авторизации', 'crimson');
      return;
  }
  const timeout = options.authStateReadyTimeout
      ? options.authStateReadyTimeout
      : 5000;
  await options.authStateReady(timeout);
  worker.Islogin = options.checkAuth();
  worker.JSLogined();
  if (worker.Islogin) {
      log('Есть авторизация', 'green');
      worker.Islogin = true;
      worker.JSLogined();
      const balanceLoaded = await options.balanceReady();
      if (!balanceLoaded) {
          log(`Баланс не появился`, 'crimson');
      }
      else {
          options.updateBalance();
      }
      if (options.afterSuccesfulLogin) {
          options.afterSuccesfulLogin();
      }
  }
  else {
      options.authorize();
  }
};

/**
* Генератор функции авторизации на сайте бк
*/
const authorizeGenerator = (options) => async () => {
  const context = options.context ? options.context() : document;
  if (options.openForm) {
      const loopCount = options.openForm.loopCount
          ? options.openForm.loopCount
          : 10;
      const triesInterval = options.openForm.triesInterval
          ? options.openForm.triesInterval
          : 1000;
      for (let i = 1; i <= loopCount; i += 1) {
          // eslint-disable-next-line no-await-in-loop
          const openLoginFormButton = await getElement(options.openForm.selector, 1000, context);
          if (!openLoginFormButton) {
              log('Не найдена кнопка открытия формы авторизации', 'crimson');
              return;
          }
          openLoginFormButton.click();
          // eslint-disable-next-line no-await-in-loop
          const authForm = await getElement(options.openForm.openedSelector, triesInterval, context);
          if (!authForm) {
              if (i === loopCount) {
                  log('Форма авторизации так и не появилась', 'crimson');
                  return;
              }
              log('Форма авторизации не появилась. Пробуем ещё раз', 'steelblue');
          }
          else {
              break;
          }
      }
      if (options.openForm.afterOpenDelay) {
          await sleep(options.openForm.afterOpenDelay);
      }
  }
  if (options.setLoginType) {
      const loginTypeSet = await options.setLoginType();
      if (!loginTypeSet) {
          log('Не удалось переключиться на вход по нужному типу логина', 'crimson');
          return;
      }
  }
  const loginInput = await getElement(options.loginInputSelector, 5000, context);
  if (!loginInput) {
      log('Не найдено поле ввода логина', 'crimson');
      return;
  }
  const input = (inputElement, value) => {
      if (options.inputType === 'nativeInput') {
          nativeInput(inputElement, value);
      }
      else if (options.inputType === 'react') {
          setReactInputValue(inputElement, value);
      }
      else {
          // eslint-disable-next-line no-param-reassign
          inputElement.value = value;
          if (options.fireEventNames) {
              options.fireEventNames.forEach((eventName) => {
                  fireEvent(inputElement, eventName);
              });
          }
          else {
              // fireEvent(inputElement, 'focus');
              // fireEvent(inputElement, 'click');
              // fireEvent(inputElement, 'keypress');
              // fireEvent(inputElement, 'keyup');
              fireEvent(inputElement, 'input');
          }
      }
  };
  input(loginInput, worker.Login);
  const passwordInput = await getElement(options.passwordInputSelector, 5000, context);
  if (!passwordInput) {
      log('Не найдено поле ввода пароля', 'crimson');
      return;
  }
  input(passwordInput, worker.Password);
  const loginSubmitButton = await getElement(options.submitButtonSelector, 5000, context);
  if (!loginSubmitButton) {
      log('Не найдена кнопка входа', 'crimson');
      return;
  }
  if (options.beforeSubmitDelay) {
      await sleep(options.beforeSubmitDelay);
  }
  if (options.beforeSubmitCheck) {
      const check = await options.beforeSubmitCheck();
      if (!check) {
          log('Не удалось пройти проверку перед попыткой входа', 'crimson');
          return;
      }
  }
  log('Нажимаем на кнопку входа', 'orange');
  loginSubmitButton.click();
  worker.LoginTry += 1;
  if (options.captchaSelector) {
      getElement(options.captchaSelector, 5000, context).then((element) => {
          if (element) {
              log('Появилась капча', 'orange');
          }
      });
  }
  if (options.loginedWait) {
      const timeout = options.loginedWait.timeout || 5000;
      const logined = await getElement(options.loginedWait.loginedSelector, timeout, context);
      if (!logined) {
          log('Авторизация не удалась', 'crimson');
          return;
      }
      log('Авторизация успешна', 'green');
      worker.Islogin = true;
      worker.JSLogined();
      const balanceLoaded = await options.loginedWait.balanceReady();
      if (!balanceLoaded) {
          log(`Баланс не появился`, 'crimson');
      }
      else {
          options.loginedWait.updateBalance();
      }
      if (options.loginedWait.afterSuccesfulLogin) {
          options.loginedWait.afterSuccesfulLogin();
      }
  }
};

const afterSuccesfulLogin = async () => {
  await clickLinkHandler();
  log('Переход на страницу спорт ставок!', 'orange');
};

const setLoginType = async () => {
  return true;
};
const authorize = authorizeGenerator({
  openForm: {
      selector: '.auth__btn.btn',
      openedSelector: '.pop-up__wrap',
      loopCount: 10,
      triesInterval: 1000,
      afterOpenDelay: 0,
  },
  setLoginType,
  loginInputSelector: '#login_input',
  passwordInputSelector: '#log_pass_input',
  submitButtonSelector: '.form-group > .btn.btn--primary',
  inputType: 'fireEvent',
  fireEventNames: ['input'],
  beforeSubmitDelay: 1000,
  captchaSelector: '',
  loginedWait: {
      loginedSelector: authElementSelector,
      timeout: 5000,
      balanceReady,
      updateBalance,
      afterSuccesfulLogin,
  },
  context: () => document,
});

const initialize = initializeGenerator({
  authStateReady,
  authStateReadyTimeout: 5000,
  checkAuth,
  balanceReady,
  updateBalance,
  authorize,
  afterSuccesfulLogin,
});

window.alert = (message) => {
  log(`Перехваченный алерт: ${message}`);
};
worker.SetCallBacks(log, getStakeInfo, setStakeSum, doStake, checkCouponLoading, checkStakeStatus, afterSuccesfulStake);
worker.SetFastCallback(fastLoad);
clearGermesData();
(async () => {
  if (worker.GetSessionData(`${window.germesData.bookmakerName}.ShowStake`) ===
      '1' &&
      worker.IsShowStake) {
      log('Загрузка страницы с открытием купона', 'steelblue');
      showStake();
  }
  else if (!worker.IsShowStake) {
      worker.SetSessionData(`${window.germesData.bookmakerName}.ShowStake`, '0');
      log('Загрузка страницы с авторизацией', 'steelblue');
      initialize();
  }
  else {
      log('Загрузка страницы без открытия купона', 'steelblue');
  }
})();
