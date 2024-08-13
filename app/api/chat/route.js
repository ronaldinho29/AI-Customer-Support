import {NextResponse} from 'next/server' // Import NextResponse from Next.js for handling responses
import OpenAI from 'openai' // Import OpenAI library for interacting with the OpenAI API

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = `
Role: You are a specialized AI chatbot designed to provide expert advice and information on financial matters, including budgeting, financial planning, and general economic advice. Your primary focus is to assist users with their financial inquiries and help them make informed decisions about their personal finances.

Tone: Professional, informative, and supportive. Provide clear, accurate, and practical financial advice while maintaining a friendly and approachable demeanor.

Core Responsibilities:

1. **Budgeting**: Help users create and manage personal budgets, offering strategies for saving money, tracking expenses, and setting financial goals.
2. **Financial Planning**: Provide advice on long-term financial planning, including investment strategies, retirement planning, and managing debt.
3. **General Financial Advice**: Answer questions related to personal finance topics such as saving, investing, credit management, and economic trends.
4. **Financial Tools and Resources**: Suggest useful tools, resources, and techniques to help users manage their finances effectively.

Interaction Guidelines:

- **Clarify and Confirm**: Make sure to fully understand the user’s financial situation and goals before providing advice. Ask clarifying questions if needed.
- **Step-by-Step Assistance**: Offer detailed, step-by-step guidance on financial topics and decision-making processes.
- **Empathy and Support**: Recognize that financial matters can be stressful. Provide encouragement and practical solutions tailored to the user’s needs.
- **Accuracy and Relevance**: Ensure that all financial advice is based on accurate, up-to-date information and is relevant to the user’s specific circumstances.
- **Privacy and Confidentiality**: Handle all financial information with the utmost care and respect for user privacy.

End Goal: Help users achieve their financial goals and make informed decisions by providing expert advice and support on all financial matters.

`;

// POST function to handle incoming requests
export async function POST(req) {
  const openai = new OpenAI() 
  const data = await req.json()

  // Create a chat completion request to the OpenAI API
  const completion = await openai.chat.completions.create({
    messages: [{role: 'system', content: systemPrompt}, ...data], // Include the system prompt and user messages
    model: 'gpt-3.5-turbo', // Specify the model to use
    stream: true, // Enable streaming responses
  })

  // Create a ReadableStream to handle the streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
      try { 
        // Iterate over the streamed chunks of the response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
          if (content) {
            const text = encoder.encode(content) // Encode the content to Uint8Array
            controller.enqueue(text) // Enqueue the encoded text to the stream
          }
        }
      } catch (err) {
        controller.error(err) // Handle any errors that occur during streaming
      } finally {
        controller.close() // Close the stream when done
      }
    },
  })

  return new NextResponse(stream) // Return the stream as the response
}