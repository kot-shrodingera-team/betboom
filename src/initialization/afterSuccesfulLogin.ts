import goToLive from '../helpers/goToLive';

const afterSuccesfulLogin = async (): Promise<void> => {
  await goToLive();
};

export default afterSuccesfulLogin;
