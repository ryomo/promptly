import DOMPurify from 'dompurify';
import { marked } from 'marked';


export async function getTabId(): Promise<number | null> {
  const tabId = await browser.tabs.query({ active: true, currentWindow: true })
    .then((tabs) => {
      if (!tabs?.length || !tabs[0]?.id) {
        return null;
      }
      return tabs[0].id;
    })
    .catch((error) => {
      console.error(error);
      return null;
    });

  return tabId;
}

export async function isHttpPage(tabId: number): Promise<boolean> {
  const tab = await browser.tabs.get(tabId);
  if (!tab.url?.startsWith('http')) {
    return false;
  }
  return true;
}

export async function readArticleFromContent(tabId: number): Promise<string | null> {
  // Inject the script to read the article content
  const article = await browser.scripting
    .executeScript({
      target: { tabId },
      files: ['readArticle.js'],
    }).then((results) => {
      // TODO: To support iframes, need to set target `allFrames: true` and handle multiple results
      console.log('readArticle.js results:', results);
      return results[0].result as string | null;
    })
    .catch((error) => {
      console.error(error);
      return null;
    });

  return article;
}

const DIV_ERROR_SECTION = 'error-section';
const DIV_ERROR_MESSAGE = 'error-message';

export function showErrorMessage(message: string) {
  const divErrorSection = document.getElementById(DIV_ERROR_SECTION);
  const divErrorMessage = document.getElementById(DIV_ERROR_MESSAGE);
  if (!divErrorSection || !divErrorMessage) {
    return;
  }

  divErrorMessage.textContent = message;
  divErrorSection.style.display = 'block';
}

export function hideErrorMessage() {
  const divErrorSection = document.getElementById(DIV_ERROR_SECTION);
  const divErrorMessage = document.getElementById(DIV_ERROR_MESSAGE);
  if (!divErrorSection || !divErrorMessage) {
    return;
  }

  divErrorMessage.textContent = '';
  divErrorSection.style.display = 'none';
}

const DIV_AI_PARENT_ID = 'ai-section';
const DIV_AI_CHILD_CLASS = 'ai-response-container';

export function clearAiResponses() {
  const divParent = document.getElementById(DIV_AI_PARENT_ID);
  if (!divParent) {
    return;
  }
  while (divParent.firstChild) {
    divParent.removeChild(divParent.firstChild);
  }
}

export async function addAiResponse(title: string, markdown: string) {
  const divParent = document.getElementById(DIV_AI_PARENT_ID);
  if (!divParent) {
    return;
  }

  /**
   * <div class="ai-response-container">
   *   <h2>Question</h2>
   *   <div>The AI's response will appear here.</div>
   * </div>
   */
  const divChild = document.createElement('div');
  divChild.classList.add(DIV_AI_CHILD_CLASS);
  divChild.appendChild(document.createElement('h2')).textContent = title;
  divChild.appendChild(document.createElement('div')).innerHTML = await markdownToDiv(markdown);

  divParent.appendChild(divChild);
}

export async function addAiResponseStream(question: string, markdownStream: ReadableStream<string>) {
  const divParent = document.getElementById(DIV_AI_PARENT_ID);
  if (!divParent) {
    return;
  }

  /**
   * <div class="ai-response-container">
   *   <h2>Question</h2>
   *   <div>The AI's response will appear here.</div>
   * </div>
   */
  const divChild = document.createElement('div');
  divChild.classList.add(DIV_AI_CHILD_CLASS);
  divChild.appendChild(document.createElement('h2')).textContent = question;

  const divAiResponse = document.createElement('div');
  divChild.appendChild(divAiResponse);
  divParent.appendChild(divChild);

  for await (const markdown of markdownStream) {
    divAiResponse.innerHTML = await markdownToDiv(markdown);
  }
}

async function markdownToDiv(markdown: string) {
  const html = await marked(markdown);
  const sanitizedHtml = DOMPurify.sanitize(html);
  return sanitizedHtml;
}
