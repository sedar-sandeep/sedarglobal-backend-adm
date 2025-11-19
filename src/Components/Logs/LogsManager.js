import React, { useEffect, useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faTrash, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { listLogs, downloadLog, deleteLog } from '../../services/LogsService';
import Config from '../Config';
import { ConfirmationDialog } from '../../ConfirmationDialog';

function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleString();
  } catch (e) {
    return dateStr;
  }
}

export default function LogsManager() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingFile, setDeletingFile] = useState(null);
  console.log('LogsManager mounted');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listLogs();
      const files = res?.data?.files || [];
      setLogs(files);
    } catch (err) {
      console.error('Failed to load logs:', err);
      Config.createNotification('error', 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleDownload = async (filename) => {
    try {
      const response = await downloadLog(filename);
      const blob = new Blob([response.data], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      Config.createNotification('success', `Downloaded ${filename}`);
    } catch (err) {
      console.error('Download failed:', err);
      Config.createNotification('error', `Download failed for ${filename}`);
    }
  };

  const confirmDelete = (filename) => {
    setDeletingFile(filename);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setDeletingFile(null);
  };

  const proceedDelete = async (agree) => {
    if (!agree) return closeConfirm();
    try {
      setLoading(true);
      await deleteLog(deletingFile);
      Config.createNotification('success', `Deleted ${deletingFile}`);
      closeConfirm();
      fetchLogs();
    } catch (err) {
      console.error('Delete failed:', err);
      Config.createNotification('error', `Delete failed for ${deletingFile}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid" style={{ padding: 24 }}>
      <div className="row mb-3 align-items-center">
        <div className="col-md-8">
          <h1 className="font-weight-bold" style={{ fontSize: 24 }}>System Log Files</h1>
          <p className="text-muted" style={{ marginBottom: 0 }}>Manage application logs (list, download, delete)</p>
        </div>
        <div className="col-md-4 text-right">
          <button className="btn btn-sm btn-outline-primary" onClick={fetchLogs} disabled={loading}>
            <FontAwesomeIcon icon={faSyncAlt} /> Refresh
          </button>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          {loading && (<div className="mb-2">Loading...</div>)}
          <div className="table-responsive">
            <table className="table table-striped table-bordered table-sm">
              <thead>
                <tr>
                  <th>Filename</th>
                  <th>Size</th>
                  <th>Last Modified</th>
                  <th style={{ width: 160 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs && logs.length > 0 ? logs.map((f, idx) => (
                  <tr key={idx}>
                    <td width={25}>{f.filename}</td>
                    <td width={20}>{f.size_human || `${f.size_bytes} B`}</td>
                    <td width={25}>{formatDate(f.modified_at)}</td>
                    <td width={30} style={{ whiteSpace: 'nowrap' }}>
                      <button className="btn btn-sm btn-success mr-2" onClick={() => handleDownload(f.filename)}><FontAwesomeIcon icon={faDownload} /> Download</button>{' '}<button className="btn btn-sm btn-danger" onClick={() => confirmDelete(f.filename)}><FontAwesomeIcon icon={faTrash} /> Delete</button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="text-center">No log files found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete confirmation */}
      <ConfirmationDialog
        dialogopen={confirmOpen}
        dialogclose={closeConfirm}
        agreeProcess={proceedDelete}
        loading={loading}
      />
    </div>
  );
}