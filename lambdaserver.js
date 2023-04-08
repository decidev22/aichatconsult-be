const apiKey = "your api key"
const serverless = require('serverless-http');
const { Configuration, OpenAIApi } = require("openai");
const express = require('express')
var cors = require('cors')
const app = express()

const configuration = new Configuration({
    apiKey: apiKey,
  });
const openai = new OpenAIApi(configuration);


let corsOptions = {
    origin: 'https://lifeconsult-chat-ab.pages.dev',
    credentials: true
}
app.use(cors(corsOptions));


app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded


app.post('/consult', async function (req, res) {
    let { userMessages, assistantMessages} = req.body

    let messages = [
        {
            role: "system",
            content: "train message 1",
        },
        {
            role: "user",
            content: "reinforcement message 1.",
        },
        {
            role: "assistant",
            content: "train message 2",
        },
        { role: "user", content: "Initiate original statement" },
    
    ]

    while (userMessages.length != 0 || assistantMessages.length != 0) {
        if (userMessages.length != 0) {
            messages.push(
                JSON.parse('{"role": "user", "content": "'+String(userMessages.shift()).replace(/\n/g,"")+'"}')
            )
        }
        if (assistantMessages.length != 0) {
            messages.push(
                JSON.parse('{"role": "assistant", "content": "'+String(assistantMessages.shift()).replace(/\n/g,"")+'"}')
            )
        }
    }

    const maxRetries = 3;
    let retries = 0;
    let completion
    while (retries < maxRetries) {
      try {
        completion = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: messages
        });
        break;
      } catch (error) {
          retries++;
          console.log(error);
          console.log(`Error fetching data, retrying (${retries}/${maxRetries})...`);
      }
    }

    let consult = completion.data.choices[0].message['content']
    res.set('Access-Control-Allow-Origin', 'https://lifeconsult-chat-ab.pages.dev');
    res.json({"assistant": consult});
});

module.exports.handler = serverless(app);


// app.listen(3000)
