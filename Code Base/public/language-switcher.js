function loadTranslations() {
  let lang = localStorage.getItem('language') || navigator.language.split('-')[0]; // Fixed split('.') to split('-')
  if (!translations[lang]) lang = 'en';

  document.querySelectorAll('[data-translate]').forEach(el => { // Fixed typo e1 to el
      const key = el.getAttribute('data-translate');
      if (translations[lang] && translations[lang][key]) { // Added null check for translations[lang]
          if (el.tagName === 'INPUT' && el.placeholder) {
              el.placeholder = translations[lang][key];
          } else if (el.tagName === 'OPTION' && el.value) {
              // Skip option elements with values
          } else {
              el.textContent = translations[lang][key];
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
  // Add language switcher to header
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
      switcher.querySelector('select').value = translations[lang] ? lang : 'en'; // Fixed null check for translations[lang]
  }
  
  loadTranslations();
});