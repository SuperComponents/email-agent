import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GitHubService } from '../services/github';
import { Button } from '../components/atoms/Button';
import { Input } from '../components/atoms/Input';
import { AppLayout } from '../components/templates';
import { Header } from '../components/organisms';
import { FileText, Plus, Edit, Trash2, Save, X, Link } from 'lucide-react';

interface KnowledgeDocument {
  name: string;
  content: string;
  path: string;
}

export function KnowledgeBasePage() {
  const { documentName } = useParams<{ documentName?: string }>();
  const navigate = useNavigate();
  
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<KnowledgeDocument | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [newDocName, setNewDocName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load documents on component mount
  useEffect(() => {
    loadDocuments();
  }, []);

  // Sync URL to document selection - URL is the single source of truth
  useEffect(() => {
    if (documentName && documents.length > 0) {
      console.log('Looking for document from URL:', documentName);
      const document = documents.find(doc => doc.name === documentName);
      if (document) {
        console.log('Found document from URL:', document.name);
        setSelectedDocument(document);
      } else {
        console.log('Document not found from URL, redirecting to knowledge base');
        // Document not found, redirect to knowledge base without document
        navigate('/knowledge-base', { replace: true });
      }
    } else if (!documentName) {
      console.log('No document in URL, clearing selection');
      setSelectedDocument(null);
    }
  }, [documentName, documents, navigate]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading documents from GitHub...');
      const fileNames = await GitHubService.listFiles('rag/knowledge_base');
      console.log('Found files:', fileNames);
      
      const docs: KnowledgeDocument[] = [];
      for (const fileName of fileNames) {
        const content = await GitHubService.getFileContent(`rag/knowledge_base/${fileName}`);
        docs.push({
          name: fileName,
          content,
          path: `rag/knowledge_base/${fileName}`,
        });
      }
      
      console.log('Loaded documents:', docs.map(d => d.name));
      setDocuments(docs);
    } catch (err) {
      setError('Failed to load documents from GitHub');
      console.error('Error loading documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDocument = (doc: KnowledgeDocument) => {
    console.log('Selecting document:', doc.name);
    if (isEditing || isCreating) {
      // Ask for confirmation if there are unsaved changes
      if (window.confirm('You have unsaved changes. Are you sure you want to switch documents?')) {
        // Navigate to the document URL
        navigate(`/knowledge-base/${encodeURIComponent(doc.name)}`);
        setIsEditing(false);
        setIsCreating(false);
        setEditContent('');
      }
    } else {
      // Navigate to the document URL
      navigate(`/knowledge-base/${encodeURIComponent(doc.name)}`);
    }
  };

  const handleEdit = () => {
    if (selectedDocument) {
      console.log('Editing document:', selectedDocument.name);
      setEditContent(selectedDocument.content);
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!selectedDocument) return;

    try {
      setLoading(true);
      console.log('Saving document:', selectedDocument.name);
      await GitHubService.commitFile({
        path: selectedDocument.path,
        content: editContent,
        message: `Update ${selectedDocument.name}`,
      });

      // Update local state
      const updatedDoc = { ...selectedDocument, content: editContent };
      setDocuments(docs => 
        docs.map(doc => doc.path === selectedDocument.path ? updatedDoc : doc)
      );
      setSelectedDocument(updatedDoc);
      setIsEditing(false);
      setEditContent('');
      console.log('Document saved successfully');
    } catch (err) {
      setError('Failed to save document');
      console.error('Error saving document:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDocument) return;

    if (window.confirm(`Are you sure you want to delete ${selectedDocument.name}?`)) {
      try {
        setLoading(true);
        console.log('Deleting document:', selectedDocument.name);
        await GitHubService.deleteFile(
          selectedDocument.path,
          `Delete ${selectedDocument.name}`
        );

        // Update local state
        setDocuments(docs => docs.filter(doc => doc.path !== selectedDocument.path));
        // Navigate back to knowledge base without document
        navigate('/knowledge-base');
        console.log('Document deleted successfully');
      } catch (err) {
        setError('Failed to delete document');
        console.error('Error deleting document:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCreateNew = () => {
    console.log('Creating new document');
    setIsCreating(true);
    setNewDocName('');
    setEditContent('# New Document\n\nEnter your content here...');
    // Navigate to knowledge base without document
    navigate('/knowledge-base');
    setIsEditing(false);
  };

  const handleSaveNew = async () => {
    if (!newDocName.trim()) {
      setError('Document name is required');
      return;
    }

    const fileName = newDocName.endsWith('.md') ? newDocName : `${newDocName}.md`;
    const path = `rag/knowledge_base/${fileName}`;

    try {
      setLoading(true);
      console.log('Creating new document:', fileName);
      await GitHubService.commitFile({
        path,
        content: editContent,
        message: `Create ${fileName}`,
      });

      // Add to local state
      const newDoc: KnowledgeDocument = {
        name: fileName,
        content: editContent,
        path,
      };
      setDocuments(docs => [...docs, newDoc]);
      setIsCreating(false);
      setNewDocName('');
      setEditContent('');
      // Navigate to the new document
      navigate(`/knowledge-base/${encodeURIComponent(fileName)}`);
      console.log('New document created successfully');
    } catch (err) {
      setError('Failed to create document');
      console.error('Error creating document:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    console.log('Canceling operation');
    setIsEditing(false);
    setIsCreating(false);
    setEditContent('');
    setNewDocName('');
  };

  const handleCopyLink = async () => {
    if (!selectedDocument) return;
    
    const url = `${window.location.origin}/knowledge-base/${encodeURIComponent(selectedDocument.name)}`;
    try {
      await navigator.clipboard.writeText(url);
      console.log('Link copied to clipboard:', url);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy link:', err);
      // Fallback: select the URL in a temporary input
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
  };

  return (
    <AppLayout
      header={<Header />}
      sidebar={
        <div className="w-80 border-r border-border bg-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Knowledge Base</h2>
            <Button
              size="sm"
              onClick={handleCreateNew}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              New
            </Button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          {loading && (
            <div className="mb-4 text-center text-muted-foreground">
              Loading...
            </div>
          )}

          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.path}
                className={`p-3 rounded-md cursor-pointer transition-colors ${
                  selectedDocument?.path === doc.path
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover:bg-muted'
                }`}
                onClick={() => handleSelectDocument(doc)}
              >
                <div className="flex items-center gap-2">
                  <FileText size={16} />
                  <span className="text-sm font-medium">{doc.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      }
      main={
        <div className="flex-1 p-6">
          {isCreating ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Create New Document</h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveNew}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <Save size={16} />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <X size={16} />
                    Cancel
                  </Button>
                </div>
              </div>

              <Input
                placeholder="Document name (e.g., troubleshooting-guide.md)"
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                className="mb-4"
              />

              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-96 p-4 border border-border rounded-md font-mono text-sm resize-none"
                placeholder="Enter your markdown content here..."
              />
            </div>
          ) : selectedDocument ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{selectedDocument.name}</h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleCopyLink}
                    disabled={loading}
                    className="flex items-center gap-2"
                    title="Copy link to this document"
                  >
                    <Link size={16} />
                    Copy Link
                  </Button>
                  {isEditing ? (
                    <>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2"
                      >
                        <Save size={16} />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleCancel}
                        disabled={loading}
                        className="flex items-center gap-2"
                      >
                        <X size={16} />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        onClick={handleEdit}
                        disabled={loading}
                        className="flex items-center gap-2"
                      >
                        <Edit size={16} />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleDelete}
                        disabled={loading}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-96 p-4 border border-border rounded-md font-mono text-sm resize-none"
                />
              ) : (
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-md">
                    {selectedDocument.content}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <FileText size={48} className="mx-auto mb-4" />
                <p>Select a document to view or create a new one</p>
              </div>
            </div>
          )}
        </div>
      }
    />
  );
}; 