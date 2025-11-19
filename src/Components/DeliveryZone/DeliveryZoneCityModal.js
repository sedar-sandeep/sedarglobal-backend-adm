
import React, { Component } from 'react';
import './DeliveryZone.scss';
import { Col, Row, Form, Modal } from 'react-bootstrap';
import ApiDataService from '../../services/ApiDataService';
import { faEdit, faCog, faTrash, faPlus, faEye } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


//const url = 'admin/portal/deliveryzone';
const url = 'admin/portal/deliveryzonecity';


class DeliveryZoneCityModal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sct_locality_yn: 'N',
            sct_active_yn: 'Y',
            errors: {},
            isValid: false,
            modalShow: false,
            modeAction: '',
            countrylov: [],
            state_lov: [],
            city_lov: [],
            area_lov: []
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

    modeActionFun = (val) => {
        if (['CA', 'CU'].indexOf(val) >= 0) {
            this.setState({ modeAction: val, area_sys_id: '' });
        } else {
            this.setState({ modeAction: val });
        }

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
    stateCityFun(country_code, state_code) {

        ApiDataService.get(url + '/city_lov/' + country_code + '/' + state_code)
            .then(response => {
                this.setState({ city_lov: response.data.result });
            }).catch(function (error) {
                //alert(error);
                console.log(error)
            });

    }
    stateAreaFun(country_code, e) {
        let key = e.target.selectedIndex;
        let attributes_val = e.target.childNodes[key].attributes
        let city_code = e.target.value

        for (var i = 0; i < attributes_val.length; i++) {
            let name = attributes_val[i]['localName'];
            let values = attributes_val[i]['value'];
            this.setState({ [name]: values });
        }
        ApiDataService.get(url + '/area_lov/' + country_code + '/' + city_code)
            .then(response => {
                this.setState({ area_lov: response.data.result });
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



    editModalRecord = (id) => {
        this.state.mode = 'UP';
        ApiDataService.get(`${url}/${id}/edit`).then(response => {
            let resp = response.data.result;
            Object.entries(resp).forEach(([key, value]) => {
                this.setState({ [key]: value });
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
        } else if (name === 'sar_active_yn') {
            let checkBox = e.target.checked;
            values = (checkBox ? 'Y' : 'N');
        } else if (name === 'area_sys_id') {
            let key = e.target.selectedIndex;
            let attributes_val = e.target.childNodes[key].attributes
            for (var i = 0; i < attributes_val.length; i++) {
                let area_name = attributes_val[i]['localName'];
                let area_values = attributes_val[i]['value'];
                this.setState({ [area_name]: area_values });
            }
            values = value;
        }
        else {
            values = value;
        }
        this.setState({ [name]: values });
    }

    cityValidationFun = () => {
        let fields = this.state;
        let errors = {};
        let formIsValid = true;

        if (!fields["sct_desc"]) {
            errors["sct_desc"] = "City description is required";
            formIsValid = false;
        } if (!fields["country_iso"]) {
            errors["country_iso"] = "Country is required";
            formIsValid = false;
        } if (!fields["state_sys_id"]) {
            errors["state_sys_id"] = "State is required";
            formIsValid = false;
        }
        this.setState({ errors: errors });
        return formIsValid;
    }
    areaValidationFun = () => {
        let fields = this.state;
        let errors = {};
        let formIsValid = true;

        if (!fields["sar_desc"]) {
            errors["sar_desc"] = "Area description is required";
            formIsValid = false;
        } if (!fields["country_iso"]) {
            errors["country_iso"] = "Country is required";
            formIsValid = false;
        } if (!fields["city_sys_id"]) {
            errors["state_sys_id"] = "City is required";
            formIsValid = false;
        }
        this.setState({ errors: errors });
        return formIsValid;
    }

    handleSubmit(event) {
        event.preventDefault();
        let Properties = this.state;
        if (['CA', 'CU'].indexOf(Properties.modeAction) >= 0 && !this.cityValidationFun()) {
            return false;
        }
        if (['AA', 'AU'].indexOf(Properties.modeAction) >= 0 && !this.areaValidationFun()) {
            console.log('here...');
            return false;
        }

        var formData = new FormData();


        for (var key in Properties) {
            formData.append(key, Properties[key]);
        }

        let api_url = url;
        if (Properties.modeAction == 'CA') {
            api_url = url + '/createCity';
        } else if (Properties.modeAction == 'CU') {
            api_url = url + '/updateCity/' + Properties.sct_code;
        } else if (Properties.modeAction == 'AA') {
            api_url = url + '/createArea';
        } else if (Properties.modeAction == 'AU') {
            api_url = url + '/updateArea/' + Properties.sar_code;
        } else {
            console.log('errors', Properties.modeAction);
            return false;
        }

        this.setState({ isValid: true });
        ApiDataService.post(api_url, formData).then(response => {
            if (response.data.return_status !== "0") {
                if (response.data.error_message === 'Error') {
                    this.props.errorMessage(response.data.result, "ERR-OBJ");
                } else {
                    if (response.data.return_status == -1 && Properties.modeAction == 'CA') {
                        this.props.errorMessage(`${Properties.sct_desc}  city already present on ${Properties.country_iso} country.`, "ERR");
                    } else if (response.data.return_status == -1 && Properties.modeAction == 'AA') {
                        //this.props.errorMessage(Properties.sct_desc + ' Area already exists.', "ERR");
                        this.props.errorMessage(`${Properties.sct_desc}  area already present on ${Properties.country_iso} country.`, "ERR");
                    } else {
                        this.props.errorMessage(response.data.error_message, "ERR");
                    }

                }
                this.setState({ isValid: false });
            } else {
                this.props.errorMessage(response.data.error_message, "DONE");
                // this.props.closeModal();
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
                <Modal animation={false} size="xl" show={this.props.show} onHide={this.props.closeModal} >
                    <Modal.Header closeButton className="">
                        <Modal.Title id="modalTitle">
                            Add/Edit City-Area
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row>
                            <Col>
                                <Form noValidate onSubmit={this.handleSubmit} autoComplete="off">
                                    <Form.Row>
                                        <Col md={5}>
                                            <Form.Group>
                                                <Form.Label>Country</Form.Label>
                                                <Form.Control as="select" value={setValue.country_iso} name="country_iso" onChange={(e) => { this.stateChanges(e); this.stateLovFun(e.target.value) }}>
                                                    <option value={''}>Select Country</option>
                                                    {setValue.countrylov.map((data, i) => (
                                                        <option value={data.ref_cn_iso} key={i}>{data.desc}</option>
                                                    ))}
                                                </Form.Control>
                                            </Form.Group>
                                        </Col>
                                        <Col md={5}>
                                            <Form.Group>
                                                <Form.Label>State</Form.Label>
                                                <Form.Control as="select" value={setValue.state_sys_id} name="state_sys_id" onChange={(e) => { this.stateChanges(e); this.stateCityFun(setValue.country_iso, e.target.value) }}>
                                                    <option value={''}>Select State</option>
                                                    {setValue.state_lov.map((data, i) => (
                                                        <option value={data.SST_CODE} key={i}>{data.SST_DESC}</option>
                                                    ))}
                                                </Form.Control>
                                            </Form.Group>
                                        </Col>

                                    </Form.Row>
                                    <Form.Row>
                                        <Col md={6}>
                                            <Form.Row>
                                                <Col>
                                                    <Form.Group>
                                                        <Form.Label>City</Form.Label>
                                                        <Form.Control as="select" value={setValue.city_sys_id} name="city_sys_id" onChange={(e) => { this.stateChanges(e); this.stateAreaFun(setValue.country_iso, e) }}>
                                                            <option value={''}>Select City</option>
                                                            {setValue.city_lov.map((data, i) => (
                                                                <option value={data.SCT_CODE} key={i} {...data}>{data.SCT_DESC}</option>
                                                            ))}
                                                        </Form.Control>
                                                    </Form.Group>

                                                    <div className={setValue.state_sys_id ? 'add_city' : 'add_city d-none'}>
                                                        <Col md={12}>
                                                            <FontAwesomeIcon icon={faPlus} title="Add City" style={{ cursor: 'pointer' }} onClick={() => { this.modeActionFun('CA') }} />
                                                            <FontAwesomeIcon icon={faEdit} title="Edit City" className={setValue.state_sys_id && setValue.city_sys_id ? 'add_city' : 'add_city d-none'} style={{ float: 'right', cursor: 'pointer' }} onClick={() => { this.modeActionFun('CU') }} />
                                                        </Col>
                                                        <Row className={setValue.state_sys_id && ['CA', 'CU'].indexOf(setValue.modeAction) >= 0 && (setValue.area_sys_id == undefined || setValue.area_sys_id == '') ? 'add_city' : 'add_city d-none'}>
                                                            <Col md={6}>
                                                                <Form.Group>
                                                                    <Form.Label>City Description</Form.Label>
                                                                    <Form.Control onChange={this.stateChanges} value={setValue.sct_desc} type="text" name="sct_desc" placeholder="City Description" />
                                                                    {this.state.errors["sct_desc"] &&
                                                                        <span className='custError'>{this.state.errors["sct_desc"]}</span>
                                                                    }
                                                                </Form.Group>
                                                            </Col>

                                                            <Col md={6}>
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
                                                            <Col>
                                                                <button type="submit" disabled={this.state.isValid} className={setValue.modeAction === 'CA' ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}>{setValue.modeAction === 'CA' ? 'Save' : 'Update'}</button>
                                                                <button type="submit" className={"btn btn-danger btn-sm"} onClick={() => { this.modeActionFun('') }} style={{ float: 'right' }}>Cancle</button>
                                                            </Col>

                                                        </Row>
                                                    </div>



                                                </Col>

                                            </Form.Row>
                                        </Col>
                                        <Col md={6}>
                                            <Col>
                                                <Form.Group>
                                                    <Form.Label>Area {this.state.errors["sar_desc"]}</Form.Label>
                                                    <Form.Control as="select" value={setValue.area_sys_id} name="area_sys_id" onChange={(e) => { this.stateChanges(e) }}>
                                                        <option value={''}>Select Area</option>
                                                        {setValue.area_lov.map((data, i) => (
                                                            <option value={data.SAR_CODE} key={i} {...data}>{data.SAR_DESC}</option>
                                                        ))}
                                                    </Form.Control>
                                                </Form.Group>
                                            </Col>
                                            <div className={setValue.state_sys_id && setValue.city_sys_id ? 'add_area' : 'add_area d-none'}>
                                                <Col md={12}>
                                                    <FontAwesomeIcon icon={faPlus} title="Add Area" style={{ cursor: 'pointer' }} onClick={() => { this.modeActionFun('AA') }} />
                                                    <FontAwesomeIcon icon={faEdit} title="Edit Area" className={setValue.state_sys_id && setValue.city_sys_id ? 'add_area' : 'add_area d-none'} style={{ float: 'right', cursor: 'pointer' }} onClick={() => { this.modeActionFun('AU') }} />
                                                </Col>
                                                <Row className={setValue.state_sys_id && setValue.city_sys_id && ['AA', 'AU'].indexOf(setValue.modeAction) >= 0 ? 'add_area' : 'add_area d-none'}>
                                                    <Col md={6}>
                                                        <Form.Group>
                                                            <Form.Label>Area Description</Form.Label>
                                                            <Form.Control onChange={this.stateChanges} value={setValue.sar_desc} type="text" name="sar_desc" placeholder="Area Description" />
                                                            {this.state.errors["sar_desc"] &&
                                                                <span className='custError'>{this.state.errors["sar_desc"]}</span>
                                                            }
                                                        </Form.Group>
                                                    </Col>


                                                    <Col md={6}>
                                                        <Form.Group controlId="formBasicCheckbox">
                                                            <Form.Label style={{ float: 'left' }}>Active ?</Form.Label>
                                                            <Form.Check onChange={this.stateChanges} checked={setValue.sar_active_yn === 'Y' ? true : false} type="checkbox" name="sar_active_yn" style={{ float: 'left', marginLeft: '20px' }} />
                                                        </Form.Group>
                                                    </Col>

                                                    <Col>
                                                        <button type="submit" disabled={this.state.isValid} className={setValue.modeAction === 'AA' ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}>{setValue.modeAction === 'AA' ? 'Save' : 'Update'}</button>
                                                        <button type="submit" className={"btn btn-danger btn-sm"} onClick={() => { this.modeActionFun('') }} style={{ float: 'right' }}>Cancle</button>
                                                    </Col>

                                                </Row>
                                            </div>
                                        </Col>



                                    </Form.Row>



                                </Form>
                            </Col>

                        </Row>
                    </Modal.Body>
                </Modal>
            </div>
        )
    }
}

export default DeliveryZoneCityModal;