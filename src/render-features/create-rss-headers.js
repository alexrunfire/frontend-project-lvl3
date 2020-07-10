import rssHeads from '../components/rss-heads';

export default ({ title, description, link }) => {
  const div = document.createElement('div');
  const a = document.createElement('a');
  a.setAttribute('href', link);
  a.textContent = `${title} (${description})`;
  div.append(a);
  rssHeads().prepend(div);
};
