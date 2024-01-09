const MAX_ELEMENTS = 90;
const checkboxes = [];
const messages = [];

function addCheckboxToMessage(message) {
  const authorPhoto = message.querySelector("#author-photo");

  if (authorPhoto && !message.hasAttribute("data-checkbox-added")) {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    message.insertBefore(checkbox, message.firstChild);

    checkboxes.push(checkbox);
    messages.push(message);

    checkbox.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    checkbox.addEventListener("change", (event) => {
      event.stopPropagation();
      handleCheckboxChange(checkbox);
    });

    message.setAttribute("data-checkbox-added", "true");

    if (checkboxes.length > MAX_ELEMENTS) {
      removeOldestMessage();
    }
  }
}

function handleCheckboxChange(clickedCheckbox) {
  const clickedIndex = checkboxes.indexOf(clickedCheckbox);

  for (let i = 0; i < checkboxes.length; i++) {
    checkboxes[i].checked = i <= clickedIndex;
    grayOutChatMessage(messages[i], i > clickedIndex);
  }
}

function removeOldestMessage() {
  const oldestCheckbox = checkboxes.shift();
  const oldestMessage = messages.shift();

  if (oldestCheckbox && oldestMessage) {
    oldestCheckbox.remove();
    oldestMessage.remove();
  }
}

function grayOutChatMessage(message, gray) {
  const chatTextElement = message.querySelector("#message");

  if (chatTextElement) {
    chatTextElement.style.color = gray ? "grey" : "";
    chatTextElement.style.textDecoration = gray ? "line-through" : "";
  }
}

const chatContainer = document.querySelector("#items.style-scope.yt-live-chat-item-list-renderer");

for (const message of chatContainer.children) {
  addCheckboxToMessage(message);
}

const observer = new MutationObserver((mutationsList) => {
  for (const mutation of mutationsList) {
    if (mutation.type === "childList") {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          addCheckboxToMessage(node);
        }
      });

      mutation.removedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const removedIndex = messages.indexOf(node);
          if (removedIndex !== -1) {
            checkboxes.splice(removedIndex, 1);
            messages.splice(removedIndex, 1);
          }
        }
      });
    }
  }
});

observer.observe(chatContainer, { childList: true });
