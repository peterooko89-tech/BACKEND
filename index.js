import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());

const APP_ID = "76613";
const PORT = process.env.PORT || 3000;

const REDIRECT_URI = "https://www.x-dbtraders.site/oauth_callback";

const AUTH_URL = `https://oauth.deriv.com/oauth2/authorize?app_id=${APP_ID}&redirect_uri=${encodeURIComponent(
  REDIRECT_URI
)}&response_type=code&scope=read`;

const TOKEN_URL = "https://api.deriv.com/oauth2/token";

let tokens = {};

app.get("/", (req, res) => {
  res.send("Deriv OAuth backend is running");
});

app.get("/login", (req, res) => {
  res.redirect(AUTH_URL);
});

app.get("/oauth_callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("Error: No code received");
  }

  try {
    const response = await axios.post(
      TOKEN_URL,
      new URLSearchParams({
        app_id: APP_ID,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      })
    );

    tokens = {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
    };

    res.json(tokens);
  } catch (error) {
    res.status(400).send(
      `Error getting token: ${error.response?.data || error.message}`
    );
  }
});

app.get("/status", (req, res) => {
  if (tokens.access_token) {
    res.json(tokens);
  } else {
    res.status(400).send("No tokens saved. Login at /login");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
