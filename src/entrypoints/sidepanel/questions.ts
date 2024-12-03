import { storage } from 'wxt/storage';

/**
 * Adds event listeners to the toggle button and question buttons.
 * Watch the questions in local storage and run `onStorageUpdated` when the questions are updated.
 * @param questions The list of questions to be displayed and edited.
 * @param onStorageUpdated A callback function to be called when the questions on local storage are updated.
 */
export function addQuestionEventListeners(questions: string[], onStorageUpdated: (newQuestions: string[] | null) => void) {
  let questionsTemp = [...questions];  // Copy the array to avoid passing by reference

  addEventListenerToToggleButton(questionsTemp);
  addEventListenerToQuestionButtons(questionsTemp);

  storage.watch('local:questions', onStorageUpdated);
}

/**
 * Adds an event listener to the toggle button for showing and hiding the collapsible content.
 */
function addEventListenerToToggleButton(questions: string[]) {

  // "Edit questions" button
  const toggleButton = document.getElementById('toggle-button');
  const collapsibleContent = document.getElementById('collapsible-content');
  if (!toggleButton || !collapsibleContent) {
    console.error('Failed to find the toggle button or collapsible content');
    return;
  }

  toggleButton?.addEventListener('click', () => {
    if (collapsibleContent?.style.display === 'none') {
      collapsibleContent.style.display = 'block';
      toggleButton.textContent = 'Save & Close';

    } else {
      collapsibleContent.style.display = 'none';
      toggleButton.textContent = 'Edit questions';

      // Save the questions to local storage
      storage.setItem('local:questions', questions);
    }
  });
}

/**
 * Adds event listeners to the question buttons for adding, editing, and deleting questions.
 */
function addEventListenerToQuestionButtons(questions: string[]) {
  const questionList = document.getElementById('question-list') as HTMLUListElement;
  const newQuestionInput = document.getElementById('new-question-input') as HTMLInputElement;
  const addQuestionButton = document.getElementById('add-question-button') as HTMLButtonElement;

  renderQuestions();

  addQuestionButton.addEventListener('click', () => {
    const newQuestion = newQuestionInput.value.trim();
    if (newQuestion) {
      questions.push(newQuestion);
      newQuestionInput.value = '';
      renderQuestions();
    }
  });

  function renderQuestions() {
    questionList.innerHTML = '';

    questions.forEach((question, index) => {
      const li = document.createElement('li');

      const input = document.createElement('input')
      input.type = 'text';
      input.value = question;
      input.addEventListener('input', (event) => {
        questions[index] = (event.target as HTMLInputElement).value;
      });

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', () => {
        questions.splice(index, 1);
        renderQuestions();
      });

      li.appendChild(input);
      li.appendChild(deleteButton);
      questionList.appendChild(li);
    });
  }
}
