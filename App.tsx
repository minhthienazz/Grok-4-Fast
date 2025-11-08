import React from 'react';
import NoteWorkspace from './components/NoteWorkspace';

const App: React.FC = () => {
  return (
    <div className="bg-[#0f172a] text-slate-100 min-h-screen flex flex-col antialiased">
      <Header />
      <main className="flex-grow flex flex-col p-4 sm:p-6 md:p-8">
        <NoteWorkspace />
      </main>
      <Footer />
    </div>
  );
};

const Header: React.FC = () => (
  <header className="bg-slate-900/80 backdrop-blur border-b border-slate-700/60 sticky top-0 z-10">
    <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center sm:justify-between">
      <div>
        <p className="uppercase tracking-[0.4em] text-xs text-slate-400 font-semibold">Ghi chú thông minh</p>
        <h1 className="text-2xl sm:text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-300">
          Sổ Tay Ý Tưởng
        </h1>
      </div>
      <p className="text-sm sm:text-base text-slate-300/80 max-w-md">
        Thu thập, tổ chức và làm mới mọi ý tưởng trong một không gian tập trung và tinh gọn.
      </p>
    </div>
  </header>
);

const Footer: React.FC = () => (
  <footer className="border-t border-slate-800/80 bg-slate-950/60">
    <div className="max-w-6xl mx-auto px-4 py-4 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
      <span>Được chế tác để truyền cảm hứng mỗi ngày.</span>
      <span className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden />
        Tự động lưu trữ vào thiết bị của bạn
      </span>
    </div>
  </footer>
);

export default App;
