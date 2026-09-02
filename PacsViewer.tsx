import React, { useState, useRef } from 'react';
import {
  RadiographItem,
  RadiographType,
} from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Eye,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Sliders,
  Sparkles,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  FileText,
  Layers,
  X,
} from 'lucide-react';

interface PacsViewerProps {
  radiographs?: RadiographItem[];
  selectedId?: string;
  onSelect?: (rad: RadiographItem) => void;
  onAddRadiograph?: (rad: Omit<RadiographItem, 'id'>) => void;
  readOnly?: boolean;
}

export const PacsViewer: React.FC<PacsViewerProps> = ({
  radiographs: customRadiographs,
  selectedId,
  onSelect,
  onAddRadiograph,
  readOnly = false,
}) => {
  const { radiographLibrary, addRadiograph, t, language } = useApp();

  const activeList = customRadiographs && customRadiographs.length > 0 ? customRadiographs : radiographLibrary;
  const [currentRadId, setCurrentRadId] = useState<string>(selectedId || activeList[0]?.id || 'rad-1');
  const [filterMode, setFilterMode] = useState<'normal' | 'negative' | 'high_contrast' | 'bone_density'>('normal');
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);

  // Upload form state
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState<RadiographType>('periapical');
  const [uploadTooth, setUploadTooth] = useState('');
  const [uploadNotes, setUploadNotes] = useState('');
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string>('');

  const viewerContainerRef = useRef<HTMLDivElement>(null);

  const currentRad = activeList.find((r) => r.id === currentRadId) || activeList[0] || radiographLibrary[0];

  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.min(Math.max(prev + delta, 0.5), 3.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const resetAdjustments = () => {
    setFilterMode('normal');
    setBrightness(100);
    setContrast(100);
    setZoom(1);
    setRotation(0);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitNewRadiograph = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle || !uploadPreviewUrl) return;

    const newRadData: Omit<RadiographItem, 'id'> = {
      title: uploadTitle,
      type: uploadType,
      toothNumber: uploadTooth || undefined,
      notes: uploadNotes || undefined,
      url: uploadPreviewUrl,
      date: new Date().toISOString().substring(0, 10),
    };

    if (onAddRadiograph) {
      onAddRadiograph(newRadData);
    } else {
      const created = addRadiograph(newRadData);
      setCurrentRadId(created.id);
    }

    setShowUploadModal(false);
    setUploadTitle('');
    setUploadNotes('');
    setUploadTooth('');
    setUploadPreviewUrl('');
  };

  // Compute CSS filter style for PACS clinical analysis
  let filterCss = `brightness(${brightness}%) contrast(${contrast}%)`;
  if (filterMode === 'negative') {
    filterCss += ' invert(100%)';
  } else if (filterMode === 'high_contrast') {
    filterCss += ' contrast(180%)';
  } else if (filterMode === 'bone_density') {
    filterCss += ' contrast(160%) hue-rotate(180deg) saturate(150%)';
  }

  const getTypeBadge = (type: RadiographType) => {
    switch (type) {
      case 'panoramic':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">OPG بانوراما</span>;
      case 'periapical':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">Periapical ذروية</span>;
      case 'bitewing':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">Bitewing مجنحة</span>;
      case 'cbct':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">CBCT مقطعية</span>;
    }
  };

  return (
    <div
      ref={viewerContainerRef}
      className={`bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 overflow-hidden shadow-lg transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full'
      }`}
    >
      {/* Top Controls Toolbar */}
      <div className="p-3 md:p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                {currentRad?.title || t.pacsTitle}
              </h3>
              {currentRad && getTypeBadge(currentRad.type)}
            </div>
            {currentRad?.toothNumber && (
              <span className="text-xs text-teal-400 font-mono">
                السن: #{currentRad.toothNumber} • {currentRad.date}
              </span>
            )}
          </div>
        </div>

        {/* Clinical Diagnostic Action Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Negative Film Inversion */}
          <button
            type="button"
            id="pacs-invert-btn"
            onClick={() =>
              setFilterMode((prev) => (prev === 'negative' ? 'normal' : 'negative'))
            }
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              filterMode === 'negative'
                ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400 font-bold shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t.negativeFilm}
          </button>

          {/* Bone Density Filter */}
          <button
            type="button"
            id="pacs-bone-density-btn"
            onClick={() =>
              setFilterMode((prev) => (prev === 'bone_density' ? 'normal' : 'bone_density'))
            }
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterMode === 'bone_density'
                ? 'bg-teal-500 text-white font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            كثافة العظم (Bone)
          </button>

          {/* Zoom In */}
          <button
            type="button"
            id="pacs-zoom-in-btn"
            onClick={() => handleZoom(0.25)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
            title={t.zoomIn}
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Zoom Out */}
          <button
            type="button"
            id="pacs-zoom-out-btn"
            onClick={() => handleZoom(-0.25)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
            title={t.zoomOut}
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Rotate */}
          <button
            type="button"
            id="pacs-rotate-btn"
            onClick={handleRotate}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
            title={t.rotate}
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            id="pacs-fullscreen-btn"
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
            title={t.fullscreen}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Upload Button */}
          {!readOnly && (
            <button
              type="button"
              id="pacs-upload-btn"
              onClick={() => setShowUploadModal(true)}
              className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              {t.uploadRadiograph}
            </button>
          )}
        </div>
      </div>

      {/* Adjustments Sub-Bar (Brightness & Contrast Sliders) */}
      <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span>{t.brightness}</span>
            <input
              type="range"
              min="50"
              max="180"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-24 accent-teal-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
            <span className="font-mono text-slate-300">{brightness}%</span>
          </div>

          <div className="flex items-center gap-2">
            <span>{t.contrast}</span>
            <input
              type="range"
              min="50"
              max="220"
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-24 accent-teal-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
            <span className="font-mono text-slate-300">{contrast}%</span>
          </div>

          <div className="text-slate-500 font-mono text-[11px]">
            Zoom: {Math.round(zoom * 100)}% • Rot: {rotation}°
          </div>
        </div>

        <button
          type="button"
          onClick={resetAdjustments}
          className="text-xs text-slate-400 hover:text-white underline underline-offset-4"
        >
          إعادة ضبط المعايرة
        </button>
      </div>

      {/* Main Radiograph Canvas Area */}
      <div className="relative min-h-[380px] max-h-[550px] flex items-center justify-center bg-black/90 p-4 overflow-hidden">
        {currentRad ? (
          <div
            className="transition-transform duration-100 ease-out flex items-center justify-center"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
            }}
          >
            <img
              src={currentRad.url}
              alt={currentRad.title}
              referrerPolicy="no-referrer"
              className="max-h-[460px] max-w-full object-contain rounded-md shadow-2xl transition-all"
              style={{
                filter: filterCss,
              }}
            />
          </div>
        ) : (
          <div className="text-center text-slate-500">
            <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>لا توجد صورة أشعة محددة</p>
          </div>
        )}

        {/* Clinical Radiograph Findings Overlay */}
        {currentRad?.notes && (
          <div className="absolute bottom-3 left-3 right-3 md:right-auto max-w-md bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-700/80 text-xs text-slate-200 shadow-xl">
            <div className="flex items-center gap-1.5 text-teal-400 font-bold mb-1">
              <FileText className="w-3.5 h-3.5" />
              <span>التقرير والتشخيص الإشعاعي (Radiological Findings):</span>
            </div>
            <p className="leading-relaxed text-slate-300 text-[11px]">{currentRad.notes}</p>
          </div>
        )}
      </div>

      {/* Radiographs Thumbnail Gallery Strip */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 overflow-x-auto">
        <div className="flex items-center gap-2">
          {activeList.map((rad) => {
            const isSelected = rad.id === currentRadId;
            return (
              <button
                key={rad.id}
                type="button"
                id={`thumb-${rad.id}`}
                onClick={() => {
                  setCurrentRadId(rad.id);
                  if (onSelect) onSelect(rad);
                }}
                className={`relative flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all group ${
                  isSelected
                    ? 'border-teal-500 ring-2 ring-teal-500/40'
                    : 'border-slate-800 hover:border-slate-600 opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={rad.url}
                  alt={rad.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[9px] font-mono text-white text-center py-0.5 truncate px-1">
                  {rad.toothNumber ? `#${rad.toothNumber}` : rad.type.toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Upload Radiograph Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Upload className="w-5 h-5 text-teal-600" />
                {t.uploadRadiograph}
              </h3>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitNewRadiograph} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان وتوصيف الأشعة *
                </label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="مثال: أشعة ذروية للسن 36 بعد حشو العصب"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.radiographType}
                  </label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as RadiographType)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
                  >
                    <option value="periapical">{t.periapical}</option>
                    <option value="bitewing">{t.bitewing}</option>
                    <option value="panoramic">{t.panoramic}</option>
                    <option value="cbct">{t.cbct}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    رقم السن (FDI)
                  </label>
                  <input
                    type="text"
                    value={uploadTooth}
                    onChange={(e) => setUploadTooth(e.target.value)}
                    placeholder="مثال: 46 أو 16"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  الملاحظات والتقرير الإشعاعي
                </label>
                <textarea
                  rows={3}
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  placeholder="وصف المشاهدات الإشعاعية مثل مستوى العظم، الآفات الذروية، أو كشف التسوس..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              {/* File Upload / Image Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ملف صورة الأشعة الرقمية (DICOM/JPG/PNG) *
                </label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:border-teal-500 transition-colors">
                  {uploadPreviewUrl ? (
                    <div className="space-y-2">
                      <img
                        src={uploadPreviewUrl}
                        alt="Preview"
                        className="max-h-32 mx-auto rounded-lg shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setUploadPreviewUrl('')}
                        className="text-xs text-rose-600 hover:underline"
                      >
                        تغيير الصورة
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 mx-auto text-slate-400 mb-1" />
                      <p className="text-xs text-slate-500">
                        اسحب وأفلت ملف الأشعة هنا أو{' '}
                        <label className="text-teal-600 font-bold cursor-pointer hover:underline">
                          تصفح جهازك
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={!uploadPreviewUrl || !uploadTitle}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-500 text-white disabled:opacity-50 transition-colors shadow-xs"
                >
                  حفظ وتوثيق الأشعة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
