const dialog = {
	pin: function(dialog) {
        dialog.classList.add("additional_pinned_dialog")
        dialog.children[1].children[0].children[5].style.cssText = `
            background-image: url(data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2216%22%20height%3D%2216%22%20fill%3D%22%23aaa%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M10.23%202.1l3.66%203.67c.23.22.07.63-.26.63h-.52a.9.9%200%2000-.64.26l-1.71%201.72a.9.9%200%2000-.26.63v3c0%20.55-.7.86-1.1.46l-2.3-2.3-3.58%203.57a.9.9%200%2011-1.26-1.27L5.83%208.9%203.54%206.6c-.4-.38-.11-1.1.46-1.1h2.99a.9.9%200%2000.63-.26l1.72-1.71a.9.9%200%2000.26-.63v-.53c0-.32.4-.5.63-.26z%22%2F%3E%3C%2Fsvg%3E)!important;
            width: 16px;
            height: 16px;
            position: absolute;
            right: 14px;
            top: 41px;
        `
        Array.from(document.querySelectorAll(".nim-dialog_pinned")).pop().after(dialog)
    },
	unpin: function(dialog) {
        dialog.classList.remove("additional_pinned_dialog")
        dialog.children[1].children[0].children[5].style.display = "none"
        let all_pinned_dialogs = [...Array.from(document.querySelectorAll(".nim-dialog_pinned")), ...Array.from(document.querySelectorAll(".additional_pinned_dialog"))]
        all_pinned_dialogs.pop().after(dialog)
    },
	checkMainPinning: function(el) {
        return document.querySelector(`a._im_peer_target[href="${el}"]`).parentElement.parentElement.parentElement.parentElement.parentElement.classList.contains("nim-dialog_pinned")
    },
	getUrl: function() {
        if (document.querySelectorAll(".im-mess").length == 0) return ""
        let url = document.querySelector("a._im_page_peer_name").getAttribute("href")
        return url
    },
	setState: function(state, url) {
        let id = null
        people.forEach((item) => {
            if (item[0] == url) id = item[1]
        })

        let pinnedDialogsList = storage.getDialogs()
        let current_dialog = document.querySelector(`.nim-dialog[data-list-id="${id}"]`)
        
        if (state == "pin") {
            this.pin(current_dialog)
            if (pinnedDialogsList.indexOf(url) == -1) {
                pinnedDialogsList.push(url)
            }
            console.log(`setDialogState("pin", "${url}")`)
        } else if (state == "unpin") {
            pinnedDialogsList.splice(pinnedDialogsList.indexOf(url, 1))
            if (getMainPinnedDialogsList().indexOf(url) === -1) {
                this.unpin(current_dialog)
            }
            console.log(`setDialogState("unpin", "${url}")`)
        }
        storage.setDialogs(pinnedDialogsList)
        pinned_dialogs_count = pinnedDialogsList.length
    }
}

const dialogs = {
	getMainList: function() {
        let urls = []
        let chats = document.querySelectorAll(".nim-dialog_pinned")
        chats.forEach((item) => {
            let url = item.children[0].children[0].children[0].children[0].children[0].getAttribute("href")
            urls.push(url)
        })
        return urls
    },
	pinAll: function() {
        let pinnedDialogsList = storage.getDialogs()
            pinnedDialogsList.forEach((item) => {
            dialog.setState("pin", item)
        })
    },
}

const pinning = {
	ready: function() {
        let pinnedDialogsList = storage.getDialogs()
        let target = pinnedDialogsList.indexOf(current_dialog_url) == -1 ? "pin" : "unpin"
        pinning.createButton(target)
    },
	toggleButton: function() {
        let target = document.querySelector(".additional_pinning").getAttribute("data-next-state")
        document.querySelector(".additional_pinning").remove()
        pinning.createButton(target)
    },
	createButton: function(target) {
        target = target == "pin" || target == "unpin" ? target : false
        if (target == false) throw "Error: Wrong target"
        let btn = document.createElement('a')
        btn.classList = `ui_actions_menu_item im-action im-action_${target}_convo additional_pinning`
        btn.onclick = () => dialog.setState(target, current_dialog_url)
        if (target == "pin") {
            btn.innerText = "Закрепить в доп. списке чатов"
            btn.setAttribute("data-next-state", "unpin")
        } else {
            btn.innerText = "Не закреплять в доп. списке чатов"
            btn.setAttribute("data-next-state", "pin")
        }

        document.querySelector(".im-action_pin_convo").after(btn)
        document.querySelector(".additional_pinning").addEventListener("click", pinning.toggleButton)
    },
}

const storage = { // DialogsStorage (storage+peopleList)
	setDialogs: function() {
        localStorage.setItem("pinned_dialogs", JSON.stringify(arr))
    },
	getDialogs: function() {
        let isFirstLaunched = localStorage.getItem("pinned_dialogs") == "" ? true : false
	    return isFirstLaunched == true ? null : JSON.parse(localStorage.getItem("pinned_dialogs"))
    },
	clearDialogs: function() {
        localStorage.setItem("pinned_dialogs", "[]")
	    window.location = "https://vk.com/im"
    },
}

const peopleList = {
	get: function() {
		let people = []
        let chats = document.querySelectorAll(".nim-dialog")
        chats.forEach((item) => {
            let url = item.children[0].children[0].children[0].children[0].children
            url = url.length > 1 ? "s_chat" : url[0].getAttribute("href")
            let id = item.getAttribute("data-list-id")
            people.push([url, id])
        })
        return people
	},
	update: function() {
        people = this.get()
    },
}

const interface_ = {
	getType: function() {
        let type = document.querySelector(".im-page--dialogs").children.length == 2 ? "old" : "new"
        return type
    },
}

let people = peopleList.get()
let interfaceType = interface_.getType()
let current_dialog_url = ""
let pinned_dialogs_count = 0

document.onload = ready()

function ready() {
	if (interfaceType == "new") {
		getPeopleList = function () {}
		getMainPinnedDialogsList = function () {}
		setDialogState = function () {} // ?
	}

	document.addEventListener("scroll", peopleList.update)
	
	if (storage.getDialogs() == null) {
		storage.setDialogs([])
		return
	}

	dialogs.pinAll()
	setInterval(function() {
		let pinnedDialogs = Array.from(document.querySelectorAll(".nim-dialog:not(.nim-dialog_pinned)")).splice(0, pinned_dialogs_count)
		pinnedDialogs.forEach((item) => {
			if (item.classList.contains("additional_pinned_dialog") === false)
			dialogs.pinAll()
		})
	}, 1000)

	setInterval(function() {
		if (current_dialog_url != dialog.getUrl()) {
			current_dialog_url = dialog.getUrl()
			if (dialogs.getMainList().indexOf(current_dialog_url) === -1) {
				// useSpecificChats()
				pinning.ready()
			}
		}
	}, 250)

	setInterval(function() {
		let pinnedDialogsList = storage.getDialogs()
		pinnedDialogsList.forEach((item) => {
			if (dialog.checkMainPinning(item) == true) {
				dialog.setState("unpin", item)
			}
		})
	}, 500)
}

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.clear == true)
			storage.clearDialogs()
	}
)





