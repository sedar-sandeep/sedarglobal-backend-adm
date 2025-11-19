"use client";
import { useState, useEffect, useRef } from "react";
import ReactDatatable from "../Datatable/ReactDatatable";

export default function DeploymentDashboard() {
    const [loading, setLoading] = useState(false);
    const [deployments, setDeployments] = useState([]);
    const [selectedLogs, setSelectedLogs] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [activeDeployment, setActiveDeployment] = useState(null);
    const token = process.env.REACT_APP_PROJECT_REBUILD_TOKEN;
    const projectId = process.env.REACT_APP_PROJECT_REBUILD_ID;
    const URL = process.env.REACT_APP_PROJECT_REBUILD_URL;
    const triggerDeploy = async () => {
        setLoading(true);
            await fetch(`${URL}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                // body: JSON.stringify({ ... }) // Add body if your API expects it
            });
        setLoading(false);
        fetchDeployments();
    };

    const fetchDeployments = async () => {
        console.log("Fetching deployments...");
        const res = await fetch("/api/deployments");
        const data = await res.json();
        setDeployments(data || []);
    };

    const fetchLogs = async (id) => {
        setActiveDeployment(id);
        setShowModal(true);
        const res = await fetch(`/api/deployments/${id}/logs`);
        const data = await res.json();
        setSelectedLogs((data && data.events) || []);
    };

    useEffect(() => {
        fetchDeployments();

        const interval = setInterval(fetchDeployments, 5000);
        return () => clearInterval(interval);
    }, []);

    // Datatable columns
    const columns = [
        {
            key: "uid",
            text: "Deployment ID",
            className: "deployment-id",
            align: "left",
            sortable: true,
            cell: (record) => record.uid?.slice(0, 8) + "..."
        },
        {
            key: "state",
            text: "Status",
            className: "status",
            align: "left",
            sortable: true,
            cell: (record) => (
                record.state === "BUILDING" ? "🔄 Building" :
                    record.state === "READY" ? "✅ Ready" :
                        record.state === "ERROR" ? "❌ Error" : record.state
            )
        },
        {
            key: "url",
            text: "URL",
            className: "url",
            align: "left",
            sortable: false,
            cell: (record) => (
                <a href={`https://${record.url}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{record.url}</a>
            )
        },
        {
            key: "createdAt",
            text: "Created",
            className: "created",
            align: "left",
            sortable: true,
            cell: (record) => record.createdAt ? new Date(record.createdAt).toLocaleString() : ""
        },
        {
            key: "action",
            text: "Action",
            className: "action",
            align: "center",
            sortable: false,
            cell: (record) => (
                <button onClick={() => fetchLogs(record.uid)} className="btn btn-sm btn-info">View Logs</button>
            )
        }
    ];

    const config = {
        page_size: 10,
        length_menu: [
            [10, 20, 50, 100],
            [10, 20, 50, 100],
        ],
        filename: "Deployments",
        no_data_text: "No deployments found!",
        button: {
            excel: false,
            print: false,
            csv: false
        },
        language: {
            length_menu: "Show _MENU_ entries",
            filter: "Search in records...",
            info: "Showing _START_ to _END_ of _TOTAL_ entries",
            pagination: {
                first: "First",
                previous: "Previous",
                next: "Next",
                last: "Last"
            },
            no_data_text: "No deployments found!"
        },
        show_length_menu: true,
        show_filter: true,
        show_pagination: true,
        show_info: true,
        show_first: true,
        show_last: true
    };

    return (
        <div className="container-fluid" style={{ padding: 24 }}>
            <div className="row mb-4 align-items-center">
                <div className="col-md-8">
                    <h1 className="font-weight-bold" style={{ fontSize: 28 }}>🚀 Vercel Deployment Dashboard</h1>
                </div>
                <div className="col-md-4 text-right">
                    <button
                        onClick={triggerDeploy}
                        disabled={loading}
                        className="btn btn-primary"
                    >
                        {loading ? "Deploying..." : "Rebuild Project"}
                    </button>
                </div>
            </div>
            <div className="card shadow-sm p-4">
                <h2 className="mb-3" style={{ fontSize: 22 }}>Recent Deployments</h2>
                <ReactDatatable
                    config={config}
                    records={deployments}
                    columns={columns}
                />
            </div>

            {/* Logs Modal */}
            {showModal && (
                <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">Logs for {activeDeployment?.slice(0, 8)}...</h5>
                                <button type="button" className="close text-white" onClick={() => setShowModal(false)}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body" style={{ background: '#222', color: '#b2f5b2', fontFamily: 'monospace', maxHeight: 500, overflowY: 'auto' }}>
                                {selectedLogs.length > 0 ? (
                                    <table className="table table-dark table-striped table-sm">
                                        <thead>
                                            <tr>
                                                <th style={{ width: 120 }}>Time</th>
                                                <th>Log</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedLogs.map((log, i) => (
                                                <tr key={i}>
                                                    <td>[{log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : ""}]</td>
                                                    <td>{log.text}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p>No logs available</p>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
