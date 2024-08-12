'use client'
import { Box, Button, Stack, TextField } from "@mui/material";

import Image from "next/image";
import { useState } from "react";

export default function Home() {
 const [messages, setMessages]= useState([
  {
  role: 'assistant',
  content: `Hi I'm the Headstarter Support Agent, how can I assist you today?`,
  }
])
  const [message,setMessage]= useState('')

  const sendMessage = async () => {
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
  


  return(
  <Box 
  width={"100vw"} 
  height={"100vh"} 
  display={"flex"} 
  flexDirection={"column"}
  justifyContent={"center"}
  alignItems={"center"}
  bgcolor={"#f5f5f5"} // Background color for the whole page
  >
    <Stack
     direction={"column"}
     width={"600px"}
     height={"700px"}
     border={"1px solid black"}
     p={2}
     spacing={3}
     bgcolor={"#fff"} // Background color for the chat container
    >
      <Stack
        direction={"column"}
        spacing={2}
        flexGrow={1}
        overflow={"auto"}
        maxHeight={"100%"}
      >
        {messages.map((message,index)=>(
            <Box key = {index} display={'flex'} justifyContent={
              message.role=== 'assistant' ? 'flex-start' : 'flex-end'
            }
            >
              <Box bgcolor={
                message.role === 'assistant'
                  ?'primary.main'
                  : 'secondary.main'
              }
              color={"white"}
              borderRadius={16}
              p={3}
              >
                {message.content}
              </Box>
            </Box>
          ))}
      </Stack>
          <Stack direction={"row"} spacing={2}>
            <TextField 
              label= "Enter a message"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              InputProps={{
                style: {
                  backgroundColor: '#fff', // Background color for the input field
                },
              }}
            />
            <Button variant="contained" onClick={sendMessage}>Send</Button>
          
          </Stack>
    </Stack>
  </Box>
)}