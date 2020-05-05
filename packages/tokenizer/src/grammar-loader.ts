import * as Prism from 'prismjs';

const components = require('prismjs/components');
const getLoader = require('prismjs/dependencies');

/**
 * The set of all languages which have been loaded using the below function.
 *
 * @type {Set<string>}
 */
const loadedLanguages = new Set();

/**
 * Loads the given languages and adds them to the current Prism instance.
 *
 * If no languages are provided, __all__ Prism languages will be loaded.
 *
 * @param {string|string[]} [languages]
 * @returns {void}
 */
export const loadLanguages = (languages: string | string[] | undefined = undefined) => {

  if (languages === undefined) {
    languages = Object.keys(components.languages).filter(l => l != 'meta');
  } else if (!Array.isArray(languages)) {
    languages = [languages];
  }

  // the user might have loaded languages via some other way or used `prism.js` which already includes some
  // we don't need to validate the ids because `getLoader` will ignore invalid ones
  const loaded = [
    ...loadedLanguages,
    ...Object.keys(Prism.languages),
  ];

  getLoader(components, languages, loaded).load(lang => {
    if (!(lang in components.languages)) {
      console.warn('Language does not exist: ' + lang);
      return;
    }

    const pathToLanguage = 'prismjs/components/prism-' + lang;

    require(pathToLanguage);

    loadedLanguages.add(lang);
  });
}

