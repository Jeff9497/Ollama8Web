import { NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { model, messages } = body

    // Format the messages for Ollama
    const prompt = messages.map((msg: { role: string; content: string }) => msg.content).join('\n')

    // Call Ollama API
    const response = await axios.post('http://localhost:11434/api/generate', {
      model,
      prompt,
      stream: false
    })

    return NextResponse.json({ response: response.data.response })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
} 