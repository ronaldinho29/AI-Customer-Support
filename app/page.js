'use client'; // Add this at the top of your file
import { useState } from 'react';
import { Box, Button, Stack, TextField, IconButton } from '@mui/material';
import Image from 'next/image';
import CloseIcon from '@mui/icons-material/Close'; // Import CloseIcon for the close button

const chatIconSrc = '/images.png';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Welcome to BudgetBot! I'm here to assist you with managing your budget, tracking expenses, and planning your financial goals. How can I help you today? Feel free to ask me anything about your finances!`,
    }
  ]);
  const [message, setMessage] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false); // State to toggle chatbox visibility

  const sendMessage = async () => {
    if (!message.trim()) return; // Prevent sending empty messages

    setMessages(prevMessages => [
      ...prevMessages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);

    setMessage(''); // Clear the input field

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }])
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = '';

      // Track if the response is completed
      let completed = false;

      while (!completed) {
        const { done, value } = await reader.read();
        if (done) {
          completed = true;
        } else {
          result += decoder.decode(value, { stream: true });

          setMessages(prevMessages => {
            // Update the last message with the accumulated result
            const lastMessageIndex = prevMessages.length - 1;
            const lastMessage = prevMessages[lastMessageIndex];
            return [
              ...prevMessages.slice(0, lastMessageIndex),
              {
                ...lastMessage,
                content: result, // Update with the latest result
              }
            ];
          });
        }
      }
    } catch (error) {
      console.error('Error fetching chat response:', error);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) { // Check if Enter key is pressed without Shift
      event.preventDefault(); // Prevent default behavior of Enter key (e.g., new line)
      sendMessage(); // Call sendMessage function
    }
  };

  return (
    <Box
      width={'100vw'}
      height={'100vh'}
      display={'flex'}
      flexDirection={'column'}
      justifyContent={'center'}
      alignItems={'center'}
      sx={{
        backgroundImage: 'url(/Budget.png)', // Use the path relative to the public folder
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <Box
        position="absolute"
        top="12%" // Centered vertically
        left="05%" // Centered horizontally
        transform="translate(-50%, -50%)"
        textAlign="center" // Center text horizontally
        fontSize="5rem" // Increase font size for a bigger text
        fontWeight="bold"
        color="white"
        zIndex="1" // Ensure the text is above other elements
      >
        BudgetBot
      </Box>
      {isChatOpen && (
        <Stack
          direction={'column'}
          width={'500px'} // Adjusted width
          height={'800px'} // Adjusted height
          border={'1px solid black'}
          p={2}
          spacing={3}
          bgcolor={'#fff'} // Background color for the chat container
          position={'fixed'} // Fixed positioning
          bottom={16}
          right={16} // Positioned to the right side
          zIndex={1000} // Ensure chatbox is above other elements
        >
          <Stack
            direction={'row'}
            justifyContent={'flex-end'}
            spacing={1}
          >
            <IconButton onClick={() => setIsChatOpen(false)} color="primary">
              <CloseIcon />
            </IconButton>
          </Stack>
          <Stack
            direction={'column'}
            spacing={2}
            flexGrow={1}
            overflow={'auto'}
            maxHeight={'100%'}
          >
            {messages.map((message, index) => (
              <Box key={index} display={'flex'} justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }>
                <Box bgcolor={
                  message.role === 'assistant'
                    ? 'primary.main'
                    : 'secondary.main'
                }
                  color={'white'}
                  borderRadius={16}
                  p={3}
                >
                  {message.content}
                </Box>
              </Box>
            ))}
          </Stack>
          <Stack direction={'row'} spacing={2} position={'relative'} bottom={0} left={0} right={0} p={2}>
            <TextField
              label="Enter a message"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown} // Add keydown event handler
              InputProps={{
                style: {
                  backgroundColor: '#fff', // Background color for the input field
                },
              }}
            />
            <Button variant="contained" onClick={sendMessage}>Send</Button>
          </Stack>
        </Stack>
      )}
      <Box
        position={'fixed'}
        bottom={16}
        right={16}
        bgcolor={'#0071ff'}
        borderRadius={'50%'}
        p={2}
        boxShadow={'0 4px 8px rgba(0, 0, 0, 0.2)'}
        cursor={'pointer'}
        onClick={() => setIsChatOpen(!isChatOpen)} // Toggle chatbox visibility
      >
        <Image src={chatIconSrc} alt="Chat Icon" width={40} height={40} />
      </Box>
    </Box>
  );
}
