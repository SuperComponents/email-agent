import React, { useState, useEffect } from 'react';
import { GitHubService } from '../services/github';
import { Button } from '../components/atoms/Button';
import { Input } from '../components/atoms/Input';
import { AppLayout } from '../components/templates';
import { Header } from '../components/organisms';
import { FileText, Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface KnowledgeDocument {
  name: string;
  content: string;
  path: string;
}

export function KnowledgeBasePage() {
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

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const fileNames = await GitHubService.listFiles('rag/knowledge_base');
      
      const docs: KnowledgeDocument[] = [];
      for (const fileName of fileNames) {
        const content = await GitHubService.getFileContent(`rag/knowledge_base/${fileName}`);
        docs.push({
          name: fileName,
          content,
          path: `rag/knowledge_base/${fileName}`,
        });
      }
      
      setDocuments(docs);
    } catch (err) {
      setError('Failed to load documents from GitHub');
      console.error('Error loading documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDocument = (doc: KnowledgeDocument) => {
    if (isEditing || isCreating) {
      // Ask for confirmation if there are unsaved changes
      if (window.confirm('You have unsaved changes. Are you sure you want to switch documents?')) {
        setSelectedDocument(doc);
        setIsEditing(false);
        setIsCreating(false);
        setEditContent('');
      }
    } else {
      setSelectedDocument(doc);
    }
  };

  const handleEdit = () => {
    if (selectedDocument) {
      setEditContent(selectedDocument.content);
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!selectedDocument) return;

    try {
      setLoading(true);
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
        await GitHubService.deleteFile(
          selectedDocument.path,
          `Delete ${selectedDocument.name}`
        );

        // Update local state
        setDocuments(docs => docs.filter(doc => doc.path !== selectedDocument.path));
        setSelectedDocument(null);
      } catch (err) {
        setError('Failed to delete document');
        console.error('Error deleting document:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setNewDocName('');
    setEditContent('# New Document\n\nEnter your content here...');
    setSelectedDocument(null);
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
      setSelectedDocument(newDoc);
      setIsCreating(false);
      setNewDocName('');
      setEditContent('');
    } catch (err) {
      setError('Failed to create document');
      console.error('Error creating document:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
    setEditContent('');
    setNewDocName('');
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
} 