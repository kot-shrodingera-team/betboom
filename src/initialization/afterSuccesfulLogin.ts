import { log } from '@kot-shrodingera-team/germes-utils';

const afterSuccesfulLogin = async (): Promise<void> => {
  if (window.location.hostname === 'pin-up.ru') {
    return;
  }
  if (!/^\/sport/.test(window.location.pathname)) {
    log('Переходим в раздел Sport', 'orange');
    window.location.pathname = '/sport';
  }
};

export default afterSuccesfulLogin;
