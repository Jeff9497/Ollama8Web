import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
}

// Custom theme variants
const themeVariants = {
  default: {
    dark: {
      bg: 'gray.800',
      secondaryBg: 'gray.700',
      accent: 'blue.500',
      gradient: 'linear-gradient(180deg, gray.900 0%, gray.800 100%)',
    },
    light: {
      bg: 'gray.50',
      secondaryBg: 'white',
      accent: 'blue.500',
      gradient: 'linear-gradient(180deg, white 0%, gray.50 100%)',
    }
  },
  gradientBlue: {
    dark: {
      bg: 'linear-gradient(135deg, #1a365d 0%, #2a4365 50%, #1a365d 100%)',
      secondaryBg: 'rgba(26, 54, 93, 0.7)',
      accent: '#63B3ED',
      gradient: 'linear-gradient(180deg, #1a365d 0%, #2a4365 100%)',
    },
    light: {
      bg: 'linear-gradient(135deg, #ebf8ff 0%, #bee3f8 50%, #ebf8ff 100%)',
      secondaryBg: 'rgba(255, 255, 255, 0.9)',
      accent: '#3182CE',
      gradient: 'linear-gradient(180deg, #ebf8ff 0%, #bee3f8 100%)',
    }
  },
  metallicBlue: {
    dark: {
      bg: 'linear-gradient(135deg, #1E293B 0%, #334155 50%, #1E293B 100%)',
      secondaryBg: 'rgba(30, 41, 59, 0.8)',
      accent: '#60A5FA',
      gradient: 'linear-gradient(180deg, #1E293B 0%, #334155 100%)',
    },
    light: {
      bg: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 50%, #F8FAFC 100%)',
      secondaryBg: 'rgba(248, 250, 252, 0.9)',
      accent: '#3B82F6',
      gradient: 'linear-gradient(180deg, #F8FAFC 0%, #E2E8F0 100%)',
    }
  },
  oceanBlue: {
    dark: {
      bg: 'linear-gradient(135deg, #00334e 0%, #145374 50%, #00334e 100%)',
      secondaryBg: 'rgba(0, 51, 78, 0.7)',
      accent: '#38B2AC',
      gradient: 'linear-gradient(180deg, #00334e 0%, #145374 100%)',
    },
    light: {
      bg: 'linear-gradient(135deg, #e3f2fd 0%, #90caf9 50%, #e3f2fd 100%)',
      secondaryBg: 'rgba(255, 255, 255, 0.9)',
      accent: '#319795',
      gradient: 'linear-gradient(180deg, #e3f2fd 0%, #90caf9 100%)',
    }
  },
  custom: {
    dark: {
      bg: 'var(--custom-bg-dark, #1A202C)',
      secondaryBg: 'var(--custom-secondary-bg-dark, rgba(26, 32, 44, 0.8))',
      accent: 'var(--custom-accent-dark, #4299E1)',
      gradient: 'var(--custom-gradient-dark, linear-gradient(180deg, #1A202C 0%, #2D3748 100%))',
    },
    light: {
      bg: 'var(--custom-bg-light, #FFFFFF)',
      secondaryBg: 'var(--custom-secondary-bg-light, rgba(255, 255, 255, 0.9))',
      accent: 'var(--custom-accent-light, #3182CE)',
      gradient: 'var(--custom-gradient-light, linear-gradient(180deg, #FFFFFF 0%, #F7FAFC 100%))',
    }
  }
} as const

const theme = extendTheme({
  config,
  styles: {
    global: (props: any) => ({
      body: {
        bg: props.theme.activeVariant?.gradient || props.theme.activeVariant?.bg || (props.colorMode === 'dark' ? 'gray.800' : 'gray.50'),
        transition: 'all 0.3s ease-in-out',
      },
    }),
  },
  semanticTokens: {
    colors: {
      'chat.user': {
        default: 'linear-gradient(135deg, blue.500 0%, purple.500 100%)',
        _dark: 'linear-gradient(135deg, blue.600 0%, purple.600 100%)',
      },
      'chat.assistant': {
        default: 'rgba(255, 255, 255, 0.9)',
        _dark: 'rgba(45, 55, 72, 0.85)',
      },
    },
  },
  components: {
    Container: {
      baseStyle: {
        maxW: ['100%', '100%', '90%'],
        px: [4, 6, 8],
      },
    },
    Card: {
      baseStyle: {
        container: {
          backdropFilter: 'blur(8px)',
          transition: 'all 0.2s ease-in-out',
          boxShadow: 'lg',
          border: '1px solid',
          borderColor: 'transparent',
        },
      },
      variants: {
        message: (props: any) => ({
          container: {
            bg: props.isUser ? 'chat.user' : 'chat.assistant',
            color: props.isUser ? 'white' : props.colorMode === 'dark' ? 'white' : 'gray.800',
            backdropFilter: 'blur(12px)',
            borderRadius: '2xl',
            p: 2,
            position: 'relative',
            overflow: 'hidden',
            maxWidth: ['60%', '55%', '50%'],
            minWidth: '200px',
            width: 'auto',
            mx: 2,
            my: 1.5,
            transition: 'all 0.2s ease-in-out',
            boxShadow: props.isUser ? 'lg' : 'sm',
            border: '1px solid',
            borderColor: props.isUser 
              ? 'whiteAlpha.200'
              : props.colorMode === 'dark' 
                ? 'whiteAlpha.100' 
                : 'blackAlpha.100',
            _before: {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              bg: 'linear-gradient(90deg, transparent, whiteAlpha.200, transparent)',
            },
            _after: {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '1px',
              bg: 'linear-gradient(90deg, transparent, whiteAlpha.100, transparent)',
            },
            _hover: {
              transform: 'translateY(-1px)',
              boxShadow: props.isUser ? 'xl' : 'md',
            },
          },
        }),
      },
    },
    Button: {
      variants: {
        gradient: {
          bg: 'linear-gradient(135deg, blue.400 0%, purple.500 100%)',
          color: 'white',
          _hover: {
            bg: 'linear-gradient(135deg, blue.500 0%, purple.600 100%)',
            transform: 'translateY(-1px)',
          },
          _active: {
            transform: 'translateY(0)',
          },
          transition: 'all 0.2s ease-in-out',
        },
        theme: (props: any) => ({
          bg: props.theme.activeVariant?.accent || 'blue.500',
          color: 'white',
          _hover: {
            bg: props.theme.activeVariant?.accent || 'blue.600',
            transform: 'translateY(-1px)',
            boxShadow: 'lg',
          },
          _active: {
            transform: 'translateY(0)',
          },
          transition: 'all 0.2s ease-in-out',
        }),
      },
    },
    Badge: {
      baseStyle: {
        textTransform: 'none',
      },
      variants: {
        solid: (props: any) => ({
          bg: props.theme.activeVariant?.accent || 'blue.500',
          color: 'white',
        }),
      },
    },
    Spinner: {
      baseStyle: (props: any) => ({
        color: props.theme.activeVariant?.accent || 'blue.500',
        emptyColor: 'transparent',
        thickness: '3px',
      }),
    },
  },
})

export { themeVariants }
export default theme 