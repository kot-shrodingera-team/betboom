import authorizeGenerator from '@kot-shrodingera-team/germes-generators/initialization/authorize';
// import {
//   getElement,
//   log,
//   resolveRecaptcha,
// } from '@kot-shrodingera-team/germes-utils';
import { authElementSelector } from '../stake_info/checkAuth';
import { updateBalance, balanceReady } from '../stake_info/getBalance';
import afterSuccesfulLogin from './afterSuccesfulLogin';

// const preInputCheck = async (): Promise<boolean> => {
//   return true;
// };

// const beforeSubmitCheck = async (): Promise<boolean> => {
//   // const recaptchaIFrame = await getElement('iframe[title="reCAPTCHA"]', 1000);
//   // if (recaptchaIFrame) {
//   //   log('Есть капча. Пытаемся решить', 'orange');
//   //   try {
//   //     await resolveRecaptcha();
//   //   } catch (e) {
//   //     if (e instanceof Error) {
//   //       log(e.message, 'red');
//   //     }
//   //     return false;
//   //   }
//   // } else {
//   //   log('Нет капчи', 'steelblue');
//   // }
//   return true;
// };

const authorize = authorizeGenerator({
  openForm: {
    selector: '.auth__btn.btn, #auth_registration',
    openedSelector: '.pop-up__wrap, #popup-reg-auth',
    // loopCount: 10,
    // triesInterval: 1000,
    // afterOpenDelay: 0,
  },
  // preInputCheck,
  loginInputSelector: '#login_input, #popup_reg_auth_inputPhone',
  passwordInputSelector: '#log_pass_input, #popup_reg_auth_inputCode',
  submitButtonSelector:
    '.form-group > .btn.btn--primary, #popup_reg_auth_submit',
  inputType: 'fireEvent',
  fireEventNames: ['input'],
  beforeSubmitDelay: 1000,
  // beforeSubmitCheck,
  // captchaSelector: '',
  loginedWait: {
    loginedSelector: authElementSelector,
    timeout: 5000,
    balanceReady,
    updateBalance,
    afterSuccesfulLogin,
  },
  // context: () => document,
});

export default authorize;
