const compareNameBKByLink = (): string =>
  /betboom/.test(worker.BookmakerMainUrl) ? 'betboom' : 'pin-up';

export default compareNameBKByLink;
