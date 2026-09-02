import React, { useState } from 'react';
import {
  NumberingSystem,
  ToothCondition,
  ToothState,
  ToothSurface,
} from '../../types';
import {
  PERMANENT_TEETH,
  DECIDUOUS_TEETH,
  ToothInfo,
  getToothLabel,
  CONDITION_CONFIG,
} from '../../utils/dentalData';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Info,
  Layers,
  Activity,
} from 'lucide-react';

interface DentalChartProps {
  dentalChart: Record<string, ToothState>;
  onChange?: (updatedChart: Record<string, ToothState>) => void;
  readOnly?: boolean;
  dentitionType?: 'permanent' | 'deciduous';
  onDentitionChange?: (type: 'permanent' | 'deciduous') => void;
}

export const DentalChart: React.FC<DentalChartProps> = ({
  dentalChart,
  onChange,
  readOnly = false,
  dentitionType = 'permanent',
  onDentitionChange,
}) => {
  const { t, language } = useApp();
  const [selectedSystem, setSelectedSystem] = useState<NumberingSystem>('fdi');
  const [selectedToothFdi, setSelectedToothFdi] = useState<string | null>('16');
  const [activeConditionBrush, setActiveConditionBrush] = useState<ToothCondition>('caries');

  const teethList = dentitionType === 'permanent' ? PERMANENT_TEETH : DECIDUOUS_TEETH;

  // Split teeth into upper (maxillary) and lower (mandibular) arches
  const upperTeeth = teethList.filter((t) => t.arch === 'maxillary');
  const lowerTeeth = teethList.filter((t) => t.arch === 'mandibular');

  // Upper Right (Q1/Q5) + Upper Left (Q2/Q6)
  // Lower Right (Q4/Q8) + Lower Left (Q3/Q7)
  const currentToothInfo = teethList.find((t) => t.fdi === selectedToothFdi);
  const currentToothState: ToothState =
    (selectedToothFdi && dentalChart[selectedToothFdi]) || {
      condition: 'sound',
      surfaces: {},
    };

  const handleSurfaceClick = (toothFdi: string, surface: ToothSurface) => {
    if (readOnly || !onChange) return;

    setSelectedToothFdi(toothFdi);
    const existing = dentalChart[toothFdi] || { condition: 'sound', surfaces: {} };
    const currentSurfaces = existing.surfaces || {};
    const newSurfaces = {
      ...currentSurfaces,
      [surface]: !currentSurfaces[surface],
    };

    // If surfaces are applied and condition was sound, default to active brush
    const newCondition =
      existing.condition === 'sound' ? activeConditionBrush : existing.condition;

    onChange({
      ...dentalChart,
      [toothFdi]: {
        ...existing,
        condition: newCondition,
        surfaces: newSurfaces,
      },
    });
  };

  const handleApplyConditionToTooth = (toothFdi: string, condition: ToothCondition) => {
    if (readOnly || !onChange) return;

    setSelectedToothFdi(toothFdi);
    const existing = dentalChart[toothFdi] || { condition: 'sound', surfaces: {} };
    onChange({
      ...dentalChart,
      [toothFdi]: {
        ...existing,
        condition,
      },
    });
  };

  const handleClearTooth = (toothFdi: string) => {
    if (readOnly || !onChange) return;
    const updated = { ...dentalChart };
    delete updated[toothFdi];
    onChange(updated);
  };

  const renderToothGraphic = (tooth: ToothInfo) => {
    const isSelected = selectedToothFdi === tooth.fdi;
    const toothState = dentalChart[tooth.fdi] || { condition: 'sound', surfaces: {} };
    const label = getToothLabel(tooth, selectedSystem);
    const condition = toothState.condition;
    const surfaces = toothState.surfaces || {};
    const conf = CONDITION_CONFIG[condition] || CONDITION_CONFIG.sound;

    // Fill colors for individual surfaces
    const surfaceColor = (surfaceName: ToothSurface) => {
      if (surfaces[surfaceName]) {
        return conf.color;
      }
      return 'var(--surface-neutral, #f8fafc)';
    };

    const isExtracted = condition === 'extraction';
    const isEndo = condition === 'endo_rct';
    const isCrown = condition === 'crown';
    const isImplant = condition === 'implant';

    return (
      <div
        key={tooth.fdi}
        id={`tooth-${tooth.fdi}`}
        onClick={() => setSelectedToothFdi(tooth.fdi)}
        className={`relative flex flex-col items-center p-1 rounded-xl transition-all select-none ${
          isSelected
            ? 'ring-2 ring-teal-500 bg-teal-50/60 dark:bg-teal-950/40 shadow-sm'
            : 'hover:bg-slate-100 dark:hover:bg-slate-800/60'
        } ${isExtracted ? 'opacity-50' : ''}`}
      >
        {/* Tooth Identifier Badge */}
        <span
          className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded mb-1 transition-colors ${
            isSelected
              ? 'bg-teal-600 text-white'
              : 'text-slate-700 dark:text-slate-300 bg-slate-200/70 dark:bg-slate-800'
          }`}
        >
          {label}
        </span>

        {/* Anatomical 5-Surface Crown Cross-Section SVG */}
        <div className="relative w-11 h-11 md:w-12 md:h-12 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs">
            <style>
              {`
                :root { --surface-neutral: #f8fafc; }
                .dark :root { --surface-neutral: #1e293b; }
              `}
            </style>

            {/* Root representation for Endo/Implant */}
            {isEndo && (
              <path
                d="M44 5 L56 5 L53 35 L47 35 Z"
                fill="#8b5cf6"
                stroke="#6d28d9"
                strokeWidth="1.5"
                className="animate-pulse"
              />
            )}

            {isImplant && (
              <g>
                <path d="M42 2 L58 2 L50 20 Z" fill="#0d9488" />
                <line x1="45" y1="6" x2="55" y2="6" stroke="#ffffff" strokeWidth="1" />
                <line x1="46" y1="11" x2="54" y2="11" stroke="#ffffff" strokeWidth="1" />
              </g>
            )}

            {/* Crown Base Outline */}
            <rect
              x="10"
              y="10"
              width="80"
              height="80"
              rx="18"
              fill={isCrown ? '#fef3c7' : 'var(--surface-neutral)'}
              stroke={isCrown ? '#d97706' : '#94a3b8'}
              strokeWidth={isCrown ? '3' : '1.5'}
            />

            {/* Buccal/Labial Surface (Top for upper, Bottom for lower) */}
            <path
              d="M18 18 L82 18 L70 30 L30 30 Z"
              fill={surfaceColor('buccal')}
              stroke="#64748b"
              strokeWidth="0.8"
              className="tooth-surface"
              onClick={(e) => {
                e.stopPropagation();
                handleSurfaceClick(tooth.fdi, 'buccal');
              }}
            />

            {/* Lingual/Palatal Surface (Bottom for upper, Top for lower) */}
            <path
              d="M30 70 L70 70 L82 82 L18 82 Z"
              fill={surfaceColor('lingual')}
              stroke="#64748b"
              strokeWidth="0.8"
              className="tooth-surface"
              onClick={(e) => {
                e.stopPropagation();
                handleSurfaceClick(tooth.fdi, 'lingual');
              }}
            />

            {/* Mesial Surface (Right side for Q1/Q4, Left side for Q2/Q3) */}
            <path
              d="M18 18 L30 30 L30 70 L18 82 Z"
              fill={surfaceColor(tooth.side === 'right' ? 'mesial' : 'distal')}
              stroke="#64748b"
              strokeWidth="0.8"
              className="tooth-surface"
              onClick={(e) => {
                e.stopPropagation();
                handleSurfaceClick(tooth.fdi, tooth.side === 'right' ? 'mesial' : 'distal');
              }}
            />

            {/* Distal Surface */}
            <path
              d="M82 18 L82 82 L70 70 L70 30 Z"
              fill={surfaceColor(tooth.side === 'right' ? 'distal' : 'mesial')}
              stroke="#64748b"
              strokeWidth="0.8"
              className="tooth-surface"
              onClick={(e) => {
                e.stopPropagation();
                handleSurfaceClick(tooth.fdi, tooth.side === 'right' ? 'distal' : 'mesial');
              }}
            />

            {/* Central Occlusal / Incisal Surface */}
            <polygon
              points="30,30 70,30 70,70 30,70"
              fill={surfaceColor('occlusal')}
              stroke="#64748b"
              strokeWidth="0.8"
              className="tooth-surface"
              onClick={(e) => {
                e.stopPropagation();
                handleSurfaceClick(tooth.fdi, 'occlusal');
              }}
            />

            {/* Extraction Cross Indicator */}
            {isExtracted && (
              <g stroke="#dc2626" strokeWidth="4" strokeLinecap="round">
                <line x1="12" y1="12" x2="88" y2="88" />
                <line x1="88" y1="12" x2="12" y2="88" />
              </g>
            )}
          </svg>

          {/* Condition Dot if non-sound */}
          {condition !== 'sound' && (
            <span
              className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-900"
              style={{ backgroundColor: conf.color }}
            />
          )}
        </div>

        {/* Mobility / Perio pocket depth indicator if present */}
        {toothState.pocketDepthMm && toothState.pocketDepthMm > 3 && (
          <span className="mt-1 text-[9px] px-1 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-bold rounded">
            {toothState.pocketDepthMm}mm
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 md:p-6 shadow-xs">
      {/* Header controls: Numbering System & Dentition Type */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t.dentalChartTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {dentitionType === 'permanent' ? t.permanentTeeth : t.deciduousTeeth}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Dentition Selector */}
          {onDentitionChange && (
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                id="dentition-permanent-btn"
                onClick={() => onDentitionChange('permanent')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  dentitionType === 'permanent'
                    ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {t.permanentTeeth.split(' ')[0]} (32)
              </button>
              <button
                type="button"
                id="dentition-deciduous-btn"
                onClick={() => onDentitionChange('deciduous')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  dentitionType === 'deciduous'
                    ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {t.deciduousTeeth.split(' ')[0]} (20)
              </button>
            </div>
          )}

          {/* Numbering System Selector (FDI / UNS / Palmer) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              id="system-fdi-btn"
              onClick={() => setSelectedSystem('fdi')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                selectedSystem === 'fdi'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              FDI
            </button>
            <button
              type="button"
              id="system-uns-btn"
              onClick={() => setSelectedSystem('uns')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                selectedSystem === 'uns'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Universal (UNS)
            </button>
            <button
              type="button"
              id="system-palmer-btn"
              onClick={() => setSelectedSystem('palmer')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                selectedSystem === 'palmer'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Palmer
            </button>
          </div>
        </div>
      </div>

      {/* Active Condition Brush Palette (when editing) */}
      {!readOnly && (
        <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-teal-600" />
              {t.conditionsLegend}
            </span>
            <span className="text-[11px] text-slate-500">
              {language === 'ar'
                ? 'اختر الحالة ثم اضغط على السن أو السطح لتطبيقه'
                : 'Select condition then click tooth or surface'}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(CONDITION_CONFIG) as ToothCondition[]).map((cond) => {
              const conf = CONDITION_CONFIG[cond];
              const isBrushActive = activeConditionBrush === cond;
              return (
                <button
                  key={cond}
                  type="button"
                  id={`condition-brush-${cond}`}
                  onClick={() => {
                    setActiveConditionBrush(cond);
                    if (selectedToothFdi) {
                      handleApplyConditionToTooth(selectedToothFdi, cond);
                    }
                  }}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                    isBrushActive
                      ? `${conf.bgBadge} ring-2 ring-teal-500 font-bold shadow-xs scale-105`
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: conf.color }}
                  />
                  {language === 'ar' ? conf.labelAr : conf.labelEn}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* The Full Dental Arch Viewport */}
      <div className="relative overflow-x-auto py-2">
        <div className="min-w-[640px] space-y-4">
          {/* Maxillary Arch (Upper Jaw) */}
          <div className="p-3 bg-slate-50/70 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 px-2">
              <span>{t.rightSide}</span>
              <span className="bg-slate-200 dark:bg-slate-800 px-2.5 py-0.5 rounded-full text-[11px] text-teal-700 dark:text-teal-300">
                {t.maxillaryArch}
              </span>
              <span>{t.leftSide}</span>
            </div>
            <div className="grid grid-flow-col auto-cols-fr gap-1 justify-items-center relative">
              {/* Midline divider */}
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-teal-500/30 -translate-x-1/2 pointer-events-none" />
              {upperTeeth.map(renderToothGraphic)}
            </div>
          </div>

          {/* Mandibular Arch (Lower Jaw) */}
          <div className="p-3 bg-slate-50/70 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <div className="grid grid-flow-col auto-cols-fr gap-1 justify-items-center relative mb-2">
              {/* Midline divider */}
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-teal-500/30 -translate-x-1/2 pointer-events-none" />
              {lowerTeeth.map(renderToothGraphic)}
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 px-2">
              <span>{t.rightSide}</span>
              <span className="bg-slate-200 dark:bg-slate-800 px-2.5 py-0.5 rounded-full text-[11px] text-teal-700 dark:text-teal-300">
                {t.mandibularArch}
              </span>
              <span>{t.leftSide}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Tooth Inspector Bar */}
      {currentToothInfo && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-mono font-bold text-lg shadow-xs">
              {getToothLabel(currentToothInfo, selectedSystem)}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {language === 'ar' ? currentToothInfo.nameAr : currentToothInfo.nameEn}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span>FDI: {currentToothInfo.fdi}</span>
                <span>•</span>
                <span>UNS: {currentToothInfo.uns}</span>
                <span>•</span>
                <span>Palmer: {currentToothInfo.palmer}</span>
              </p>
            </div>
          </div>

          {/* Active Status Badge on selected tooth */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-xs">
              <span className="text-slate-500 mr-1 ml-1">{t.surfaceSelection}</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {Object.entries(currentToothState.surfaces || {})
                  .filter(([, active]) => active)
                  .map(([s]) => s.toUpperCase().charAt(0))
                  .join('-') || (language === 'ar' ? 'السن كاملاً' : 'Full Tooth')}
              </span>
            </div>

            {!readOnly && (
              <button
                type="button"
                id="clear-tooth-btn"
                onClick={() => handleClearTooth(currentToothInfo.fdi)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors border border-rose-200 dark:border-rose-900"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {t.clearTooth}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
