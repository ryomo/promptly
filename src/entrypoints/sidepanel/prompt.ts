export class Prompt {
  SYSTEM_PROMPT = 'Please write the answer to the following question as concisely as possible based on the "Article".';

  session: AILanguageModel | null;

  constructor() {
    this.session = null;
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
      systemPrompt: this.SYSTEM_PROMPT,
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
