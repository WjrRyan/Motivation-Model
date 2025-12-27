import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MotivationModelData, CategoryType, MotivationItem } from '../types';
import { IconDo, IconBe, IconFeel } from './Icons';

interface DiagramViewProps {
  data: MotivationModelData;
  scale: number;
}

const ORBIT_RADIUS = 280;
const NODE_RADIUS = 120; // Distance of items from their category center

// Helper to calculate positions in a circle
const getPosition = (angleDeg: number, radius: number, centerX: number, centerY: number) => {
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleRad),
    y: centerY + radius * Math.sin(angleRad),
  };
};

export const DiagramView: React.FC<DiagramViewProps> = ({ data, scale }) => {
  // Center of the SVG canvas
  const CX = 600;
  const CY = 500; // Shifted up slightly to accommodate bottom heavy layout

  // Angles for the three main categories (Triangle layout)
  // DO: Top (270 deg)
  // FEEL: Bottom Right (30 deg)
  // BE: Bottom Left (150 deg)
  const categoryAngles = {
    [CategoryType.DO]: 270,
    [CategoryType.FEEL]: 30,
    [CategoryType.BE]: 150,
  };

  const categoryCenters = {
    [CategoryType.DO]: getPosition(categoryAngles[CategoryType.DO], ORBIT_RADIUS, CX, CY),
    [CategoryType.FEEL]: getPosition(categoryAngles[CategoryType.FEEL], ORBIT_RADIUS, CX, CY),
    [CategoryType.BE]: getPosition(categoryAngles[CategoryType.BE], ORBIT_RADIUS, CX, CY),
  };

  // Helper to render connection lines
  const ConnectionLine = ({ x1, y1, x2, y2, color }: { x1: number; y1: number; x2: number; y2: number; color: string }) => (
    <motion.line
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.3 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={color}
      strokeWidth="2"
      strokeDasharray="4 4"
    />
  );

  const renderNodes = (items: MotivationItem[], category: CategoryType, colorClass: string, icon: React.ReactNode) => {
    const center = categoryCenters[category];
    
    return (
      <g>
        {/* Category Hub Circle */}
        <motion.circle
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          cx={center.x}
          cy={center.y}
          r={50}
          className={`${colorClass} fill-opacity-20 stroke-2`}
          stroke="currentColor"
        />
        
        {/* Icon in Center of Hub */}
        <foreignObject x={center.x - 15} y={center.y - 15} width={30} height={30} className={colorClass}>
           <div className="flex items-center justify-center w-full h-full">
             {icon}
           </div>
        </foreignObject>

        {/* Category Label */}
        <text 
          x={center.x} 
          y={center.y + 70} 
          textAnchor="middle" 
          className={`text-lg font-bold uppercase tracking-widest fill-current ${colorClass}`}
        >
          {category}
        </text>

        {/* Leaf Nodes */}
        {items.map((item, index) => {
          // Distribute leaf nodes around the category center
          // We want them to fan out away from the main center (CX, CY)
          const totalNodes = items.length;
          const spreadAngle = 120; // Degrees of spread
          const startAngle = categoryAngles[category] - spreadAngle / 2;
          const step = spreadAngle / (totalNodes - 1 || 1);
          
          // Adjust angle so items don't overlap with the center lines too much
          // Actually, let's just rotate them relative to the category angle
          const currentAngle = (startAngle + index * step);

          const pos = getPosition(currentAngle, NODE_RADIUS + 40, center.x, center.y);

          return (
            <React.Fragment key={item.id}>
              {/* Line from Hub to Leaf */}
              <ConnectionLine 
                x1={center.x} 
                y1={center.y} 
                x2={pos.x} 
                y2={pos.y} 
                color="currentColor" 
              />
              
              {/* Leaf Node Bubble */}
              <motion.g
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
              >
                <foreignObject x={pos.x - 70} y={pos.y - 30} width={140} height={80}>
                  <div className={`
                    flex items-center justify-center text-center p-2 rounded-xl shadow-lg border h-full
                    backdrop-blur-md bg-opacity-90 transition-transform hover:scale-105
                    ${colorClass === 'text-do-primary' ? 'bg-slate-800 border-do-primary/30 text-white' : ''}
                    ${colorClass === 'text-be-primary' ? 'bg-slate-800 border-be-primary/30 text-white' : ''}
                    ${colorClass === 'text-feel-primary' ? 'bg-slate-800 border-feel-primary/30 text-white' : ''}
                  `}>
                    <span className="text-xs font-medium leading-tight">{item.text}</span>
                  </div>
                </foreignObject>
              </motion.g>
            </React.Fragment>
          );
        })}
      </g>
    );
  };

  return (
    <div className="w-full h-full overflow-hidden flex items-center justify-center bg-dark-bg relative">
      <div 
        className="transition-transform duration-300 ease-out origin-center"
        style={{ transform: `scale(${scale})` }}
      >
        <svg width="1200" height="1000" viewBox="0 0 1200 1000" className="max-w-full max-h-full">
          <defs>
             <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
             </radialGradient>
          </defs>

          {/* Central Connecting Lines */}
          <ConnectionLine x1={CX} y1={CY} x2={categoryCenters[CategoryType.DO].x} y2={categoryCenters[CategoryType.DO].y} color="#3b82f6" />
          <ConnectionLine x1={CX} y1={CY} x2={categoryCenters[CategoryType.BE].x} y2={categoryCenters[CategoryType.BE].y} color="#8b5cf6" />
          <ConnectionLine x1={CX} y1={CY} x2={categoryCenters[CategoryType.FEEL].x} y2={categoryCenters[CategoryType.FEEL].y} color="#ec4899" />

          {/* Center Topic Node */}
          <motion.circle 
            initial={{ r: 0 }} 
            animate={{ r: 90 }} 
            cx={CX} cy={CY} 
            fill="url(#centerGradient)" 
          />
          <motion.circle
            initial={{ r: 0 }}
            animate={{ r: 80 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            cx={CX}
            cy={CY}
            className="fill-slate-800 stroke-slate-600 stroke-2"
          />
          <foreignObject x={CX - 70} y={CY - 70} width={140} height={140}>
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-2">
               <h2 className="text-white font-bold text-lg leading-tight break-words">{data.topic}</h2>
            </div>
          </foreignObject>

          {/* Render Categories */}
          <g className="text-do-primary">
            {renderNodes(data.doItems, CategoryType.DO, 'text-do-primary', <IconDo size={24} />)}
          </g>
          <g className="text-be-primary">
            {renderNodes(data.beItems, CategoryType.BE, 'text-be-primary', <IconBe size={24} />)}
          </g>
          <g className="text-feel-primary">
             {renderNodes(data.feelItems, CategoryType.FEEL, 'text-feel-primary', <IconFeel size={24} />)}
          </g>

        </svg>
      </div>
    </div>
  );
};