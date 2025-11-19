import React, { Component } from 'react';
//import './DeliveryZone.scss';
import ServerTable from '../../services/server-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faCog, faTrash, faPlus, faLanguage } from '@fortawesome/free-solid-svg-icons';
import { Dropdown, DropdownButton, OverlayTrigger, Tooltip } from 'react-bootstrap';
import AreaModal from "./AreaModal";
import { ConfirmationDialog, SnapBarError } from "../../ConfirmationDialog";
import { WindowPanel } from "../../WindowPanel";
const PER_PAGE = process.env.REACT_APP_PER_PAGE;
const url = 'admin/portal/area';

class AreaList extends Component {
    constructor(props) {
        super(props);
        this._isMounted = true;
        this.state = {
            modalShow: false,
            mode: '',
            snapopen: false,
            snapcolor: null,
            error: null,
            deletedialog: false,
            proceed: false,
            renderTable: false,
            sysid: null,
            page: 1,
            deletesysid: '',
            lang_code: 'en'
        };
        this.modalRef = React.createRef();
    }
    setModalShow = () => {
        this.setState({
            modalShow: true,
            mode: 'IS',
            lang_code: 'en'
        });
        this.modalRef.current.AddModalRecord();
    }

    closedialog = () => {
        this.setState({ deletedialog: false });
    }
    modalClose = () => {
        this.setState({ modalShow: false });
    }

    renderTable = () => {
        this.setState({
            renderTable: true
        }, () => {
            this.setState({ renderTable: false });
        });
    }

    editRecord = (id, lang_code) => {
        this.modalRef.current.editModalRecord(id, lang_code);
        this.setState({ modalShow: true, mode: 'UP', sysid: id, lang_code: lang_code },
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
        var backColor = ((argu === 'ERR' || argu === 'ERR-OBJ') ? '#ff4c4ceb' : '#20bb20eb');
        this.setState({ snapopen: true, snapcolor: backColor });
        this.setState({ error: erroMessage });
    }



    render() {
        let self = this;

        let $button = (<OverlayTrigger overlay={<Tooltip id="tooltip">Add/Edit</Tooltip>}>
            <button className="btn btn-primary btn-sm" onClick={this.setModalShow}>{<FontAwesomeIcon icon={faPlus} />}</button></OverlayTrigger>
        );
        const columns = ['sr_no', 'SAR_SCN_ISO', 'SST_DESC', 'SCT_DESC', 'SAR_DESC', 'SAR_ACTIVE_YN', 'actions'];
        const options = {
            perPage: PER_PAGE,
            headings: {
                sr_no: '#',
                SAR_SCN_ISO: 'Country',
                SST_DESC: 'Sate/Province',
                SCT_DESC: 'City',
                SAR_DESC: "Area",
                SAR_ACTIVE_YN: 'Active'

            },
            search_key: {
                SAR_SCN_ISO: 'Country',
                SST_DESC: 'Sate/Province',
                SCT_DESC: 'City',
                SAR_DESC: "Area",
                SAR_ACTIVE_YN: 'Active'

            },
            sortable: ['SAR_SCN_ISO', 'SST_DESC', 'SCT_DESC', 'SAR_DESC', 'SAR_ACTIVE_YN'],
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
                        <ServerTable renderView={this.state.renderTable} columns={columns} url={url} options={options} addme={$button} bordered hover updateUrl>

                            {
                                function (row, column, index) {
                                    switch (column) {
                                        case 'sr_no':
                                            return (
                                                (index + 1) + (PER_PAGE * ((self.state.page) - 1))
                                            );
                                        case 'actions':
                                            return (
                                                <div className="form-control-sm" style={{ textAlign: 'center' }}>
                                                    <DropdownButton size="sm" id="dropdown-basic-button" title={<FontAwesomeIcon icon={faCog} />}>
                                                        <Dropdown.Item onClick={() => self.editRecord(row.SAR_CODE, 'en')}><FontAwesomeIcon icon={faEdit} /> Edit</Dropdown.Item>
                                                        <Dropdown.Item onClick={() => self.editRecord(row.SAR_CODE, 'ar')}><FontAwesomeIcon icon={faLanguage} /> Edit Language</Dropdown.Item>
                                                        <Dropdown.Item onClick={() => self.deletRecord(row.SAR_CODE)}><FontAwesomeIcon icon={faTrash} /> Delete</Dropdown.Item>
                                                    </DropdownButton>
                                                </div>
                                            );
                                        default:
                                            return (row[column]);
                                    }
                                }
                            }
                        </ServerTable>

                        <AreaModal
                            ref={this.modalRef}
                            renderTable={this.renderTable}
                            editModal={this.editModal}
                            mode={this.state.mode}
                            show={this.state.modalShow}
                            closeModal={this.modalClose}
                            closeDelete={this.closedialog}
                            errorMessage={this.errorThrough}
                            lang_code={this.state.lang_code}
                        />
                    </div>
                } />
            </div>
        );
    }
}

export default AreaList;