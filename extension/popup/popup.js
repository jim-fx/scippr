const send = (event, data) => new Promise((resolve, reject) => {
  chrome.runtime.sendMessage({ event, data }, response => {
    resolve(response)
  })
})

const stateWrapper = document.getElementById("state-wrapper");
const boatID = document.getElementById("boat-id")
const chatLog = document.getElementById("chat-log")

const state = {
  mode: undefined,
  boatID: undefined,
}
const setMode = s => {

  if (!s) s = "main"

  state.mode = s;
  boatID.innerHTML = state.boatID;


  stateWrapper.className = "state-" + s;
}

window.addEventListener("load", async () => {


  // document.getElementById("chat").addEventListener("keydown", ev => {
  //   if (ev.key === "Enter") {
  //     ev.preventDefault();
  //     const v = ev.target.value;
  //     ev.target.value = ""
  //     chatLog.innerHTML += "<p> " + v + "</p>";
  //     send("chat", v);
  //   }
  // });

  document.getElementById("connect-to").addEventListener("keydown", ev => {
    if (ev.key === "Enter") {
      setMode("loading")
      send("connect-to", ev.target.value).then(boatID => {
        state.boatID = boatID
        setMode("connected");
      })
    }
  });

  document.getElementById("become-scippr").addEventListener("click", () => {

    setMode("loading")

    send("become-scippr").then(boatID => {

      state.boatID = boatID
      setMode("connected");

    })

  });

  [...document.querySelectorAll("button.disconnect")].forEach(el => {
    el.addEventListener("click", async () => {
      send("disconnect", state.boatID)
      state.boatID = undefined;
      setMode("main");
    });
  })


  // Get initial data from background page
  const initState = await send("init")
  if (initState.boatID) state.boatID = initState.boatID
  console.log("GOT INIT STATE", initState)
  setMode(initState.mode)

})

// chrome.runtime.onMessage.addListener(({ event, data }) => {
//   console.log("|" + event + "|" + data + "|");
//   if (event === "chat") {
//     chatLog.innerHTML += "<p> " + data + "</p>";
//   }
// })

chrome.windows.getCurrent(function (win) {
  chrome.tabs.query({
    'windowId': win.id,
    'active': true
  }, function (tabArray) {

    const activeTab = tabArray[0];

    chrome.tabs.executeScript(activeTab.id, { code: "window.scipprRegistered" }, function (result) {
      let e = chrome.runtime.lastError;
      if (e !== undefined) {
        console.log(activeTab.id, _, e);
      }
      if (!result || !result[0]) {
        chrome.tabs.executeScript(activeTab.id, {
          file: "content/inject.js"
        }, _ => {
          let e = chrome.runtime.lastError;
          if (e !== undefined) {
            console.log(activeTab.id, _, e);
          }
        });
      }
    });

  });
});