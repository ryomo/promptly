export class TaskQueue {
  private taskQueue: Promise<void> = Promise.resolve();

  /**
   * Add a task to the queue
   * @param task - The task to be added to the end of the queue
   */
  public addTask(task: () => Promise<void>): void {
    this.taskQueue = this.taskQueue
      .then(() => task());
  }
}
