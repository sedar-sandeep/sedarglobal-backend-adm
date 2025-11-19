import React, { Component } from 'react';
import ServerTable from '../../services/server-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faCog, faTrash, faPlus} from '@fortawesome/free-solid-svg-icons';
import { Dropdown, DropdownButton, OverlayTrigger, Tooltip } from 'react-bootstrap';
import EcardModal from "./EcardModel";
import QRCodeModal from "./QRCodeModal";
import { ConfirmationDialog, SnapBarError } from "../../ConfirmationDialog";
import { WindowPanel } from "../../WindowPanel";
import AccessSecurity from '../../AccessSecurity';
const url = `admin/portal/ecard`;

const PER_PAGE = process.env.REACT_APP_PER_PAGE;
const imagePath = process.env.REACT_APP_SERVER_URL + 'uploads/ecard/';
class Ecard extends Component {
    constructor(props) {
        super(props);
        this._isMounted = true;
        this.state = {
            modalShow: false,
            qrCodeShow: false,
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
        this.qrCodeShowRef = React.createRef();
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
    qrCodeClose = () => {
        this.setState({ qrCodeShow: false });
    }

    renderTable = () => {
        this.setState({
            renderTable: true
        }, () => {
            this.setState({ renderTable: false });
        });
    }

    editRecord = (id, name) => {
        this.modalRef.current.editModalRecord(id, name);

        this.setState({ modalShow: true, mode: 'UP', sysid: id },
            () => { this.setState({ sysid: null }); });
    }

    qrcode = (id, name) => {
        this.qrCodeShowRef.current.qrcodeModalRecord(id, name);

        this.setState({ qrCodeShow: true, sysid: id },
            () => { this.setState({ sysid: null }); });
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
        var backEcard = ((argu === 'ERR' || argu === 'ERR-OBJ') ? '#ff4c4ceb' : '#20bb20eb');
        this.setState({ snapopen: true, snapcolor: backEcard });
        this.setState({ error: erroMessage });
    }

    setsecurity = (param) => {
        //console.log(param.USER_ROLE)
        this.setState({ security: param });
    }

    render() {
       // let security = this.state.security;
        
        let self = this;

        let $button = (<OverlayTrigger overlay={<Tooltip id="tooltip">Add Ecard</Tooltip>}>
            <button className="btn btn-primary btn-sm" onClick={this.setModalShow}>{<FontAwesomeIcon icon={faPlus} />}</button></OverlayTrigger>);
        const columns = ['sr_no', 'EE_SYS_ID', 'EE_NAME', 'EE_DESIGNATION', 'EE_COMPANY', 'EE_MOBILE', 'EE_EMAIL', 'EE_IMAGE_PATH', 'EE_ACTIVE_YN', 'actions']; //, 'tag_id'
        const options = {
            perPage: PER_PAGE,
            headings: {
                sr_no: '#',
                EE_SYS_ID: 'Id',
                EE_NAME: 'Name',
                EE_DESIGNATION: 'Designation',
                EE_COMPANY: 'Company',
                EE_MOBILE: 'Mobile',
                EE_EMAIL: 'Email',
                EE_IMAGE_PATH: 'Image',
                EE_ACTIVE_YN: 'Active'                
            },
            search_key: {
                EE_SYS_ID: 'Id',
                EE_NAME: 'name',
                EE_DESIGNATION: 'Designation',
                EE_ACTIVE_YN: 'Active',
            },
            sortable: ['EE_SYS_ID', 'EE_NAME', 'EE_DESIGNATION', 'EE_COMPANY', 'EE_MOBILE', 'EE_EMAIL', 'EE_IMAGE_PATH', 'EE_ACTIVE_YN'], //'tag_id', 
            requestParametersNames: { search_value: 'search_value', search_column: 'search_column', direction: 'order' },
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
                        <ServerTable renderView={this.state.renderTable} columns={columns} url={url} options={options} addme={$button} bordered hover updateUrl hist_table="HRMS_M_ECARD">
                            {
                                function (row, column, index) {
                                    switch (column) {
                                        case 'sr_no':
                                            return (
                                                (index + 1) + (PER_PAGE * ((self.state.page) - 1))
                                            );
                                        case 'EE_IMAGE_PATH':
                                            return (
                                                <img src={imagePath + row.EE_IMAGE_PATH} width="50px"></img>
                                            );
                                        case 'actions':
                                            return (
                                                <div className="form-control-sm" style={{ textAlign: 'center' }}>
                                                    <DropdownButton size="sm" id="dropdown-basic-button" title={<FontAwesomeIcon icon={faCog} />}>
                                                        <Dropdown.Item onClick={() => self.editRecord(row.EE_SYS_ID, row.EE_NAME)}><FontAwesomeIcon icon={faEdit} /> Edit</Dropdown.Item>
                                                        <Dropdown.Item onClick={() => self.qrcode(row.EE_SYS_ID, row.EE_NAME)}><FontAwesomeIcon icon={faEdit} /> QR Code</Dropdown.Item>
                                                        <Dropdown.Item onClick={() => self.deletRecord(row.EE_SYS_ID)}><FontAwesomeIcon icon={faTrash} /> Delete</Dropdown.Item>
                                                    </DropdownButton>
                                                </div>
                                            );
                                        default:
                                            return (row[column]);
                                    }
                                }
                            }
                        </ServerTable>
                        {/* {this.state.modalShow && */}
                            <EcardModal
                                ref={this.modalRef}
                                renderTable={this.renderTable}
                                editModal={this.editModal}
                                mode={this.state.mode}
                                show={this.state.modalShow}
                                closeModal={this.modalClose}
                                closeDelete={this.closedialog}
                                errorMessage={this.errorThrough}
                            />
                        {/* } */}
                        <QRCodeModal
                            ref={this.qrCodeShowRef}
                            show={this.state.qrCodeShow}
                            closeModal={this.qrCodeClose}
                            closeDelete={this.qrCodeClosedialog}
                        />
                    </div>
                } />
            </div>
        );
    }
}

export default Ecard;