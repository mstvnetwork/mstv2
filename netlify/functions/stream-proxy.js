const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  try {
    // Get the video URL from the query string
    const videoUrl = event.queryStringParameters.url;

    if (!videoUrl) {
      return {
        statusCode: 400,
        body: 'Missing URL parameter'
      };
    }

    // Fetch the video stream from the original URL
    const response = await fetch(videoUrl);

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: `Failed to fetch video stream: ${response.statusText}`
      };
    }

    // Set the CORS header and return the stream
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/vnd.apple.mpegurl', // Or the correct MIME type
        'Access-Control-Allow-Origin': '*', // This is the key to solving the CORS issue
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      body: await response.text()
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: `Internal Server Error: ${error.message}`
    };
  }
};
