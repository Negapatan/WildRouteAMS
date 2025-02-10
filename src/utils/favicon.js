export const setFavicon = () => {
  const link = document.querySelector("link[rel~='icon']");
  if (link) {
    link.href = process.env.PUBLIC_URL + '/CIT-icon.png';
  }
  
  const appleTouchIcon = document.querySelector("link[rel='apple-touch-icon']");
  if (appleTouchIcon) {
    appleTouchIcon.href = process.env.PUBLIC_URL + '/CIT192.png';
  }
}; 