import React, { Component } from 'react';
import { Col, Row, Form, Modal } from 'react-bootstrap';
import ApiDataService from '../../services/ApiDataService';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import * as XLSX from 'xlsx';

const insertUrl = `admin/portal/bulkupload`;

class BulkUploadModal extends Component {
  state = {
    value: [],
  };
  constructor(props) {
    super(props);
    this._isMounted = true;
    this.state = {
      active_yn: 'Y',
      field_label: '',
      execution_date: new Date(),
      excel_file: null,
      excel_file_name: '',
      remarks: '',
      errors: {},
      sysid: '',
      isValid: false,
      modalShow: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }
  stateChanges = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };
  handleCheckbox = (e) => {
    this.setState({ active_yn: e.target.checked ? 'Y' : 'N' });
  };
  _fileChange(e) {
    e.preventDefault();
    const file = e.target.files[0];
    this.setState({ excel_file: file, excel_file_name: file ? file.name : '' });
  }

  validation = () => {
    let fields = this.state;
    let errors = {};
    let formIsValid = true;

    if (!fields["execution_date"]) {
      errors["execution_date"] = "Execution Date is required";
      formIsValid = false;
    }
    if (this.props.mode === 'IS' && !fields["excel_file"]) {
      errors["excel_file"] = "Upload File is required";
      formIsValid = false;
    }
    this.setState({ errors });
    return formIsValid;
  }

  handleSubmit(event) {
    event.preventDefault();
    if (!this.validation()) return;
    if (this.props.mode === 'UP') {
      this.submitUpdate();
    } else {
      this.readFile();
    }
  }
 

  convertToJson(csv) {
    const lines = csv.split("\n");
    const result = [];

    if (!lines.length) {
      this.props.errorMessage('CSV file is empty', 'ERR');
      return;
    }

    const headers = lines[0].split(",");
    for (let i = 1; i < lines.length; i++) {
      const obj = {};
      const currentline = lines[i].split(",");
      if (currentline.length === 1 && currentline[0] === '') continue;

      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentline[j];
      }
      result.push(obj);
    }

    const formData = new FormData();
    formData.append('key', JSON.stringify(result));
    formData.append('field_label', this.state.field_label);
    // formData.append('execution_date', "08-Dec-2025");
    formData.append('execution_date', moment(this.state.execution_date).format('DD-MMM-YYYY'));
    formData.append('remarks', this.state.remarks);
    formData.append('active_yn', this.state.active_yn);
    formData.append('excel_file_name', this.state.excel_file_name);

    formData.append('excel_file', this.state.excel_file);

    ApiDataService.post('admin/portal/bulkupload/excel', formData).then(response => {
      if (response.data.return_status !== '0') {
        if (response.data.error_message === 'Error') {
          this.props.errorMessage(response.data.result, 'ERR-OBJ');
        } else {
          this.props.errorMessage(response.data.error_message, 'ERR');
        }
      } else {
        this.props.errorMessage(response.data.error_message, 'DONE');
        this.props.renderTable();
        this.props.closeModal();
      }
    }).catch((error) => {
      this.props.errorMessage(error.message, 'ERR');
    });
  }

  readFile() {
    const f = this.state.excel_file;
    if (!f) {
      this.props.errorMessage('Upload File is required', 'ERR');
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_csv(ws, { header: 1 });
      this.convertToJson(data);
    };
    reader.readAsBinaryString(f);
  }

  prefillEditData = (item) => {
    const execDate = item && item.SPBU_EXECUTION_DT ? moment(item.SPBU_EXECUTION_DT, 'DD-MMM-YYYY').toDate() : new Date();
    const fullPath = item && item.SPBU_EXCEL_FILE_PATH ? String(item.SPBU_EXCEL_FILE_PATH) : '';
    const marker = 'bulk_excel/';
    const idx = fullPath.indexOf(marker);
    const fileName = idx > -1 ? fullPath.slice(idx + marker.length) : (fullPath.split('/').pop());
    this.setState({
      active_yn: item.SPBU_ACTIVE_YN || 'Y',
      remarks: item.SPBU_REMARKS || '',
      execution_date: execDate,
      excel_file: null,
      excel_file_name: fileName,
      sysid: item.SPBU_SYS_ID || ''
    });
  }

  fileToJSON = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_csv(ws, { header: 1 });
        const lines = data.split("\n");
        const result = [];
        if (!lines.length) { resolve([]); return; }
        const headers = lines[0].split(",");
        for (let i = 1; i < lines.length; i++) {
          const obj = {};
          const currentline = lines[i].split(",");
          if (currentline.length === 1 && currentline[0] === '') continue;
          for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j];
          }
          result.push(obj);
        }
        resolve(result);
      };
      reader.onerror = (e) => reject(e);
      reader.readAsBinaryString(file);
    });
  }

  submitUpdate = async () => {
    const formData = new FormData();
    formData.append('field_label', this.state.field_label);
    formData.append('execution_date', moment(this.state.execution_date).format('DD-MMM-YYYY'));
    formData.append('remarks', this.state.remarks);
    formData.append('active_yn', this.state.active_yn);
    if (this.state.excel_file) {
      const json = await this.fileToJSON(this.state.excel_file);
      formData.append('key', JSON.stringify(json));
      formData.append('excel_file', this.state.excel_file);
      formData.append('excel_file_name', this.state.excel_file.name);
    } else {
      formData.append('excel_file_name', this.state.excel_file_name);
    }
    ApiDataService.post(`admin/portal/bulkupload/update/${this.state.sysid}`, formData).then(response => {
      if (response.data.return_status !== '0') {
        if (response.data.error_message === 'Error') {
          this.props.errorMessage(response.data.result, 'ERR-OBJ');
        } else {
          this.props.errorMessage(response.data.error_message, 'ERR');
        }
      } else {
        this.props.errorMessage(response.data.error_message, 'DONE');
        this.props.renderTable();
        this.props.closeModal();
      }
    }).catch((error) => {
      this.props.errorMessage(error.message, 'ERR');
    });
  }

  deleteModalRecord = (sysid) => {
    const formData = new FormData();
    ApiDataService.post(`admin/portal/bulkupload/delete/${sysid}`, formData).then(response => {
      if (response.data.return_status === '0') {
        this.props.errorMessage(response.data.error_message || 'Deleted', 'DONE');
        this.props.closeDelete();
        this.props.renderTable();
      } else {
        this.props.errorMessage(response.data.error_message || 'Delete failed', 'ERR');
      }
    }).catch((error) => {
      this.props.errorMessage(error.message, 'ERR');
    });
  }

  render() {
    const setValue = this.state;
    return (
      <div>
        <Modal animation={false} size="lg" show={this.props.show} onHide={this.props.closeModal} >
          <Modal.Header closeButton>
            <Modal.Title>Bulk Upload</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col>
                <Form noValidate onSubmit={this.handleSubmit} autoComplete="off">
                  <Form.Row>
                    <Col>
                      <Form.Group>
                        <Form.Label>Execution Date</Form.Label>
                        <DatePicker
                          selected={setValue.execution_date}
                          onChange={(date) => this.setState({ execution_date: date })}
                          className="form-control"
                          dateFormat="dd-MMM-yyyy"
                        />
                        {this.state.errors["execution_date"] &&
                          <span className='custError'>{this.state.errors["execution_date"]}</span>}
                      </Form.Group>
                    </Col>
                    <Col md={2} style={{ textAlign: 'center' }}>
                      <Form.Group>
                        <Form.Label>Active Y/N ?</Form.Label>
                        <Form.Check
                          onChange={this.handleCheckbox}
                          checked={setValue.active_yn === 'Y'}
                          type="checkbox"
                          name="active_yn"
                        />
                      </Form.Group>
                    </Col>
                  </Form.Row>

                  <Form.Group>
                    <Form.Label>Upload File (Excel)</Form.Label>
                    <Form.Control
                      type="file"
                      name="excel_file"
                      accept=".xlsx,.xls"
                      onChange={(e) => this._fileChange(e)}
                    />
                    {this.state.errors["excel_file"] &&
                      <span className='custError'>{this.state.errors["excel_file"]}</span>}
                  </Form.Group>

                  <Form.Group>
                    <Form.Label>Remarks</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="remarks"
                      value={setValue.remarks}
                      onChange={this.stateChanges}
                    />
                  </Form.Group>

                  <button type="submit" className="btn btn-primary btn-sm">
                    {this.props.mode === 'IS' ? 'Save' : 'Update'}
                  </button>
                </Form>
              </Col>
            </Row>
          </Modal.Body>
        </Modal>
      </div>
    )
  }
}

export default BulkUploadModal;
