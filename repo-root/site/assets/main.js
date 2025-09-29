document.addEventListener('DOMContentLoaded', () => {
  const slideshow = document.getElementById('slideshow');
  if (!slideshow) return;

  const imageEl = slideshow.querySelector('.slideshow-image');
  const titleEl = slideshow.querySelector('.slideshow-title');
  const descriptionEl = slideshow.querySelector('.slideshow-description');
  const metaIntegrationEl = slideshow.querySelector('.meta-integration');
  const metaSubsEl = slideshow.querySelector('.meta-subs');
  const metaGainEl = slideshow.querySelector('.meta-gain');
  const metaBortleEl = slideshow.querySelector('.meta-bortle');

  const wikiSummaryEl = document.querySelector('.wiki-summary');
  const wikiLinkEl = document.querySelector('.wiki-link');

  const prevButton = document.getElementById('prev-slide');
  const nextButton = document.getElementById('next-slide');

  let imagesData = [];
  let currentIndex = 0;
  let currentWikiTitle = '';

  async function fetchImages() {
    try {
      const response = await fetch('assets/data.json');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      imagesData = await response.json();
      if (imagesData.length > 0) {
        updateSlide(currentIndex);
      }
    } catch (error) {
      console.error('Failed to load image data:', error);
      descriptionEl.textContent = 'Error: Could not load image data.';
    }
  }

  async function fetchWikiSummary(pageTitle) {
    if (!pageTitle || pageTitle === currentWikiTitle) {
      return; // No title or same as current, so no need to fetch.
    }

    wikiSummaryEl.innerHTML = 'Loading...';
    wikiLinkEl.style.display = 'none';
    currentWikiTitle = pageTitle;

    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;

    try {
      const response = await fetch(url, { headers: { 'Api-User-Agent': 'AstroBlog/1.0' } });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      wikiSummaryEl.innerHTML = data.extract_html;
      wikiLinkEl.href = data.content_urls.desktop.page;
      wikiLinkEl.style.display = 'inline-block';
    } catch (error) {
      console.error('Failed to load Wikipedia summary:', error);
      wikiSummaryEl.textContent = 'Error: Could not load Wikipedia summary.';
      currentWikiTitle = ''; // Reset on error to allow retrying
    }
  }

  function updateSlide(index) {
    if (!imagesData[index]) return;

    const slide = imagesData[index];

    // Preload the image before showing it
    const tempImg = new Image();
    tempImg.onload = () => {
        imageEl.src = slide.imageUrl;
        imageEl.alt = slide.title;
        slideshow.classList.remove('loading');
    };
    tempImg.onerror = () => {
        imageEl.alt = 'Image not found';
        slideshow.classList.remove('loading');
    }
    slideshow.classList.add('loading');
    tempImg.src = slide.imageUrl;

    titleEl.textContent = slide.title;
    descriptionEl.textContent = slide.description;
    metaIntegrationEl.textContent = slide.acquisition.integration || 'N/A';
    metaSubsEl.textContent = slide.acquisition.subs || 'N/A';
    metaGainEl.textContent = slide.acquisition.gain_iso || 'N/A';
    metaBortleEl.textContent = slide.acquisition.bortle || 'N/A';

    fetchWikiSummary(slide.wikiPageTitle);

    currentIndex = index;
  }

  prevButton.addEventListener('click', () => {
    const newIndex = (currentIndex - 1 + imagesData.length) % imagesData.length;
    updateSlide(newIndex);
  });

  nextButton.addEventListener('click', () => {
    const newIndex = (currentIndex + 1) % imagesData.length;
    updateSlide(newIndex);
  });

  // Initial load
  fetchImages();
});
