import { browser } from 'wxt/browser';
import { Prompt } from './prompt';
import { SummarizeError, summarizeText } from './summarize';
import { addAiResponse, addAiResponseStream, clearAiResponses, getTabId, hideErrorMessage, isHttpPage, readArticleFromContent, showErrorMessage } from './utils';


const tabId = await getTabId();

let promptSession: Prompt;


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
  // NOTE: Disabled for now, because the context window is limited to 1024 tokens.
  // await summarizeApi(article);

  // Prompt API
  await promptApi(article);
}


function initialize() {
  hideErrorMessage();
  clearAiResponses();

  if (promptSession) {
    promptSession.destroy();
  }
}


async function promptApi(article: string) {
  promptSession = new Prompt();
  await promptSession.init();

  const questions = [
    "Summarize this article. (~1000 characters)",
    "What are the key points of the article? (~2000 characters)",
    "I'm a programmer. Please explain the parts of this article that are relevant to me. (~1000 characters)",
  ]

  console.groupCollapsed('Prompt API');

  for (let i=0; i<questions.length; i++) {
    const question = questions[i];
    let prompt = '';
    if (i === 0) {
      prompt = `Article: "${article}"\n\n`;
    }
    prompt += `Q:${question}\nA:`;
    console.log(prompt);
    const stream = promptSession.promptStreaming(prompt);
    await addAiResponseStream(question, stream);
    console.log(promptSession.info());
  }

  console.groupEnd();

  promptSession.destroy();
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
