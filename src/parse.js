export default (response) => {
  const domparser = new DOMParser();
  const xmlDoc = domparser.parseFromString(response.data, 'application/xml');
  return domparser.parseFromString(xmlDoc, 'text/html');
};
