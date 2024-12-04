export class Prompt {
  DEFAULT_SYSTEM_PROMPT = 'Please write the answer in English to the following question concisely based on the "Article".'
    + 'If the length of the answer is not specified in the each question, keep the answer within 100 words.';

  session?: AILanguageModel;
  systemPrompt?: string;

  constructor(systemPrompt?: string) {
    this.session = undefined;
    this.systemPrompt = systemPrompt;
    if (!this.systemPrompt) {
      this.systemPrompt = this.DEFAULT_SYSTEM_PROMPT;
    }
  }

  async init() {
    // Check if the prompt model is available
    const capabilities = await window.ai.languageModel.capabilities();
    if (capabilities.available === 'no') {
      throw new PromptError('The prompt model is not available');
    }

    // Initialize the prompt model
    this.session = await window.ai.languageModel.create({
      // Track download progress
      monitor(_monitor) {
        _monitor.addEventListener('downloadprogress', (event) => {
          console.log(`Downloaded ${event.loaded} of ${event.total} bytes.`);
        });
      },
      // Set the system prompt
      systemPrompt: this.systemPrompt,
    });
  }

  promptStreaming(inputText: string): ReadableStream {
    if (!this.session) {
      throw new PromptError('The prompt model is not available');
    }

    const stream: ReadableStream = this.session.promptStreaming(inputText);
    return stream;
  }

  info(): string {
    if (!this.session) {
      throw new PromptError('The prompt model is not available');
    }
    return `Tokens: ${this.session.tokensSoFar}/${this.session.maxTokens} (${this.session.tokensLeft} left)`;
  }

  destroy() {
    if (!this.session) {
      console.log('No prompt session to destroy');
      return;
    }
    this.session.destroy();
    console.log('Prompt session destroyed');
  }
}

/**
 * Error class for summarization
 * The message of the error be shown to the user.
 */
export class PromptError extends Error {
}
