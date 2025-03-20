chrome.action.onClicked.addListener(async () => {
  try {
    // Query all tabs in the current window.
    const tabs = await chrome.tabs.query({ currentWindow: true });

    // Partition tabs into new tabs and other tabs.
    const newTabs = [];
    const otherTabs = [];

    tabs.forEach(tab => {
      // Check if the tab represents a New Tab page.
      // This assumes new tabs have a URL that starts with "chrome://newtab".
      if (tab.url && tab.url.startsWith("chrome://newtab")) {
        newTabs.push(tab);
      } else {
        otherTabs.push(tab);
      }
    });

    // Sort otherTabs by the domain name of their URL (A -> Z).
    otherTabs.sort((a, b) => {
      try {
        const domainA = new URL(a.url).hostname;
        const domainB = new URL(b.url).hostname;
        return domainA.localeCompare(domainB);
      } catch (e) {
        // Handle cases where URL might be invalid
        // Fall back to using the full URL for comparison
        return (a.url || '').localeCompare(b.url || '');
      }
    });

    // Concatenate newTabs (which come first) and the sorted otherTabs.
    const sortedTabs = [...newTabs, ...otherTabs];

    // Move each tab to its new position.
    for (let i = 0; i < sortedTabs.length; i++) {
      await chrome.tabs.move(sortedTabs[i].id, { index: i });
    }
  } catch (error) {
    console.error('Error sorting tabs:', error);
  }
});
