(() => {
  const packageImages = {
    basic: 'assets/packages/basic-craze.webp.b64',
    standard: 'assets/packages/standard-craze.webp.b64',
    popular: 'assets/packages/popular-craze.webp.b64',
    premium: 'assets/packages/premium-craze.webp.b64'
  };

  const applyImage = async (key, path) => {
    const response = await fetch(`${path}?v=1`, { cache: 'force-cache' });
    if (!response.ok) throw new Error(`${key} package image returned ${response.status}`);

    const base64 = (await response.text()).trim();
    if (!base64.startsWith('UklG') || base64.length < 1000) {
      throw new Error(`${key} package image data is invalid`);
    }

    const imageUrl = `url("data:image/webp;base64,${base64}")`;
    document.querySelectorAll(`.${key}-photo`).forEach((element) => {
      element.style.backgroundImage = imageUrl;
      element.style.backgroundSize = 'cover';
      element.style.backgroundPosition = 'center';
      element.style.backgroundRepeat = 'no-repeat';
    });
  };

  Promise.all(Object.entries(packageImages).map(([key, path]) => applyImage(key, path)))
    .then(() => document.documentElement.classList.add('package-images-ready'))
    .catch((error) => console.error('Candy Craze package images:', error));
})();
