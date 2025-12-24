import Handlebars from 'handlebars';

Handlebars.registerHelper('firstLetter', (value) => {
  if (!value || typeof value !== 'string') return '';

  return value.trim().charAt(0).toUpperCase();
});

Handlebars.registerHelper('isEqual', (a, b) => a != null && b != null && a === b);
