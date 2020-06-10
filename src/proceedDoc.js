export default (doc) => {
  try {
    const title = doc.querySelector('title').textContent;
    const description = doc.querySelector('description').textContent;
    const items = [...doc.querySelectorAll('item')].reduce((acc, item) => {
      const itemTitle = item.querySelector('title').textContent;
      const pubDate = item.querySelector('pubdate').textContent;
      const link = item.querySelector('link').textContent;
      return [...acc, { itemTitle, pubDate, link }];
    }, []);
    return {
      head: {
        title,
        description,
      },
      items,
    };
  } catch (e) {
    return e;
  }
};
