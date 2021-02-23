import throttle from "./throttle.js"
import simmer from "./simmer.js"

window.simmer = simmer;
window.scipprRegistered = true;

document.addEventListener("keydown", ev => {
  if (ev.isTrusted) {
    if (ev.key === "ArrowRight") {
      console.log("sending right arrow");
      chrome.runtime.sendMessage({ event: "key", data: { key: "ArrowRight", host: window.location.host } });
    }
    if (ev.key === "ArrowLeft") {
      console.log("sending left arrow");
      chrome.runtime.sendMessage({ event: "key", data: { key: "ArrowLeft", host: window.location.host } });
    }
  }
}, true)

const w = window.innerWidth;
const h = window.innerHeight;
const handleMouseMove = throttle(ev => {
  const x = ev.clientX / w;
  const y = ev.clientY / h;
  chrome.runtime.sendMessage({ event: "mouse", data: { x, y } });
}, 50)
window.addEventListener("mousemove", handleMouseMove);

const svg = `
		<svg width="55" height="55" viewBox="0 0 55 55" fill="none" xmlns="http://www.w3.org/2000/svg">
			<circle cx="27.5" cy="27.5" r="27.5" fill="hsl(LULdeg 100% 50%)"/>
			<path d="M30.7253 24.8113H51C51 34.1321 41.6044 41 27.2637 41C12.9231 41 6 33.1509 6 24.8113H30.7253ZM30.7253 24.8113L32.2088 15H14.4066L14.9011 24.3208" stroke="white" stroke-width="2.5" stroke-linejoin="round"/>
			<path d="M37.25 31.4667C37.25 32.7376 38.2285 33.6833 39.3333 33.6833C40.4382 33.6833 41.4167 32.7376 41.4167 31.4667C41.4167 30.1958 40.4382 29.25 39.3333 29.25C38.2285 29.25 37.25 30.1958 37.25 31.4667Z" stroke="white" stroke-width="2.5"/>
			<path d="M26.4167 32.3333C26.4167 33.6042 27.3952 34.55 28.5 34.55C29.6048 34.55 30.5833 33.6042 30.5833 32.3333C30.5833 31.0624 29.6048 30.1167 28.5 30.1167C27.3952 30.1167 26.4167 31.0624 26.4167 32.3333Z" stroke="white" stroke-width="2.5"/>
			<path d="M15.5833 31.4667C15.5833 32.7376 16.5618 33.6833 17.6667 33.6833C18.7715 33.6833 19.75 32.7376 19.75 31.4667C19.75 30.1958 18.7715 29.25 17.6667 29.25C16.5618 29.25 15.5833 30.1958 15.5833 31.4667Z" stroke="white" stroke-width="2.5"/>
			<path d="M25.1667 25.4V19.3333H19.3333L19.8636 25.4" stroke="white" stroke-width="2.5" stroke-linejoin="round"/>
		</svg>
	`

const cursors = {};
chrome.runtime.onMessage.addListener(({ event: eventType, data, userID }, sender, sendResponse) => {

  switch (eventType) {
    case "key":
      if (data.host === window.location.host) {
        if (data.key === "ArrowRight") {
          document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", keyCode: 39, which: 39 }));
        }

        if (data.key === "ArrowLeft") {
          document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", keyCode: 37, which: 37 }));
        }
      }
      break;
    case "mouse":

      if (!cursors[userID]) {
        const el = document.createElement("div");
        el.innerHTML = svg.replace("LUL", Math.floor(Math.random() * 360));
        el.style.width = "35px";
        el.style.transition = "transform 0.1s"
        el.style.opacity = 0.5;
        el.style.top = "0px";
        el.style.left = "0px";
        el.style.position = "absolute"
        el.style.zIndex = 999999999999;
        el.style.transform = `translate(${data.x * 100}%, ${data.y * 100}%)`
        cursors[userID] = el;
        document.body.append(el);
        el.children[0].style.width = "100%";
      } else {
        cursors[userID].style.transform = `translate(${data.x * w}px, ${data.y * h}px)`
      }

      break;
  }



  return true

})



