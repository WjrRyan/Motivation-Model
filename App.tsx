import React, { FormEvent, useEffect, useState } from 'react';

import { DiagramView } from './components/DiagramView';
import { EditPanel } from './components/EditPanel';
import { HistoryPanel } from './components/HistoryPanel';
import {
  IconArchive,
  IconBrain,
  IconEdit,
  IconMagic,
  IconRefresh,
  IconRegenerate,
  IconSave,
  IconTrash,
  IconZoomIn,
  IconZoomOut,
} from './components/Icons';
import { createBlankSession, createSeedSession, refreshSessionTimestamp } from './lib/session-utils.ts';
import {
  deleteSessionRecord,
  loadStoredSessions,
  upsertSessionRecord,
} from './lib/session-storage.ts';
import {
  GEMINI_MODEL,
  generateMotivationModel,
  regenerateSessionSection,
} from './services/geminiService';
import type { MotivationItem, MotivationSession, SessionRegenerationKey } from './types.ts';

const storageAvailable = () => typeof window !== 'undefined' && !!window.localStorage;

const compareSessions = (left: MotivationSession, right: MotivationSession) =>
  JSON.stringify(left) === JSON.stringify(right);

const formatUpdatedAt = (value: string) => {
  try {
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const renderInsightList = (title: string, accentClass: string, items: MotivationItem[]) => (
  <div className="rounded-[26px] border border-white/10 bg-black/10 p-4">
    <div className={`text-xs font-semibold uppercase tracking-[0.26em] ${accentClass}`}>{title}</div>
    <div className="mt-4 space-y-2">
      {items.length === 0 ? (
        <p className="text-sm leading-6 text-slate-500">Nothing here yet.</p>
      ) : (
        items.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2 text-sm leading-6 text-slate-100"
          >
            {item.text}
          </div>
        ))
      )}
    </div>
  </div>
);

export default function App() {
  const [savedSessions, setSavedSessions] = useState<MotivationSession[]>([]);
  const [currentSession, setCurrentSession] = useState<MotivationSession>(() =>
    createSeedSession('Build a steadier creative habit')
  );
  const [topicInput, setTopicInput] = useState('Build a steadier creative habit');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [scale, setScale] = useState(0.92);
  const [regeneratingKey, setRegeneratingKey] = useState<SessionRegenerationKey | null>(null);

  useEffect(() => {
    if (!storageAvailable()) {
      return;
    }

    const stored = loadStoredSessions(window.localStorage);
    setSavedSessions(stored);

    if (stored.length > 0) {
      setCurrentSession(stored[0]);
      setTopicInput(stored[0].sourcePrompt || stored[0].topic);
    }
  }, []);

  const savedVersion = savedSessions.find((session) => session.id === currentSession.id) ?? null;
  const isSaved = !!savedVersion;
  const isDirty = savedVersion ? !compareSessions(savedVersion, currentSession) : true;

  const generateFromPrompt = async () => {
    const prompt = topicInput.trim();
    if (!prompt) {
      setError('Add a focus area first so the coach has something to work with.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const session = await generateMotivationModel(prompt);
      setCurrentSession(session);
      setIsEditOpen(false);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Could not generate a session right now.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async (event: FormEvent) => {
    event.preventDefault();
    await generateFromPrompt();
  };

  const handleCreateDraft = () => {
    const draft = createBlankSession(topicInput.trim());
    setCurrentSession(draft);
    setError(null);
    setIsEditOpen(true);
  };

  const handleSelectSession = (sessionId: string) => {
    const next = savedSessions.find((session) => session.id === sessionId);
    if (!next) {
      return;
    }

    setCurrentSession(next);
    setTopicInput(next.sourcePrompt || next.topic);
    setError(null);
  };

  const handleSave = (mode: 'overwrite' | 'copy' = 'overwrite') => {
    if (!storageAvailable()) {
      setError('Local storage is not available in this browser.');
      return;
    }

    const sessionToSave =
      mode === 'copy'
        ? {
            ...currentSession,
            id: crypto.randomUUID(),
          }
        : currentSession;

    const nextSession = refreshSessionTimestamp(sessionToSave);
    const nextSavedSessions = upsertSessionRecord(window.localStorage, nextSession);

    setCurrentSession(nextSession);
    setSavedSessions(nextSavedSessions);
    setError(null);
  };

  const handleDelete = (sessionId: string) => {
    if (!storageAvailable()) {
      setError('Local storage is not available in this browser.');
      return;
    }

    const nextSavedSessions = deleteSessionRecord(window.localStorage, sessionId);
    setSavedSessions(nextSavedSessions);

    if (currentSession.id === sessionId) {
      const fallback = nextSavedSessions[0] ?? createBlankSession(topicInput.trim());
      setCurrentSession(fallback);
      setTopicInput(fallback.sourcePrompt || fallback.topic);
    }
  };

  const handleRegenerate = async (key: SessionRegenerationKey) => {
    setRegeneratingKey(key);
    setError(null);

    try {
      const nextSession = await regenerateSessionSection(currentSession, key);
      setCurrentSession(nextSession);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Could not refresh that section right now.'
      );
    } finally {
      setRegeneratingKey(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#050b16] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-12%] top-[-8%] h-[28rem] w-[28rem] rounded-full bg-cyan-400/12 blur-3xl" />
        <div className="absolute right-[-12%] top-[10%] h-[22rem] w-[22rem] rounded-full bg-amber-300/10 blur-3xl" />
        <div className="absolute bottom-[-18%] left-[28%] h-[30rem] w-[30rem] rounded-full bg-fuchsia-300/8 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-[36px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.36)] backdrop-blur-md sm:p-8">
          <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">
                Motivation Model vNext
              </p>
              <h1 className="font-display mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Turn a fuzzy goal into something you can actually start today.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                This is no longer just a mind map. It is a local-first coaching workspace for
                generating, editing, saving, and revisiting the motivational shape of a goal.
              </p>

              <form onSubmit={handleGenerate} className="mt-8 flex flex-col gap-3 lg:max-w-3xl">
                <label className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Focus area
                </label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    placeholder="Examples: restart my workout routine, finish the essay, stop doomscrolling..."
                    value={topicInput}
                    onChange={(event) => setTopicInput(event.target.value)}
                    className="min-w-0 flex-1 rounded-[24px] border border-white/10 bg-black/20 px-5 py-4 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40 focus:bg-black/30"
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-[24px] bg-cyan-300 px-5 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-wait disabled:opacity-70"
                  >
                    {isLoading ? (
                      <>
                        <IconRefresh size={18} className="animate-spin" />
                        Building session
                      </>
                    ) : (
                      <>
                        <IconMagic size={18} />
                        Generate session
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateDraft}
                    className="inline-flex items-center justify-center gap-2 rounded-[24px] border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
                  >
                    <IconArchive size={18} />
                    New draft
                  </button>
                </div>
              </form>

              {error && (
                <div className="mt-4 rounded-[22px] border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm leading-6 text-rose-100">
                  {error}
                </div>
              )}
            </div>

            <div className="rounded-[30px] border border-white/10 bg-black/20 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">
                    Local-first note
                  </p>
                  <h2 className="font-display mt-2 text-xl font-semibold text-white">
                    Safe enough for personal use, not for public launch yet
                  </h2>
                </div>
                <IconBrain size={22} className="text-cyan-200" />
              </div>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                <p>
                  Sessions are stored in browser <code className="text-cyan-200">localStorage</code>,
                  so you can revisit and refine them without adding auth or a database.
                </p>
                <p>
                  The Gemini key is still injected into the client for local use. Move AI calls
                  behind a server or edge function before sharing this outside a trusted circle.
                </p>
                <p>
                  Model configured in the app: <code className="text-cyan-200">{GEMINI_MODEL}</code>.
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-6 xl:grid-cols-[320px_1fr]">
          <HistoryPanel
            sessions={savedSessions}
            activeSessionId={currentSession.id}
            onCreateDraft={handleCreateDraft}
            onSelect={handleSelectSession}
            onDelete={handleDelete}
          />

          <main className="space-y-6">
            <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-sm sm:p-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
                    {isSaved ? 'Saved session' : 'Working draft'}
                    {isDirty ? (
                      <span className="rounded-full border border-amber-200/25 bg-amber-200/10 px-2 py-0.5 text-[10px] text-amber-100">
                        Unsynced changes
                      </span>
                    ) : null}
                  </div>
                  <h2 className="font-display mt-2 text-3xl font-semibold text-white">
                    {currentSession.topic || 'Untitled session'}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Last touched {formatUpdatedAt(currentSession.updatedAt)}. Original prompt:{' '}
                    <span className="text-slate-300">
                      {currentSession.sourcePrompt || 'Not captured'}
                    </span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setScale((current) => Math.min(current + 0.08, 1.2))}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200 transition hover:border-white/20 hover:bg-white/10"
                  >
                    <IconZoomIn size={14} />
                    Zoom in
                  </button>
                  <button
                    type="button"
                    onClick={() => setScale((current) => Math.max(current - 0.08, 0.72))}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200 transition hover:border-white/20 hover:bg-white/10"
                  >
                    <IconZoomOut size={14} />
                    Zoom out
                  </button>
                  <button
                    type="button"
                    onClick={generateFromPrompt}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100 transition hover:border-cyan-200/40 hover:bg-cyan-300/15 disabled:cursor-wait disabled:opacity-70"
                  >
                    <IconRegenerate size={14} />
                    Regenerate all
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200 transition hover:border-white/20 hover:bg-white/10"
                  >
                    <IconEdit size={14} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSave('overwrite')}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-950 transition hover:bg-slate-100"
                  >
                    <IconSave size={14} />
                    {isSaved ? 'Save update' : 'Save session'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSave('copy')}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200 transition hover:border-white/20 hover:bg-white/10"
                  >
                    <IconArchive size={14} />
                    Save copy
                  </button>
                  {isSaved ? (
                    <button
                      type="button"
                      onClick={() => handleDelete(currentSession.id)}
                      className="inline-flex items-center gap-2 rounded-full border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-100 transition hover:border-rose-300/35 hover:bg-rose-300/15"
                    >
                      <IconTrash size={14} />
                      Delete
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="mt-6 grid gap-6 2xl:grid-cols-[1.28fr_0.92fr]">
                <DiagramView session={currentSession} scale={scale} />

                <div className="space-y-4">
                  {renderInsightList('DO', 'text-cyan-300', currentSession.doItems)}
                  {renderInsightList('BE', 'text-rose-200', currentSession.beItems)}
                  {renderInsightList('FEEL', 'text-amber-200', currentSession.feelItems)}
                </div>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-6">
                <div className="rounded-[32px] border border-cyan-300/15 bg-cyan-300/10 p-6 shadow-[0_16px_56px_rgba(0,0,0,0.22)]">
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
                    First action
                  </div>
                  <p className="mt-3 text-2xl font-semibold leading-tight text-white">
                    {currentSession.firstAction || 'Generate or write the smallest first step here.'}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-cyan-50/80">
                    The app now treats the model as a coaching artifact, not just a visual. This
                    should be the action someone can do immediately.
                  </p>
                </div>

                <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6">
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">
                    Why now
                  </div>
                  <p className="mt-3 text-lg leading-8 text-white">
                    {currentSession.whyNow || 'Use this space to anchor why the goal matters now.'}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6">
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-200">
                    Obstacles
                  </div>
                  <div className="mt-4 space-y-3">
                    {currentSession.obstacles.length === 0 ? (
                      <p className="text-sm leading-6 text-slate-500">
                        No blockers captured yet. Add friction patterns in the editor or regenerate
                        this section.
                      </p>
                    ) : (
                      currentSession.obstacles.map((item) => (
                        <div
                          key={item}
                          className="rounded-[22px] border border-white/10 bg-black/10 px-4 py-3 text-sm leading-6 text-slate-100"
                        >
                          {item}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6">
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-fuchsia-200">
                    Reflection prompt
                  </div>
                  <p className="mt-4 text-lg leading-8 text-white">
                    {currentSession.reflectionPrompt ||
                      'Give yourself one honest question to revisit after you act.'}
                  </p>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>

      <EditPanel
        isOpen={isEditOpen}
        session={currentSession}
        onClose={() => setIsEditOpen(false)}
        onChange={setCurrentSession}
        onRegenerate={handleRegenerate}
        regeneratingKey={regeneratingKey}
      />
    </div>
  );
}
