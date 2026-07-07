/* ============================================
   AUTO TRANSLATE - Sinhala to English
   Uses MyMemory free translation API
   ============================================ */
async function translateSiToEn(text) {
  if (!text || !text.trim()) return '';
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=si|en`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.responseStatus === 200 && data.responseData) {
      return data.responseData.translatedText;
    }
    return '';
  } catch (e) {
    console.error('Translation error:', e);
    return '';
  }
}

/* ============================================
   I18N - Language Toggle System
   ============================================ */
const translations = {
  en: {
    topbar_new: 'New episodes daily',
    topbar_lang: 'English / සිංහල',
    nav_home: 'Home',
    nav_categories: 'Categories',
    nav_watchlater: 'Watch Later',
    nav_about: 'About',
    search_placeholder: 'Search cartoons...',
    hero_badge: 'Trending Now',
    hero_title: 'Watch Your Favorite Cartoons Anytime',
    hero_desc: 'Stream the best cartoons in Sinhala and English. New episodes added every day!',
    hero_browse: 'Browse Now',
    hero_watchlater: 'My Watch Later',
    stat_videos: 'Videos',
    stat_viewers: 'Viewers',
    stat_rating: 'Rating',
    pill_all: 'All',
    latest_title: 'Latest Uploads',
    view_all: 'View All',
    feat_title: 'Browse by Category',
    about_title: 'About CartoonLK',
    about_desc: 'CartoonLK is your ultimate destination for cartoon entertainment. We bring you the best animated content in both Sinhala and English, completely free.',
    about_f1: 'Fast Streaming',
    about_f2: 'Mobile Friendly',
    about_f3: 'Multi Language',
    about_f4: 'Safe & Secure',
    footer_desc: 'Your favorite cartoons in Sinhala and English.',
    footer_links: 'Quick Links',
    footer_categories: 'Categories',
    footer_contact: 'Contact',
    footer_rights: 'All Rights Reserved.',
    add_watchlater: 'Watch Later',
    in_watchlater: 'In Watch Later',
    share: 'Share',
    related: 'Related Videos',
    more_videos: 'More Videos',
    load_video: 'Loading video...',
    ad_wait: 'Opening in',
    ad_continue: 'Continue',
    ad_note: 'This supports our free service',
    wl_title: 'My Watch Later',
    wl_clear: 'Clear All',
    wl_empty_title: 'Your Watch Later list is empty',
    wl_empty_desc: 'Save videos to watch them later!',
    wl_browse: 'Browse Videos'
  },
  si: {
    topbar_new: 'දිනපතා නව කතාංග',
    topbar_lang: 'English / සිංහල',
    nav_home: 'මුල් පිටුව',
    nav_categories: 'ප්‍රවර්ග',
    nav_watchlater: 'පසුව නරඹන්න',
    nav_about: 'අප ගැන',
    search_placeholder: 'සජීවිකරණ සොයන්න...',
    hero_badge: 'ජනප්‍රියයි',
    hero_title: 'ඔබේ ප්‍රියතම සජීවිකරණ ඕනෑම වේලාවක නරඹන්න',
    hero_desc: 'සිංහල සහ ඉංග්‍රීසි භාෂාවෙන් හොඳම සජීවිකරණ නරඹන්න. දිනපතා නව කතාංග එකතු කරනු ලැබේ!',
    hero_browse: 'දැන්ම බලන්න',
    hero_watchlater: 'මගේ නැරඹීමේ ලැයිස්තුව',
    stat_videos: 'වීඩියෝ',
    stat_viewers: 'නරඹන්නන්',
    stat_rating: 'ශ්‍රේණිගත',
    pill_all: 'සියල්ල',
    latest_title: 'නවතම උඩුගත කිරීම්',
    view_all: 'සියල්ල බලන්න',
    feat_title: 'ප්‍රවර්ග අනුව බලන්න',
    about_title: 'CartoonLK ගැන',
    about_desc: 'CartoonLK යනු සජීවිකරණ විනෝදාස්වාදය සඳහා ඔබේ අවසාන ගමනාන්තයයි. අපි ඔබ වෙත සිංහල සහ ඉංග්‍රීසි යන භාෂාවලින් හොඳම සජීවිකරණ ඇනිමේෂන් අන්තර්ගතය සම්පූර්ණයෙන්ම නොමිලේ ගෙන එන්නෙමු.',
    about_f1: 'වේගවත් විකාශනය',
    about_f2: 'ජංගම හිතකාමී',
    about_f3: 'බහු භාෂා',
    about_f4: 'ආරක්ෂිත',
    footer_desc: 'සිංහල සහ ඉංග්‍රීසි භාෂාවෙන් ඔබේ ප්‍රියතම සජීවිකරණ.',
    footer_links: 'ඉක්මන් සබැඳි',
    footer_categories: 'ප්‍රවර්ග',
    footer_contact: 'සම්බන්ධ වන්න',
    footer_rights: 'සියලු හිමිකම් ඇවිරිණි.',
    add_watchlater: 'පසුව නරඹන්න',
    in_watchlater: 'ලැයිස්තුවේ ඇත',
    share: 'බෙදාගන්න',
    related: 'අදාළ වීඩියෝ',
    more_videos: 'තවත් වීඩියෝ',
    load_video: 'වීඩියෝ පූරණය වෙමින්...',
    ad_wait: 'විවෘත වීමට',
    ad_continue: 'ඉදිරියට',
    ad_note: 'මෙය අපගේ නොමිලේ සේවාවට සහය වේ',
    wl_title: 'මගේ නැරඹීමේ ලැයිස්තුව',
    wl_clear: 'සියල්ල මකන්න',
    wl_empty_title: 'ඔබේ ලැයිස්තුව හිස්ය',
    wl_empty_desc: 'පසුව නැරඹීමට වීඩියෝ සුරකින්න!',
    wl_browse: 'වීඩියෝ බලන්න'
  }
};

function applyLanguage(lang) {
  document.body.classList.toggle('lang-si', lang === 'si');
  document.documentElement.lang = lang;
  
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
  
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (translations[lang] && translations[lang][key]) {
      el.placeholder = translations[lang][key];
    }
  });
  
  const label = document.getElementById('langLabel');
  if (label) label.textContent = lang === 'en' ? 'සිංහල' : 'English';
}

// Apply on load
const initLang = localStorage.getItem('clk_lang') || 'en';
applyLanguage(initLang);