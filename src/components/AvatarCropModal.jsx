import { useState, useRef, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const MotionDiv = motion.div;

const CANVAS_SIZE = 300; // output image px
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.01;

/**
 * Modal that lets users zoom & drag-position a photo before saving it as their avatar.
 * Renders a square preview with rounded corners matching the app's design system.
 */
const AvatarCropModal = ({ imageUrl, isOpen, onSave, onCancel }) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });

  const imgRef = useRef(null);
  const containerRef = useRef(null);

  // Load image dimensions once the URL is available
  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.onload = () => {
      setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Clamp offset so the image always covers the preview area
  const clampOffset = useCallback((ox, oy, z) => {
    if (!containerRef.current) return { x: ox, y: oy };
    const box = containerRef.current.getBoundingClientRect();
    const { w, h } = imgSize;
    if (!w || !h) return { x: ox, y: oy };

    // Compute scaled image dimensions (cover-fit at zoom=1, then scaled)
    const aspect = w / h;
    let dispW, dispH;
    if (aspect >= 1) {
      // landscape or square — height fits container, width overflows
      dispH = box.height * z;
      dispW = dispH * aspect;
    } else {
      // portrait — width fits container, height overflows
      dispW = box.width * z;
      dispH = dispW / aspect;
    }

    const maxX = Math.max(0, (dispW - box.width) / 2);
    const maxY = Math.max(0, (dispH - box.height) / 2);

    return {
      x: Math.min(maxX, Math.max(-maxX, ox)),
      y: Math.min(maxY, Math.max(-maxY, oy)),
    };
  }, [imgSize]);

  // --- Pointer drag ---
  const handlePointerDown = (e) => {
    e.preventDefault();
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handlePointerMove = useCallback((e) => {
    if (!dragging) return;
    const nx = e.clientX - dragStart.x;
    const ny = e.clientY - dragStart.y;
    setOffset(clampOffset(nx, ny, zoom));
  }, [dragging, dragStart, zoom, clampOffset]);

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [dragging, handlePointerMove, handlePointerUp]);

  // --- Zoom ---
  const handleZoomChange = (newZoom) => {
    const z = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, newZoom));
    setZoom(z);
    setOffset(prev => clampOffset(prev.x, prev.y, z));
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.002;
    handleZoomChange(zoom + delta);
  };

  // --- Reset ---
  const handleReset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  // --- Save: render to canvas and export ---
  const handleSave = () => {
    if (!imgRef.current || !containerRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    const ctx = canvas.getContext('2d');

    const box = containerRef.current.getBoundingClientRect();
    const { w, h } = imgSize;
    const aspect = w / h;

    let dispW, dispH;
    if (aspect >= 1) {
      dispH = box.height * zoom;
      dispW = dispH * aspect;
    } else {
      dispW = box.width * zoom;
      dispH = dispW / aspect;
    }

    // Image top-left relative to container
    const imgLeft = (box.width - dispW) / 2 + offset.x;
    const imgTop = (box.height - dispH) / 2 + offset.y;

    // Map container coords to canvas coords
    const scale = CANVAS_SIZE / box.width;
    ctx.drawImage(
      imgRef.current,
      imgLeft * scale,
      imgTop * scale,
      dispW * scale,
      dispH * scale
    );

    // Use toDataURL so it persists across sessions (unlike blob URLs)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    onSave(dataUrl);
  };

  if (!imageUrl) return null;

  // Compute image transform style
  const { w, h } = imgSize;
  const aspect = w && h ? w / h : 1;
  const isLandscape = aspect >= 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-secondary/70 backdrop-blur-md flex items-center justify-center p-4"
          onClick={onCancel}
        >
          <MotionDiv
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="bg-paper rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="text-lg font-black tracking-tight text-secondary">
                Adjust Photo
              </h2>
              <button
                onClick={onCancel}
                className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center text-secondary hover:bg-secondary/20 transition-colors"
                aria-label="Cancel"
              >
                <X size={18} />
              </button>
            </div>

            {/* Preview area */}
            <div className="px-5">
              <div
                ref={containerRef}
                onPointerDown={handlePointerDown}
                onWheel={handleWheel}
                className="relative w-full aspect-square rounded-[28px] overflow-hidden bg-secondary/5 cursor-grab active:cursor-grabbing touch-none select-none"
              >
                {/* Guide overlay — subtle rounded-square outline */}
                <div className="absolute inset-3 rounded-[24px] border-2 border-white/40 pointer-events-none z-10" />

                <img
                  ref={imgRef}
                  src={imageUrl}
                  alt="Crop preview"
                  draggable={false}
                  className="absolute pointer-events-none"
                  style={{
                    width: isLandscape ? 'auto' : '100%',
                    height: isLandscape ? '100%' : 'auto',
                    transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})`,
                    top: '50%',
                    left: '50%',
                    transformOrigin: 'center center',
                  }}
                />
              </div>
            </div>

            {/* Zoom controls */}
            <div className="px-5 pt-4 pb-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleZoomChange(zoom - 0.1)}
                  disabled={zoom <= MIN_ZOOM}
                  className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center text-secondary disabled:opacity-30 hover:bg-secondary/20 transition-colors"
                  aria-label="Zoom out"
                >
                  <ZoomOut size={16} />
                </button>
                <input
                  type="range"
                  min={MIN_ZOOM}
                  max={MAX_ZOOM}
                  step={ZOOM_STEP}
                  value={zoom}
                  onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                  className="flex-1 h-1.5 appearance-none rounded-full bg-secondary/15 accent-primary cursor-pointer"
                  aria-label="Zoom level"
                />
                <button
                  onClick={() => handleZoomChange(zoom + 0.1)}
                  disabled={zoom >= MAX_ZOOM}
                  className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center text-secondary disabled:opacity-30 hover:bg-secondary/20 transition-colors"
                  aria-label="Zoom in"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  onClick={handleReset}
                  className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center text-secondary hover:bg-secondary/20 transition-colors"
                  aria-label="Reset position"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-5 pt-2 pb-5">
              <button
                onClick={onCancel}
                className="flex-1 py-3.5 rounded-[20px] bg-secondary/10 text-secondary font-bold text-sm uppercase tracking-widest active:scale-[0.98] transition-transform"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3.5 rounded-[20px] bg-primary text-white font-bold text-sm uppercase tracking-widest shadow-lg active:scale-[0.98] transition-transform"
              >
                Save
              </button>
            </div>
          </MotionDiv>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
};

export default AvatarCropModal;
