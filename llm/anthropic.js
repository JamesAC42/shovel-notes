const Anthropic = require('@anthropic-ai/sdk');
const anthropicConfig = require('../config/anthropic.json');
const anthropic = new Anthropic({
  apiKey: anthropicConfig.apiKey,
});

const complete = async (system, prompt) => {
    console.log("generating...");
    const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 8192,
        system,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      });
    return response.content[0].text;
}

module.exports = {complete, anthropic};