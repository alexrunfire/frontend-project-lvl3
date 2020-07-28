const makeArticle = (item) => {
  const title = item.querySelector('title').textContent;
  const link = item.querySelector('link').textContent;
  const guid = item.querySelector('guid').textContent;
  return { title, link, guid };
};

export default (data) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(data, 'text/xml');
  const title = doc.querySelector('title').textContent;
  const description = doc.querySelector('description').textContent;
  const link = doc.querySelector('link').textContent;
  const items = [...doc.querySelectorAll('item')].map(makeArticle);
  return {
    title,
    description,
    link,
    items,
  };
};
