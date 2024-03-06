const MAX_ELEMENTS = 90;
const checkboxes = new Map();
const messages = [];

function addCheckboxToMessage(message) {
  const authorPhoto = message.querySelector("#author-photo");

  // Check if the element is a chat message (modify based on your actual HTML structure)
  const isChatMessage = message.classList.contains("chat-message-class");

  if (authorPhoto && isChatMessage && !message.hasAttribute("data-checkbox-added")) {
    const messageId = message.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    message.insertBefore(checkbox, message.firstChild);

    checkboxes.set(messageId, checkbox);
    messages.push(message);

    checkbox.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    checkbox.addEventListener("change", (event) => {
      event.stopPropagation();
      handleCheckboxChange(checkbox);
    });

    message.setAttribute("data-checkbox-added", "true");

    if (checkboxes.size > MAX_ELEMENTS) {
      removeOldestMessage();
    }

    // Check if the message is a system message (modify based on your actual HTML structure)
    const isSystemMessage = message.classList.contains("system-message-class");

    if (isSystemMessage) {
      handleSystemMessage(message);
    }
  }
}

function handleCheckboxChange(clickedCheckbox) {
  const clickedIndex = messages.findIndex((msg) => msg.id === clickedCheckbox.parentElement.id);

  for (let i = 0; i < messages.length; i++) {
    const messageId = messages[i].id;
    checkboxes.get(messageId).checked = i <= clickedIndex;
    grayOutChatMessage(messages[i], i > clickedIndex);
  }
}

function removeOldestMessage() {
  const oldestMessage = messages.shift();

  if (oldestMessage) {
    const oldestCheckbox = checkboxes.get(oldestMessage.id);
    oldestCheckbox.remove();
    checkboxes.delete(oldestMessage.id);
    oldestMessage.remove();
  }
}

function grayOutChatMessage(message, gray) {
  const chatTextElement = message.querySelector("#message");

  if (chatTextElement) {
    chatTextElement.style.color = gray ? "" : "grey";
    chatTextElement.style.textDecoration = gray ? "" : "line-through";
  }
}

function handleSystemMessage(systemMessage) {
  const systemTextElement = systemMessage.querySelector("#system-message-text");

  if (systemTextElement) {
    const systemText = systemTextElement.textContent.toLowerCase();

    // Check if the system message indicates a timeout
    if (systemText.includes("timeout")) {
      handleTimeoutMessage(systemMessage);
    }
    // You can add more conditions to handle other types of system messages as needed
  }
}

function handleTimeoutMessage(systemMessage) {
  const affectedUserId = extractUserIdFromTimeoutMessage(systemMessage);
  const affectedCheckbox = checkboxes.get(affectedUserId);

  if (affectedCheckbox) {
    // Example: Uncheck the checkbox for the user who received a timeout
    affectedCheckbox.checked = false;
    // Additional actions can be added based on your requirements
  }
}

function extractUserIdFromTimeoutMessage(systemMessage) {
  // Implement logic to extract user ID from the timeout message
  // This depends on the actual structure of your timeout messages
  // Return the user ID or a unique identifier for the affected user
  // For example, you might extract the user ID from a specific attribute in the system message
  const userId = systemMessage.getAttribute("data-user-id");
  return userId || "";
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
          const removedIndex = messages.findIndex((msg) => msg.id === node.id);
          if (removedIndex !== -1) {
            const removedMessage = messages.splice(removedIndex, 1)[0];
            const removedCheckbox = checkboxes.get(removedMessage.id);
            checkboxes.delete(removedMessage.id);
            removedCheckbox.remove();
          }
        }
      });
    } else if (mutation.type === "characterData") {
      const mutatedMessage = mutation.target.parentElement;
      const mutatedCheckbox = checkboxes.get(mutatedMessage.id);
      handleCheckboxChange(mutatedCheckbox);
    }
  }
});

observer.observe(chatContainer, { childList: true, subtr
