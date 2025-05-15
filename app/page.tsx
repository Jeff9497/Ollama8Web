'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Box,
  Container,
  VStack,
  Input,
  Button,
  Text,
  useToast,
  Flex,
  Select,
  Heading,
  IconButton,
  useColorMode,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  Badge,
  Card,
  CardBody,
  Collapse,
  useDisclosure,
  Tooltip,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  Switch,
  Grid,
  GridItem,
  Link,
  Spinner,
  CardProps,
  chakra,
  Alert,
  AlertIcon,
  InputGroup,
  InputRightElement,
  Code,
  Textarea,
  HStack,
  SimpleGrid,
  Icon as ChakraIcon,
} from '@chakra-ui/react'
import { FaPaperPlane, FaSun, FaMoon, FaCog, FaUpload, FaBrain, FaGithub, FaPlus, FaTimes, FaCheck, FaEllipsisH, FaEnvelope, FaCode, FaLightbulb, FaFileAlt, FaSpellCheck, FaDatabase } from 'react-icons/fa'
import ReactMarkdown from 'react-markdown'
import { themeVariants } from './theme'
import { keyframes } from '@emotion/react'
import { IconType } from 'react-icons'

interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  thinking?: string;
  attachments?: string[];
  reactions?: MessageReaction[];
  isEditing?: boolean;
  threadMessages?: Message[];
  threadOpen?: boolean;
  font?: string;
}

interface OllamaModel {
  name: string
  modified_at: string
  size: number
}

type ThemeVariant = 'default' | 'gradientBlue' | 'oceanBlue' | 'metallicBlue' | 'custom'

interface ModelConfig {
  name: string;
  displayName: string;
  description?: string;
  temperature?: number;
}

interface ModelPersona {
  baseModel: string;
  name: string;
  systemPrompt: string;
  description?: string;
}

interface QuickPrompt {
  title: string;
  prompt: string;
  icon: IconType;
  category: 'general' | 'writing' | 'coding' | 'creative';
}

// Add loading animation keyframes
const pulseKeyframes = keyframes`
  0% { transform: scale(0.95) translateY(0); opacity: 0.5; }
  50% { transform: scale(1) translateY(-2px); opacity: 0.8; }
  100% { transform: scale(0.95) translateY(0); opacity: 0.5; }
`

const ThinkingAnimation = () => {
  const pulseAnimation = `${pulseKeyframes} 1.5s ease-in-out infinite`
  
  return (
    <Flex align="center" gap={3}>
      <Text fontSize="sm" fontWeight="medium" color="gray.500">
        AI is thinking
      </Text>
      <Flex gap={1.5}>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            as="span"
            h="6px"
            w="6px"
            borderRadius="full"
            bgGradient="linear(to-r, blue.400, purple.400)"
            animation={pulseAnimation}
            style={{ animationDelay: `${i * 0.2}s` }}
            boxShadow="sm"
          />
        ))}
      </Flex>
      <Spinner 
        size="sm" 
        speed="0.8s" 
        thickness="2px"
        color="blue.400"
        emptyColor="gray.200"
      />
    </Flex>
  )
}

// Add custom Card prop types
interface CustomCardProps extends CardProps {
  isUser?: boolean;
}

// Update the Card usage type
const CustomCard = chakra(Card) as React.FC<CustomCardProps>;

// Add this style at the beginning of the file, after imports
const globalStyles = `
  body, html {
    margin: 0;
    padding: 0;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
  }
`

// Add this before the Home component
const themeNames = {
  default: 'Default Theme',
  gradientBlue: 'Gradient Blue',
  metallicBlue: 'Metallic Blue',
  oceanBlue: 'Ocean Blue',
  custom: 'Custom Theme'
} as const

// Add before the Home component
const defaultModels: ModelConfig[] = [
  {
    name: 'jeff28',
    displayName: 'Jeff28',
    description: 'Friendly and helpful assistant based on Qwen',
    temperature: 0.7
  },
  {
    name: 'qwen:0.6b',
    displayName: 'Qwen 0.6B',
    description: 'Base Qwen model'
  }
]

const quickPrompts: QuickPrompt[] = [
  {
    title: 'Write an Email',
    prompt: 'Help me write a professional email about ',
    icon: FaEnvelope,
    category: 'writing'
  },
  {
    title: 'Explain AI',
    prompt: 'Explain how artificial intelligence works in simple terms',
    icon: FaBrain,
    category: 'general'
  },
  {
    title: 'Code Review',
    prompt: 'Review this code and suggest improvements: ',
    icon: FaCode,
    category: 'coding'
  }
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [model, setModel] = useState('')
  const [models, setModels] = useState<OllamaModel[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTheme, setActiveTheme] = useState<ThemeVariant>('default')
  const [appName, setAppName] = useState('Ollama8Web')
  const [customTheme, setCustomTheme] = useState({
    bgDark: '#1A202C',
    bgLight: '#FFFFFF',
    accentDark: '#4299E1',
    accentLight: '#3182CE',
  })
  const { colorMode, toggleColorMode } = useColorMode()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortController = useRef<AbortController | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [ollamaAvailable, setOllamaAvailable] = useState<boolean>(false)
  const [checkingOllama, setCheckingOllama] = useState<boolean>(true)
  const [fileError, setFileError] = useState<string>('')
  const [modelPersonas, setModelPersonas] = useState<ModelPersona[]>([])
  const [selectedPersona, setSelectedPersona] = useState<ModelPersona | null>(null)
  const [newPersonaModal, setNewPersonaModal] = useState(false)
  const [newPersona, setNewPersona] = useState<ModelPersona>({
    baseModel: '',
    name: '',
    systemPrompt: '',
    description: ''
  })
  const [dragActive, setDragActive] = useState(false);
  const [selectedFont, setSelectedFont] = useState('Inter');
  const [fontSize, setFontSize] = useState('md');
  const [selectedCategory, setSelectedCategory] = useState<QuickPrompt['category']>('general');

  const availableFonts = [
    'Inter',
    'Roboto',
    'Open Sans',
    'Poppins',
    'Montserrat',
    'Source Code Pro'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Add Ollama availability check
  useEffect(() => {
    const checkOllama = async () => {
      try {
        const response = await fetch('http://localhost:11434/api/tags')
        if (response.ok) {
          const data = await response.json()
          setOllamaAvailable(true)
          
          // Show success message
          toast({
            render: ({ onClose }) => (
              <Flex
                bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.9)' : 'white'}
                color={colorMode === 'dark' ? 'white' : 'gray.800'}
                p={3}
                borderRadius="xl"
                shadow="lg"
                alignItems="center"
                gap={3}
                backdropFilter="blur(8px)"
                border="1px solid"
                borderColor={colorMode === 'dark' ? 'whiteAlpha.200' : 'gray.100'}
              >
                <Box
                  bg={colorMode === 'dark' ? 'green.500' : 'green.400'}
                  p={2}
                  borderRadius="lg"
                  color="white"
                >
                  <FaCheck size={16} />
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontWeight="medium">All Systems Go! 🚀</Text>
                  <Text fontSize="sm" opacity={0.9}>Ollama is running smoothly</Text>
                </VStack>
              </Flex>
            ),
            duration: 4000,
            isClosable: true,
            position: "top"
          })

          if (data.models && data.models.length > 0) {
            setModels(data.models)
            setModel(data.models[0].name)
          } else {
            toast({
              title: 'No Models Available',
              description: 'Please pull a model using "ollama pull model-name". For example: "ollama pull llama2"',
              status: 'warning',
              duration: null,
              isClosable: true,
            })
          }
        } else {
          setOllamaAvailable(false)
          toast({
            title: 'Ollama Not Found',
            description: 'Please install Ollama and make sure it is running with "ollama serve". Visit ollama.ai for installation instructions.',
            status: 'error',
            duration: null,
            isClosable: true,
          })
        }
      } catch (error) {
        setOllamaAvailable(false)
        toast({
          title: 'Cannot Connect to Ollama',
          description: 'Please install Ollama and make sure it is running with "ollama serve". Visit ollama.ai for installation instructions.',
          status: 'error',
          duration: null,
          isClosable: true,
        })
      } finally {
        setCheckingOllama(false)
      }
    }
    checkOllama()
  }, [toast, colorMode])

  const validateFile = (file: File) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
      'text/markdown'
    ]
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!allowedTypes.includes(file.type)) {
      return 'File type not supported. Please upload images, PDFs, or text files.'
    }
    if (file.size > maxSize) {
      return 'File too large. Maximum size is 5MB.'
    }
    return null
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setFileError('')
    
    const validFiles: File[] = []
    for (const file of files) {
      const error = validateFile(file)
      if (error) {
        setFileError(error)
        return
      }
      validFiles.push(file)
    }
    
    setUploadedFiles(prev => [...prev, ...validFiles])
    
    // Preview files in chat
    const fileUrls = validFiles.map(file => URL.createObjectURL(file))
    if (fileUrls.length > 0) {
      setMessages(prev => [...prev, {
        role: 'user',
        content: 'Uploaded files:',
        attachments: fileUrls
      }])
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const extractThinking = (content: string): { thinking?: string; content: string } => {
    const thinkMatch = content.match(/<think>(.*?)<\/think>/s)
    if (thinkMatch) {
      return {
        thinking: thinkMatch[1].trim(),
        content: content.replace(/<think>.*?<\/think>/s, '').trim()
      }
    }
    return { content }
  }

  const handleStopGeneration = () => {
    if (abortController.current) {
      abortController.current.abort();
      setIsGenerating(false);
      setIsLoading(false);
    }
  };

  const handleCreatePersona = () => {
    if (!newPersona.baseModel || !newPersona.name || !newPersona.systemPrompt) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setModelPersonas(prev => [...prev, newPersona])
    setNewPersona({
      baseModel: '',
      name: '',
      systemPrompt: '',
      description: ''
    })
    setNewPersonaModal(false)
    toast({
      title: 'Persona Created',
      description: `Created ${newPersona.name} based on ${newPersona.baseModel}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() && uploadedFiles.length === 0) return
    if (!model) return

    const userMessage = { 
      role: 'user' as const, 
      content: input,
      attachments: uploadedFiles.map(file => URL.createObjectURL(file))
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setUploadedFiles([])
    setIsLoading(true)
    setIsGenerating(true)

    try {
      abortController.current = new AbortController();

      // Include system prompt if a persona is selected
      const allMessages = selectedPersona 
        ? [{ role: 'system' as const, content: selectedPersona.systemPrompt }, ...messages, userMessage]
        : [...messages, userMessage]

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedPersona?.baseModel || model,
          messages: allMessages,
        }),
        signal: abortController.current.signal
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      const { thinking, content } = extractThinking(data.response)
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content,
        ...(thinking && { thinking })
      }])
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        toast({
          title: 'Generation stopped',
          description: 'The response generation was stopped',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to get response from Ollama',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setIsLoading(false)
      setIsGenerating(false)
      abortController.current = null
    }
  }

  // Add keyboard event handler for input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (input.trim() || uploadedFiles.length > 0) {
        handleSubmit(e as unknown as React.FormEvent)
      }
    }
  }

  const applyCustomTheme = () => {
    document.documentElement.style.setProperty('--custom-bg-dark', customTheme.bgDark)
    document.documentElement.style.setProperty('--custom-bg-light', customTheme.bgLight)
    document.documentElement.style.setProperty('--custom-accent-dark', customTheme.accentDark)
    document.documentElement.style.setProperty('--custom-accent-light', customTheme.accentLight)
    setActiveTheme('custom')
  }

  // Add this useEffect for theme transitions
  useEffect(() => {
    document.body.style.transition = 'background 0.3s ease-in-out'
    document.body.style.background = themeVariants[activeTheme][colorMode].gradient
    
    return () => {
      document.body.style.transition = ''
      document.body.style.background = ''
    }
  }, [activeTheme, colorMode])

  const handleThemeChange = (newTheme: ThemeVariant) => {
    setActiveTheme(newTheme)
    // Save theme preference
    localStorage.setItem('preferredTheme', newTheme)
  }

  // Load saved theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('preferredTheme') as ThemeVariant
    if (savedTheme && Object.keys(themeVariants).includes(savedTheme)) {
      setActiveTheme(savedTheme)
    }
  }, [])

  // Add drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles: File[] = [];
    for (const file of files) {
      const error = validateFile(file);
      if (error) {
        setFileError(error);
        return;
      }
      validFiles.push(file);
    }
    
    setUploadedFiles(prev => [...prev, ...validFiles]);
    const fileUrls = validFiles.map(file => URL.createObjectURL(file));
    if (fileUrls.length > 0) {
      setMessages(prev => [...prev, {
        role: 'user',
        content: 'Uploaded files:',
        attachments: fileUrls
      }]);
    }
  };

  // Add message reaction handler
  const handleReaction = (messageIndex: number, emoji: string) => {
    setMessages(prev => {
      const newMessages = [...prev];
      const message = newMessages[messageIndex];
      if (!message.reactions) {
        message.reactions = [];
      }
      
      const existingReaction = message.reactions.find(r => r.emoji === emoji);
      if (existingReaction) {
        existingReaction.count += 1;
        existingReaction.users.push('user'); // In a real app, use actual user ID
      } else {
        message.reactions.push({
          emoji,
          count: 1,
          users: ['user']
        });
      }
      
      return newMessages;
    });
  };

  // Add message editing handler
  const handleEditMessage = (messageIndex: number, newContent: string) => {
    setMessages(prev => {
      const newMessages = [...prev];
      newMessages[messageIndex] = {
        ...newMessages[messageIndex],
        content: newContent,
        isEditing: false
      };
      return newMessages;
    });
  };

  // Add this function to handle quick prompt selection
  const handleQuickPrompt = (prompt: QuickPrompt) => {
    setInput(prompt.prompt);
    // Focus the input field
    const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
      // If the prompt ends with a space, move cursor to that position
      if (prompt.prompt.endsWith(' ')) {
        inputElement.setSelectionRange(prompt.prompt.length, prompt.prompt.length);
      }
    }
  };

  // Update the return JSX to show loading or error state
  if (checkingOllama) {
    return (
      <Container maxW="container.xl" h="100vh" p={0}>
        <Flex h="full" align="center" justify="center">
          <VStack spacing={4}>
            <Spinner size="xl" />
            <Text>Checking Ollama availability...</Text>
          </VStack>
        </Flex>
      </Container>
    )
  }

  if (!ollamaAvailable) {
    return (
      <Container maxW="container.xl" h="100vh" p={4}>
        <Flex h="full" align="center" justify="center">
          <VStack spacing={6} maxW="600px" textAlign="center">
            <Heading size="lg" color="red.500">Ollama Not Available</Heading>
            <Text>
              This application requires Ollama to be installed and running on your machine.
            </Text>
            <VStack spacing={2} align="stretch">
              <Text fontWeight="bold">To get started:</Text>
              <Text>1. Visit <Link href="https://ollama.ai" color="blue.500" isExternal>ollama.ai</Link> to install Ollama</Text>
              <Text>2. Run Ollama with the command: <Code>ollama serve</Code></Text>
              <Text>3. Refresh this page</Text>
            </VStack>
            <Button
              colorScheme="blue"
              onClick={() => window.location.reload()}
              leftIcon={<FaSun />}
            >
              Refresh Page
            </Button>
          </VStack>
        </Flex>
      </Container>
    )
  }

  return (
    <>
      <style jsx global>{globalStyles}</style>
      <Container maxW="container.xl" h="100vh" p={0} position="relative" overflow="hidden">
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient={themeVariants[activeTheme][colorMode].gradient}
          opacity={1}
          transition="all 0.3s ease-in-out"
          pointerEvents="none"
          zIndex={-1}
        />
        <VStack h="full" spacing={0} position="relative">
          <Flex
            w="full"
            justify="space-between"
            align="center"
            p={[2, 3, 4]}
            borderBottom="1px"
            borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
            bgGradient={themeVariants[activeTheme][colorMode].bg}
          >
            <Heading size={["sm", "md", "lg"]}>{appName}</Heading>
            <Flex gap={[1, 2]} align="center">
              <Select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                width={["120px", "150px", "200px"]}
                size={["sm", "sm", "md"]}
                placeholder={models.length === 0 ? "No models found" : "Select a model"}
                isDisabled={models.length === 0}
              >
                {models.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </Select>

              <Menu>
                <MenuButton
                  as={Button}
                  variant="theme"
                  size={["sm", "sm", "md"]}
                  leftIcon={<FaSun />}
                >
                  {themeNames[activeTheme]}
                </MenuButton>
                <MenuList>
                  {Object.entries(themeNames).map(([key, name]) => (
                    <MenuItem
                      key={key}
                      onClick={() => handleThemeChange(key as ThemeVariant)}
                      icon={activeTheme === key ? <FaSun /> : undefined}
                    >
                      {name}
                    </MenuItem>
                  ))}
                  <Divider />
                  <MenuItem
                    onClick={toggleColorMode}
                    icon={colorMode === 'dark' ? <FaMoon /> : <FaSun />}
                  >
                    Toggle {colorMode === 'dark' ? 'Light' : 'Dark'} Mode
                  </MenuItem>
                </MenuList>
              </Menu>

              <IconButton
                aria-label="Settings"
                icon={<FaCog />}
                size={["sm", "sm", "md"]}
                variant="theme"
                onClick={onOpen}
              />
            </Flex>
          </Flex>

          <Box
            flex={1}
            w="full"
            overflowY="auto"
            px={[2, 3, 4]}
            py={[1, 2]}
            position="relative"
            sx={{
              '&::-webkit-scrollbar': { width: '4px' },
              '&::-webkit-scrollbar-track': { width: '6px' },
              '&::-webkit-scrollbar-thumb': {
                background: colorMode === 'dark' ? 'gray.500' : 'gray.400',
                borderRadius: '24px',
              },
            }}
          >
            {messages.length === 0 && (
              <SimpleGrid columns={[1, 2, 3]} spacing={4} w="full" maxW="container.lg" py={8} px={4}>
                {quickPrompts.map((prompt, index) => (
                  <Card
                    key={index}
                    cursor="pointer"
                    onClick={() => handleQuickPrompt(prompt)}
                    _hover={{
                      transform: 'translateY(-2px)',
                      shadow: 'lg',
                    }}
                    transition="all 0.2s"
                    bg={colorMode === 'dark' ? 'whiteAlpha.100' : 'white'}
                    borderRadius="xl"
                  >
                    <CardBody>
                      <VStack spacing={3}>
                        <ChakraIcon
                          as={prompt.icon}
                          boxSize={6}
                          color={colorMode === 'dark' ? 'blue.200' : 'blue.500'}
                        />
                        <Text
                          fontWeight="medium"
                          textAlign="center"
                          color={colorMode === 'dark' ? 'white' : 'gray.700'}
                        >
                          {prompt.title}
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            )}

            {messages.map((message, index) => (
              <CustomCard
                key={index}
                variant="message"
                isUser={message.role === 'user'}
                mb={2}
                ml={message.role === 'user' ? 'auto' : '0'}
              >
                <CardBody p={2}>
                  <Flex justify="space-between" align="center" mb={1}>
                    <Badge 
                      colorScheme={message.role === 'user' ? 'blue' : 'purple'}
                      borderRadius="full"
                      px={2}
                      py={0.5}
                      fontSize="xs"
                    >
                      {message.role === 'user' ? 'You' : model}
                    </Badge>
                    {message.thinking && (
                      <Tooltip label="View thinking process">
                        <IconButton
                          aria-label="Show thinking"
                          icon={<FaBrain />}
                          size="xs"
                          variant="ghost"
                          onClick={() => {
                            toast({
                              title: "Thinking Process",
                              description: message.thinking,
                              status: "info",
                              duration: null,
                              isClosable: true,
                              position: "top",
                            })
                          }}
                        />
                      </Tooltip>
                    )}
                  </Flex>

                  {message.attachments?.map((url, i) => (
                    <Image
                      key={i}
                      src={url}
                      alt="Uploaded content"
                      maxH="150px"
                      my={1}
                      borderRadius="sm"
                    />
                  ))}

                  <Box
                    fontSize="sm"
                    sx={{
                      '& p': { my: 0.5 },
                      '& pre': {
                        bg: colorMode === 'dark' ? 'rgba(45, 55, 72, 0.6)' : 'rgba(237, 242, 247, 0.6)',
                        p: 1.5,
                        borderRadius: 'sm',
                        overflowX: 'auto',
                        fontSize: 'xs',
                      },
                      '& code': {
                        bg: colorMode === 'dark' ? 'rgba(45, 55, 72, 0.6)' : 'rgba(237, 242, 247, 0.6)',
                        px: 1,
                        py: 0.5,
                        borderRadius: 'sm',
                        fontSize: 'xs',
                      },
                    }}
                  >
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </Box>
                </CardBody>
              </CustomCard>
            ))}
            {isLoading && (
              <CustomCard
                variant="message"
                mb={4}
              >
                <CardBody>
                  <ThinkingAnimation />
                </CardBody>
              </CustomCard>
            )}
            <div ref={messagesEndRef} />
          </Box>

          <Box
            as="form"
            onSubmit={handleSubmit}
            w="full"
            position="relative"
            pb={4}
            pt={2}
            px={6}
            mb={2}
            onDragEnter={handleDrag}
            sx={{
              fontFamily: selectedFont,
              fontSize: fontSize
            }}
          >
            {dragActive && (
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bg={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.9)' : 'rgba(237, 242, 247, 0.9)'}
                borderRadius="3xl"
                border="3px dashed"
                borderColor={colorMode === 'dark' ? 'blue.400' : 'blue.500'}
                zIndex={2}
                display="flex"
                alignItems="center"
                justifyContent="center"
                color={colorMode === 'dark' ? 'blue.200' : 'blue.600'}
                pointerEvents="none"
              >
                <VStack spacing={2}>
                  <FaUpload size={24} />
                  <Text>Drop files here</Text>
                </VStack>
              </Box>
            )}
            
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bg={colorMode === 'dark' ? 'rgba(17, 25, 40, 0.75)' : 'rgba(255, 255, 255, 0.9)'}
              borderRadius="3xl"
              backdropFilter="blur(12px) saturate(180%)"
              boxShadow={`0 -4px 20px ${colorMode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'}`}
              border="1px solid"
              borderColor={colorMode === 'dark' ? 'whiteAlpha.100' : 'gray.200'}
              zIndex={0}
            />

            <Box position="relative" zIndex={1}>
              {fileError && (
                <Alert status="error" mb={2} borderRadius="xl" bg={colorMode === 'dark' ? 'red.900' : 'red.50'}>
                  <AlertIcon />
                  {fileError}
                </Alert>
              )}
              
              <Flex direction="column" gap={2}>
                {uploadedFiles.length > 0 && (
                  <Flex gap={2} flexWrap="wrap" mb={2}>
                    {uploadedFiles.map((file, index) => (
                      <Badge
                        key={index}
                        display="flex"
                        alignItems="center"
                        gap={1}
                        px={3}
                        py={1.5}
                        borderRadius="full"
                        bg={colorMode === 'dark' ? 'whiteAlpha.200' : 'blackAlpha.100'}
                        color={colorMode === 'dark' ? 'white' : 'gray.700'}
                        fontSize="xs"
                        fontWeight="medium"
                      >
                        <Text fontSize="xs">{file.name}</Text>
                        <IconButton
                          aria-label="Remove file"
                          icon={<FaTimes />}
                          size="xs"
                          variant="ghost"
                          onClick={() => removeFile(index)}
                          _hover={{ color: 'red.500' }}
                        />
                      </Badge>
                    ))}
                  </Flex>
                )}
                
                <Flex gap={3} align="center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    multiple
                    accept="image/*,.pdf,.txt,.md"
                  />
                  <Tooltip label="Upload files" placement="top">
                    <IconButton
                      aria-label="Upload files"
                      icon={<FaUpload />}
                      onClick={() => fileInputRef.current?.click()}
                      size="lg"
                      variant="ghost"
                      isDisabled={!model}
                      color={colorMode === 'dark' ? 'whiteAlpha.700' : 'gray.500'}
                      _hover={{
                        color: colorMode === 'dark' ? 'white' : 'gray.700',
                        transform: 'translateY(-1px)',
                      }}
                      _active={{
                        transform: 'translateY(0)',
                      }}
                      transition="all 0.2s"
                    />
                  </Tooltip>
                  
                  <InputGroup size="lg">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={
                        !model 
                          ? "Please select a model first" 
                          : models.length === 0 
                            ? "No models available. Pull a model using 'ollama pull model-name'" 
                            : "Type your message..."
                      }
                      disabled={isLoading || !model}
                      pr="4.5rem"
                      bg="transparent"
                      border="none"
                      _focus={{
                        boxShadow: 'none',
                        outline: 'none'
                      }}
                      _hover={{
                        border: 'none'
                      }}
                      fontSize="md"
                      color={colorMode === 'dark' ? 'white' : 'gray.700'}
                      sx={{
                        '::placeholder': {
                          color: colorMode === 'dark' ? 'whiteAlpha.400' : 'gray.400',
                          fontStyle: 'italic'
                        }
                      }}
                    />
                    <InputRightElement width="4.5rem">
                      {isGenerating ? (
                        <Button
                          size="sm"
                          onClick={handleStopGeneration}
                          variant="ghost"
                          color="red.400"
                          _hover={{
                            color: 'red.500',
                            transform: 'translateY(-1px)'
                          }}
                          _active={{
                            transform: 'translateY(0)'
                          }}
                          transition="all 0.2s"
                        >
                          Stop
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          type="submit"
                          variant="ghost"
                          disabled={!model || !input.trim()}
                          leftIcon={<FaPaperPlane />}
                          color={colorMode === 'dark' ? 'blue.200' : 'blue.500'}
                          _hover={{
                            color: colorMode === 'dark' ? 'blue.100' : 'blue.600',
                            transform: 'translateY(-1px)'
                          }}
                          _active={{
                            transform: 'translateY(0)'
                          }}
                          transition="all 0.2s"
                        >
                          Send
                        </Button>
                      )}
                    </InputRightElement>
                  </InputGroup>
                </Flex>
              </Flex>
            </Box>
          </Box>

          <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay backdropFilter="blur(10px)" />
            <ModalContent>
              <ModalHeader>Settings</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Tabs>
                  <TabList>
                    <Tab>General</Tab>
                    <Tab>Appearance</Tab>
                    <Tab>Model Personas</Tab>
                    <Tab>About</Tab>
                  </TabList>

                  <TabPanels>
                    <TabPanel>
                      <VStack spacing={4} align="stretch">
                        <FormControl>
                          <FormLabel>Font Family</FormLabel>
                          <Select
                            value={selectedFont}
                            onChange={(e) => setSelectedFont(e.target.value)}
                          >
                            {availableFonts.map((font) => (
                              <option key={font} value={font}>{font}</option>
                            ))}
                          </Select>
                        </FormControl>

                        <FormControl>
                          <FormLabel>Font Size</FormLabel>
                          <Select
                            value={fontSize}
                            onChange={(e) => setFontSize(e.target.value)}
                          >
                            <option value="xs">Extra Small</option>
                            <option value="sm">Small</option>
                            <option value="md">Medium</option>
                            <option value="lg">Large</option>
                            <option value="xl">Extra Large</option>
                          </Select>
                        </FormControl>

                        <FormControl>
                          <FormLabel>App Name</FormLabel>
                          <Input
                            value={appName}
                            onChange={(e) => setAppName(e.target.value)}
                            placeholder="Enter custom app name"
                          />
                        </FormControl>
                        
                        <FormControl display="flex" alignItems="center">
                          <FormLabel mb="0">Stream Responses</FormLabel>
                          <Switch colorScheme="blue" />
                        </FormControl>
                      </VStack>
                    </TabPanel>

                    <TabPanel>
                      <VStack spacing={4} align="stretch">
                        <Text fontWeight="bold">Custom Theme Colors</Text>
                        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                          <GridItem>
                            <FormControl>
                              <FormLabel>Background (Dark)</FormLabel>
                              <Input
                                type="color"
                                value={customTheme.bgDark}
                                onChange={(e) => setCustomTheme(prev => ({
                                  ...prev,
                                  bgDark: e.target.value
                                }))}
                              />
                            </FormControl>
                          </GridItem>
                          <GridItem>
                            <FormControl>
                              <FormLabel>Background (Light)</FormLabel>
                              <Input
                                type="color"
                                value={customTheme.bgLight}
                                onChange={(e) => setCustomTheme(prev => ({
                                  ...prev,
                                  bgLight: e.target.value
                                }))}
                              />
                            </FormControl>
                          </GridItem>
                          <GridItem>
                            <FormControl>
                              <FormLabel>Accent (Dark)</FormLabel>
                              <Input
                                type="color"
                                value={customTheme.accentDark}
                                onChange={(e) => setCustomTheme(prev => ({
                                  ...prev,
                                  accentDark: e.target.value
                                }))}
                              />
                            </FormControl>
                          </GridItem>
                          <GridItem>
                            <FormControl>
                              <FormLabel>Accent (Light)</FormLabel>
                              <Input
                                type="color"
                                value={customTheme.accentLight}
                                onChange={(e) => setCustomTheme(prev => ({
                                  ...prev,
                                  accentLight: e.target.value
                                }))}
                              />
                            </FormControl>
                          </GridItem>
                        </Grid>
                        <Button onClick={applyCustomTheme} colorScheme="blue">
                          Apply Custom Theme
                        </Button>
                      </VStack>
                    </TabPanel>

                    <TabPanel>
                      <VStack spacing={4} align="stretch">
                        <Flex justify="space-between" align="center">
                          <Heading size="md">Model Personas</Heading>
                          <Button
                            colorScheme="blue"
                            onClick={() => setNewPersonaModal(true)}
                            leftIcon={<FaPlus />}
                          >
                            Create Persona
                          </Button>
                        </Flex>
                        
                        {modelPersonas.length > 0 ? (
                          <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={4}>
                            {modelPersonas.map((persona, index) => (
                              <Card key={index} variant="outline">
                                <CardBody>
                                  <VStack align="stretch" spacing={2}>
                                    <Heading size="sm">{persona.name}</Heading>
                                    <Text fontSize="sm" color="gray.500">Based on {persona.baseModel}</Text>
                                    <Text fontSize="xs" noOfLines={2}>{persona.systemPrompt}</Text>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      colorScheme={selectedPersona?.name === persona.name ? 'green' : 'blue'}
                                      onClick={() => {
                                        if (selectedPersona?.name === persona.name) {
                                          setSelectedPersona(null)
                                        } else {
                                          setSelectedPersona(persona)
                                          setModel(persona.baseModel)
                                        }
                                      }}
                                    >
                                      {selectedPersona?.name === persona.name ? 'Active' : 'Use This Persona'}
                                    </Button>
                                    <IconButton
                                      aria-label="Remove file"
                                      icon={<FaTimes />}
                                      size="xs"
                                      variant="ghost"
                                      onClick={() => removeFile(index)}
                                    />
                                  </VStack>
                                </CardBody>
                              </Card>
                            ))}
                          </Grid>
                        ) : (
                          <Text color="gray.500">No personas created yet. Create one to give models different personalities!</Text>
                        )}
                      </VStack>
                    </TabPanel>

                    <TabPanel>
                      <VStack spacing={4} align="stretch">
                        <Text fontSize="lg" fontWeight="bold">
                          About {appName}
                        </Text>
                        <Text>
                          A modern web interface for Ollama, bringing the power of local AI models
                          to your browser with a beautiful and intuitive interface.
                        </Text>
                        <Link
                          href="https://github.com/yourusername/ollama8web"
                          isExternal
                          display="flex"
                          alignItems="center"
                          gap={2}
                        >
                          <FaGithub /> View on GitHub
                        </Link>
                        <Divider />
                        <Text fontSize="sm" color="gray.500">
                          Version 1.0.0
                        </Text>
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </ModalBody>
            </ModalContent>
          </Modal>

          <Modal isOpen={newPersonaModal} onClose={() => setNewPersonaModal(false)} size="xl">
            <ModalOverlay backdropFilter="blur(10px)" />
            <ModalContent>
              <ModalHeader>Create New Model Persona</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Base Model</FormLabel>
                    <Select
                      value={newPersona.baseModel}
                      onChange={(e) => setNewPersona(prev => ({ ...prev, baseModel: e.target.value }))}
                      placeholder="Select base model"
                    >
                      {models.map((m) => (
                        <option key={m.name} value={m.name}>{m.name}</option>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Persona Name</FormLabel>
                    <Input
                      value={newPersona.name}
                      onChange={(e) => setNewPersona(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Friendly Jeff, Pirate Assistant"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>System Prompt</FormLabel>
                    <Textarea
                      value={newPersona.systemPrompt}
                      onChange={(e) => setNewPersona(prev => ({ ...prev, systemPrompt: e.target.value }))}
                      placeholder="You are a friendly assistant named Jeff who speaks casually and uses emojis..."
                      minH="150px"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Description (Optional)</FormLabel>
                    <Input
                      value={newPersona.description || ''}
                      onChange={(e) => setNewPersona(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="A brief description of this persona"
                    />
                  </FormControl>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={() => setNewPersonaModal(false)}>
                  Cancel
                </Button>
                <Button colorScheme="blue" onClick={handleCreatePersona}>
                  Create Persona
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </VStack>
      </Container>
    </>
  )
} 