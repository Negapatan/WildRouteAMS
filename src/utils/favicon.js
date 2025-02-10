export const setFavicon = () => {
  const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
  link.type = 'image/x-icon';
  link.rel = 'icon';
  link.href = process.env.PUBLIC_URL + '/wildcore-favicon.ico';
  document.head.appendChild(link);
}; 