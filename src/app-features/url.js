const proxy = {
  url: () => 'cors-container.herokuapp.com',
};
export default (url) => `https://${proxy.url()}/${url}`;
