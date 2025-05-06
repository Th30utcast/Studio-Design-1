function loadTranslations() {
  let lang = localStorage.getItem('language') || navigator.language.split('-')[0];
  if (!translations[lang]) lang = 'en';

  document.querySelectorAll('[data-translate]').forEach(el => {
    const key = el.getAttribute('data-translate');
    const text = translations[lang]?.[key];

    if (text) {
      if (el.tagName === 'INPUT' && el.placeholder) {
        el.placeholder = text;
      } else if (el.tagName === 'OPTION' && el.value) {

      } else {
        el.textContent = text;
      }
    }
  });

  document.documentElement.lang = lang;
}

function changeLanguage(lang) {
  localStorage.setItem('language', lang);
  loadTranslations();
}

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header');
  if (header) {
    const switcher = document.createElement('div');
    switcher.className = 'language-switcher';
    switcher.style.marginLeft = '20px';
    switcher.innerHTML = `
      <select onchange="changeLanguage(this.value)" style="padding: 5px; border-radius: 4px; background: #162c52; color: white; border: 1px solid #3a6ee8;">
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="fr">Français</option>
        <option value="de">Deutsch</option>
      </select>
    `;
    header.appendChild(switcher);

    const lang = localStorage.getItem('language') || navigator.language.split('-')[0] || 'en';
    switcher.querySelector('select').value = translations[lang] ? lang : 'en';
  }

  loadTranslations();
});
