// Set extension to only be active on Amazon.com
chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
chrome.declarativeContent.onPageChanged.addRules([{
  conditions: [new chrome.declarativeContent.PageStateMatcher({
    pageUrl: {hostEquals: 'www.amazon.com'},
  })],
  actions: [new chrome.declarativeContent.ShowPageAction()]
}]);
});