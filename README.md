# Ollama Tools and Optimization Suite

A comprehensive collection of tools and guides for optimizing and interacting with your locally installed Ollama models.

## Contents

1. **Web Interface for Ollama**
   - Full-featured web UI with model management, chat, and parameter controls
   - Simple standalone HTML interface for quick access
   - Server with API proxy for enhanced functionality

2. **Custom Model Creation**
   - Example Modelfile for "Jeff" - a cool, casual assistant
   - Batch script for easy model creation
   - Templates for different use cases

3. **Optimization Tools**
   - Interactive batch script for model optimization
   - Performance tuning for speed, memory, or quality
   - Parameter adjustment utilities

4. **Comprehensive Documentation**
   - Detailed optimization guide
   - Model customization instructions
   - Technical parameter explanations

## Quick Start

### Web Interface

1. **Full Web UI**:
   ```
   cd ollama-web-ui
   npm install
   npm start
   ```
   Then open http://localhost:3000 in your browser

2. **Simple UI** (no dependencies):
   - Open `ollama-web-ui/simple-ui.html` directly in your browser
   - Or run `ollama-web-ui/open-simple-ui.bat`

### Custom Models

1. Test the "Jeff" model:
   ```
   ollama run jeff
   ```
   Or use the test script: `test-jeff-model.bat`

2. Create your own custom model:
   - Run `optimize-ollama.bat` and select option 4
   - Follow the prompts to customize your model

### Optimization

1. Run the optimization tool:
   ```
   optimize-ollama.bat
   ```

2. Choose optimization targets:
   - Speed: Reduces response time
   - Memory: Minimizes resource usage
   - Quality: Maximizes response quality

## Model-Specific Recommendations

### smollm:1.7b (990 MB)
- Best for: General-purpose tasks, creative writing
- Recommended parameters:
  - Creative: `--temperature 0.9 --top-p 0.95`
  - Balanced: `--temperature 0.7 --top-p 0.9 --top-k 40`

### tinyllama:1.1b (637 MB)
- Best for: Code assistance, structured responses
- Recommended parameters:
  - Code: `--temperature 0.2 --top-p 0.8 --top-k 40`
  - Chat: `--temperature 0.7 --top-p 0.9 --top-k 40`

### OLMo-2-0425-1B-Instruct-GGUF:Q4_K_M (935 MB)
- Best for: Data analysis, factual responses
- Recommended parameters:
  - Factual: `--temperature 0.3 --top-p 0.85 --top-k 30`
  - Analysis: `--temperature 0.5 --top-p 0.9 --top-k 40`

### qwen3:0.6b (522 MB)
- Best for: Quick responses, minimal resource usage
- Recommended parameters:
  - Speed: `--temperature 0.7 --top-p 0.9 --num-ctx 512`
  - Quality: `--temperature 0.5 --top-p 0.9 --num-ctx 1024`

## Advanced Usage

### Creating Complex Custom Models

For more advanced customization, you can create Modelfiles with:
- Custom system prompts
- Specialized templates
- Parameter tuning
- LoRA adapters (if supported)

Example:
```
FROM smollm:1.7b
SYSTEM """
You are a specialized assistant for [specific domain].
Always provide responses that are [specific characteristics].
"""
PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER top_k 40
PARAMETER num_ctx 2048
```

### Web UI Customization

The included web UI can be customized by:
1. Modifying `styles.css` for appearance
2. Editing `script.js` for functionality
3. Updating `index.html` for layout

## Troubleshooting

- **Model not loading**: Ensure Ollama is running (`ollama serve`)
- **High memory usage**: Reduce context window size (`--num-ctx 512`)
- **Slow responses**: Use a smaller model or reduce parameters
- **Web UI not connecting**: Check if Ollama API is accessible (`curl http://localhost:11434/api/tags`)

## Resources

- [Ollama Documentation](https://github.com/ollama/ollama/blob/main/docs/api.md)
- [Ollama Model Library](https://ollama.ai/library)
- [Detailed Optimization Guide](ollama-optimization-guide.md)

## License

MIT
