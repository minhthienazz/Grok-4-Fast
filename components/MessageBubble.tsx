
import React, { useState, useEffect } from 'react';
import { Message, Role } from '../types';

interface MessageBubbleProps {
  message: Message;
  isLoading?: boolean;
  editingMessageId?: string | null;
  setEditingMessageId?: (id: string | null) => void;
  onSaveEdit?: (messageId: string, newContent: string) => void;
}

const TRUNCATE_LENGTH = 300;

const LoadingDots: React.FC = () => (
  <div className="flex items-center space-x-1">
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
  </div>
);

const AIAvatar: React.FC = () => (
    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 shadow-md">
       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
       </svg>
    </div>
);

const MessageContent: React.FC<{ content: string }> = ({ content }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongMessage = content.length > TRUNCATE_LENGTH;

  if (!isLongMessage) {
    return <p className="whitespace-pre-wrap">{content}</p>;
  }

  return (
    <div>
      <p className="whitespace-pre-wrap">
        {isExpanded ? content : `${content.substring(0, TRUNCATE_LENGTH)}...`}
      </p>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-blue-400 hover:underline text-sm mt-2 font-semibold"
      >
        {isExpanded ? 'Show less' : 'Read more'}
      </button>
    </div>
  );
};

const ActionButton: React.FC<{ onClick: () => void, children: React.ReactNode, ariaLabel: string }> = ({ onClick, children, ariaLabel }) => (
    <button onClick={onClick} aria-label={ariaLabel} className="p-1.5 rounded-full text-gray-400 hover:bg-gray-600 hover:text-gray-200 transition-colors">
        {children}
    </button>
);


const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isLoading = false, editingMessageId, setEditingMessageId, onSaveEdit }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [editText, setEditText] = useState(message.content);
  
  const isUser = message.role === Role.USER;
  const isEditing = editingMessageId === message.id;

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
        alert("Sorry, your browser doesn't support text-to-speech.");
        return;
    }
    
    if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
    }

    const utterance = new SpeechSynthesisUtterance(message.content);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const handleSave = () => {
      if (onSaveEdit) {
          onSaveEdit(message.id, editText);
      }
  };

  const handleCancel = () => {
      if (setEditingMessageId) {
          setEditingMessageId(null);
          setEditText(message.content);
      }
  };
  
  useEffect(() => {
    return () => {
      if(isSpeaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSpeaking]);

  const bubbleClasses = isUser
    ? 'bg-blue-600 text-white rounded-br-none'
    : 'bg-gray-700 text-gray-200 rounded-bl-none';
  
  const containerClasses = `flex items-start gap-3 group relative ${isUser ? 'justify-end' : 'justify-start'}`;

  if (isEditing) {
    return (
      <div className='flex justify-end w-full'>
          <div className="w-full max-w-lg">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full p-2 rounded-lg bg-gray-800 border border-gray-600 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={Math.max(3, editText.split('\n').length)}
                autoFocus
              />
              <div className="flex justify-end gap-2 mt-2">
                  <button onClick={handleCancel} className="px-3 py-1 text-sm font-semibold rounded-md bg-gray-600 hover:bg-gray-500 transition-colors">Cancel</button>
                  <button onClick={handleSave} className="px-3 py-1 text-sm font-semibold rounded-md bg-blue-600 hover:bg-blue-500 transition-colors">Save</button>
              </div>
          </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
       {!isUser && <AIAvatar />}
      <div className={`max-w-lg px-4 py-3 rounded-xl shadow-md transition-all duration-300 ${bubbleClasses}`}>
        {isLoading ? <LoadingDots /> : <MessageContent content={message.content} />}
      </div>
      {!isLoading && message.content && (
        <div className={`absolute bottom-0 mb-1 flex items-center gap-0.5 p-1 rounded-full bg-gray-800 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isUser ? 'left-0 -translate-x-full mr-2' : 'right-0 translate-x-full ml-2'}`}>
            <ActionButton onClick={() => setIsLiked(!isLiked)} ariaLabel={isLiked ? 'Unlike message' : 'Like message'}>
                {isLiked ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                )}
            </ActionButton>
            {isUser && setEditingMessageId && (
                <ActionButton onClick={() => setEditingMessageId(message.id)} ariaLabel="Edit message">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                </ActionButton>
            )}
            {!isUser && (
                <ActionButton onClick={handleSpeak} ariaLabel={isSpeaking ? 'Stop speaking' : 'Read message aloud'}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-colors ${isSpeaking ? 'text-blue-400' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </ActionButton>
            )}
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
