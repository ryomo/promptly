import { Readability, isProbablyReaderable } from '@mozilla/readability';

export default defineUnlistedScript((): string|null => {
  if (!isProbablyReaderable(document)) {
    return null;
  }

  // Clone the document to avoid side effects
  const documentClone = document.cloneNode(true) as Document;

  // Extract the article content
  const article = new Readability(documentClone).parse();
  const textContent = article?.textContent;

  if (!textContent) {
    return null;
  }
  return textContent;
});
