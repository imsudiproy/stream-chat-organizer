class ChatMessage {
  constructor(checkbox, message) {
    this.checkbox = checkbox;
    this.message = message;
  }
}

const MAX_ELEMENTS = 90;
const chatMessages = new Map();

function addCheckboxToMessage(message) {
  const authorPhoto = message.querySelector("#author-photo");
  const messageId = message.getAttribute("id");

  if (authorPhoto && messageId && !chatMessages.has(messageId)) {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    message.insertBefore(checkbox, message.firstChild);

    const chatMessage = new ChatMessage(checkbox, message);
    chatMessages.set(messageId, chatMessage);

    checkbox.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    checkbox.addEventListener("change", (event) => {
      event.stopPropagation();
      handleCheckboxChange(checkbox);
    });

    if (chatMessages.size > MAX_ELEMENTS) {
      removeOldestMessage();
    }
  }
}

function handleCheckboxChange(clickedCheckbox) {
  const clickedMessage = chatMessages.get(clickedCheckbox.parentNode.getAttribute("id"));

  if (!clickedMessage) {
    return;
  }

  const clickedIndex = Array.from(chatMessages.values()).indexOf(clickedMessage);

  for (const [index, message] of chatMessages.entries()) {
    if (index < clickedIndex) {
      message.checkbox.checked = true;
      grayOutChatMessage(message.message, true);
    } else {
      message.checkbox.checked = false;
      grayOutChatMessage(message.message, false);
    }
  }
}

function removeOldestMessage() {
  const oldestMessageId = chatMessages.keys().next().value;

  if (oldestMessageId) {
    const oldestMessage = chatMessages.get(oldestMessageId);
    oldestMessage.checkbox.remove();
    oldestMessage.message.remove();
    chatMessages.delete(oldestMessageId);
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
          const removedMessageId = node.getAttribute("id");
          if (removedMessageId && chatMessages.has(removedMessageId)) {
            const removedMessage = chatMessages.get(removedMessageId);
            removedMessage.checkbox.remove();
            removedMessage.message.remove();
            chatMessages.delete(removedMessageId);
          }
        }
      });
    }
  }
});

observer.observe(chatContainer, { childList: true, subtree: true });
