// https://docs.google.com/document/d/1Bvd6cU9VIEb7kHTAOCtmmHNAYlIZdeNmV7Oy-2CtimA/edit?tab=t.0#heading=h.wotps13gj8r
const MAX_SUMMARIZE_LENGTH = 4000  // (1024 - 26) * 4

export async function summarizeText(text: string): Promise<string | null> {
  let summarizerSession;

  // Check the length of the article content
  if (text.length > MAX_SUMMARIZE_LENGTH) {
    throw new SummarizeError(`The article is too long to summarize: ${text.length}/ ${MAX_SUMMARIZE_LENGTH}`);
  }

  // Check if the summarizer is available
  const canSummarize = await window.ai.summarizer.capabilities();
  if (!canSummarize || canSummarize.available === 'no') {
    throw new SummarizeError('The summarizer is not available');
  }

  // Initialize the summarizer
  summarizerSession = await window.ai.summarizer.create();

  // Wait for download
  if (canSummarize.available !== 'readily') {
    console.info('Downloading the summarizer model');
    summarizerSession = await window.ai.summarizer.create();
    summarizerSession.addEventListener('downloadprogress', (event) => {
      const progressEvent = event as ProgressEvent;
      console.log(progressEvent.loaded, progressEvent.total);
    });
    await summarizerSession.ready;
  }

  if (!summarizerSession) {
    throw new SummarizeError('Failed to initialize the summarizer');
  }

  const summary = await summarizerSession.summarize(text);
  summarizerSession.destroy();

  return summary;
}

/**
 * Error class for summarization
 * The message of the error be shown to the user.
 */
export class SummarizeError extends Error {
}
