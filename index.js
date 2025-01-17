const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const BASE_URL = "https://barry-32257.chipp.ai";

const headers = {
  "Content-Type": "application/json",
};

async function fetchFeatureFlags() {
  const response = await axios.get(`${BASE_URL}/api/featureFlags`, { headers });
  return response.data;
}

async function checkAuthSession() {
  const response = await axios.get(`${BASE_URL}/api/auth/session`, { headers });
  return response.data;
}

async function getChatSession() {
  const params = {
    page: 1,
    pageSize: 5,
    appNameId: "Barry-32257",
  };
  const response = await axios.get(
    `${BASE_URL}/w/chat/api/chat-history/chat-sessions-for-user`,
    { headers, params }
  );
  return response.data.chatSessions[0]; // Return the latest chat session
}

async function sendMessage(chatSessionId, userMessage) {
  const payload = {
    chatSessionId,
    messages: [
      { content: userMessage, role: "user" },
    ],
  };

  const response = await axios.post(`${BASE_URL}/api/chat`, payload, { headers });
  return response.data; // Return the AI's response
}

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    // Step 1: Fetch Feature Flags
    const featureFlags = await fetchFeatureFlags();
    if (!featureFlags.find(flag => flag.key === "chat_tools" && flag.value)) {
      return res.status(400).json({ error: "Chat tools feature is disabled." });
    }

    // Step 2: Check Authentication Session
    await checkAuthSession();

    // Step 3: Retrieve or Create Chat Session
    const chatSession = await getChatSession();
    const chatSessionId = chatSession ? chatSession.id : null;

    if (!chatSessionId) {
      return res.status(400).json({ error: "No active chat session found." });
    }

    // Step 4: Send User Message
    const aiResponse = await sendMessage(chatSessionId, message);

    // Step 5: Return the AI Response
    res.json({ aiResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while processing the chat." });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
