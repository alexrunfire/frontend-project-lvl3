export default (response) => {
  const domparser = new DOMParser();
  return domparser.parseFromString(response.data, 'text/xml');
};
