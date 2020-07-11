import parseRss from '../rss-parser';
import state from '../state';
import { watchedProcessed } from '../render';

export default (rssDoc, url) => {
  const {
    title, description, link, items,
  } = parseRss(rssDoc);
  watchedProcessed().items = { ...watchedProcessed().items, [url]: items };
  if (!state.rssUrls.includes(url)) {
    watchedProcessed().head = { title, description, link };
    state.rssUrls = [...state.rssUrls, url];
  }
};
