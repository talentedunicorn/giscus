const url = new URL(window.location.href);
const session = url.searchParams.get('giscussions');

if (session) {
  localStorage.setItem('giscussions-session', session);
  url.searchParams.delete('giscussions');
  history.replaceState(undefined, document.title, url.toString());
}

const script = document.currentScript as HTMLScriptElement;
const attributes = script.dataset;
const params: Record<string, string> = {};

params.origin = location.href;
params.session = session || localStorage.getItem('giscussions-session') || '';
params.theme = attributes.theme;
params.repo = attributes.repo;

switch (attributes.mapping) {
  case 'url':
    params.term = location.href;
    break;
  case 'title':
    params.term = document.title;
    break;
  case 'og:title':
    {
      const ogtitleMeta = document.querySelector(
        `meta[property='og:title'],meta[name='og:title']`,
      ) as HTMLMetaElement;
      params.term = ogtitleMeta ? ogtitleMeta.content : '';
    }
    break;
  case 'specific':
    params.term = attributes.term;
    break;
  case 'pathname':
  default:
    params.term = location.pathname;
    break;
}

const giscussionsOrigin = script.src.match(
  /^https:\/\/giscussions\.vercel\.app|http:\/\/localhost:\d+/,
)[0];
const src = `${giscussionsOrigin}/widget?${new URLSearchParams(params)}`;

const iframeElement = document.createElement('iframe');
const iframeAttributes = {
  class: 'giscussions-frame',
  title: 'Comments',
  scrolling: 'no',
  src,
};
Object.entries(iframeAttributes).forEach(([key, value]) => iframeElement.setAttribute(key, value));

const existingContainer = document.querySelector('.giscussions');
if (!existingContainer) {
  const iframeContainer = document.createElement('div');
  iframeContainer.setAttribute('class', 'giscussions');
  iframeContainer.appendChild(iframeElement);

  script.insertAdjacentElement('afterend', iframeContainer);
} else {
  while (existingContainer.firstChild) existingContainer.firstChild.remove();
  existingContainer.appendChild(iframeElement);
}

// Set up iframeResizer

declare let iFrameResize: (options: Record<string, unknown>) => void;

function loadScript(url: string, callback: VoidFunction) {
  const target = document.createElement('script');
  target.setAttribute('src', url);
  target.onload = callback;
  script.insertAdjacentElement('beforeend', target);
}

loadScript('https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.3.1/iframeResizer.min.js', () =>
  iFrameResize({ checkOrigin: [giscussionsOrigin] }),
);