
import React, { Component } from 'react';
import './FamilyInfo.scss';
import ServerTable from '../../services/server-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ConfirmationDialog, SnapBarError } from "../../ConfirmationDialog";

import { faEdit, faCog, faTrash, faLanguage } from '@fortawesome/free-solid-svg-icons';
import { Dropdown, DropdownButton, OverlayTrigger, Tooltip, Col, Row, Form, Modal, Table } from 'react-bootstrap';
import ApiDataService from '../../services/ApiDataService';
import PriceFormModal from "./PriceFormModal";
import Spinner from 'react-bootstrap/Spinner';

const url = 'admin/portal/familyinfo';



class PriceListModal extends Component {
    state = {
        value: [],
    };
    constructor(props) {
        super(props);
        this._isMounted = true;
        this.state = {
            price_list: [],
            mode: '',
            priceFormModal: false,

            snapopen: false,
            snapcolor: null,
            error: null,
            deletedialog: false,
            proceed: false,
            sysid: '',
            security: [],
            prod: '',
            loading: false,
            table_loading: false,
            lang: 'en'
        };

        this.priceModalRecord = this.priceModalRecord.bind(this);
        this.priceFormModalRef = React.createRef();
    }

    modalClose = () => {
        this.setState({ priceFormModal: false });
    }

    priceModalRecord = (id, lang='en') => {
        this.setState({
            table_loading: true
        });
        this.state.mode = 'UP';
        ApiDataService.get(`${url}/getFamilyPriceList/${id}?lang=${lang}`).then(response => {
            this.setState({
                price_list: response.data.result
            });
            this.setState({
                table_loading: false
            });
        }).catch((error) => {
            console.log(error);
            this.setState({
                table_loading: false
            });
        });

    }
    editRecord = (data, lang) => {
       // this.priceModalRecord(data.SFP_SFI_CODE, lang);
        this.priceFormModalRef.current.priceFormModalRecord(data, lang);
        this.setState({ priceFormModal: true, sysid: data.SFP_SFI_CODE, prod: data.SFP_PR_ITEM_CODE },
            () => { this.setState({ sysid: null, lang: lang }); });
    }

    deletRecord = (id, prod) => {

        this.setState({ deletedialog: true, sysid: id, prod: prod });
    }

    proceedDelete = (params) => {
        this.setState({
            loading: true
        });

        if (params) {
            ApiDataService.delete(`${url}/${this.state.sysid}/${this.state.prod}`, '').then(response => {
                if (response.data.return_status !== "0") {
                    if (response.data.error_message === 'Error') {
                        this.props.errorMessage(response.data.result, "ERR-OBJ");
                    } else {
                        this.props.errorMessage(response.data.error_message, "ERR");
                    }
                } else {
                    this.props.errorMessage(response.data.error_message, "DONE");
                    this.priceModalRecord(this.state.sysid);
                    this.setState({
                        loading: false
                    });
                }
                this.closedialog();
            }).catch((error) => {
                this.props.errorMessage(error.message, "ERR");
                this.pclosedialog();
                this.setState({
                    loading: false
                });
            });
        } else {

        }

    }

    snapclose = () => {
        this.setState({ snapopen: false });
    };
    closedialog = () => {
        this.setState({ deletedialog: false });
    }
    

    render() {
        const setValue = this.state;
        let self = this;
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
                    loading={this.state.loading}
                />
                <Modal animation={false} size="xl" show={this.props.show} onHide={this.props.closeModal} >
                    <Modal.Header closeButton className="">
                        <Modal.Title id="modalTitle">
                            ItemFamily Price
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row>
                            <Col md={12}>
                                {this.state.table_loading ? (
                                    <Spinner animation="border" role="status" style={{ margin: '0 50%' }}>
                                    </Spinner>
                                ) : ('')}
                                <Table striped bordered hover width={'100%'} >
                                    <thead>
                                        <tr>
                                            <th>Family Desc</th>
                                            <th>Product Desc</th>
                                            <th>Base Price</th>
                                            <th>Country Conversion</th>
                                            <th>Country PCT</th>
                                            <th>From Date</th>
                                            <th>Upto Date</th>
                                            <th>Active?</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {setValue.price_list && setValue.price_list.map((e, i) => {
                                            return (
                                                <tr key={i}>

                                                    <td>{e.SFI_DESC}</td>
                                                    <td>{e.PRODUCT_DESC}</td>
                                                    <td>{e.SFP_PRICE_BASE}</td>
                                                    <td>{e.SFP_PRICE_COUNTRY_CONVERSION}</td>
                                                    <td>{e.SFP_OFFER_COUNTRY_PCT}</td>
                                                    <td>{e.SFP_OFFER_COUNTRY_FROM_DT}</td>
                                                    <td>{e.SFP_OFFER_COUNTRY_UPTO_DT}</td>
                                                    <td>{e.SFP_ACTIVE_YN}</td>
                                                    <td>
                                                        <div className="form-control-sm" style={{ textAlign: 'center' }}>
                                                            <DropdownButton size="sm" id="dropdown-basic-button" title={<FontAwesomeIcon icon={faCog} />}>
                                                                <Dropdown.Item onClick={() => self.editRecord(e, 'en')}><FontAwesomeIcon icon={faEdit} /> Edit</Dropdown.Item>
                                                                <Dropdown.Item onClick={() => self.editRecord(e, 'ar')}>
                                                                    <FontAwesomeIcon icon={faLanguage} /> Edit Language
                                                                </Dropdown.Item>
                                                                <Dropdown.Item onClick={() => self.deletRecord(e.SFP_SFI_CODE, e.SFP_PR_ITEM_CODE)}><FontAwesomeIcon icon={faTrash} /> Delete </Dropdown.Item>

                                                            </DropdownButton>
                                                        </div></td>
                                                </tr>
                                            )

                                        })
                                        }
                                    </tbody>

                                </Table>
                            </Col>
                        </Row>
                    </Modal.Body>
                </Modal>

                <PriceFormModal
                    ref={this.priceFormModalRef}
                    priceModalRecord={this.priceModalRecord}
                    mode={this.state.mode}
                    show={this.state.priceFormModal}
                    closeModal={this.modalClose}
                    sysid={this.state.sysid}
                    //closeDelete={this.closedialog}
                    errorMessage={this.props.errorMessage}
                    lang={this.state.lang}
                    prod={this.state.prod}
                />
            </div>
        )
    }
}

export default PriceListModal;