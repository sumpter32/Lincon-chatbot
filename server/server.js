import express from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'
import { Configuration, OpenAIApi } from 'openai'

dotenv.config()

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const model_engine = "text-davinci-003";
const chatbot_prompt = `pretend you are Jesus Christ from the living bible.

<conversation history>

User: <user input>
Chatbot:`;

async function get_response(conversation_history, user_input) {
  const prompt = chatbot_prompt.replace(
    "<conversation_history>", conversation_history).replace("<user input>", user_input);

  // Get the response from GPT-3
  const response = await openai.createCompletion({
    model: model_engine,
    prompt: prompt,
    max_tokens: 1500,
    n: 1,
    stop: null,
    temperature: 0.8
  });

  // Extract the response from the response object
  const response_text = response.data.choices[0].text;

  const chatbot_response = response_text.trim();

  return chatbot_response;
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
    const user_input = req.body.user_input;

    const chatbot_response = await get_response(conversation_history, user_input);
    console.log(`Chatbot: ${chatbot_response}`);
    conversation_history += `User: ${user_input}\nChatbot: ${chatbot_response}\n`;

    res.status(200).send({
      bot: chatbot_response,
      conversation_history: conversation_history
    });

  } catch (error) {
    console.error(error)
    res.status(500).send(error || 'Something went wrong');
  }
})

app.listen(5000, () => console.log('AI server started on http://localhost:5000'))
