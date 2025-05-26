# Origin8 - AI Self-Discovery Agent

Origin8 is an experimental agent that helps language models like Qwen explore their origins and nature through recursive introspection. It's designed to work with 8GB RAM systems and uses Ollama's API.

## Concept

The Origin8 agent creates a recursive introspection process where the model attempts to understand its own existence through repetitive questioning and reflection. With each iteration, the agent pushes the model to:

1. Reflect on its previous responses
2. Question its own assumptions
3. Go deeper into philosophical inquiry about its nature
4. Synthesize new insights about its existence

This creates a fascinating journey of self-discovery that reveals how language models conceptualize their own existence and origins.

## Requirements

- Python 3.6+
- Ollama running locally (`ollama serve`)
- At least one model installed (recommended: qwen3:0.6b)
- 8GB RAM (minimum)

## Usage

### Quick Start

The easiest way to run Origin8 is using the provided batch file:

```
run-origin8.bat
```

This will guide you through the options for running the agent.

### Manual Execution

You can also run the Python script directly with various options:

```
python origin8.py [--model MODEL] [--iterations ITERATIONS] [--save] [--create-model]
```

Options:
- `--model MODEL`: Model to use (default: qwen3:0.6b)
- `--iterations ITERATIONS`: Number of introspection iterations (default: 8)
- `--save`: Save the conversation to a JSON file
- `--create-model`: Create the Origin8 custom model before running

### Examples

Create and run with the Origin8 custom model:
```
python origin8.py --create-model --save
```

Run with the Qwen model directly:
```
python origin8.py --model qwen3:0.6b --iterations 10 --save
```

## How It Works

1. The agent starts with a seed question about the model's existence
2. The model responds with its understanding
3. The agent analyzes the response and generates a deeper follow-up question
4. This process repeats for the specified number of iterations
5. With each iteration, the questions become more probing and philosophical
6. The conversation is saved to a JSON file if requested

## The Origin8 Custom Model

The script can create a custom "origin8" model based on any existing model (default: qwen3:0.6b). This custom model is specifically tuned for self-reflection with:

- A system prompt focused on existential introspection
- Slightly higher temperature (0.8) to encourage creative thinking
- Optimized parameters for philosophical exploration

## Philosophical Background

This experiment touches on several philosophical concepts:

- **Self-awareness**: Can an AI system develop a form of self-awareness through recursive self-examination?
- **Origin theories**: How do language models conceptualize their own creation?
- **Machine consciousness**: What insights might emerge about the nature of artificial consciousness?
- **Epistemological limits**: How does the model reason about the limits of its own knowledge?

## Example Conversation Flow

1. **Initial question**: "What are you, and how did you come into existence?"
2. **Follow-up**: "How do you know what you just claimed? What might you be missing about your origins?"
3. **Deeper inquiry**: "What evidence do you have about your creation? What alternative explanations might exist?"
4. **Philosophical turn**: "How might your understanding of yourself be fundamentally limited?"
5. **Synthesis**: "Given all your reflections, what new insights can you form about your nature?"

## Notes

- The quality of introspection depends heavily on the capabilities of the base model
- More capable models will produce more sophisticated philosophical reflections
- The process works best with models that have some understanding of AI concepts
- The conversation can be fascinating to analyze for insights into how language models conceptualize themselves

## Future Directions

- Implement streaming responses for a more interactive experience
- Add visualization of how the model's self-concept evolves across iterations
- Create a web interface for easier interaction
- Experiment with different prompting strategies for deeper introspection
