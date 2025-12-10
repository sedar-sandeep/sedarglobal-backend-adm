import React, { Component } from 'react';
import ServerTable from '../../services/server-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faCog, faTrash, faPlus, faDownload,faMoneyBillAlt} from '@fortawesome/free-solid-svg-icons';
import { Dropdown, DropdownButton, OverlayTrigger, Tooltip } from 'react-bootstrap';
import BulkUploadModal from "./BulkModel";
import BulkModalExport from "./BulkModalExport";
import { ConfirmationDialog, SnapBarError } from "../../ConfirmationDialog";
import { WindowPanel } from "../../WindowPanel";
import AccessSecurity from '../../AccessSecurity';
const url = `admin/portal/bulkupload/getList`;
const PER_PAGE = process.env.REACT_APP_PER_PAGE;
const csv_path = "https://uatapi.sedarglobal.com/uploads/100001/bulk_excel/";

class BulkList extends Component {
    constructor(props) {
        super(props);
        this._isMounted = true;
        this.state = {
            modalShow: false,
            mode: '',
            dataview: [],
            totaldata: null,
            snapopen: false,
            snapcolor: null,
            error: null,
            deletedialog: false,
            proceed: false,
            renderTable: false,
            sysid: null,
            page: 1,
            deletesysid: '',
            security: [],
        };
        this.modalRef = React.createRef();
        this.bulkUploadModalRef = React.createRef();
        
    }
    setModalShow = () => {
        this.setState({
            modalShow: true,
            mode: 'IS'
        });
    }

    closedialog = () => {
        this.setState({ deletedialog: false });
    }
    modalClose = () => {
        this.setState({ modalShow: false });
    }
    BulkmodalClose = () => {
        console.log("testing herr")

        this.setState({ bulkUploadModal: false, mode: 'IS' });
    }

    renderTable = () => {
        this.setState({
            renderTable: true
        }, () => {
            this.setState({ renderTable: false });
        });
    }

    editRecord = (row) => {
        this.modalRef.current.prefillEditData(row);
        this.setState({ modalShow: true, mode: 'UP', sysid: row.SPBU_SYS_ID }, () => { this.setState({ sysid: null }); });
    }

    deletRecord = (id) => {
        this.setState({ deletedialog: true, sysid: id });
    }


    proceedDelete = (params) => {
        if (params) {
            this.modalRef.current.deleteModalRecord(this.state.sysid);
        } else {

        }

    }


    downloadExcel = (filePath) => {
        if (!filePath) return;

        // Always extract only the filename
        const fileName = filePath.split('/').pop();

        // Final URL ALWAYS = basePath + filename
        const finalUrl = csv_path + fileName;

        const a = document.createElement('a');
        a.href = finalUrl;
        a.download = fileName;
        a.target = '_blank';

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };


    snapclose = () => {
        this.setState({ snapopen: false });
    };
    handleClose = () => {
        this.setState({ open: false });
    };
    errorThrough = (error, argu) => {
        var erroMessage = '';
        if (argu === 'ERR-OBJ') {
            erroMessage = Object.keys(error).map(function (key) {
                return <ul key={key} className="mrgnone list-unstyled"><li>{error[key]}</li></ul>;
            });
        } else {
            erroMessage = <ul className="mrgnone list-unstyled"><li>{error}</li></ul>;
        }
        var backColor = ((argu === 'ERR' || argu === 'ERR-OBJ') ? '#ff4c4ceb' : '#20bb20eb');
        this.setState({ snapopen: true, snapcolor: backColor });
        this.setState({ error: erroMessage });
    }

    setsecurity = (param) => {
        //console.log(param.USER_ROLE)
        this.setState({ security: param });
    }
    bulkUploadModalRecord = (id) => {
        this.bulkUploadModalRef.current.bulkUploadModalRecord(id);
        this.setState({ bulkUploadModal: true, mode: 'IS' });
    }
    render() {
       // let security = this.state.security;

        let self = this;

        let $button = (<OverlayTrigger overlay={<Tooltip id="tooltip">Add Bulk Upload</Tooltip>}>
            <button className="btn btn-primary btn-sm" onClick={this.setModalShow}>{<FontAwesomeIcon icon={faPlus} />}</button></OverlayTrigger>);
        const columns = ['sr_no','SPBU_EXECUTION_DT', 'SPBU_EXCEL_FILE_PATH', 'SPBU_EXECUTION_STATUS', 'SPBU_REMARKS', 'SPBU_ACTIVE_YN', 'SPBU_CR_UID', 'SPBU_CR_DT', 'actions'];
        const options = {
            perPage: PER_PAGE,
            headings: {
                sr_no: '#',
                SPBU_EXECUTION_DT: 'Execution Date',
                SPBU_EXCEL_FILE_PATH: 'Excel File Name',
                SPBU_EXECUTION_STATUS: 'Execution Status',
                SPBU_REMARKS: 'Remarks',
                SPBU_ACTIVE_YN: 'Active Y/N',
                SPBU_CR_UID: 'Created UID',
                SPBU_CR_DT: 'Created Date'
            },
            sortable: [ 'SPBU_EXECUTION_DT', 'SPBU_EXCEL_FILE_PATH', 'SPBU_EXECUTION_STATUS', 'SPBU_ACTIVE_YN', 'SPBU_CR_UID', 'SPBU_CR_DT'],
            requestParametersNames: { search_value: 'search_value', direction: 'order' },
            columnsAlign: { actions: 'center' },
            responseAdapter: function (resp_data) {
                self.setState({ page: resp_data.page });
                return { data: resp_data.result, total: resp_data.row_count }
            },
            texts: {
                show: ''
            },
            search_lov: {
                pages: []
            }
        };
        let $addModal = (<button className="btn btn-primary btn-sm mr-3" onClick={() => self.bulkUploadModalRecord()}> Bulk Export </button>);
        return (
            <div>
                
                <AccessSecurity
                    accessecurity={this.setsecurity}
                />
                <SnapBarError
                    message={this.state.error}
                    snapopen={this.state.snapopen}
                    snapcolor={this.state.snapcolor}
                    snapclose={this.snapclose} />
                <ConfirmationDialog
                    dialogopen={this.state.deletedialog}
                    dialogclose={this.closedialog}
                    agreeProcess={this.proceedDelete}
                />
                <WindowPanel rawHtml={
                    <div className="windowContent">
                        <ServerTable renderView={this.state.renderTable} columns={columns} url={url} options={options} addme={$button} bordered hover updateUrl hist_table="SITE_M_SHOWROOM_HIST" addModal={$addModal}>
                            {
                                function (row, column, index) {
                                    switch (column) {
                                        case 'sr_no':
                                            return (
                                                (index + 1) + (PER_PAGE * ((self.state.page) - 1))
                                            );
                                       case 'SPBU_EXCEL_FILE_PATH': {
                                            const val = row[column] || '';
                                            const marker = 'bulk_excel/';
                                            const idx = val.indexOf(marker);

                                            // Extract the file name
                                            const fileName =
                                                idx > -1 ? val.slice(idx + marker.length) : String(val).split('/').pop();

                                            // Full path for direct download
                                            const fileUrl = `${csv_path}/${val}`;

                                            return (
                                                <a
                                                    href={fileUrl}
                                                    download={fileName}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ color: '#007bff', textDecoration: 'none', cursor: 'pointer' }}
                                                >
                                                    {fileName}
                                                </a>
                                            );
                                        }

                                        case 'actions':
                                            return (
                                                <div className="form-control-sm" style={{ textAlign: 'center' }}>
                                                    <DropdownButton size="sm" id="dropdown-basic-button" title={<FontAwesomeIcon icon={faCog} />}> 
                                                        <Dropdown.Item onClick={() => self.editRecord(row)}><FontAwesomeIcon icon={faEdit} /> Edit</Dropdown.Item>
                                                        {/* <Dropdown.Item onClick={() => self.duplicateRecord(row.BR_CODE, row.BR_DESC, 'en')}><FontAwesomeIcon icon={faCopy} /> Duplicate</Dropdown.Item>
                                                        <Dropdown.Item disabled={security.LANGUAGE_YN !== 'Y' ? true : false} onClick={() => self.editRecord(row.BR_CODE, row.BR_DESC, 'ar')}>
                                                            <FontAwesomeIcon icon={faLanguage} /> Edit Language
                                                        </Dropdown.Item> */}
                                                        <Dropdown.Item onClick={() => self.deletRecord(row.SPBU_SYS_ID)}><FontAwesomeIcon icon={faTrash} /> Delete</Dropdown.Item>
                                                        <Dropdown.Item onClick={() => self.downloadExcel(row.SPBU_EXCEL_FILE_PATH)}><FontAwesomeIcon icon={faDownload} /> Download</Dropdown.Item>
                                                    </DropdownButton>
                                                </div>
                                            );
                                        default:
                                            return (row[column]);
                                    }
                                }
                            }
                        </ServerTable>

                        <BulkUploadModal
                            ref={this.modalRef}
                            renderTable={this.renderTable}
                            editModal={this.editModal}
                            mode={this.state.mode}
                            show={this.state.modalShow}
                            closeModal={this.modalClose}
                            closeDelete={this.closedialog}
                            errorMessage={this.errorThrough}
                        />
                        <BulkModalExport
                            ref={this.bulkUploadModalRef}
                            renderTable={this.renderTable}
                            mode={this.state.mode}
                            show={this.state.bulkUploadModal}
                            closeModal={this.BulkmodalClose}
                            closeDelete={this.closedialog}
                            errorMessage={this.errorThrough}
                        />
                    </div>
                } />
            </div>
        );
    }
}

export default BulkList;
