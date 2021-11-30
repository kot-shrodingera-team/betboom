import { log } from '@kot-shrodingera-team/germes-utils';

const afterSuccesfulLogin = async (): Promise<void> => {
  if (!/^\/sport/.test(window.location.pathname)) {
    log('Переходим в раздел Sport', 'orange');
    window.location.pathname = '/sport';
  }
};

export default afterSuccesfulLogin;
