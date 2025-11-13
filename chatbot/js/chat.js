import * as styles from "../style/chat.css";

function querySelector(className, element) {
  return (element ? element : document).querySelector(`.${className}`);
}

function validate_color(c) {
  var litmus = "red";
  var d = document.createElement("div");
  d.style.color = litmus;
  d.style.color = c;
  //Element's style.color will be reverted to litmus or set to '' if an invalid color is given
  if (c !== litmus && (d.style.color === litmus || d.style.color === "")) {
    return "#438a56";
  }
  return c;
}

function pushItems(key, value) {
  const storedItems = JSON.parse(localStorage.getItem(key)) ?? [];
  storedItems.push(value);
  localStorage.setItem(key, JSON.stringify(storedItems));
}

function setItem(key, value, location = "local") {
  if (location === "session") {
    sessionStorage.setItem(key, JSON.stringify(value));
    return;
  }
  localStorage.setItem(key, JSON.stringify(value));
}

function removeItem(key) {
  localStorage.removeItem(key);
}

function getItems(key, location = "local") {
  if (location === "session") {
    return JSON.parse(sessionStorage.getItem(key));
  }
  const storedItems = JSON.parse(localStorage.getItem(key));
  return storedItems;
}

const patchMessageFeedback = (id, feedback) => {
  const messageItems = getItems("messages");
  const index = messageItems?.findIndex((message) => message?.id === id);
  const f = feedback === "liked" ? 1 : feedback === "disliked" ? 2 : 0; // 1 - liked, 2- disliked, 0 - none
  if (index !== -1) {
    messageItems[index] = {
      ...messageItems[index],
      f,
    };
    setItem("messages", messageItems);
  }
};

function isEmpty(value) {
  return !value || value === "";
}

////////////////////////////////////////////////////////////////////////
// Convert base64 (ASCII) -> UTF-8 string in browser reliably
function base64ToUtf8(b64 = "") {
  // atob -> binary string (each char code 0..255)
  const binary = typeof window !== "undefined" ? window.atob(b64) : Buffer.from(b64, 'base64').toString('binary');
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder("utf-8").decode(bytes);
}
//////////////////////////////////////////////////////////////////////////////////

function validateForm() {
  const validateFields = ["email", "phone", "name"];
  let isValid = true;
  validateFields.forEach((field) => {
    const element = document.getElementById(field);
    if (isEmpty(element.value)) {
      isValid = false;
      element.style.borderColor = "red";
      return;
    }
    element.style.borderColor = "gray";
  });
  return isValid;
}

async function feedbackSubmit(payload) {
  const API_URL = `${process.env.NEXT_PUBLIC_API}/api/widgets/feedback`;
  // Define the properties and message for the API request
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  };
  // Send POST request to API, get response and set the reponse as paragraph text
  const data = await fetch(API_URL, requestOptions);
  return data;
}

const attachFeedbackButton = (chatDiv, id, selectedFeedback) => {
  const thumbsDown = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#666666"><path d="M240-840h400v520L360-40l-50-50q-7-7-11.5-19t-4.5-23v-14l44-174H120q-32 0-56-24t-24-56v-80q0-7 1.5-15t4.5-15l120-282q9-20 30-34t44-14Zm480 520v-520h160v520H720Z"/></svg>`;
  const thumbsUp = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#EA3323"><path d="M720-120H320v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h218q32 0 56 24t24 56v80q0 7-1.5 15t-4.5 15L794-168q-9 20-30 34t-44 14ZM240-640v520H80v-520h160Z"/></svg>`;
  const feedbackDiv = document.createElement("div");
  feedbackDiv.className = styles["feedback-container"];

  const thumbsUpWrapper = document.createElement("div");
  thumbsUpWrapper.innerHTML = thumbsUp;
  thumbsUpWrapper.className = styles["feedback-icon-wrapper"];

  const thumbsDownWrapper = document.createElement("div");
  thumbsDownWrapper.innerHTML = thumbsDown;
  thumbsDownWrapper.className = styles["feedback-icon-wrapper"];

  if (selectedFeedback == 1) {
    thumbsUpWrapper.classList.add(styles["filled"]);
  } else if (selectedFeedback == 2) {
    thumbsDownWrapper.classList.add(styles["filled"]);
  }

  thumbsUpWrapper.addEventListener("click", async () => {
    if (thumbsDownWrapper.classList.contains(styles["filled"])) {
      thumbsDownWrapper.classList.remove(styles["filled"]);
    }
    thumbsUpWrapper.classList.toggle(styles["filled"]);
    const { BotID } = getItems("message-thread");
    const payload = {
      bot_id: BotID,
      message_id: id,
      feedback: thumbsUpWrapper.classList.contains(styles["filled"])
        ? "liked"
        : null,
    };
    const res = await feedbackSubmit(payload);
    const resData = await res.json();
    if (resData.data) {
      const { message_id, feedback } = resData.data;
      patchMessageFeedback(message_id, feedback);
    }
  });

  thumbsDownWrapper.addEventListener("click", async () => {
    if (thumbsUpWrapper.classList.contains(styles["filled"])) {
      thumbsUpWrapper.classList.remove(styles["filled"]);
    }
    thumbsDownWrapper.classList.toggle(styles["filled"]);
    const { BotID } = getItems("message-thread");
    const payload = {
      bot_id: BotID,
      message_id: id,
      feedback: thumbsDownWrapper.classList.contains(styles["filled"])
        ? "disliked"
        : null,
    };
    const res = await feedbackSubmit(payload);
    const resData = await res.json();
    if (resData.data) {
      const { message_id, feedback } = resData.data;
      patchMessageFeedback(message_id, feedback);
    }
  });

  feedbackDiv.appendChild(thumbsUpWrapper);
  feedbackDiv.appendChild(thumbsDownWrapper);
  chatDiv.appendChild(feedbackDiv);
};

const createChatLi = ({
  message,
  className,
  name,
  timestamp,
  loading,
  messageId,
  selectedFeedback,
}) => {
  // Create a chat <li> element with passed message and className
  const chatLi = document.createElement("li");
  chatLi.classList.add(styles["chat"], styles[`${className}`]);
  const svg = `<span class=${styles["chatbot-icons"]}><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3m-2 10H6V7h12zm-9-6c-.83 0-1.5-.67-1.5-1.5S8.17 10 9 10s1.5.67 1.5 1.5S9.83 13 9 13m7.5-1.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5s1.5.67 1.5 1.5M8 15h8v2H8z"/></svg></span>`;
  if (className === "incoming") {
    chatLi.innerHTML = svg;
  }

  const chatLiContainer = document.createElement("div");
  chatLiContainer.className = styles.container;
  const chatLiDiv = document.createElement("div");
  chatLiDiv.className = styles.wrapper;

  if (!loading) {
    const pElement = document.createElement("p");
    const userNameEle = document.createElement("span");
    userNameEle.className = styles.name;
    userNameEle.innerHTML = name;
    pElement.innerHTML = message;
    chatLiDiv.appendChild(pElement);
    chatLiContainer.appendChild(userNameEle);
  } else {
    chatLiDiv.innerHTML = `<div class=${styles["dot-flashing-wrapper"]}><div class=${styles["dot-flashing"]}></div></div>`;
  }
  if (!isEmpty(timestamp)) {
    const dateOption = {
      day: "2-digit",
      month: "2-digit",
      month: "short",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    const time = new Date(timestamp).toLocaleString("en-US", dateOption);
    const pTime = document.createElement("span");
    pTime.className = styles.time;
    pTime.innerHTML = time;
    chatLiDiv.appendChild(pTime);
  }

  if (className === "incoming" && messageId) {
    attachFeedbackButton(chatLiDiv, messageId, selectedFeedback);
  }

  chatLiContainer.appendChild(chatLiDiv);
  chatLi.appendChild(chatLiContainer);
  const aTags = chatLi.querySelectorAll("a");
  aTags?.forEach((a) => a.setAttribute("target", "_blank"));
  return chatLi; // return chat <li> element
};

function createWidget(document, config, botData) {
  // Create button element
  const button = document.createElement("button");
  button.className = styles["chatbot-toggler"];
  // Create span elements for button
  const span1 = document.createElement("span");
  span1.className = styles["chatbot-icons"];
  span1.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/></svg>`;

  const span2 = document.createElement("span");
  span2.className = styles["chatbot-icons"];
  span2.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;

  button.appendChild(span1);
  button.appendChild(span2);

  const chatbotOverlay = document.createElement("div");
  chatbotOverlay.id = "chatbot-overlay";
  chatbotOverlay.className = "";

  chatbotOverlay.addEventListener("click", () => {
    const cc = querySelector(styles["chatbot"]);
    cc.classList.toggle(styles["expand"]);
    chatbotOverlay.classList.toggle(styles["chatbot-overlay"]);
    document.body.classList.toggle(styles["disable-scroll"]);
  });

  // Create chatbot div
  const chatbotDiv = document.createElement("div");
  chatbotDiv.className = styles["chatbot"];
  const expandSvg = `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 21L21 3M3 21H9M3 21L3 15M21 3H15M21 3V9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

  // Create header
  const header = document.createElement("header");
  const h2 = document.createElement("h2");
  h2.textContent = botData.bot_name;
  const closeBtn = document.createElement("span");
  closeBtn.className = "close-btn material-symbols-outlined";
  closeBtn.textContent = "close";

  const root = document.documentElement;
  const themeColor = validate_color(botData.theme_color);
  root.style.setProperty("--chatbot-background", themeColor);
  header.appendChild(h2);
  const expandIcon = document.createElement("button");
  expandIcon.className = styles["expand-icon"];
  expandIcon.innerHTML = expandSvg;
  header.appendChild(expandIcon);
  header.appendChild(closeBtn);

  expandIcon.addEventListener("click", () => {
    const cc = querySelector(styles["chatbot"]);
    cc.classList.toggle(styles["expand"]);
    chatbotOverlay.classList.toggle(styles["chatbot-overlay"]);
    document.body.classList.toggle(styles["disable-scroll"]);
  });

  //Create chatbox
  const chatbox = document.createElement("div");
  chatbox.className = styles["chatbox"];

  // Create chatbox ul
  const chatboxUl = document.createElement("ul");
  chatboxUl.className = styles["chatbox-ul"];

  chatbox.appendChild(chatboxUl);

  chatbotDiv.appendChild(header);

  const messageThreadData = getItems("message-thread");

  if (!messageThreadData || messageThreadData?.BotID != config.API_KEY) {
    console.log("Message thread id does not match/ not found");
    removeItem("messages");
    const form = handleForm(botData);
    chatbotDiv.appendChild(form);
    form.addEventListener("submit", async function (event) {
      event.preventDefault(); // Prevent default form submission
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const phone = document.getElementById("phone").value;
      const splittedName = name.split(" ");
      const first_name = splittedName[0];
      const last_name = splittedName.slice(1, splittedName.length).join(" ");
      const payload = {
        bot_id: config.API_KEY,
        first_name,
        last_name,
        email,
        phone,
      };

      const isValid = validateForm();
      if (!isValid) {
        alert("Please fill all the required fields");
        return;
      }

      try {
        const submitButton = form.querySelector(".chatbot-form-submit");
        submitButton.classList.toggle(styles["button--loading"]);
        submitButton.disabled = true;
        const response = await handleFormSubmit(payload);
        const { data } = await response.json();
        if (!data) {
          submitButton.classList.remove(styles["button--loading"]);
          submitButton.disabled = false;
          return;
        }
        setItem("message-thread", data.messageThread);
        if (data.initialMessage) {
          pushItems("messages", {
            m: data.initialMessage.Message,
            s: false,
            d: data.initialMessage.SentDateTime,
          });
        }
        form.remove();
        chatbotDiv.appendChild(chatbox);
        populateChatUl(chatbox);
        handleChatInput(chatbox, config);
      } catch (err) {
        console.log(err);
      }
    });
  } else {
    chatbotDiv.appendChild(chatbox);
    populateChatUl(chatbox);
    handleChatInput(chatbox, config);
  }

  // Append button and chatbot div to body
  document.body.appendChild(button);
  document.body.appendChild(chatbotDiv);
  document.body.appendChild(chatbotOverlay);
}

async function handleFormSubmit(payload) {
  const API_URL = `${process.env.NEXT_PUBLIC_API}/api/widgets/message-thread`;
  // Define the properties and message for the API request
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  };
  // Send POST request to API, get response and set the reponse as paragraph text
  const data = await fetch(API_URL, requestOptions);
  return data;
}

function changeFormInputBorderColor(element) {
  element.addEventListener("keyup", (event) => {
    if (isEmpty(event.target.value)) {
      element.style.borderColor = "red";
      return;
    }
    element.style.borderColor = "gray";
  });
}

function handleForm(botData) {
  // Create form element
  const form = document.createElement("form");
  form.setAttribute("id", "myForm");
  form.className = styles["message-form"];

  // Create input for first name

  const nameInput = document.createElement("input");
  nameInput.setAttribute("type", "text");
  nameInput.setAttribute("id", "name");
  nameInput.setAttribute("placeholder", "Name *");

  // Create input for email

  const emailInput = document.createElement("input");
  emailInput.setAttribute("type", "text");
  emailInput.setAttribute("id", "email");
  emailInput.setAttribute("placeholder", "Email *");
  emailInput.setAttribute("pattern", "^[^ ]+@[^ ]+\\.[a-z]{2,6}$");
  emailInput.setAttribute("required", true);

  emailInput.addEventListener("input", function (event) {
    const emailField = event.target;
    if (emailField.validity.patternMismatch) {
      emailField.setCustomValidity("Please enter a valid email address.");
    } else {
      emailField.setCustomValidity("");
    }
  });

  // Create input for phone
  const phoneInput = document.createElement("input");
  phoneInput.setAttribute("type", "text");
  phoneInput.setAttribute("id", "phone");
  phoneInput.setAttribute("placeholder", "Phone *");
  // phoneInput.addEventListener("input", function (event) {
  //   const value = event.target.value;
  //   event.target.value = value.replace(/\D/g, "");
  // });

  // Create submit button
  const submitButtonName = document.createElement("span");
  submitButtonName.className = styles["button__text"];
  const submitButton = document.createElement("button");
  submitButton.className = "chatbot-form-submit";
  submitButton.appendChild(submitButtonName);
  submitButton.setAttribute("type", "submit");
  submitButtonName.textContent = "Submit";

  // Privacy policy
  const privacyPolicy = document.createElement("div");
  privacyPolicy.className = styles["privacy-policy"];
  privacyPolicy.innerHTML = botData?.privacy_policy;

  const inputWrapper = document.createElement("div");
  inputWrapper.className = styles["form-input-wrapper"];
  const bottomWrapper = document.createElement("div");

  // Append inputs and button to form
  inputWrapper.appendChild(nameInput);
  inputWrapper.appendChild(emailInput);
  inputWrapper.appendChild(phoneInput);
  bottomWrapper.appendChild(submitButton);
  bottomWrapper.appendChild(privacyPolicy);

  form.appendChild(inputWrapper);
  form.appendChild(bottomWrapper);

  changeFormInputBorderColor(nameInput);
  changeFormInputBorderColor(emailInput);
  changeFormInputBorderColor(phoneInput);

  return form;
}

function handleChatInput(chatbotDiv, config) {
  // Create chat-input div
  const chatInputDiv = document.createElement("div");
  chatInputDiv.className = styles["chat-input"];
  const textarea = document.createElement("textarea");
  textarea.setAttribute("placeholder", config.CHAT_PLACEHOLDER);
  textarea.setAttribute("spellcheck", "false");
  textarea.setAttribute("required", "");
  textarea.setAttribute("maxlength", 256);
  const sendBtn = document.createElement("span");
  sendBtn.id = "send-btn";
  sendBtn.className = styles["chatbot-icons"];
  sendBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`;

  chatInputDiv.appendChild(textarea);
  chatInputDiv.appendChild(sendBtn);
  chatbotDiv.appendChild(chatInputDiv);
  const inputInitHeight = textarea?.scrollHeight;
  const API_KEY = config.API_KEY;

  textarea.addEventListener("input", () => {
    // Adjust the height of the input textarea based on its content
    textarea.style.height = `${inputInitHeight}px`;
    textarea.style.height = `${textarea.scrollHeight}px`;
  });

  textarea.addEventListener("keydown", (e) => {
    // If Enter key is pressed without Shift key and the window
    // width is greater than 800px, handle the chat
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
      e.preventDefault();
      textarea.style.height = `${inputInitHeight}px`;
      handleChat(textarea, API_KEY);
    }
  });
  sendBtn.addEventListener("click", () => {
    textarea.style.height = `${inputInitHeight}px`;
    handleChat(textarea, API_KEY);
  });
}

const handleChat = (textarea, API_KEY) => {
  const chatbox = querySelector(styles["chatbox-ul"]);
  const userMessage = textarea.value.trim(); // Get user entered message and remove extra whitespace
  if (!userMessage) return;
  const date = new Date().toISOString();
  const userName = getItems("message-thread")?.FirstName;

  // Clear the input textarea and set its height to default
  textarea.value = "";
  textarea.style.height = `${textarea?.scrollHeight}px`;

  // Append the user's message to the chatbox
  chatbox.appendChild(
    createChatLi({
      message: userMessage,
      className: "outgoing",
      name: userName,
      timestamp: date,
    })
  );
  chatbox.scrollTo(0, chatbox.scrollHeight);

  // Display loading message animation while waiting for the response
  generateResponse(userMessage, API_KEY, date);
};

const generateResponse = async (userMessage, API_KEY, date) => {
  const chatbox = querySelector(styles["chatbox"]);
  const chatboxUl = querySelector(styles["chatbox-ul"]);
  const API_URL = `${process.env.NEXT_PUBLIC_API}/api/widgets/message`;
  // Define the properties and message for the API request

  const messageThreadData = getItems("message-thread");
  const botName = getItems("botConfig", "session")?.bot_name;

  pushItems("messages", {
    m: userMessage,
    s: true,
    d: date,
  });

  const payload = {
    message: userMessage,
    bot_id: API_KEY,
    thread_id: messageThreadData.ThreadID,
  };

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  };

  const incomingChatLi = createChatLi({
    message: "",
    className: "incoming",
    name: botName,
    loading: true,
  });
  chatboxUl.appendChild(incomingChatLi);
  chatboxUl.scrollTo(0, chatboxUl.scrollHeight);

  // Send POST request to API, get response and set the reponse as paragraph text
  fetch(API_URL, requestOptions)
    .then(async (res) => {
      let fullText = "";
      if (!res.ok) {
        throw "Failed to fetch response";
      }
      const reader = res.body?.pipeThrough(new TextDecoderStream()).getReader();
      incomingChatLi.remove();
      const incomingChatLi2 = createChatLi({
        message: " ",
        className: "incoming",
        name: botName,
        timestamp: new Date().toISOString(),
      });
      const chatLiP = incomingChatLi2.querySelector("p");
      const chatLiWrapperDiv = incomingChatLi2.querySelector(
        `.${styles["wrapper"]}`
      );
      chatboxUl.appendChild(incomingChatLi2);
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          return;
        }
        if (value) {
          const arr = value.split("␞");
          for (let j = 0; j < arr.length; j++) {
            if (!isEmpty(arr[j])) {
              const chunk = JSON.parse(arr[j]?.trim());
              // if (window.atob(chunk?.Message) !== "undefined") {
              //   fullText += window.atob(chunk?.Message);
              //   chatLiP.innerHTML = fullText;
              // }
              // if (chunk?.done) {
              //   const aTags = chatLiP.querySelectorAll("a");
              //   aTags?.forEach((a) => a.setAttribute("target", "_blank"));
              //   pushItems("messages", {
              //     m: fullText,
              //     s: false,
              //     d: chunk.SentDateTime,
              //     id: chunk.MessageID,
              //   });
              //   attachFeedbackButton(chatLiWrapperDiv, chunk.MessageID);
              // }

              ////////////////////////////////////
              // decode base64 -> utf8
              const decoded = chunk?.Message ? base64ToUtf8(chunk.Message) : "";

              // Append decoded text to fullText and render
              fullText += decoded;
              chatLiP.innerHTML = fullText;

              // If this chunk signals completion, finalize DB/local storage and UI
              if (chunk?.done) {
                const aTags = chatLiP.querySelectorAll("a");
                aTags?.forEach((a) => a.setAttribute("target", "_blank"));

                // use decoded fullText for storage and feedback
                pushItems("messages", {
                  m: fullText,
                  s: false,
                  d: chunk.SentDateTime,
                  id: chunk.MessageID,
                });
                attachFeedbackButton(chatLiWrapperDiv, chunk.MessageID);
              }

              ////////////////////////////////////////

            }
          }
        }
      }
    })
    .catch((err) => {
      console.log(err);
      incomingChatLi.remove();
      const incomingChatLiError = createChatLi({
        message: "Oops! Something went wrong. Please try again.",
        className: "incoming",
        name: botName,
      });
      const messageElement = incomingChatLiError.querySelector(
        `.${styles["wrapper"]}`
      );
      messageElement.classList.add(styles["error"]);
      chatboxUl.appendChild(incomingChatLiError);
    });
  // .finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
};

function loadCSS(document) {
  var stylesheet1 = document.createElement("link");
  stylesheet1.rel = "stylesheet";
  stylesheet1.href =
    "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0";
  document.head.appendChild(stylesheet1);

  var stylesheet2 = document.createElement("link");
  stylesheet2.rel = "stylesheet";
  stylesheet2.href =
    "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@48,400,1,0";
  document.head.appendChild(stylesheet2);
}

function populateChatUl(chatboxDiv) {
  const chatbox = querySelector(styles["chatbox-ul"], chatboxDiv);
  const storedChatItems = getItems("messages");
  const botName = getItems("botConfig", "session")?.bot_name;
  const userName = getItems("message-thread")?.FirstName;

  storedChatItems?.forEach((element) => {
    const type = element.s ? "outgoing" : "incoming";
    const name = element.s ? userName : botName;
    const selectedFeedback = element.f;
    chatbox.appendChild(
      createChatLi({
        message: element.m,
        className: type,
        name,
        timestamp: element.d,
        messageId: element.id,
        selectedFeedback,
      })
    );
  });
  chatbox.scrollTo(0, chatbox.scrollHeight);
}

function handleChatOperations(window, document, config) {
  const chatbotToggler = querySelector(styles["chatbot-toggler"]);
  const chatbotOverlay = document.getElementById("chatbot-overlay");
  const closeBtn = document.querySelector(".close-btn");

  closeBtn.addEventListener("click", () => {
    document.body.classList.remove(styles["show-chatbot"]);
  });
  chatbotToggler.addEventListener("click", () => {
    document.body.classList.toggle(styles["show-chatbot"]);
    const isBotOpen = document.body.classList.contains(styles["show-chatbot"]);
    const isExpanded = document.querySelector(
      `.${styles["chatbot"]}.${styles["expand"]}`
    );
    const chatboxUl = querySelector(styles["chatbox-ul"], document);
    chatboxUl.scrollTo(0, chatboxUl.scrollHeight);

    if (isExpanded) {
      if (isBotOpen) {
        document.body.classList.toggle(styles["disable-scroll"]);
        chatbotOverlay.classList.toggle(styles["chatbot-overlay"]);
      } else {
        document.body.classList.remove(styles["disable-scroll"]);
        chatbotOverlay.classList.remove(styles["chatbot-overlay"]);
      }
    }
  });
}

async function loadChatbot(config) {
  const API_URL = `${process.env.NEXT_PUBLIC_API}/api/widgets/chatbot`;
  // Define the properties and message for the API request
  const payload = {
    botId: config.API_KEY,
  };
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  };
  const respone = await fetch(API_URL, requestOptions);
  const data = await respone.json();
  if (data?.data) {
    setItem("botConfig", data?.data, "session");
  }
  return data?.data;
}

export async function init(window, document, config) {
  console.log("Init bot...", config);
  loadCSS(document);
  const chatbotData = await loadChatbot(config);
  if (!chatbotData) {
    console.warn(
      "Failed to load chatbot. Please verify APIKEY or contact support"
    );
    return;
  }
  createWidget(document, config, chatbotData);
  handleChatOperations(window, document, config);
}
