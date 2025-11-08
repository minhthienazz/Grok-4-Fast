import React, { useEffect, useMemo, useState } from 'react';
import type { Note } from '../types';
import { formatDateTime, formatWordCount } from '../utils/formatting';

interface NoteEditorProps {
  note: Note | null;
  onChange: (id: string, changes: Partial<Note>) => void;
  onCreateNote: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onChange, onCreateNote }) => {
  const [tagsDraft, setTagsDraft] = useState('');
  const [isCopying, setIsCopying] = useState(false);

  useEffect(() => {
    setTagsDraft(note ? note.tags.join(', ') : '');
  }, [note?.id]);

  const handleTagsCommit = () => {
    if (!note) {
      return;
    }
    const tags = tagsDraft
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
      .map((tag) => tag.replace(/^#+/, '').replace(/\s+/g, '-').toLowerCase());
    onChange(note.id, { tags });
  };

  const handleCopy = async () => {
    if (!note || typeof navigator === 'undefined' || !navigator.clipboard) {
      return;
    }
    const summary = [
      `# ${note.title || 'Không tiêu đề'}`,
      '',
      note.content,
      '',
      note.tags.length ? `Thẻ: ${note.tags.map((tag) => `#${tag}`).join(' ')}` : '',
      `Cập nhật: ${formatDateTime(note.updatedAt)}`,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      setIsCopying(true);
      await navigator.clipboard.writeText(summary);
      setTimeout(() => setIsCopying(false), 1200);
    } catch (error) {
      console.warn('Không thể sao chép ghi chú:', error);
      setIsCopying(false);
    }
  };

  const stats = useMemo(() => {
    if (!note) {
      return {
        words: 0,
        characters: 0,
      };
    }
    const characters = note.content.length;
    const words = note.content.trim() ? note.content.trim().split(/\s+/).length : 0;
    return { characters, words };
  }, [note?.content]);

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center text-center flex-1 gap-4 text-slate-400/90">
        <span className="text-4xl">✨</span>
        <div className="max-w-sm space-y-2">
          <p className="text-lg font-semibold text-slate-200">Hãy bắt đầu một ý tưởng</p>
          <p className="text-sm">
            Tạo ghi chú mới để lưu lại những điều bạn đang suy nghĩ. Mỗi ghi chú sẽ tự động lưu, giúp bạn hoàn toàn tập trung.
          </p>
        </div>
        <button
          onClick={onCreateNote}
          className="bg-sky-500/90 hover:bg-sky-400 text-slate-950 font-semibold rounded-full px-5 py-2 transition"
        >
          Tạo ghi chú mới
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <input
            value={note.title}
            onChange={(event) => onChange(note.id, { title: event.target.value })}
            placeholder="Tiêu đề ghi chú"
            className="bg-transparent text-2xl sm:text-3xl font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/60 rounded-xl px-2"
          />
          <p className="text-xs uppercase tracking-widest text-slate-400/80">
            Cập nhật {formatDateTime(note.updatedAt)} • {formatWordCount(stats.words, stats.characters)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopy}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              isCopying
                ? 'bg-emerald-400/80 text-emerald-950'
                : 'bg-slate-800/70 hover:bg-slate-700/60 text-slate-200'
            }`}
          >
            {isCopying ? 'Đã sao chép!' : 'Sao chép nhanh'}
          </button>
          <button
            onClick={() => onChange(note.id, { isPinned: !note.isPinned })}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              note.isPinned
                ? 'bg-amber-300/90 text-amber-900'
                : 'bg-slate-800/70 hover:bg-slate-700/60 text-slate-200'
            }`}
          >
            {note.isPinned ? 'Bỏ ghim' : 'Ghim ghi chú' }
          </button>
        </div>
      </header>

      <div className="mt-6 flex flex-col gap-6 flex-1">
        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-slate-400/80">
            Thẻ & chủ đề
          </label>
          <input
            value={tagsDraft}
            onChange={(event) => setTagsDraft(event.target.value)}
            onBlur={handleTagsCommit}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleTagsCommit();
              }
            }}
            placeholder="Ví dụ: thiết kế, kế-hoạch, đọc-sách"
            className="mt-2 w-full bg-slate-950/50 border border-slate-800/60 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/60"
          />
        </div>

        <div className="flex-1 relative">
          <textarea
            value={note.content}
            onChange={(event) => onChange(note.id, { content: event.target.value })}
            placeholder="Hãy viết ra những ý tưởng, suy nghĩ hay kế hoạch của bạn..."
            className="w-full h-full min-h-[18rem] resize-none bg-slate-950/30 border border-slate-800/60 rounded-3xl px-5 py-5 text-sm sm:text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/60"
          />
        </div>

        {note.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
            {note.tags.map((tag) => (
              <span key={tag} className="bg-slate-800/70 px-3 py-1 rounded-full uppercase tracking-widest">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteEditor;
