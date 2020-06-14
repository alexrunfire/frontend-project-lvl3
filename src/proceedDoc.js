export default (doc) => {
  try {
    const title = doc.querySelector('title').textContent;
    const description = doc.querySelector('description').textContent;
    const headLink = doc.querySelector('link').textContent;
    const items = [...doc.querySelectorAll('item')].reduce((acc, item) => {
      const itemTitle = item.querySelector('title').textContent;
      const link = item.querySelector('link').textContent;
      const id = item.querySelector('guid').textContent;
      return [...acc, { itemTitle, link, id }];
    }, []);
    return {
      head: {
        title,
        description,
        headLink,
      },
      items,
    };
  } catch (e) {
    return e;
  }
};
