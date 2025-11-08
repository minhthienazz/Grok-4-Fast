import React from 'react';
import type { Note } from '../types';
import { formatDate } from '../utils/formatting';

interface NoteListProps {
  notes: Note[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

const NoteList: React.FC<NoteListProps> = ({
  notes,
  activeId,
  onSelect,
  onTogglePin,
  onDelete,
  onDuplicate,
}) => {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center text-sm text-slate-400/80 border border-dashed border-slate-700/70 rounded-2xl px-6 py-12 gap-3">
        <span className="text-3xl">🗒️</span>
        <p>
          Chưa có ghi chú nào. Bấm <span className="font-medium text-slate-200">+</span> để bắt đầu!
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {notes.map((note) => {
        const isActive = note.id === activeId;
        const tags = note.tags.slice(0, 3);
        const hasMoreTags = note.tags.length > tags.length;

        return (
          <li key={note.id}>
            <button
              type="button"
              onClick={() => onSelect(note.id)}
              className={`w-full text-left group rounded-2xl border transition p-4 ${
                isActive
                  ? 'border-sky-500/80 bg-slate-900/80 shadow-lg shadow-sky-900/30'
                  : 'border-transparent bg-slate-950/40 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-100 truncate">
                      {note.title || 'Không tiêu đề'}
                    </p>
                    {note.isPinned && (
                      <span className="text-amber-300 text-xs font-medium">ĐÃ GHIM</span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {note.content ? note.content : 'Gõ nội dung để khởi đầu một ý tưởng...'}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-slate-500/80">
                    {formatDate(note.updatedAt)}
                  </span>
                  <div className="flex gap-1">
                    <IconButton
                      label={note.isPinned ? 'Bỏ ghim' : 'Ghim ghi chú'}
                      onClick={(event) => {
                        event.stopPropagation();
                        onTogglePin(note.id);
                      }}
                    >
                      {note.isPinned ? '📌' : '📍'}
                    </IconButton>
                    <IconButton
                      label="Nhân bản ghi chú"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDuplicate(note.id);
                      }}
                    >
                      🪄
                    </IconButton>
                    <IconButton
                      label="Xoá ghi chú"
                      onClick={(event) => {
                        event.stopPropagation();
                        if (confirm('Bạn có chắc muốn xoá ghi chú này?')) {
                          onDelete(note.id);
                        }
                      }}
                    >
                      🗑️
                    </IconButton>
                  </div>
                </div>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] uppercase tracking-widest bg-slate-800/70 text-slate-300 px-2 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                  {hasMoreTags && (
                    <span className="text-[10px] text-slate-500">+{note.tags.length - tags.length} nữa</span>
                  )}
                </div>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
};

interface IconButtonProps {
  label: string;
  children: React.ReactNode;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const IconButton: React.FC<IconButtonProps> = ({ label, children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-8 h-8 rounded-xl bg-slate-900/70 hover:bg-slate-800/70 flex items-center justify-center text-lg transition"
    title={label}
    aria-label={label}
  >
    {children}
  </button>
);

export default NoteList;
