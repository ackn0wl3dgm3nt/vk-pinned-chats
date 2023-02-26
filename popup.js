document.querySelector(".clear-pinned-dialogs").addEventListener("click", clearPinnedDialogs)

function clearPinnedDialogs() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {"clear": true})
    })
}
