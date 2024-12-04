import { browser } from 'wxt/browser';
import { storage } from 'wxt/storage';
import { addQuestionEditingEventListeners, addSingleQuestionEventListener, DEFAULT_QUESTIONS } from './questions';
import { Prompt, PromptError } from './prompt';
import { SummarizeError, summarizeText } from './summarize';
import { addAiResponse, addAiResponseStream, addCloseErrorButtonEventListener, clearAiResponses, getTabId, hideErrorMessage, isHttpPage, readArticleFromContent, showErrorMessage } from './utils';
import { TaskQueue } from './taskQueue';


let promptObj: Prompt;
let questions: string[] = [];
const taskQueue = new TaskQueue();
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

  questions = await storage.getItem('local:questions', { defaultValue: DEFAULT_QUESTIONS }) ?? [];

  addQuestionEditingEventListeners(questions, (newQuestions: string[] | null) => {
    // When the questions are updated
    questions = newQuestions ?? [];
    console.log('questions updated:', questions);
    if (tabId) {
      process(tabId);
    }
  });

  addSingleQuestionEventListener(async (question) => {
    taskQueue.addTask(() => singlePrompt(question));
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
  await promptQuestions(article);
}


function initialize() {
  hideErrorMessage();
  clearAiResponses();
  addCloseErrorButtonEventListener();

  if (promptObj) {
    promptObj.destroy();
  }
}


async function promptQuestions(article: string) {
  promptObj = new Prompt();
  await promptObj.init();

  for (let i=0; i<questions.length; i++) {
    const question = questions[i];
    if (i === 0) {
      // await singlePrompt(question, `Article: "${article}"\n\n`);
      taskQueue.addTask(() => singlePrompt(question, `Article: "${article}"\n\n`));
    } else {
      // await singlePrompt(question);
      taskQueue.addTask(() => singlePrompt(question));
    }
  }
}


async function singlePrompt(question: string, prependText: string | null = null) {
  const inputText = prependText ? prependText + question : question;

  console.groupCollapsed('Prompt');
  console.log(inputText);
  console.groupEnd();

  try {
    const outputStream = promptObj.promptStreaming(inputText);
    if (outputStream) {
      await addAiResponseStream(question, outputStream);
    }

  } catch (error) {
    handlePromptError(error);
  }

  console.log(promptObj.info());
}


function handlePromptError(error: unknown) {
  if (error instanceof DOMException
    && error.name === 'InvalidStateError') {
    console.warn('Expected error:', error);
    return;
  }

  if (error instanceof DOMException
    && error.name === 'NotSupportedError'
    && error.message === 'The model attempted to output text in an untested language, and was prevented from doing so.') {
    console.error(error);
    showErrorMessage('The model attempted to output text in an untested language or encountered a bug. You can try again by reloading the page.');
    return;
  }

  if (error instanceof PromptError) {
    console.error(error.message);
    showErrorMessage(error.message);
    return;
  }

  throw error;
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
