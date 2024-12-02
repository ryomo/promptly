export default defineBackground(() => {
  // Open the side panel by clicking on the toolbar button.
  browser.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));
});
