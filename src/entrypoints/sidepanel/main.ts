import { browser } from 'wxt/browser';
import { getTabId, isHttpPage, readArticleFromContent, clearAiResponses, addAiResponse, showErrorMessage, hideErrorMessage } from './utils';
import { summarizeText, SummarizeError } from './summarize';


const tabId = await getTabId();

main();


async function main() {
  // When this sidepanel is opened
  console.log('Sidepanel opened');
  if (tabId) {
    console.log('tabId:', tabId);
    process(tabId);
  }

  // When the active tab changes
  browser.tabs.onActivated.addListener((tabActiveInfo) => {
    const tabId = tabActiveInfo.tabId
    console.log('tabs.onActivated:', tabId);
    process(tabId);
  });

  // When the tab is reloaded
  browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status !== 'complete') {
      return;
    }
    console.log('tabs.onUpdated:', tabId);
    process(tabId);
  });
}


async function process(tabId: number) {
  initialize();

  if (!(await isHttpPage(tabId))) {
    console.log('Not an HTTP page');
    showErrorMessage('Not an HTTP page');
    return;
  }

  // Read the article content
  const article = await readArticleFromContent(tabId);
  if (!article) {
    console.log('Failed to read the article content');
    showErrorMessage('Failed to extract the article content');
    return;
  }

  clearAiResponses();

  // Summarize API
  await summarizeApi(article);
}


function initialize() {
  hideErrorMessage();
  clearAiResponses();
}


async function summarizeApi(article: string) {
  console.log('Summarizing the article content...');
  addAiResponse('Summary', 'Summarizing the article content...');
  let summary;
  try {
    summary = await summarizeText(article);
  } catch (error) {
    if (error instanceof SummarizeError) {
      console.warn(error.message);
      showErrorMessage(error.message);
      return;
    }
    console.error(error);
    showErrorMessage('Failed to summarize the article content');
    return
  }

  if (summary) {
    clearAiResponses();
    console.log('Summarized the article content');
    addAiResponse('Summary', summary);
  }
}
