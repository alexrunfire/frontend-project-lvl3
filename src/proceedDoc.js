export default (doc) => {
  try {
    const itemTitle = doc.querySelector('title').textContent;
    const description = doc.querySelector('description').textContent;
    const itemLink = doc.querySelector('link').textContent;
    const articles = [...doc.querySelectorAll('item')].reduce((acc, article) => {
      const articleTitle = article.querySelector('title').textContent;
      const aticleLink = article.querySelector('link').textContent;
      const id = article.querySelector('guid').textContent;
      return [...acc, { articleTitle, aticleLink, id }];
    }, []);
    return {
      item: {
        itemTitle,
        description,
        itemLink,
      },
      articles,
    };
  } catch (e) {
    return e;
  }
};
