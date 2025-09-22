
import React from 'react';
import ChatWindow from './components/ChatWindow';

const App: React.FC = () => {
  return (
    <div className="bg-[#111317] text-gray-200 min-h-screen flex flex-col antialiased">
      <Header />
      <main className="flex-grow flex flex-col p-2 sm:p-4 md:p-6 overflow-hidden">
        <ChatWindow />
      </main>
    </div>
  );
};

const Header: React.FC = () => (
  <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/50 p-4 sticky top-0 z-10">
    <div className="max-w-5xl mx-auto">
      <h1 className="text-xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
        Grok 4 Fast AI
      </h1>
    </div>
  </header>
);

export default App;
