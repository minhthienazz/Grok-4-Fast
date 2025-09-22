
import React, { useState, useEffect, useRef } from 'react';
import { Message, Role } from '../types';
import { sendMessageToAI } from '../services/geminiService';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial-1',
      role: Role.MODEL,
      content: "Hello! I'm Grok 4 Fast AI. How can I assist you today? I can also generate very long responses to test the new collapsible text feature. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue. Ut in risus volutpat libero pharetra tempor. Cras vestibulum bibendum augue. Praesent egestas leo in pede. Praesent blandit odio eu enim. Pellentesque sed dui ut augue blandit sodales. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aliquam nibh. Mauris ac mauris sed pede pellentesque fermentum. Maecenas adipiscing ante non diam. Proin sed quam. Sed vitae eros ut sapien dictum condimentum.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (userInput: string) => {
    if (!userInput.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: Role.USER,
      content: userInput,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const aiResponse = await sendMessageToAI(userInput);
      const modelMessage: Message = {
        id: `model-${Date.now()}`,
        role: Role.MODEL,
        content: aiResponse,
      };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
       const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: Role.MODEL,
        content: "Sorry, I encountered an error. Please check your API key or try again later.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveEdit = async (messageId: string, newContent: string) => {
    const messageIndex = messages.findIndex((msg) => msg.id === messageId);
    if (messageIndex === -1 || !newContent.trim()) {
      setEditingMessageId(null);
      return;
    }

    const updatedMessages = messages.slice(0, messageIndex + 1).map((msg, index) =>
        index === messageIndex ? { ...msg, content: newContent } : msg
    );
    
    setMessages(updatedMessages);
    setEditingMessageId(null);
    setIsLoading(true);

    try {
      const aiResponse = await sendMessageToAI(newContent);
      const modelMessage: Message = {
        id: `model-${Date.now()}`,
        role: Role.MODEL,
        content: aiResponse,
      };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: Role.MODEL,
        content: "Sorry, I encountered an error while regenerating the response.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex flex-col flex-grow h-full max-w-5xl mx-auto w-full bg-gray-900/30 rounded-lg shadow-2xl overflow-hidden">
      <div className="flex-grow p-4 space-y-4 overflow-y-auto">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            editingMessageId={editingMessageId}
            setEditingMessageId={setEditingMessageId}
            onSaveEdit={handleSaveEdit}
          />
        ))}
        {isLoading && (
           <MessageBubble message={{ id: 'loading', role: Role.MODEL, content: '' }} isLoading={true} />
        )}
        <div ref={chatEndRef} />
      </div>
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading || !!editingMessageId} />
    </div>
  );
};

export default ChatWindow;
