import React, { useEffect, useMemo, useState } from 'react';
import type { Note } from '../types';
import NoteList from './NoteList';
import NoteEditor from './NoteEditor';

const STORAGE_KEY = 'so-tay-y-tuong-notes';

type DraftableNote = Omit<Note, 'tags'> & { tags: string[] };

const createEmptyNote = (): DraftableNote => ({
  id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `note-${Math.random().toString(36).slice(2, 10)}`,
  title: 'Ghi chú mới',
  content: '',
  tags: [],
  isPinned: false,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

const parseStoredNotes = (rawValue: string | null): DraftableNote[] => {
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((candidate) => ({
        ...createEmptyNote(),
        ...candidate,
        tags: Array.isArray(candidate?.tags)
          ? (candidate.tags as string[]).filter((tag) => typeof tag === 'string')
          : [],
      }))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (error) {
    console.warn('Không thể đọc dữ liệu ghi chú từ bộ nhớ:', error);
    return [];
  }
};

const NoteWorkspace: React.FC = () => {
  const [notes, setNotes] = useState<DraftableNote[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }
    return parseStoredNotes(window.localStorage.getItem(STORAGE_KEY));
  });
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(() =>
    notes.length > 0 ? notes[0].id : null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    if (notes.length === 0) {
      setSelectedNoteId(null);
      return;
    }

    if (!selectedNoteId || !notes.some((note) => note.id === selectedNoteId)) {
      setSelectedNoteId(notes[0].id);
    }
  }, [notes, selectedNoteId]);

  const filteredNotes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return notes
      .filter((note) => {
        if (showPinnedOnly && !note.isPinned) {
          return false;
        }
        if (!query) {
          return true;
        }
        const haystack = [note.title, note.content, note.tags.join(' ')].join(' ').toLowerCase();
        return haystack.includes(query);
      })
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) {
          return a.isPinned ? -1 : 1;
        }
        return b.updatedAt - a.updatedAt;
      });
  }, [notes, searchQuery, showPinnedOnly]);

  const activeNote = selectedNoteId
    ? notes.find((note) => note.id === selectedNoteId) ?? null
    : null;

  const handleCreateNote = () => {
    const newNote = createEmptyNote();
    setNotes((previous) => [newNote, ...previous]);
    setSelectedNoteId(newNote.id);
  };

  const handleUpdateNote = (id: string, changes: Partial<Note>) => {
    setNotes((previous) => {
      const updated = previous.map((note) =>
        note.id === id
          ? {
              ...note,
              ...changes,
              tags: Array.isArray(changes.tags)
                ? (changes.tags as string[])
                : note.tags,
              updatedAt: Date.now(),
            }
          : note
      );

      return updated.sort((a, b) => {
        if (a.isPinned !== b.isPinned) {
          return a.isPinned ? -1 : 1;
        }
        return b.updatedAt - a.updatedAt;
      });
    });
  };

  const handleDeleteNote = (id: string) => {
    setNotes((previous) => previous.filter((note) => note.id !== id));
  };

  const handleTogglePin = (id: string) => {
    setNotes((previous) =>
      previous
        .map((note) =>
          note.id === id
            ? {
                ...note,
                isPinned: !note.isPinned,
                updatedAt: Date.now(),
              }
            : note
        )
        .sort((a, b) => {
          if (a.isPinned !== b.isPinned) {
            return a.isPinned ? -1 : 1;
          }
          return b.updatedAt - a.updatedAt;
        })
    );
  };

  const handleDuplicate = (id: string) => {
    setNotes((previous) => {
      const noteToDuplicate = previous.find((note) => note.id === id);
      if (!noteToDuplicate) {
        return previous;
      }
      const duplicated: DraftableNote = {
        ...noteToDuplicate,
        id: createEmptyNote().id,
        title: `${noteToDuplicate.title} (bản sao)`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isPinned: false,
      };
      return [duplicated, ...previous];
    });
  };

  const totalPinned = useMemo(
    () => notes.reduce((count, note) => (note.isPinned ? count + 1 : count), 0),
    [notes]
  );

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8 max-w-6xl mx-auto w-full">
      <aside className="lg:w-80 xl:w-96 bg-slate-900/50 border border-slate-800/60 rounded-2xl p-4 flex flex-col h-[32rem]">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm kiếm ghi chú, thẻ hoặc nội dung..."
              className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/60 focus:border-sky-400/60 transition"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500/80">⌘K</span>
          </div>
          <button
            onClick={handleCreateNote}
            className="bg-sky-500/90 hover:bg-sky-400 text-slate-950 font-semibold rounded-xl px-4 py-2 transition"
          >
            +
          </button>
        </div>
        <div className="flex items-center justify-between mt-4 text-xs text-slate-400 uppercase tracking-widest">
          <span>{filteredNotes.length} ghi chú</span>
          <button
            onClick={() => setShowPinnedOnly((previous) => !previous)}
            className={`transition ${showPinnedOnly ? 'text-sky-300' : 'hover:text-slate-200/80'}`}
          >
            {showPinnedOnly ? 'Đang xem ghim' : `${totalPinned} đã ghim`}
          </button>
        </div>
        <div className="mt-4 flex-1 overflow-y-auto pr-1">
          <NoteList
            notes={filteredNotes}
            activeId={selectedNoteId}
            onSelect={setSelectedNoteId}
            onTogglePin={handleTogglePin}
            onDelete={handleDeleteNote}
            onDuplicate={handleDuplicate}
          />
        </div>
      </aside>

      <section className="flex-1 bg-slate-900/40 border border-slate-800/60 rounded-3xl p-5 lg:p-8 min-h-[32rem] flex flex-col">
        <NoteEditor
          note={activeNote}
          onChange={handleUpdateNote}
          onCreateNote={handleCreateNote}
        />
      </section>
    </div>
  );
};

export default NoteWorkspace;
