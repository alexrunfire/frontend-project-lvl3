import rssItems from '../components/rss-items';
import findNewItems from './find-new-items';

const createItem = (item) => {
  const { link, title } = item;
  const div = document.createElement('div');
  const a = document.createElement('a');
  a.setAttribute('href', link);
  a.classList.add('text-info');
  a.textContent = title;
  div.append(a);
  return div;
};

export default (currentValue, previousValue) => {
  const newItems = findNewItems(currentValue, previousValue);
  if (rssItems().children.length === 0) {
    newItems.forEach((item) => {
      const newItem = createItem(item);
      rssItems().append(newItem);
    });
  } else {
    const { firstChild } = rssItems();
    newItems.forEach((item) => {
      const newItem = createItem(item);
      firstChild.before(newItem);
    });
  }
};
