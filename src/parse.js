export default (response) => {
  const domparser = new DOMParser();
  const xmlDoc = domparser.parseFromString(response.data, 'text/html');
  return domparser.parseFromString(xmlDoc, 'text/html');
};
