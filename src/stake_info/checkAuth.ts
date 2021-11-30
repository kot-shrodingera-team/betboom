import checkAuthGenerator, {
  authStateReadyGenerator,
} from '@kot-shrodingera-team/germes-generators/stake_info/checkAuth';

export const noAuthElementSelector = '.auth__btn.btn, #auth_registration';
export const authElementSelector =
  '.header__control.control-account, .userbar__item-money';

export const authStateReady = authStateReadyGenerator({
  noAuthElementSelector,
  authElementSelector,
  // maxDelayAfterNoAuthElementAppeared: 0,
  // context: () => document,
});

const checkAuth = checkAuthGenerator({
  authElementSelector,
  // context: () => document,
});

export default checkAuth;
