
import React, { Component } from 'react';
//import './DeliveryZone.scss';
import { Col, Row, Form, Modal } from 'react-bootstrap';
import ApiDataService from '../../services/ApiDataService';
import { faEdit, faCog, faTrash, faPlus, faEye } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const url = 'admin/portal/city';


class CityModal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sct_locality_yn: 'N',
            sct_active_yn: 'Y',
            sct_zone: '',
            errors: {},
            isValid: false,
            modalShow: false,
            countrylov: [],
            state_lov: [],
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
        this.setState({ mode: 'IS', sys_id: false, lang_code: 'en',sct_zone:'',sct_desc:'' });
    }

    editModalRecord = (id, lang) => {

        this.setState({ mode: 'UP', sys_id: id, lang_code: lang });
        ApiDataService.get(`${url}/${id}/edit`, lang).then(response => {
            let resp = response.data.result;
            Object.entries(resp).forEach(([key, value]) => {
                this.setState({ [key]: value && value.length > 0 ? value : '' });
                //  console.log(value, 'values', key);
                if (key == 'sct_scn_iso' && value) {
                    this.stateLovFun(value)
                }
            });
        }).catch((error) => {
            console.log(error);
        });

    }


    stateChanges = (e) => {
        const { name, value } = e.target;
        var values = '';
        if (name === 'sct_active_yn') {
            let checkBox = e.target.checked;
            values = (checkBox ? 'Y' : 'N');
        } else if (name === 'sct_locality_yn') {
            let checkBox = e.target.checked;
            values = (checkBox ? 'Y' : 'N');
        } else {
            values = value;
        }
        this.setState({ [name]: values && values.length > 0 ? values : '' });
        console.log(values, 'values', name);
    }

    cityValidationFun = () => {
        let fields = this.state;
        let errors = {};
        let formIsValid = true;

        if (!fields["sct_desc"]) {
            errors["sct_desc"] = "City description is required";
            formIsValid = false;
        } if (!fields["sct_scn_iso"]) {
            errors["sct_scn_iso"] = "Country is required";
            formIsValid = false;
        } if (!fields["sct_sst_code"]) {
            errors["sct_sst_code"] = "State is required";
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
        console.log(Properties.mode, 'Properties.mode');


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
                        this.props.errorMessage(`${Properties.sct_desc}  city already present on ${Properties.sct_scn_iso} country.`, "ERR");
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
                            {setValue.sys_id ? 'Update City' : 'Add City'}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row>
                            <Col>
                                <Form noValidate onSubmit={this.handleSubmit} autoComplete="off">
                                    <Form.Row className={this.props.lang_code == 'ar' ? 'd-none' : ''}>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>Country</Form.Label>
                                                <Form.Control as="select" value={setValue.sct_scn_iso} name="sct_scn_iso" onChange={(e) => { this.stateChanges(e); this.stateLovFun(e.target.value) }}>
                                                    <option value={''}>Select Country</option>
                                                    {setValue.countrylov.map((data, i) => (
                                                        <option value={data.ref_cn_iso} key={i}>{data.desc}</option>
                                                    ))}
                                                </Form.Control>
                                                {this.state.errors["sct_scn_iso"] &&
                                                    <span className='custError'>{this.state.errors["sct_scn_iso"]}</span>
                                                }
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>State</Form.Label>
                                                <Form.Control as="select" value={setValue.sct_sst_code} name="sct_sst_code" onChange={(e) => { this.stateChanges(e) }}>
                                                    <option value={''}>Select State</option>
                                                    {setValue.state_lov.map((data, i) => (
                                                        <option value={data.SST_CODE} key={i}>{data.SST_DESC}</option>
                                                    ))}
                                                </Form.Control>
                                                {this.state.errors["sct_sst_code"] &&
                                                    <span className='custError'>{this.state.errors["sct_sst_code"]}</span>
                                                }
                                            </Form.Group>
                                        </Col>

                                    </Form.Row>
                                    <Form.Row>
                                        <Col>
                                            <Form.Group>
                                                <Form.Label>City Description</Form.Label>
                                                <Form.Control onChange={this.stateChanges} value={setValue.sct_desc} type="text" name="sct_desc" placeholder="City Description" />
                                                {this.state.errors["sct_desc"] &&
                                                    <span className='custError'>{this.state.errors["sct_desc"]}</span>
                                                }
                                            </Form.Group>
                                        </Col>

                                        <Col className={this.props.lang_code == 'ar' ? 'd-none' : ''}>
                                            <Form.Group>
                                                <Form.Label>Zone</Form.Label>
                                                <Form.Control as="select" value={setValue.sct_zone} name="sct_zone" onChange={this.stateChanges}>
                                                    <option value=''>Select Zone</option>
                                                    <option value="A">Zone-A</option>
                                                    <option value="B">Zone-B</option>
                                                    <option value="C">Zone-C</option>
                                                    <option value="D">Zone-D</option>
                                                    <option value="E">Zone-E</option>
                                                    <option value="F">Zone-F</option>
                                                    <option value="G">Zone-G</option>
                                                </Form.Control>
                                            </Form.Group>
                                        </Col>
                                    </Form.Row>
                                    <Form.Row className={this.props.lang_code == 'ar' ? 'd-none' : ''}>
                                        <Col md={6}>
                                            <Form.Group controlId="formBasicCheckbox">
                                                <Form.Label style={{ float: 'left' }}>Active ?</Form.Label>
                                                <Form.Check onChange={this.stateChanges} checked={setValue.sct_active_yn === 'Y' ? true : false} type="checkbox" name="sct_active_yn" style={{ float: 'left', marginLeft: '20px' }} />
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group controlId="formBasicCheckbox">
                                                <Form.Label style={{ float: 'left' }}>Main City ?</Form.Label>
                                                <Form.Check onChange={this.stateChanges} checked={setValue.sct_locality_yn === 'Y' ? true : false} type="checkbox" name="sct_locality_yn" style={{ float: 'left', marginLeft: '20px' }} />
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

export default CityModal;