import React from 'react';

import type { MotivationSession } from '../types.ts';
import {
  IconChevronRight,
  IconDraft,
  IconHistory,
  IconSave,
  IconTrash,
} from './Icons';

interface HistoryPanelProps {
  sessions: MotivationSession[];
  activeSessionId: string;
  onCreateDraft: () => void;
  onSelect: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
}

const formatDate = (value: string) => {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return value;
  }
};

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  sessions,
  activeSessionId,
  onCreateDraft,
  onSelect,
  onDelete,
}) => {
  return (
    <aside className="rounded-[32px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
            Library
          </p>
          <h2 className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
            <IconHistory size={18} />
            Saved sessions
          </h2>
        </div>
        <button
          type="button"
          onClick={onCreateDraft}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200 transition hover:border-white/20 hover:bg-white/10"
        >
          <IconDraft size={14} />
          New
        </button>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-400">
        Local-first history. Sessions stay in this browser until you delete them.
      </p>

      <div className="mt-6 space-y-3">
        {sessions.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-white/10 bg-black/10 p-4 text-sm leading-6 text-slate-400">
            No saved sessions yet. Generate one, tune it, then save it here.
          </div>
        ) : (
          sessions.map((session) => {
            const isActive = session.id === activeSessionId;

            return (
              <div
                key={session.id}
                className={`rounded-[24px] border p-4 transition ${
                  isActive
                    ? 'border-cyan-300/60 bg-cyan-300/10'
                    : 'border-white/8 bg-black/10 hover:border-white/15 hover:bg-white/[0.03]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(session.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        <IconSave size={13} />
                        Saved
                      </div>
                      <h3 className="mt-2 text-sm font-semibold leading-5 text-white">
                        {session.topic || 'Untitled session'}
                      </h3>
                      <p className="mt-2 text-xs text-slate-400">
                        {formatDate(session.updatedAt)}
                      </p>
                    </div>
                    <IconChevronRight
                      size={16}
                      className={isActive ? 'text-cyan-200' : 'text-slate-500'}
                    />
                  </div>
                </button>

                <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-400">
                  <span>
                    {session.doItems.length + session.beItems.length + session.feelItems.length} insight
                    {session.doItems.length + session.beItems.length + session.feelItems.length === 1
                      ? ''
                      : 's'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onDelete(session.id)}
                    className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 font-semibold uppercase tracking-[0.16em] transition hover:border-rose-300/30 hover:bg-rose-400/10 hover:text-rose-200"
                  >
                    <IconTrash size={12} />
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
