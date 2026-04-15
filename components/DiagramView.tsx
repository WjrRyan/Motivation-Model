import React from 'react';
import { motion } from 'framer-motion';

import { CategoryType } from '../types.ts';
import type { MotivationItem, MotivationSession } from '../types.ts';
import { IconBe, IconDo, IconFeel } from './Icons';

interface DiagramViewProps {
  session: MotivationSession;
  scale: number;
}

const ORBIT_RADIUS = 250;
const LEAF_RADIUS = 132;
const CANVAS_WIDTH = 980;
const CANVAS_HEIGHT = 820;
const CENTER_X = CANVAS_WIDTH / 2;
const CENTER_Y = CANVAS_HEIGHT / 2 - 10;

const categoryAngles: Record<CategoryType, number> = {
  [CategoryType.DO]: 270,
  [CategoryType.FEEL]: 25,
  [CategoryType.BE]: 155,
};

const getPosition = (angleDeg: number, radius: number, centerX: number, centerY: number) => {
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleRad),
    y: centerY + radius * Math.sin(angleRad),
  };
};

const categoryColors = {
  [CategoryType.DO]: {
    stroke: '#48d6ff',
    fill: '#48d6ff14',
    bubble: 'bg-cyan-300/10 border-cyan-200/25',
  },
  [CategoryType.BE]: {
    stroke: '#f8b4d9',
    fill: '#f8b4d914',
    bubble: 'bg-rose-200/10 border-rose-200/25',
  },
  [CategoryType.FEEL]: {
    stroke: '#ffd166',
    fill: '#ffd16614',
    bubble: 'bg-amber-200/10 border-amber-200/25',
  },
};

const categoryCenters: Record<CategoryType, { x: number; y: number }> = {
  [CategoryType.DO]: getPosition(categoryAngles[CategoryType.DO], ORBIT_RADIUS, CENTER_X, CENTER_Y),
  [CategoryType.FEEL]: getPosition(
    categoryAngles[CategoryType.FEEL],
    ORBIT_RADIUS,
    CENTER_X,
    CENTER_Y
  ),
  [CategoryType.BE]: getPosition(categoryAngles[CategoryType.BE], ORBIT_RADIUS, CENTER_X, CENTER_Y),
};

const ConnectionLine = ({
  x1,
  y1,
  x2,
  y2,
  color,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}) => (
  <motion.line
    initial={{ pathLength: 0, opacity: 0 }}
    animate={{ pathLength: 1, opacity: 0.42 }}
    transition={{ duration: 0.9, ease: 'easeInOut' }}
    x1={x1}
    y1={y1}
    x2={x2}
    y2={y2}
    stroke={color}
    strokeWidth="2"
    strokeDasharray="6 8"
  />
);

const renderLeafNodes = (
  items: MotivationItem[],
  category: CategoryType,
  icon: React.ReactNode
) => {
  const center = categoryCenters[category];
  const colors = categoryColors[category];
  const spreadAngle = 112;
  const startAngle = categoryAngles[category] - spreadAngle / 2;
  const step = spreadAngle / Math.max(items.length - 1, 1);

  return (
    <g>
      <motion.circle
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        cx={center.x}
        cy={center.y}
        r={58}
        fill={colors.fill}
        stroke={colors.stroke}
        strokeWidth="2"
      />

      <foreignObject x={center.x - 18} y={center.y - 18} width={36} height={36}>
        <div className="flex h-full w-full items-center justify-center text-white">{icon}</div>
      </foreignObject>

      <text
        x={center.x}
        y={center.y + 82}
        textAnchor="middle"
        fill={colors.stroke}
        className="text-[16px] font-bold uppercase tracking-[0.45em]"
      >
        {category}
      </text>

      {items.map((item, index) => {
        const angle = startAngle + index * step;
        const position = getPosition(angle, LEAF_RADIUS + 26, center.x, center.y);

        return (
          <React.Fragment key={item.id}>
            <ConnectionLine
              x1={center.x}
              y1={center.y}
              x2={position.x}
              y2={position.y}
              color={colors.stroke}
            />
            <motion.g
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: 0.28 + index * 0.08 }}
            >
              <foreignObject x={position.x - 88} y={position.y - 40} width={176} height={90}>
                <div
                  className={`flex h-full items-center justify-center rounded-[22px] border p-3 text-center text-sm font-medium leading-5 text-slate-100 shadow-lg backdrop-blur-sm ${colors.bubble}`}
                >
                  {item.text}
                </div>
              </foreignObject>
            </motion.g>
          </React.Fragment>
        );
      })}
    </g>
  );
};

export const DiagramView: React.FC<DiagramViewProps> = ({ session, scale }) => {
  return (
    <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(113,215,255,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(255,209,102,0.12),_transparent_24%),linear-gradient(180deg,rgba(7,14,28,0.92),rgba(5,10,20,0.98))] p-4">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:44px_44px] opacity-30" />
      <div
        className="relative mx-auto flex items-center justify-center transition-transform duration-300 ease-out"
        style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
      >
        <svg
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
          className="max-w-full"
        >
          <defs>
            <radialGradient id="topicGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
              <stop offset="70%" stopColor="#57cbff" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#57cbff" stopOpacity="0" />
            </radialGradient>
          </defs>

          <ConnectionLine
            x1={CENTER_X}
            y1={CENTER_Y}
            x2={categoryCenters[CategoryType.DO].x}
            y2={categoryCenters[CategoryType.DO].y}
            color={categoryColors[CategoryType.DO].stroke}
          />
          <ConnectionLine
            x1={CENTER_X}
            y1={CENTER_Y}
            x2={categoryCenters[CategoryType.BE].x}
            y2={categoryCenters[CategoryType.BE].y}
            color={categoryColors[CategoryType.BE].stroke}
          />
          <ConnectionLine
            x1={CENTER_X}
            y1={CENTER_Y}
            x2={categoryCenters[CategoryType.FEEL].x}
            y2={categoryCenters[CategoryType.FEEL].y}
            color={categoryColors[CategoryType.FEEL].stroke}
          />

          <motion.circle
            initial={{ r: 0 }}
            animate={{ r: 112 }}
            cx={CENTER_X}
            cy={CENTER_Y}
            fill="url(#topicGlow)"
          />
          <motion.circle
            initial={{ r: 0 }}
            animate={{ r: 92 }}
            transition={{ type: 'spring', stiffness: 180, damping: 18 }}
            cx={CENTER_X}
            cy={CENTER_Y}
            fill="#09111f"
            stroke="#dff7ff33"
            strokeWidth="2"
          />

          <foreignObject x={CENTER_X - 88} y={CENTER_Y - 76} width={176} height={152}>
            <div className="flex h-full w-full flex-col items-center justify-center text-center">
              <span className="text-[11px] font-semibold uppercase tracking-[0.34em] text-slate-400">
                Focus
              </span>
              <h2 className="mt-3 text-xl font-semibold leading-tight text-white">
                {session.topic || 'Untitled session'}
              </h2>
            </div>
          </foreignObject>

          {renderLeafNodes(session.doItems, CategoryType.DO, <IconDo size={24} />)}
          {renderLeafNodes(session.beItems, CategoryType.BE, <IconBe size={24} />)}
          {renderLeafNodes(session.feelItems, CategoryType.FEEL, <IconFeel size={24} />)}
        </svg>
      </div>
    </div>
  );
};
