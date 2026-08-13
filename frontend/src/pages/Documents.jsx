import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { documentsApi, ragApi } from '../services/api';
import DocumentUpload from '../components/documents/DocumentUpload';
import DocumentTable from '../components/documents/DocumentTable';
import { FileText, X, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Documents() {
  const { activeProject, projectId } = useOutletContext();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [indexingId, setIndexingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  const fetchDocuments = () => {
    if (!projectId) return;
    setLoading(true);
    documentsApi.getDocuments(projectId)
      .then((res) => setDocuments(res.data || []))
      .catch(() => setDocuments([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDocuments();
  }, [projectId]);

  const handleUpload = async (file) => {
    setIsUploading(true);
    setStatusMessage(null);
    try {
      const formData = new FormData();
      formData.append('file', file);

      await documentsApi.uploadDocument(projectId, formData);
      setStatusMessage({ type: 'success', text: `Document '${file.name}' uploaded and processed successfully!` });
      fetchDocuments();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to upload document.';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsUploading(false);
    }
  };

  const handleIndex = async (docId) => {
    setIndexingId(docId);
    setStatusMessage(null);
    try {
      const res = await ragApi.indexDocument(docId);
      setStatusMessage({ type: 'success', text: `Document indexed successfully! ${res.data.chunks_created} chunks added to ChromaDB.` });
      fetchDocuments();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to index document.';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIndexingId(null);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document and all associated ChromaDB vector chunks?')) return;

    setDeletingId(docId);
    setStatusMessage(null);
    try {
      await documentsApi.deleteDocument(docId);
      setStatusMessage({ type: 'success', text: 'Document and vector embeddings deleted successfully.' });
      fetchDocuments();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to delete document.';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = async (doc) => {
    try {
      const res = await documentsApi.getDocumentDetail(doc.id);
      setSelectedDoc(res.data);
    } catch {
      setSelectedDoc(doc);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Project Knowledge Base</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage and index document sources used by the AI RAG engine for <strong>{activeProject?.name || 'this project'}</strong>.
        </p>
      </div>

      {/* Notification Banner */}
      {statusMessage && (
        <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
          statusMessage.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
        }`}>
          <div className="flex items-center gap-2 font-semibold">
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">×</button>
        </div>
      )}

      {/* Upload Zone */}
      <DocumentUpload onUpload={handleUpload} isUploading={isUploading} />

      {/* Document Table */}
      <DocumentTable
        documents={documents}
        onView={handleView}
        onIndex={handleIndex}
        onDelete={handleDelete}
        indexingId={indexingId}
        deletingId={deletingId}
      />

      {/* Document View Raw Text Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{selectedDoc.filename}</h4>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">{selectedDoc.file_type} · {(selectedDoc.file_size / 1024).toFixed(1)} KB</span>
                </div>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
              {selectedDoc.raw_text || 'No extracted text available.'}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold rounded-lg text-xs"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
