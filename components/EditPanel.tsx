import React from 'react';

import type {
  MotivationItem,
  MotivationSession,
  SessionArrayKey,
  SessionListKey,
  SessionRegenerationKey,
  SessionTextKey,
} from '../types.ts';
import {
  IconAdd,
  IconArrowDown,
  IconArrowUp,
  IconBe,
  IconClose,
  IconDo,
  IconFeel,
  IconRegenerate,
  IconTrash,
} from './Icons';

interface EditPanelProps {
  isOpen: boolean;
  session: MotivationSession | null;
  onClose: () => void;
  onChange: (nextSession: MotivationSession) => void;
  onRegenerate: (key: SessionRegenerationKey) => void;
  regeneratingKey: SessionRegenerationKey | null;
}

const panelInputClass =
  'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/30 focus:bg-white/10';

const helperButtonClass =
  'inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white disabled:cursor-wait disabled:opacity-60';

const replaceItemAtIndex = (
  items: MotivationItem[],
  index: number,
  updater: (current: MotivationItem) => MotivationItem
) => {
  return items.map((item, currentIndex) =>
    currentIndex === index ? updater(item) : item
  );
};

const moveItem = (items: MotivationItem[], index: number, direction: -1 | 1) => {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) {
    return items;
  }

  const next = [...items];
  const [item] = next.splice(index, 1);
  next.splice(nextIndex, 0, item);
  return next;
};

const moveStringItem = (items: string[], index: number, direction: -1 | 1) => {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) {
    return items;
  }

  const next = [...items];
  const [item] = next.splice(index, 1);
  next.splice(nextIndex, 0, item);
  return next;
};

export const EditPanel: React.FC<EditPanelProps> = ({
  isOpen,
  session,
  onClose,
  onChange,
  onRegenerate,
  regeneratingKey,
}) => {
  if (!isOpen || !session) {
    return null;
  }

  const updateList = (key: SessionListKey, nextItems: MotivationItem[]) => {
    onChange({
      ...session,
      [key]: nextItems,
      updatedAt: new Date().toISOString(),
    });
  };

  const updateStringList = (key: Extract<SessionArrayKey, 'obstacles'>, nextItems: string[]) => {
    onChange({
      ...session,
      [key]: nextItems,
      updatedAt: new Date().toISOString(),
    });
  };

  const updateText = (key: SessionTextKey, nextValue: string) => {
    onChange({
      ...session,
      [key]: nextValue,
      updatedAt: new Date().toISOString(),
    });
  };

  const renderListSection = (
    title: string,
    key: SessionListKey,
    items: MotivationItem[],
    Icon: React.FC<{ size?: number | string; className?: string }>
  ) => (
    <section className="space-y-3 rounded-[28px] border border-white/10 bg-black/10 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/8 text-white">
            <Icon size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            <p className="text-xs text-slate-400">Edit, reorder, or regenerate this layer.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onRegenerate(key)}
          disabled={regeneratingKey === key}
          className={helperButtonClass}
        >
          <IconRegenerate size={14} />
          {regeneratingKey === key ? 'Refreshing' : 'Refresh'}
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={item.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
            <textarea
              value={item.text}
              rows={2}
              onChange={(event) =>
                updateList(
                  key,
                  replaceItemAtIndex(items, index, (current) => ({
                    ...current,
                    text: event.target.value,
                  }))
                )
              }
              className={`${panelInputClass} min-h-[72px] resize-none`}
            />
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => updateList(key, moveItem(items, index, -1))}
                className={helperButtonClass}
              >
                <IconArrowUp size={14} />
                Up
              </button>
              <button
                type="button"
                onClick={() => updateList(key, moveItem(items, index, 1))}
                className={helperButtonClass}
              >
                <IconArrowDown size={14} />
                Down
              </button>
              <button
                type="button"
                onClick={() =>
                  updateList(
                    key,
                    items.filter((current) => current.id !== item.id)
                  )
                }
                className={helperButtonClass}
              >
                <IconTrash size={14} />
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() =>
          updateList(key, [
            ...items,
            { id: crypto.randomUUID(), text: '' },
          ])
        }
        className={helperButtonClass}
      >
        <IconAdd size={14} />
        Add item
      </button>
    </section>
  );

  const renderObstacleSection = () => (
    <section className="space-y-3 rounded-[28px] border border-white/10 bg-black/10 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white">Obstacles</h3>
          <p className="text-xs text-slate-400">Capture the friction you expect to hit.</p>
        </div>
        <button
          type="button"
          onClick={() => onRegenerate('obstacles')}
          disabled={regeneratingKey === 'obstacles'}
          className={helperButtonClass}
        >
          <IconRegenerate size={14} />
          {regeneratingKey === 'obstacles' ? 'Refreshing' : 'Refresh'}
        </button>
      </div>

      <div className="space-y-3">
        {session.obstacles.map((item, index) => (
          <div key={`${item}-${index}`} className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
            <textarea
              value={item}
              rows={2}
              onChange={(event) =>
                updateStringList(
                  'obstacles',
                  session.obstacles.map((current, currentIndex) =>
                    currentIndex === index ? event.target.value : current
                  )
                )
              }
              className={`${panelInputClass} min-h-[72px] resize-none`}
            />
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() =>
                  updateStringList('obstacles', moveStringItem(session.obstacles, index, -1))
                }
                className={helperButtonClass}
              >
                <IconArrowUp size={14} />
                Up
              </button>
              <button
                type="button"
                onClick={() =>
                  updateStringList('obstacles', moveStringItem(session.obstacles, index, 1))
                }
                className={helperButtonClass}
              >
                <IconArrowDown size={14} />
                Down
              </button>
              <button
                type="button"
                onClick={() =>
                  updateStringList(
                    'obstacles',
                    session.obstacles.filter((_, currentIndex) => currentIndex !== index)
                  )
                }
                className={helperButtonClass}
              >
                <IconTrash size={14} />
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => updateStringList('obstacles', [...session.obstacles, ''])}
        className={helperButtonClass}
      >
        <IconAdd size={14} />
        Add obstacle
      </button>
    </section>
  );

  const renderTextSection = (
    title: string,
    key: SessionTextKey,
    value: string,
    rows: number
  ) => (
    <section className="space-y-3 rounded-[28px] border border-white/10 bg-black/10 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="text-xs text-slate-400">Keep it short and usable in the moment.</p>
        </div>
        <button
          type="button"
          onClick={() => onRegenerate(key)}
          disabled={regeneratingKey === key}
          className={helperButtonClass}
        >
          <IconRegenerate size={14} />
          {regeneratingKey === key ? 'Refreshing' : 'Refresh'}
        </button>
      </div>

      <textarea
        value={value}
        rows={rows}
        onChange={(event) => updateText(key, event.target.value)}
        className={`${panelInputClass} min-h-[96px] resize-y`}
      />
    </section>
  );

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-950/60 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close editor"
        className="hidden h-full flex-1 lg:block"
        onClick={onClose}
      />
      <aside className="h-full w-full max-w-2xl overflow-y-auto border-l border-white/10 bg-[#0a1325]/95 p-5 shadow-2xl shadow-black/50">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
              Edit Session
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Refine the model by hand
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
              Add better phrasing, reorder the strongest ideas, or regenerate one weak section
              without losing the rest of the work.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <IconClose size={18} />
          </button>
        </div>

        <div className="space-y-5">
          <section className="space-y-3 rounded-[28px] border border-white/10 bg-black/10 p-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Focus area</h3>
              <p className="text-xs text-slate-400">This title is what you will see in history.</p>
            </div>
            <input
              type="text"
              value={session.topic}
              onChange={(event) =>
                onChange({
                  ...session,
                  topic: event.target.value,
                  updatedAt: new Date().toISOString(),
                })
              }
              className={panelInputClass}
              placeholder="What are you trying to make easier?"
            />
          </section>

          {renderListSection('DO: Behaviors', 'doItems', session.doItems, IconDo)}
          {renderListSection('BE: Identity', 'beItems', session.beItems, IconBe)}
          {renderListSection('FEEL: Rewards', 'feelItems', session.feelItems, IconFeel)}
          {renderObstacleSection()}
          {renderTextSection('First action', 'firstAction', session.firstAction, 3)}
          {renderTextSection('Why now', 'whyNow', session.whyNow, 3)}
          {renderTextSection(
            'Reflection prompt',
            'reflectionPrompt',
            session.reflectionPrompt,
            3
          )}
        </div>
      </aside>
    </div>
  );
};
