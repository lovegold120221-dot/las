import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useUI } from '../lib/state';

const DownloadButton = ({ content, title, type, ext }: { content: string, title: string, type: string, ext: string }) => (
  <button className="flex items-center gap-2 pill-btn bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition" onClick={() => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title?.replace(/[^a-z0-9]/gi, '_') || 'document'}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }}>
    <Download size={16} /> Download {ext.toUpperCase()}
  </button>
);

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
          className="fixed inset-0 z-50 flex flex-col bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">
              {isGenerating ? 'Beatrice is working...' : (activeWorkspaceResult?.artifact ? `Artifact: ${activeWorkspaceResult.artifact.title}` : 'Workspace Data')}
            </h2>
            <button className="p-2 rounded-full hover:bg-gray-100" onClick={closeOverlay}>
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4" />
                <p>Generating your artifact...</p>
              </div>
            ) : activeWorkspaceResult?.artifact ? (
              <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl border shadow-sm">
                <div className="mb-6 flex gap-2">
                  <DownloadButton 
                    content={activeWorkspaceResult.artifact.content}
                    title={activeWorkspaceResult.artifact.title || 'artifact'}
                    type={activeWorkspaceResult.artifact.type === 'markdown' ? 'text/markdown' : 'text/plain'}
                    ext={activeWorkspaceResult.artifact.type === 'markdown' ? 'md' : 'txt'}
                  />
                </div>
                
                {activeWorkspaceResult.artifact.type === 'html' && (
                  <iframe srcDoc={activeWorkspaceResult.artifact.content} className="w-full h-[60vh] border rounded-lg" title="HTML Preview" />
                )}
                {activeWorkspaceResult.artifact.type === 'markdown' && (
                  <div className="prose max-w-none">
                    <ReactMarkdown>{activeWorkspaceResult.artifact.content}</ReactMarkdown>
                  </div>
                )}
                {activeWorkspaceResult.artifact.type === 'structured' && (
                  <pre className="p-4 bg-gray-100 rounded-lg overflow-x-auto text-sm font-mono text-gray-800">
                    {JSON.stringify(JSON.parse(activeWorkspaceResult.artifact.content), null, 2)}
                  </pre>
                )}
                {activeWorkspaceResult.artifact.type === 'code' && (
                  <pre className="p-4 bg-gray-900 text-white rounded-lg overflow-x-auto text-sm font-mono">
                    <code>{activeWorkspaceResult.artifact.content}</code>
                  </pre>
                )}
              </div>
            ) : (
              <pre className="p-4 bg-gray-900 rounded-lg text-green-400 overflow-x-auto text-xs">
                {activeWorkspaceResult ? JSON.stringify(activeWorkspaceResult, null, 2) : ''}
              </pre>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
