export default (doc) => {
  try {
    const title = doc.querySelector('title').textContent;
    const description = doc.querySelector('description').textContent;
    const items = [...doc.querySelectorAll('item')].reduce((acc, item) => {
      const itemTitle = item.querySelector('title').textContent;
      return [...acc, itemTitle];
    }, []);
    return {
      head: {
        title,
        description,
      },
      items,
    };
  } catch (e) {
    console.log(e.message);
    return e;
  }
};
