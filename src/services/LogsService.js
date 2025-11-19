import http from './http-common';

// Base path for logs API
const LOGS_ENDPOINT = '/admin/logs';

// List all log files
export const listLogs = async () => {
  return http.get(LOGS_ENDPOINT);
};

// Download a specific log file by filename
export const downloadLog = async (filename) => {
  return http.get(`${LOGS_ENDPOINT}/download/` + filename, {
    params: { filename },
    responseType: 'blob'
  });
};

// Delete a specific log file by filename
export const deleteLog = async (filename) => {
  return http.delete(LOGS_ENDPOINT + '/' + filename, {
    params: { filename }
  });
};

export default {
  listLogs,
  downloadLog,
  deleteLog,
};