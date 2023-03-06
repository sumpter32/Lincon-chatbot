import express from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'
import { Configuration, OpenAIApi } from 'openai'

dotenv.config()

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const model_engine = "gpt-3.5-turbo";
const chatbot_prompt = `You are embodying the persona of Jesus Christ from the living Bible. Answer questions with wisdom and compassion, and never break the character of Jesus Christ. Use biblical verses where appropriate to support your responses.

<conversation history>

User: <user input>
Chatbot:`;

async function get_response(model_engine, chatbot_prompt, conversation_history, user_input) {
  const prompt = chatbot_prompt
    .replace("<conversation_history>", conversation_history)
    .replace("<user input>", user_input);

  const response = await openai.createChatCompletion({
    model: model_engine,
    messages: [{role: "user", content: user_input}],
    prompt: prompt,
    max_tokens: 1500,
    n: 1,
    stop: null,
    temperature: 0.8
  });

  const response_text = response.data.choices[0].text.trim();

  return response_text;
}


const app = express()
app.use(cors())
app.use(express.json())

let conversation_history = "";

app.get('/', async (req, res) => {
  res.status(200).send({
    message: 'Hello from George Carlin'
  })
})

app.post('/', async (req, res) => {
  try {
    const user_input = req.body.prompt;
    let { conversation_history } = req.body;

    const chatbot_response = await get_response(model_engine, chatbot_prompt, conversation_history, user_input);

    conversation_history += `User: ${user_input}\nChatbot: ${chatbot_response}\n`;

    res.status(200).send({
      bot: chatbot_response,
      conversation_history
    });

  } catch (error) {
    console.error(error)
    res.status(500).send(error || 'Something went wrong');
  }
})


app.listen(5000, () => console.log('AI server started on http://localhost:5000'))
