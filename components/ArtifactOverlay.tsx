import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useUI } from '../lib/state';

export const ArtifactOverlay: React.FC = () => {
  const activeWorkspaceResult = useUI((state) => state.activeWorkspaceResult);
  const isGenerating = useUI((state) => state.isGenerating);
  const setActiveWorkspaceResult = useUI((state) => state.setActiveWorkspaceResult);
  const setIsGenerating = useUI((state) => state.setIsGenerating);

  const closeOverlay = () => {
    setActiveWorkspaceResult(null);
    setIsGenerating(false);
  };

  return (
    <AnimatePresence>
      {(activeWorkspaceResult || isGenerating) && (
        <motion.div
          id="overlay-workspace"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
          className="full-page-overlay active"
        >
          <div className="overlay-header">
            <div className="overlay-title">
              {isGenerating ? 'Beatrice is working...' : (activeWorkspaceResult?.artifact ? `Artifact: ${activeWorkspaceResult.artifact.title}` : 'Workspace Data')}
            </div>
            <button className="close-overlay-btn" onClick={closeOverlay}>
              <X size={18} />
            </button>
          </div>
          <div className="overlay-content" style={{ overflowY: 'auto', padding: '24px' }}>
            {isGenerating ? (
              <div className="artifact-viewer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTopColor: 'var(--accent-active)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
                <p>Generating your document...</p>
              </div>
            ) : activeWorkspaceResult?.artifact ? (
              <div className="artifact-viewer" style={{ backgroundColor: 'white', color: 'black', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                {activeWorkspaceResult.artifact.type === 'html' && (
                  <iframe srcDoc={activeWorkspaceResult.artifact.content} style={{ width: '100%', height: '100%', border: 'none' }} title="HTML Preview" />
                )}
                {activeWorkspaceResult.artifact.type === 'pdf' && (
                  <iframe src={activeWorkspaceResult.artifact.content} style={{ width: '100%', height: '100%', border: 'none' }} title="PDF Preview" />
                )}
                {activeWorkspaceResult.artifact.type === 'markdown' && (
                  <div className="markdown-body">
                    <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
                      <button className="pill-btn" onClick={() => {
                        const blob = new Blob([activeWorkspaceResult.artifact.content], { type: 'text/markdown' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${activeWorkspaceResult.artifact.title?.replace(/[^a-z0-9]/gi, '_') || 'document'}.md`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}>Download Markdown</button>
                    </div>
                    <ReactMarkdown>{activeWorkspaceResult.artifact.content}</ReactMarkdown>
                  </div>
                )}
                {activeWorkspaceResult.artifact.type === 'code' && (
                  <div className="artifact-viewer">
                    <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
                        <button className="pill-btn" onClick={() => {
                            const blob = new Blob([activeWorkspaceResult.artifact.content], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${activeWorkspaceResult.artifact.title || 'code'}.txt`;
                            a.click();
                        }}>Download Code</button>
                    </div>
                    <pre style={{ backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '8px', overflowX: 'auto' }}>
                      <code>{activeWorkspaceResult.artifact.content}</code>
                    </pre>
                  </div>
                )}
                {activeWorkspaceResult.artifact.type === 'structured' && (
                  <div style={{ whiteSpace: 'pre-wrap' }}>{activeWorkspaceResult.artifact.content}</div>
                )}
                {activeWorkspaceResult.artifact.type === 'chart' && (
                  <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                    [Chart Visualization Rendering: {activeWorkspaceResult.artifact.title}]
                    <pre style={{ fontSize: '10px', textAlign: 'left' }}>{activeWorkspaceResult.artifact.content}</pre>
                  </div>
                )}
              </div>
            ) : (
              <pre style={{ backgroundColor: '#111', padding: '16px', borderRadius: '8px', color: '#a3f01c', whiteSpace: 'pre-wrap', fontSize: '12px' }}>
                {activeWorkspaceResult ? JSON.stringify(activeWorkspaceResult, null, 2) : ''}
              </pre>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
