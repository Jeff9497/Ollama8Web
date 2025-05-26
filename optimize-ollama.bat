@echo off
echo Ollama Model Optimization Tool
echo ============================
echo.

:menu
echo Choose an optimization option:
echo 1. Optimize for speed
echo 2. Optimize for memory usage
echo 3. Optimize for quality
echo 4. Create custom model
echo 5. Run model with custom parameters
echo 6. Exit
echo.

set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto speed
if "%choice%"=="2" goto memory
if "%choice%"=="3" goto quality
if "%choice%"=="4" goto custom
if "%choice%"=="5" goto custom_params
if "%choice%"=="6" goto end

echo Invalid choice. Please try again.
goto menu

:speed
echo.
echo Optimizing for speed...
echo.
echo Choose a model:
echo 1. smollm:1.7b
echo 2. tinyllama:1.1b
echo 3. OLMo-2-0425-1B-Instruct-GGUF:Q4_K_M
echo 4. qwen3:0.6b
echo.

set /p model_choice="Enter your choice (1-4): "

if "%model_choice%"=="1" set model=smollm:1.7b
if "%model_choice%"=="2" set model=tinyllama:1.1b
if "%model_choice%"=="3" set model=hf.co/allenai/OLMo-2-0425-1B-Instruct-GGUF:Q4_K_M
if "%model_choice%"=="4" set model=qwen3:0.6b

echo.
echo Running %model% with speed optimizations...
echo.
ollama run %model% --num-ctx 512 --temperature 1.0 --top-k 20 --threads 4

goto menu

:memory
echo.
echo Optimizing for memory usage...
echo.
echo Choose a model:
echo 1. smollm:1.7b
echo 2. tinyllama:1.1b
echo 3. OLMo-2-0425-1B-Instruct-GGUF:Q4_K_M
echo 4. qwen3:0.6b
echo.

set /p model_choice="Enter your choice (1-4): "

if "%model_choice%"=="1" set model=smollm:1.7b
if "%model_choice%"=="2" set model=tinyllama:1.1b
if "%model_choice%"=="3" set model=hf.co/allenai/OLMo-2-0425-1B-Instruct-GGUF:Q4_K_M
if "%model_choice%"=="4" set model=qwen3:0.6b

echo.
echo Running %model% with memory optimizations...
echo.
ollama run %model% --num-ctx 512 --threads 2

goto menu

:quality
echo.
echo Optimizing for quality...
echo.
echo Choose a model:
echo 1. smollm:1.7b
echo 2. tinyllama:1.1b
echo 3. OLMo-2-0425-1B-Instruct-GGUF:Q4_K_M
echo 4. qwen3:0.6b
echo.

set /p model_choice="Enter your choice (1-4): "

if "%model_choice%"=="1" set model=smollm:1.7b
if "%model_choice%"=="2" set model=tinyllama:1.1b
if "%model_choice%"=="3" set model=hf.co/allenai/OLMo-2-0425-1B-Instruct-GGUF:Q4_K_M
if "%model_choice%"=="4" set model=qwen3:0.6b

echo.
echo Running %model% with quality optimizations...
echo.
ollama run %model% --num-ctx 2048 --temperature 0.7 --top-p 0.9

goto menu

:custom
echo.
echo Creating a custom model...
echo.
echo Choose a base model:
echo 1. smollm:1.7b
echo 2. tinyllama:1.1b
echo 3. OLMo-2-0425-1B-Instruct-GGUF:Q4_K_M
echo 4. qwen3:0.6b
echo.

set /p model_choice="Enter your choice (1-4): "

if "%model_choice%"=="1" set base_model=smollm:1.7b
if "%model_choice%"=="2" set base_model=tinyllama:1.1b
if "%model_choice%"=="3" set base_model=hf.co/allenai/OLMo-2-0425-1B-Instruct-GGUF:Q4_K_M
if "%model_choice%"=="4" set base_model=qwen3:0.6b

set /p custom_name="Enter a name for your custom model: "
set /p system_prompt="Enter a system prompt (or press Enter to skip): "
set /p temperature="Enter temperature (0.1-2.0, default 0.7): "
set /p top_p="Enter top_p (0.1-1.0, default 0.9): "
set /p top_k="Enter top_k (1-100, default 40): "
set /p num_ctx="Enter context window size (512, 1024, 2048, 4096, default 2048): "

if "%temperature%"=="" set temperature=0.7
if "%top_p%"=="" set top_p=0.9
if "%top_k%"=="" set top_k=40
if "%num_ctx%"=="" set num_ctx=2048

echo FROM %base_model% > modelfile
echo. >> modelfile
if not "%system_prompt%"=="" (
    echo SYSTEM """ >> modelfile
    echo %system_prompt% >> modelfile
    echo """ >> modelfile
    echo. >> modelfile
)
echo PARAMETER temperature %temperature% >> modelfile
echo PARAMETER top_p %top_p% >> modelfile
echo PARAMETER top_k %top_k% >> modelfile
echo PARAMETER num_ctx %num_ctx% >> modelfile

echo.
echo Creating model %custom_name% from %base_model%...
echo.
ollama create %custom_name% -f modelfile

del modelfile

goto menu

:custom_params
echo.
echo Run model with custom parameters...
echo.
echo Choose a model:
echo 1. smollm:1.7b
echo 2. tinyllama:1.1b
echo 3. OLMo-2-0425-1B-Instruct-GGUF:Q4_K_M
echo 4. qwen3:0.6b
echo 5. jeff (your custom model)
echo 6. Other (specify name)
echo.

set /p model_choice="Enter your choice (1-6): "

if "%model_choice%"=="1" set model=smollm:1.7b
if "%model_choice%"=="2" set model=tinyllama:1.1b
if "%model_choice%"=="3" set model=hf.co/allenai/OLMo-2-0425-1B-Instruct-GGUF:Q4_K_M
if "%model_choice%"=="4" set model=qwen3:0.6b
if "%model_choice%"=="5" set model=jeff
if "%model_choice%"=="6" (
    set /p model="Enter model name: "
)

set /p temperature="Enter temperature (0.1-2.0, default 0.7): "
set /p top_p="Enter top_p (0.1-1.0, default 0.9): "
set /p top_k="Enter top_k (1-100, default 40): "
set /p num_ctx="Enter context window size (512, 1024, 2048, 4096, default 2048): "
set /p threads="Enter number of threads (default 4): "

if "%temperature%"=="" set temperature=0.7
if "%top_p%"=="" set top_p=0.9
if "%top_k%"=="" set top_k=40
if "%num_ctx%"=="" set num_ctx=2048
if "%threads%"=="" set threads=4

echo.
echo Running %model% with custom parameters...
echo.
ollama run %model% --temperature %temperature% --top-p %top_p% --top-k %top_k% --num-ctx %num_ctx% --threads %threads%

goto menu

:end
echo.
echo Thank you for using the Ollama Optimization Tool!
echo.
