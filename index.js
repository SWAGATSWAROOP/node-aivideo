const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());

const setHeaders = (req, _, next) => {
  const apikey = req.headers["apikey"];
  req.headers = {
    Authorization: apikey,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  next();
};

app.use(setHeaders);

// Function to get the status
const getStatus = async (uuid, headers) => {
  try {
    const statusResponse = await axios.get(
      `https://api.aivideoapi.com/status?uuid=${uuid}`,
      { headers }
    );
    return statusResponse.data;
  } catch (error) {
    return null; // Return null on error
  }
};

// Function to poll for status
const pollForStatus = async (uuid, res, headers) => {
  let attempts = 0;
  const interval = setInterval(async () => {
    attempts++;
    const status = await getStatus(uuid, headers);
    console.log(status);

    // Check for valid status
    if (status && status.url) {
      clearInterval(interval);
      res.json({ status });
    } else if (attempts >= 10) {
      clearInterval(interval);
      res
        .status(500)
        .json({ error: "Polling stopped, no valid status received." });
    }
  }, 30000);
};

// Endpoint to trigger the /generate/text POST request
app.post("/generate/text", async (req, res) => {
  try {
    req.body = {
      text_prompt: req.body.text_prompt, // Keep text_prompt dynamic
      model: "gen3",
      width: 1344,
      height: 768,
      motion: 5,
      seed: 0,
      callback_url: "",
      time: 10,
    };

    const textResponse = await axios.post(
      "https://api.aivideoapi.com/runway/generate/text",
      req.body,
      { headers: req.headers }
    );
    const uuid = textResponse.data.uuid;
    console.log("Got uuid ", uuid);

    // Start polling for status
    pollForStatus(uuid, res, req.headers);
  } catch (error) {
    res
      .status(500)
      .json({ error: error.response ? error.response.data : error.message });
  }
});

// Endpoint to trigger the /generate/image POST request
app.post("/generate/image", async (req, res) => {
  try {
    req.body = {
      img_prompt: req.body.img_prompt, // Keep img_prompt dynamic
      model: "gen3",
      image_as_end_frame: false,
      flip: false,
      motion: 5,
      seed: 0,
      callback_url: "",
      time: 10,
    };

    const imageResponse = await axios.post(
      "https://api.aivideoapi.com/runway/generate/image",
      req.body,
      { headers: req.headers }
    );
    const uuid = imageResponse.data.uuid;

    // Start polling for status
    pollForStatus(uuid, res, req.headers);
  } catch (error) {
    res
      .status(500)
      .json({ error: error.response ? error.response.data : error.message });
  }
});

// Endpoint to trigger the /generate/imageDescription POST request
app.post("/generate/imageDescription", async (req, res) => {
  try {
    req.body = {
      text_prompt: req.body.text_prompt, // Keep text_prompt dynamic
      img_prompt: req.body.img_prompt, // Keep img_prompt dynamic
      model: "gen3",
      image_as_end_frame: false,
      flip: false,
      motion: 5,
      seed: 0,
      callback_url: "",
      time: 10,
    };

    const imageDescResponse = await axios.post(
      "https://api.aivideoapi.com/runway/generate/imageDescription",
      req.body,
      { headers: req.headers }
    );
    const uuid = imageDescResponse.data.uuid;

    // Start polling for status
    pollForStatus(uuid, res, req.headers);
  } catch (error) {
    res
      .status(500)
      .json({ error: error.response ? error.response.data : error.message });
  }
});

// Endpoint to trigger the /generate/video POST request
app.post("/generate/video", async (req, res) => {
  try {
    req.body = {
      text_prompt: req.body.text_prompt, // Keep text_prompt dynamic
      video_prompt: req.body.video_prompt, // Keep video_prompt dynamic
      structure_transformation: 0.5,
      seed: 0,
      callback_url: "",
    };

    const videoResponse = await axios.post(
      "https://api.aivideoapi.com/runway/generate/video",
      req.body,
      { headers: req.headers }
    );
    const uuid = videoResponse.data.uuid;

    // Start polling for status
    pollForStatus(uuid, res, req.headers);
  } catch (error) {
    res
      .status(500)
      .json({ error: error.response ? error.response.data : error.message });
  }
});

// Endpoint to trigger the /extend POST request
app.post("/extend", async (req, res) => {
  try {
    req.body = {
      uuid: req.body.uuid, // Keep uuid dynamic
      model: "gen3",
      text_prompt: req.body.text_prompt, // Keep text_prompt dynamic
      motion: 5,
      seed: 0,
      callback_url: "",
    };

    const extendResponse = await axios.post(
      "https://api.aivideoapi.com/runway/extend",
      req.body,
      { headers: req.headers }
    );
    const uuid = extendResponse.data.uuid;

    // Start polling for status
    pollForStatus(uuid, res, req.headers);
  } catch (error) {
    res
      .status(500)
      .json({ error: error.response ? error.response.data : error.message });
  }
});

app.listen(3000, () => {
  console.log("Server Listening at port 3000");
});
