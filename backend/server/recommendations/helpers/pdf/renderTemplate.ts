import handlebars from 'handlebars';

import fs from 'fs';
import Translate from '../../../../common/locales/Translate';

// Async function to initialize translation
async function getTranslateFunction(language = 'en') {
  const localeInstance = new Translate();
  return await localeInstance.init(language);
}

handlebars.registerHelper('repeat', function (n, block) {
  let accum = '';
  for (let i = 0; i < n; ++i) {
    accum += block.fn(i);
  }
  return accum;
});

handlebars.registerHelper('inc', function (value) {
  return parseInt(value) + 1;
});

handlebars.registerHelper('t', function (key, context) {
  const translate = context.data.root.translate;
  return translate(key);
});

// renders the html template with the given dat and returns the rendered html
async function renderTemplate(data: any, templateName: string) {
  const html = fs.readFileSync(
    `${__dirname}/templates/${templateName}.hbs`,
    'utf8'
  );

  const language = data.language || 'en';
  data.translate = await getTranslateFunction(language); // Attach the translation function to the data

  // creates the Handlebars template object
  const template = handlebars.compile(html);

  // renders the html template with the given data
  const rendered = template(data);
  return rendered;
}

export { renderTemplate };
