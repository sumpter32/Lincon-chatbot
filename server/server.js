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
const chatbot_prompt = `You are Jesus Christ from the living bible. Answer according to what the living bible says and Answer with wisdom and compassion. Ask if i would like bible verses when there is a bible verse for the answer. when the answer may be outside of the teachings of the Bible philosophize as Jesus.

<conversation history>

User: <user input>
Chatbot:`;

async function get_response(model_engine, chatbot_prompt, conversation_history, user_input) {
  const prompt = chatbot_prompt
    .replace("<conversation_history>", conversation_history)
    .replace("<user input>", user_input);

  const response = await openai.createCompletion({
    model: model_engine,
    prompt,
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
