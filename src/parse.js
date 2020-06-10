export default (response) => {
  const domparser = new DOMParser();
  const xmlDoc = domparser.parseFromString(response.data, 'text/xml');
  return domparser.parseFromString(xmlDoc, 'text/html');
};
