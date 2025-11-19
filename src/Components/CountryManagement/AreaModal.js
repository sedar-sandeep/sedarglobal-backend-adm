
import React, { Component } from 'react';
//import './DeliveryZone.scss';
import { Col, Row, Form, Modal } from 'react-bootstrap';
import ApiDataService from '../../services/ApiDataService';
import { faEdit, faCog, faTrash, faPlus, faEye } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const url = 'admin/portal/area';


class AreaModal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sar_active_yn: 'Y',
            errors: {},
            isValid: false,
            modalShow: false,
            countrylov: [],
            state_lov: [],
            city_lov: [],
            sys_id: false,
            mode: this.props.mode,
            lang_code: this.props.lang_code
        };
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        this.countryLovFun();
    }

    closedialog = () => {
        this.setState({ deletedialog: false });
    }
    modalClose = () => {
        this.setState({ modalShow: false });
    }

    countryLovFun() {
        ApiDataService.get(url + '/country_access/list')
            .then(response => {
                this.setState({ countrylov: response.data.result });
            }).catch(function (error) {
                //alert(error);
                console.log(error)
            });

    }
    stateLovFun(country_code) {
        ApiDataService.get(url + '/state_lov/' + country_code)
            .then(response => {
                this.setState({ state_lov: response.data.result });
            }).catch(function (error) {
                //alert(error);
                console.log(error)
            });
    }
    cityLovFun(country_code, state_code) {

        ApiDataService.get(url + '/city_lov/' + country_code + '/' + state_code)
            .then(response => {
                this.setState({ city_lov: response.data.result });
            }).catch(function (error) {
                //alert(error);
                console.log(error)
            });

    }


    deleteModalRecord = (id) => {
        ApiDataService.delete(`${url}/`, id).then(response => {
            if (response.data.return_status !== "0") {
                if (response.data.error_message === 'Error') {
                    this.props.errorMessage(response.data.result, "ERR-OBJ");
                } else {
                    this.props.errorMessage(response.data.error_message, "ERR");
                }
            } else {
                this.props.errorMessage(response.data.error_message, "DONE");
                this.props.renderTable();
            }
            this.props.closeDelete();
        }).catch((error) => {
            this.props.errorMessage(error.message, "ERR");
            this.props.closeDelete();
        });
    }


    AddModalRecord = () => {
        this.setState({ mode: 'IS', sys_id: false, lang_code: 'en',sar_sct_code:'',sar_desc:'' });
    }

    editModalRecord = (id, lang) => {

        this.setState({ mode: 'UP', sys_id: id, lang_code: lang });
        ApiDataService.get(`${url}/${id}/edit`, lang).then(response => {
            let resp = response.data.result;
            Object.entries(resp).forEach(([key, value]) => {
                this.setState({ [key]: value && value.length > 0 ? value : '' });
                //  console.log(value, 'values', key);
                if (key == 'sar_scn_iso' && value) {
                    this.stateLovFun(value)
                } else if (key == 'sar_sst_code' && value) {
                    this.cityLovFun(resp.sar_scn_iso, value)
                }
            });
        }).catch((error) => {
            console.log(error);
        });

    }


    stateChanges = (e) => {
        const { name, value } = e.target;
        var values = '';
        if (name === 'sar_active_yn') {
            let checkBox = e.target.checked;
            values = (checkBox ? 'Y' : 'N');
        } else {
            values = value;
        }
        this.setState({ [name]: values && values.length > 0 ? values : '' });
    }

    cityValidationFun = () => {
        let fields = this.state;
        let errors = {};
        let formIsValid = true;

        if (!fields["sar_desc"]) {
            errors["sar_desc"] = "Area description is required";
            formIsValid = false;
        } if (!fields["sar_scn_iso"]) {
            errors["sar_scn_iso"] = "Country is required";
            formIsValid = false;
        } if (!fields["sar_sst_code"]) {
            errors["sar_sst_code"] = "State is required";
            formIsValid = false;
        }
        this.setState({ errors: errors });
        return formIsValid;
    }


    handleSubmit(event) {
        event.preventDefault();
        let Properties = this.state;
        if (!this.cityValidationFun()) {
            return false;
        }

        var formData = new FormData();

        for (var key in Properties) {
            formData.append(key, Properties[key]);
        }

        let api_url = url;
        if (Properties.mode == 'UP' && Properties.sys_id && Properties.lang_code == 'en') {
            api_url = url + '/update/' + Properties.sys_id;
            console.log('here..');
        } else if (Properties.mode == 'UP' && Properties.sys_id && Properties.lang_code == 'ar') {
            api_url = url + '/updateLang/' + Properties.sys_id;
        }

        this.setState({ isValid: true });
        ApiDataService.post(api_url, formData).then(response => {
            if (response.data.return_status !== "0") {
                if (response.data.error_message === 'Error') {
                    this.props.errorMessage(response.data.result, "ERR-OBJ");
                } else {
                    if (response.data.return_status == -1 && Properties.mode === 'IS') {
                        this.props.errorMessage(`${Properties.sar_desc}  area already present on ${Properties.sar_scn_iso} country.`, "ERR");
                    } else {
                        this.props.errorMessage(response.data.error_message, "ERR");
                    }
                }
                this.setState({ isValid: false });
            } else {
                this.props.errorMessage(response.data.error_message, "DONE");
                this.props.closeModal();
                this.props.renderTable();
                this.setState({ isValid: false });
            }
        }).catch((error) => {
            console.log(error);
            this.setState({ isValid: false });
            this.props.errorMessage(error.message, "ERR");
        });


    }



    render() {
        const setValue = this.state;

        return (
            <div>
                <Modal animation={false} size="md" show={this.props.show} onHide={this.props.closeModal} >
                    <Modal.Header closeButton className="">
                        <Modal.Title id="modalTitle">
                            {setValue.sys_id ? 'Update Area' : 'Add Area'}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row>
                            <Col>
                                <Form noValidate onSubmit={this.handleSubmit} autoComplete="off">
                                    <Form.Row className={this.props.lang_code == 'ar' ? 'd-none' : ''}>
                                        <Col md={5}>
                                            <Form.Group>
                                                <Form.Label>Country</Form.Label>
                                                <Form.Control as="select" value={setValue.sar_scn_iso} name="sar_scn_iso" onChange={(e) => { this.stateChanges(e); this.stateLovFun(e.target.value) }}>
                                                    <option value={''}>Select Country</option>
                                                    {setValue.countrylov.map((data, i) => (
                                                        <option value={data.ref_cn_iso} key={i}>{data.desc}</option>
                                                    ))}
                                                </Form.Control>
                                                {this.state.errors["sar_scn_iso"] &&
                                                    <span className='custError'>{this.state.errors["sar_scn_iso"]}</span>
                                                }
                                            </Form.Group>
                                        </Col>
                                        <Col md={5}>
                                            <Form.Group>
                                                <Form.Label>State</Form.Label>
                                                <Form.Control as="select" value={setValue.sar_sst_code} name="sar_sst_code" onChange={(e) => { this.stateChanges(e); this.cityLovFun(setValue.sar_scn_iso, e.target.value) }}>
                                                    <option value={''}>Select State</option>
                                                    {setValue.state_lov.map((data, i) => (
                                                        <option value={data.SST_CODE} key={i}>{data.SST_DESC}</option>
                                                    ))}
                                                </Form.Control>
                                                {this.state.errors["sar_sst_code"] &&
                                                    <span className='custError'>{this.state.errors["sar_sst_code"]}</span>
                                                }
                                            </Form.Group>
                                        </Col>
                                        <Col md={2}>
                                            <Form.Group controlId="formBasicCheckbox">
                                                <Form.Label style={{ float: 'left' }}>Active ?</Form.Label>
                                                <Form.Check onChange={this.stateChanges} checked={setValue.sar_active_yn === 'Y' ? true : false} type="checkbox" name="sar_active_yn" style={{ float: 'left', marginLeft: '20px' }} />
                                            </Form.Group>
                                        </Col>

                                    </Form.Row>
                                    <Form.Row>
                                        <Col className={this.props.lang_code == 'ar' ? 'd-none' : ''}>
                                            <Form.Group>
                                                <Form.Label>City</Form.Label>
                                                <Form.Control as="select" value={setValue.sar_sct_code} name="sar_sct_code" onChange={(e) => { this.stateChanges(e); }}>
                                                    <option value={''}>Select City</option>
                                                    {setValue.city_lov.map((data, i) => (
                                                        <option value={data.SCT_CODE} key={i}>{data.SCT_DESC}</option>
                                                    ))}
                                                </Form.Control>
                                                {this.state.errors["sar_sst_code"] &&
                                                    <span className='custError'>{this.state.errors["sar_sst_code"]}</span>
                                                }
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group>
                                                <Form.Label>Area Description</Form.Label>
                                                <Form.Control onChange={this.stateChanges} value={setValue.sar_desc} type="text" name="sar_desc" placeholder="Area Description" />
                                                {this.state.errors["sar_desc"] &&
                                                    <span className='custError'>{this.state.errors["sar_desc"]}</span>
                                                }
                                            </Form.Group>
                                        </Col>
                                    </Form.Row>

                                    <Form.Row>
                                        <Col>
                                            <button type="submit" disabled={this.state.isValid} className={setValue.sys_id ? "btn btn-secondary btn-sm" : "btn btn-primary btn-sm"}>{setValue.sys_id ? 'Update' : 'Save'}</button>
                                        </Col>
                                    </Form.Row>
                                </Form>
                            </Col>

                        </Row>
                    </Modal.Body>
                </Modal >
            </div >
        )
    }
}

export default AreaModal;