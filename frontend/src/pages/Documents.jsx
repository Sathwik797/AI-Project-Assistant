import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { documentsApi, ragApi } from '../services/api';
import DocumentUpload from '../components/documents/DocumentUpload';
import DocumentTable from '../components/documents/DocumentTable';
import DocumentSplitWorkspace from '../components/documents/DocumentSplitWorkspace';
import { FileText, X, AlertCircle, CheckCircle2, Search, Filter } from 'lucide-react';

export default function Documents() {
  const { activeProject, projectId } = useOutletContext();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [indexingId, setIndexingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

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
      const chunkCount = res.data.index_info?.chunk_count ?? 0;
      setStatusMessage({ type: 'success', text: `Document indexed successfully! ${chunkCount} chunks added to ChromaDB.` });
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

  const filteredDocs = documents.filter((d) => {
    const matchesSearch = !searchQuery || d.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || (d.file_type && d.file_type.toLowerCase() === typeFilter.toLowerCase());
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Search Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-[#1F2937] tracking-tight">Project Knowledge Base</h3>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Manage, inspect and index document sources for <strong>{activeProject?.name || 'this project'}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search docs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#E5E1D8] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#1F2937] outline-none focus:ring-1 focus:ring-[#C8923E] shadow-2xs"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#1F2937] outline-none shadow-2xs cursor-pointer"
          >
            <option value="ALL">All Types</option>
            <option value="PDF">PDF</option>
            <option value="DOCX">DOCX</option>
            <option value="TXT">TXT</option>
          </select>
        </div>
      </div>

      {/* Notification Banner */}
      {statusMessage && (
        <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
          statusMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2 font-semibold">
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-[#6B7280] hover:text-[#1F2937] cursor-pointer">×</button>
        </div>
      )}

      {/* Upload Zone */}
      <DocumentUpload onUpload={handleUpload} isUploading={isUploading} />

      {/* Document Table */}
      <DocumentTable
        documents={filteredDocs}
        onView={handleView}
        onIndex={handleIndex}
        onDelete={handleDelete}
        indexingId={indexingId}
        deletingId={deletingId}
      />

      {/* Interactive Split Document Workspace Modal */}
      {selectedDoc && (
        <DocumentSplitWorkspace
          document={selectedDoc}
          projectId={projectId}
          onClose={() => setSelectedDoc(null)}
        />
      )}
    </div>
  );
}
