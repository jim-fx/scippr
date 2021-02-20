const server = "localhost:3000"
const userID = Math.random().toString(36).substr(2, 9);


const ws = (() => {

  /**
   * @type {WebSocket}
   */
  let socket;

  const cbs = {};

  const handleMessage = msgEvent => {
    const msg = JSON.parse(msgEvent.data);
    if (msg.userID === userID) return
    if (msg.event in cbs) {
      cbs[msg.event].forEach(cb => cb(msg.data, msg.userID));
    }
  }

  const handleError = (err) => {
    console.error(err);
  }

  const handleOpen = () => {
    console.log("WebSocket connected")
  }

  /**
   * 
   * @param {WebSocket} s 
   */
  const bindSocketEvents = s => {
    s.addEventListener("open", handleOpen);
    s.addEventListener("error", handleError);
    s.addEventListener("message", handleMessage);

  }

  /**
   * 
   * @param {WebSocket} s 
   */
  const removeSocketEvents = s => {
    s.removeEventListener("open", handleOpen);
    s.removeEventListener("error", handleError);
    s.removeEventListener("message", handleMessage);
  }

  return {
    connect: (url) => {
      if (socket && socket.open) socket.close()
      socket = new WebSocket(url);
      bindSocketEvents(socket);
    },
    disconnect: () => {
      if (socket && socket.open) socket.close()
      removeSocketEvents(socket)
      socket = undefined;
    },
    send: (event, data) => {
      if (socket && socket.OPEN) {
        socket.send(JSON.stringify({ event, data, userID }));
      }
    },
    on: (eventType, callback) => {
      cbs[eventType] = eventType in cbs ? [callback, ...cbs[eventType]] : [callback];
    },
  }

})();

let state = {
  mode: "",
  boatID: ""
};

chrome.runtime.onMessage.addListener(({ event: eventType, data }, sender, sendResponse) => {

  switch (eventType) {
    case "mouse":
      ws.send("mouse", data);
      break
    case "key":
      ws.send("key", data);
      break;
    case "chat":
      ws.send("chat", data);
      break;
    case "init":
      sendResponse(state);
      break
    case "connect-to":
      ws.connect("ws://" + server + "/ws/" + data);
      state.mode = "connected"
      state.boatID = data
      sendResponse(data);
      break
    case "disconnect":
      state.mode = ""
      state.boatID = undefined
      ws.disconnect()
      break
    case "become-scippr":
      fetch("http://" + server + "/boat")
        .then(res => res.text())
        .then(boatID => {
          state.mode = "connected";
          state.boatID = boatID;
          ws.connect("ws://" + server + "/ws/" + boatID);
          sendResponse(boatID)
        })
      break;
  }

  return true

})

ws.on("chat", data => {
  chrome.runtime.sendMessage({ event: "chat", data });
})

ws.on("key", data => {
  chrome.tabs.query({ active: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { event: "key", data });
  });
})

ws.on("mouse", (data, userID) => {
  chrome.tabs.query({ active: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { event: "mouse", data, userID });
  });
})