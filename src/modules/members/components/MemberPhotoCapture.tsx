import React, { useState, useRef, useEffect } from 'react';
import { Camera, Trash2, RefreshCw, X, Check, User, Loader2 } from 'lucide-react';
import { toast } from '@/shared';

interface MemberPhotoCaptureProps {
  value?: string;
  documentId?: string;
  onChange: (url: string, documentId?: string) => void;
  disabled?: boolean;
  mode?: 'add' | 'edit' | 'view';
}

export const MemberPhotoCapture: React.FC<MemberPhotoCaptureProps> = ({
  value,
  documentId,
  onChange,
  disabled = false
}) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
    setCameraError(null);
    setIsUploading(false);
  };

  // Start webcam
  const startCamera = async () => {
    try {
      setCameraError(null);
      setIsCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      const msg = err.message || 'Unable to access camera. Please check camera permissions.';
      setCameraError(msg);
      toast.error(msg, { title: 'Camera Error' });
    }
  };


  useEffect(() => {
    if (isCameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(console.error);
    }
  }, [isCameraOpen]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Upload image to backend document upload API with 'nsf-members' folder
  const uploadImageToS3 = async (fileBlob: Blob): Promise<{ url: string; documentId: string }> => {
    const formData = new FormData();
    formData.append('file', fileBlob, `member-${Date.now()}.jpg`);
    formData.append('folder', 'nsf-members');

    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${process.env.VITE_API_BASE_URL}/document/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to upload image to server');
    }

    const resData = await response.json();
    const uploadedUrl = resData?.data?.url || resData?.url;
    const docId = resData?.data?._id || resData?._id || '';

    if (!uploadedUrl) {
      throw new Error('Upload succeeded but no image URL was returned.');
    }
    return { url: uploadedUrl, documentId: docId };
  };

  // Capture frame from video stream and upload directly
  const capturePhoto = () => {
    if (!videoRef.current || isUploading) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setCameraError('Failed to process camera image.');
        return;
      }

      try {
        setIsUploading(true);
        setCameraError(null);
        const { url, documentId: newDocId } = await uploadImageToS3(blob);
        onChange(url, newDocId);
        stopCamera();
        toast.success('Photo captured and uploaded successfully!');
      } catch (err: any) {
        console.error('Image upload failed:', err);
        setCameraError(err.message || 'Failed to upload photo. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }, 'image/jpeg', 0.9);
  };

  // Remove photo and call delete document API if documentId is present
  const removePhoto = async () => {
    if (isDeleting) return;

    if (documentId) {
      try {
        setIsDeleting(true);
        const token = localStorage.getItem('accessToken');
        await fetch(`${process.env.VITE_API_BASE_URL}/document/${documentId}`, {
          method: 'DELETE',
          headers: {
            'accept': '*/*',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
      } catch (err) {
        console.error('Failed to delete image document:', err);
      } finally {
        setIsDeleting(false);
      }
    }

    onChange('', '');
    toast.info('Photo removed.');
  };


  return (
    <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 transition-all">
      <div className="flex flex-col sm:flex-row items-center gap-5">
        {/* Photo Avatar Preview */}
        <div className="relative group shrink-0">
          <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 bg-white flex items-center justify-center shadow-inner">
            {isDeleting ? (
              <div className="flex flex-col items-center justify-center p-2 text-slate-400 gap-1">
                <Loader2 className="w-6 h-6 animate-spin text-red-500" />
                <span className="text-[9px] font-medium text-slate-500">Deleting...</span>
              </div>
            ) : value ? (
              <img src={value} alt="Member preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center text-slate-350">
                <User className="w-9 h-9 text-slate-300" />
                <span className="text-[10px] font-medium mt-1 text-slate-400">No Photo</span>
              </div>
            )}
          </div>

          {value && !disabled && !isDeleting && (
            <button
              type="button"
              onClick={removePhoto}
              title="Remove photo"
              className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition-transform hover:scale-110"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex-1 text-center sm:text-left">
          <h4 className="text-sm font-semibold text-slate-800">Member Photo</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            {value
              ? 'Photo attached to member profile.'
              : 'Capture a live member photo via camera.'}
          </p>

          {!disabled && (
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-3">
              {!value ? (
                <button
                  type="button"
                  onClick={startCamera}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Take Photo</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={removePhoto}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-red-600 hover:bg-red-50 border border-red-200 bg-white text-xs font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Photo</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Live Webcam Modal / Overlay */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl overflow-hidden max-w-md w-full shadow-2xl border border-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-slate-800 text-sm">Capture Member Photo</h3>
              </div>
              <button
                type="button"
                onClick={stopCamera}
                disabled={isUploading}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Viewport */}
            <div className="relative bg-slate-950 aspect-4/3 flex items-center justify-center overflow-hidden">
              {cameraError ? (
                <div className="p-6 text-center text-white space-y-2">
                  <p className="text-sm font-semibold text-rose-400">Camera / Upload Error</p>
                  <p className="text-xs text-slate-300">{cameraError}</p>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Try Again</span>
                  </button>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                  {/* Target Crosshair / Oval Outline Overlay */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-48 h-56 rounded-full border-2 border-dashed border-white/60 shadow-sm" />
                  </div>

                  {/* Uploading Spinner Overlay */}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white gap-2">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p className="text-xs font-semibold">Uploading photo to S3...</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Controls */}
            <div className="p-4 bg-slate-50 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={stopCamera}
                disabled={isUploading}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={capturePhoto}
                disabled={!!cameraError || isUploading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md shadow-primary/20 transition-all disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Capture & Save</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
