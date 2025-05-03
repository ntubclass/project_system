document.addEventListener("DOMContentLoaded", function () {
  const chatInputField = document.querySelector(".chat-input-field");
  const chatSendButton = document.querySelector(".chat-send-button");
  const chatGrid = document.querySelector(".chat-grid");
  const chatNotificationBanner = document.querySelector(
    ".chat-notification-banner"
  );
  const chatNotificationText = document.querySelector(
    ".chat-notification-text"
  );

  // WebSocket connection setup
  const urlParts = window.location.pathname.split("/");
  const roomId = urlParts[urlParts.length - 2];
  const chatSocket = new WebSocket(
    "ws://" + window.location.host + "/ws/chat/" + roomId + "/"
  );

  // Enable the Send button when there's text input
  chatInputField.addEventListener("input", function () {
    chatSendButton.disabled = !chatInputField.value.trim();
  });

  // When WebSocket is connected
  chatSocket.onopen = function () {
    console.log("Connected to WebSocket");
  };

  // When WebSocket receives a message
  chatSocket.onmessage = function (event) {
    const data = JSON.parse(event.data);

    // Handle different message types
    if (data.type === "pin_message") {
      // Update the pinned message in notification banner
      updatePinnedMessage(data.message_content, data.message_id);
    } else if (data.type === "unpin_message") {
      // Clear the pinned message when an unpin event is received
      clearPinnedMessage();
    } else {
      // Handle regular chat message
      const message = data.message;
      const userId = data.user_id;

      // Check if message is from current user or someone else
      const isCurrentUser = userId === currentUserId;

      // Create a new chat message element
      const messageElement = document.createElement("div");
      messageElement.classList.add(
        "chat-message",
        isCurrentUser ? "chat-right" : "chat-left"
      );
      messageElement.setAttribute(
        "data-message-id",
        data.message_id || "temp-" + Date.now()
      );
      messageElement.innerHTML = `
            <div class="chat-avatar"></div>
            <div class="chat-message-content">
                <div class="chat-message-header">
                    <span class="chat-name">${
                      isCurrentUser ? "You" : "User " + userId
                    }</span>
                    <span class="chat-timestamp">${new Date().toLocaleTimeString()}</span>
                    <span class="pin-message" title="釘選此訊息"><i class="fas fa-thumbtack"></i></span>
                </div>
                <div class="chat-message-text">${message}</div>
            </div>
        `;
      chatGrid.appendChild(messageElement);

      // Add click event listener to the newly created pin icon
      const pinIcon = messageElement.querySelector(".pin-message");
      addPinMessageListener(pinIcon);

      // Scroll to the bottom of the chat
      chatGrid.scrollTop = chatGrid.scrollHeight;
    }
  };

  // When WebSocket is closed
  chatSocket.onclose = function (event) {
    console.log("WebSocket connection closed", event);
  };

  // When an error occurs in WebSocket
  chatSocket.onerror = function (error) {
    console.error("WebSocket Error:", error);
  };

  // Handle Send button click
  chatSendButton.addEventListener("click", function () {
    const message = chatInputField.value.trim();
    if (message) {
      // Send message via WebSocket
      if (chatSocket.readyState === WebSocket.OPEN) {
        chatSocket.send(
          JSON.stringify({
            type: "chat_message",
            message: message,
          })
        );
      } else {
        console.error("WebSocket is not open. Message not sent.");
      }
      chatInputField.value = ""; // Clear the input field
      chatSendButton.disabled = true; // Disable the send button until there's new input
      chatGrid.scrollTop = chatGrid.scrollHeight;
    }
  });

  // Handle Enter key press in the input field
  chatInputField.addEventListener("keypress", function (event) {
    if (event.key === "Enter" && chatInputField.value.trim()) {
      chatSendButton.click(); // Trigger the Send button click
      event.preventDefault(); // Prevent default form submission behavior
    }
  });

  // Function to add click event listener to pin message icons
  function addPinMessageListener(pinElement) {
    pinElement.addEventListener("click", function () {
      const messageElement = this.closest(".chat-message");
      const messageId = messageElement.dataset.messageId;
      const messageContent =
        messageElement.querySelector(".chat-message-text").textContent;

      // Check if this message is already pinned
      const isCurrentlyPinned = this.classList.contains("active");

      // If already pinned, send unpin message
      if (isCurrentlyPinned) {
        if (chatSocket.readyState === WebSocket.OPEN) {
          chatSocket.send(
            JSON.stringify({
              type: "unpin_message",
              message_id: messageId,
            })
          );
        } else {
          console.error("WebSocket is not open. Cannot unpin message.");
        }
      }
      // If not pinned, send pin message
      else {
        if (chatSocket.readyState === WebSocket.OPEN) {
          chatSocket.send(
            JSON.stringify({
              type: "pin_message",
              message_id: messageId,
              message_content: messageContent,
            })
          );
        } else {
          console.error("WebSocket is not open. Cannot pin message.");
        }
      }
    });
  }

  // Function to clear the pinned message banner
  function clearPinnedMessage() {
    // Hide the banner
    chatNotificationBanner.style.display = "none";
    chatNotificationBanner.classList.remove("active");

    // Clear the stored message ID
    delete chatNotificationBanner.dataset.pinnedMessageId;

    // Remove pinned class from all messages
    document.querySelectorAll(".chat-message.pinned").forEach((msg) => {
      msg.classList.remove("pinned");
    });

    // Remove active class from all pin icons
    document.querySelectorAll(".pin-message.active").forEach((pin) => {
      pin.classList.remove("active");
    });
  }

  // Function to update the pinned message banner
  function updatePinnedMessage(content, messageId) {
    chatNotificationText.textContent = content;
    chatNotificationBanner.dataset.pinnedMessageId = messageId;

    // Make the banner visible
    chatNotificationBanner.style.display = "flex";

    // Add active class to show it properly
    chatNotificationBanner.classList.add("active");

    // Remove pinned class from all messages
    document.querySelectorAll(".chat-message.pinned").forEach((msg) => {
      msg.classList.remove("pinned");
    });

    // Remove active class from all pin icons
    document.querySelectorAll(".pin-message.active").forEach((pin) => {
      pin.classList.remove("active");
    });

    // Add pinned class to the currently pinned message
    const pinnedMessage = document.querySelector(
      `.chat-message[data-message-id="${messageId}"]`
    );
    if (pinnedMessage) {
      pinnedMessage.classList.add("pinned");
      pinnedMessage.classList.add("pin-highlight");

      // Mark the pin icon as active
      const pinIcon = pinnedMessage.querySelector(".pin-message");
      if (pinIcon) {
        pinIcon.classList.add("active");
      }

      // Remove animation class after animation completes
      setTimeout(() => {
        pinnedMessage.classList.remove("pin-highlight");
      }, 2000);

      // Scroll to the message if it's not visible
      if (!isElementInViewport(pinnedMessage)) {
        pinnedMessage.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }

  // Helper function to check if element is in viewport
  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  // Add pin message functionality to existing pin icons
  document.querySelectorAll(".pin-message").forEach((pin) => {
    addPinMessageListener(pin);
  });

  // Initial scroll to bottom when loading page with existing messages
  chatGrid.scrollTop = chatGrid.scrollHeight;
});
