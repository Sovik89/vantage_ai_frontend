
import React from 'react';

export default function UploadButton({ onFiles }: { onFiles: (files: FileList) => void }) {
  const fileRef = React.useRef<HTMLInputElement | null>(null);

  return (
    <div className="inline-block">
      <button
        aria-label="Upload files"
        onClick={() => fileRef.current && fileRef.current.click()}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg focus:outline-none"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))', border: '1px solid rgba(4,174,236,0.14)', color: '#04AEEC', fontSize: 28 }}
        title="Upload files"
      >
        +
      </button>
      <input
        ref={fileRef}
        type="file"
        style={{ display: 'none' }}
        multiple
        onChange={(e) => e.target.files && onFiles(e.target.files)}
      />
    </div>
  );
}
