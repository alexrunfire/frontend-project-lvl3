const makeArticle = (item) => {
  const title = item.querySelector('title').textContent;
  const link = item.querySelector('link').textContent;
  const guid = item.querySelector('guid').textContent;
  return { title, link, guid };
};

export default (rssDoc) => {
  try {
    const title = rssDoc.querySelector('title').textContent;
    const description = rssDoc.querySelector('description').textContent;
    const link = rssDoc.querySelector('link').textContent;
    const items = [...rssDoc.querySelectorAll('item')].map(makeArticle);
    return {
      title,
      description,
      link,
      items,
    };
  } catch (e) {
    throw new Error('This is not RSS format.');
  }
};
