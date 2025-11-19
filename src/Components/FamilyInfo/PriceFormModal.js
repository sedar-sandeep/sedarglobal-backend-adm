
import React, { Component } from 'react';
import './FamilyInfo.scss';
import { Col, Row, Form, Modal, Table } from 'react-bootstrap';
import { Editor } from "react-draft-wysiwyg";
import { EditorState, ContentState, convertToRaw } from 'draft-js';
import moment from 'moment';
import DatePicker from "react-datepicker";
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';

import ApiDataService from '../../services/ApiDataService';
const url = 'admin/portal/familyinfo';
const Api_Langlov = 'admin/portal/familyinfo/lang/lov';



class PriceFormModal extends Component {
    state = {
        value: [],
    };
    constructor(props) {
        super(props);
        this.state = {
            startDate: new Date(),
            endDate: moment(new Date()).add(1, 'M').toDate(),
            errors: {},
            new_family_list: [],
            isValid: false,
            modalShow: false,
            texture_type: [],
            country_lov: [],
            applicable_countries: [],
            lang: props.lang,
            langDrop: [],
            SFP_TITLE: props.lang,
            SFP_SFI_CODE: props.sysid,
            SFP_PR_ITEM_CODE: props.prod,
        };
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.show && !prevProps.show) {

            if (this.state.language != 'en') {
                ApiDataService.get(process.env.REACT_APP_SERVER_URL + Api_Langlov, null).then(response => {
                    let data = response.data.result;
                    this.setState({
                        langDrop: data
                    });
                });

                ApiDataService.get(`${process.env.REACT_APP_SERVER_URL}admin/portal/familyinfo/getFamilyPriceList/${this.props.sysid}?lang=${this.state.lang}&prod=${this.state.SFP_PR_ITEM_CODE}`).then(response => {
                    this.setState({
                        SFP_TITLE: response.data.result[0]['SFP_TITLE'],
                        SFP_SFI_CODE: response.data.result[0]['SFP_SFI_CODE'],
                        SFP_PR_ITEM_CODE: response.data.result[0]['SFP_PR_ITEM_CODE']
                    });
                    console.log(this.state, 'setState');
                }).catch((error) => {
                    console.log(error);
                });
            }
        }
    }

    priceFormModalRecord = (data, lang) => {
        this.setState({ lang: lang });
        Object.entries(data).forEach(([key, value]) => {


            if (key == 'SFP_OFFER_COUNTRY_FROM_DT') {
                let val = value && value != 'null' && value != null ? value : new Date();

                let fdate = moment(val, 'DD-MMM-YYYY').toDate();
                console.log(fdate, 'SFP_OFFER_COUNTRY_FROM_DT..');
                this.setState({ startDate: fdate });
                this.setState({ SFP_OFFER_COUNTRY_FROM_DT: value ? value : '' });
            }
            else if (key == 'SFP_OFFER_COUNTRY_UPTO_DT') {
                let fdate = value && value != 'null' && value != null ? moment(value, 'DD-MMM-YYYY').toDate() : moment(new Date()).add(1, 'M').toDate();
                //  let fdate = moment(val, 'DD-MMM-YYYY').toDate();
                console.log(fdate, 'SFP_OFFER_COUNTRY_UPTO_DT');
                this.setState({ endDate: fdate });
                this.setState({ SFP_OFFER_COUNTRY_UPTO_DT: value ? value : '' });

            } else {
                this.setState({ [key]: value ? value : '' });
            }
            // this.setState({ SFP_OFFER_COUNTRY_UPTO_DT: format });
        });
    }
    stateChanges = (e) => {
        const { name, value } = e.target;
        var values = '';
        if (name === 'SFP_ACTIVE_YN') {
            let checkBox = e.target.checked;
            values = (checkBox ? 'Y' : 'N');
            this.setState({ [name]: values });
        } else if (name === 'lang') {
            // this.setState({ [name]: value });
            // this.setState({ 'langs: value });
            this.setState({ [name]: value });
            //this.props.priceModalRecord(this.state.SFP_SFI_CODE, value);

            ApiDataService.get(`${process.env.REACT_APP_SERVER_URL}admin/portal/familyinfo/getFamilyPriceList/${this.state.SFP_SFI_CODE}?lang=${value}&prod=${this.state.SFP_PR_ITEM_CODE}`).then(response => {
                if (response.data.result[0] != undefined) {
                    this.setState({
                        SFP_TITLE: response.data.result[0]['SFP_TITLE'],
                        SFP_SFI_CODE: response.data.result[0]['SFP_SFI_CODE']
                    });
                }
                console.log(this.state, 'setState');
            }).catch((error) => {
                console.log(error);
            });

        } else {
            values = value;
            this.setState({ [name]: values });
        }
        //this.setState({ [name]: values });
    }
    changeDate = (data, mode) => {
        var format = moment(data).format('DD-MMM-YYYY');
        let fdate = moment(data, 'DD-MMM-YYYY').toDate();

        if (mode === 'FD') {
            this.setState({ startDate: fdate });
            this.setState({ SFP_OFFER_COUNTRY_FROM_DT: format });
        }
        if (mode === 'UD') {
            this.setState({ endDate: fdate });
            this.setState({ SFP_OFFER_COUNTRY_UPTO_DT: format });
        }
    }
    validation = () => {
        let fields = this.state;
        let errors = {};
        let formIsValid = true;

        if (!fields["SFP_SFI_CODE"]) {
            errors["SFP_SFI_CODE"] = "Family Code is required";
            formIsValid = false;
        } else if (!fields["SFP_PR_ITEM_CODE"]) {
            errors["SFP_PR_ITEM_CODE"] = "Product Item code is required";
            formIsValid = false;
        } else if (!fields["SFP_PRICE_BASE"]) {
            errors["SFP_PRICE_BASE"] = "Price Base is required";
            formIsValid = false;
        } else if (!fields["SFP_PRICE_COUNTRY_CONVERSION"]) {
            errors["SFP_PRICE_COUNTRY_CONVERSION"] = "Price Country Conversion is required";
            formIsValid = false;
        }

        this.setState({ errors: errors });
        console.log(formIsValid, 'formIsValid', errors);
        return formIsValid;
    }

    handleSubmit(event) {
        console.log(event, 'event...');
        event.preventDefault();
        if (!this.validation()) {
            return false;
        }



        var formData = new FormData();

        let Properties = this.state;
        for (var key in Properties) {
            formData.append(key, Properties[key]);
        }



        let update_url = `${url}/updateFamilyPrice/${this.state.SFP_SFI_CODE}//${this.state.SFP_PR_ITEM_CODE}`;
        ApiDataService.update(update_url, formData).then(response => {
            if (response.data.return_status !== "0") {
                if (response.data.error_message === 'Error') {
                    this.props.errorMessage(response.data.result, "ERR-OBJ");
                } else {
                    this.props.errorMessage(response.data.error_message, "ERR");
                }
            } else {
                this.props.errorMessage(response.data.error_message, "DONE");
                this.props.closeModal();
                this.props.priceModalRecord(this.state.SFP_SFI_CODE, this.state.lang);
            }
        }).catch((error) => {
            console.log(error);
            this.props.errorMessage(error.message, "ERR");
        });


    }

    render() {

        const setValue = this.state;
        let theis = this;

        return (
            <div>
                <Modal animation={false} size="xl" show={this.props.show} onHide={this.props.closeModal} >
                    <Modal.Header closeButton className="">
                        <Modal.Title id="modalTitle">
                            Item Family {this.state.lang}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>

                        <Row>
                            <Col>
                                <Form noValidate onSubmit={this.handleSubmit} autoComplete="off">
                                    <Form.Row>
                                        <Col className={this.state.lang == 'en' ? 'd-none' : ''}>
                                            <Form.Group>
                                                <Form.Label>Language</Form.Label>
                                                <Form.Control as="select" value={setValue.lang} name="lang" onChange={this.stateChanges}>
                                                    <option>Select Language</option>
                                                    {setValue.langDrop.map((data, i) => (
                                                        <option value={data.code} key={i}>{data.desc}</option>
                                                    ))}
                                                </Form.Control>
                                            </Form.Group>
                                        </Col>
                                        {this.state.lang == 'en' ? (
                                            <>
                                                <Col md={2} >
                                                    <Form.Group>
                                                        <Form.Label>Family Code</Form.Label>
                                                        <Form.Control onChange={this.stateChanges} value={setValue.SFP_SFI_CODE} type="text" name="SFP_SFI_CODE" placeholder="Family Code" readOnly={true} />
                                                        {this.state.errors["SFP_SFI_CODE"] &&
                                                            <span className='custError'>{this.state.errors["SFP_SFI_CODE"]}</span>
                                                        }
                                                    </Form.Group>
                                                </Col>
                                                <Col >
                                                    <Form.Group>
                                                        <Form.Label>Family Desc</Form.Label>
                                                        <Form.Control onChange={this.stateChanges} value={setValue.SFI_DESC} type="text" name="SFI_DESC" placeholder="Family Desc" readOnly={true} />
                                                        {this.state.errors["SFI_DESC"] &&
                                                            <span className='custError'>{this.state.errors["SFI_DESC"]}</span>
                                                        }
                                                    </Form.Group>
                                                </Col>
                                                <Col className='d-none' >
                                                    <Form.Group>
                                                        <Form.Label>Product Item Code</Form.Label>
                                                        <Form.Control onChange={this.stateChanges} value={setValue.SFP_PR_ITEM_CODE} type="text" name="SFP_PR_ITEM_CODE" placeholder="Product Item Code" readOnly={true} />
                                                        {this.state.errors["SFP_PR_ITEM_CODE"] &&
                                                            <span className='custError'>{this.state.errors["SFP_PR_ITEM_CODE"]}</span>
                                                        }
                                                    </Form.Group>
                                                </Col>
                                                <Col>
                                                    <Form.Group>
                                                        <Form.Label>Product Desc</Form.Label>
                                                        <Form.Control onChange={this.stateChanges} value={setValue.PRODUCT_DESC} type="text" name="PRODUCT_DESC" placeholder="Product Desc" readOnly={true} />
                                                        {this.state.errors["PRODUCT_DESC"] &&
                                                            <span className='custError'>{this.state.errors["PRODUCT_DESC"]}</span>
                                                        }
                                                    </Form.Group>
                                                </Col>
                                                <Col>
                                                    <Form.Group>
                                                        <Form.Label>Price Base</Form.Label>
                                                        <Form.Control onChange={this.stateChanges} value={setValue.SFP_PRICE_BASE} type="text" name="SFP_PRICE_BASE" placeholder="100" />
                                                        {this.state.errors["SFP_PRICE_BASE"] &&
                                                            <span className='custError'>{this.state.errors["SFP_PRICE_BASE"]}</span>
                                                        }
                                                    </Form.Group>
                                                </Col>


                                                <Col md={1} style={{ textAlign: 'center' }}>
                                                    <Form.Group controlId="formBasicCheckbox">
                                                        <Form.Label>Active?</Form.Label>
                                                        <Form.Check onChange={this.stateChanges} checked={setValue.SFP_ACTIVE_YN === 'Y' ? true : false} type="checkbox" name="SFP_ACTIVE_YN" />
                                                    </Form.Group>
                                                </Col>
                                            </>
                                        ) : <></>}
                                    </Form.Row>

                                    <Form.Row>
                                        <Col>
                                            <Form.Group>
                                                <Form.Label>Title</Form.Label>
                                                <Form.Control onChange={this.stateChanges} value={setValue.SFP_TITLE} type="text" name="SFP_TITLE" placeholder="Title" maxLength={70} />
                                                {this.state.errors["SFP_TITLE"] &&
                                                    <span className='custError'>{this.state.errors["SFP_TITLE"]}</span>
                                                }
                                            </Form.Group>
                                        </Col>
                                    </Form.Row>

                                    {this.state.lang == 'en' ? (
                                        <>
                                            <Form.Row>

                                                <Col md={5}>
                                                    <Form.Group>
                                                        <Form.Label>Price Country Conversion</Form.Label>
                                                        <Form.Control onChange={this.stateChanges} value={setValue.SFP_PRICE_COUNTRY_CONVERSION} type="text" name="SFP_PRICE_COUNTRY_CONVERSION" placeholder="Format AE-1" />
                                                        {this.state.errors["SFP_PRICE_COUNTRY_CONVERSION"] &&
                                                            <span className='custError'>{this.state.errors["SFP_PRICE_COUNTRY_CONVERSION"]}</span>
                                                        }
                                                    </Form.Group>
                                                </Col>
                                                <Col>
                                                    <Form.Group>
                                                        <Form.Label>Country PCT</Form.Label>
                                                        <Form.Control onChange={this.stateChanges} value={setValue.SFP_OFFER_COUNTRY_PCT} type="text" name="SFP_OFFER_COUNTRY_PCT" placeholder="Format AE-50" />
                                                        {this.state.errors["SFP_OFFER_COUNTRY_PCT"] &&
                                                            <span className='custError'>{this.state.errors["SFP_OFFER_COUNTRY_PCT"]}</span>
                                                        }
                                                    </Form.Group>
                                                </Col>
                                                <Col>
                                                    {/* <Form.Group>
                                                    <Form.Label>Offer Country From date</Form.Label>
                                                    <Form.Control onChange={this.stateChanges} value={setValue.SFP_OFFER_COUNTRY_FROM_DT} type="text" name="SFP_OFFER_COUNTRY_FROM_DT" placeholder="Offer Country From date" />
                                                    {this.state.errors["SFP_OFFER_COUNTRY_FROM_DT"] &&
                                                        <span className='custError'>{this.state.errors["SFP_OFFER_COUNTRY_FROM_DT"]}</span>
                                                    }
                                                </Form.Group> */}
                                                    <Form.Group>
                                                        <Form.Label>Offer Country From date</Form.Label>
                                                        <Form.Control onChange={this.stateChanges} value={setValue.SFP_OFFER_COUNTRY_FROM_DT} type="text" name="SFP_OFFER_COUNTRY_FROM_DT" placeholder="Format AE-01-JAN-2022" />

                                                        {/* <DatePicker selected={this.state.startDate} className="form-control" name="SFP_OFFER_COUNTRY_FROM_DT" dateFormat="dd-MMM-yyyy" onChange={date => this.changeDate(date, 'FD')} required />
                                                    <Form.Control.Feedback type="invalid">Start Date is a required field</Form.Control.Feedback> */}


                                                    </Form.Group>
                                                </Col>
                                                <Col>
                                                    {/* <Form.Group>
                                                    <Form.Label>Offer Country Upto date</Form.Label>
                                                    <Form.Control onChange={this.stateChanges} value={setValue.SFP_OFFER_COUNTRY_UPTO_DT} type="text" name="SFP_OFFER_COUNTRY_UPTO_DT" placeholder="Offer Country Upto date" />
                                                    {this.state.errors["SFP_OFFER_COUNTRY_UPTO_DT"] &&
                                                        <span className='custError'>{this.state.errors["SFP_OFFER_COUNTRY_UPTO_DT"]}</span>
                                                    }
                                                </Form.Group> */}


                                                    <Form.Group>
                                                        <Form.Label>Upto Date</Form.Label>
                                                        <Form.Control onChange={this.stateChanges} value={setValue.SFP_OFFER_COUNTRY_UPTO_DT} type="text" name="SFP_OFFER_COUNTRY_UPTO_DT" placeholder="Format AE-31-DEC-2022" />

                                                        {/* <DatePicker selected={this.state.endDate} className="form-control" name="SFP_OFFER_COUNTRY_UPTO_DT" dateFormat="dd-MMM-yyyy" onChange={date => this.changeDate(date, 'UD')} required /> */}
                                                        {/* <Form.Control.Feedback type="invalid">Upto Date is a required field</Form.Control.Feedback> */}
                                                    </Form.Group>
                                                </Col>
                                            </Form.Row>

                                            <Form.Row>
                                                <Col>
                                                    <Form.Group>
                                                        <Form.Label>Product Min Width</Form.Label>
                                                        <Form.Control onChange={this.stateChanges} value={setValue.SFP_PR_MIN_WIDTH} type="text" name="SFP_PR_MIN_WIDTH" placeholder="Product Min Width" />
                                                        {this.state.errors["SFP_PR_MIN_WIDTH"] &&
                                                            <span className='custError'>{this.state.errors["SFP_PR_MIN_WIDTH"]}</span>
                                                        }
                                                    </Form.Group>
                                                </Col>
                                                <Col>
                                                    <Form.Group>
                                                        <Form.Label>Product Max Width</Form.Label>
                                                        <Form.Control onChange={this.stateChanges} value={setValue.SFP_PR_MAX_WIDTH} type="text" name="SFP_PR_MAX_WIDTH" placeholder="Product Max Width" />
                                                        {this.state.errors["SFP_PR_MAX_WIDTH"] &&
                                                            <span className='custError'>{this.state.errors["SFP_PR_MAX_WIDTH"]}</span>
                                                        }
                                                    </Form.Group>
                                                </Col>
                                                <Col>
                                                    <Form.Group>
                                                        <Form.Label>Product Min Width</Form.Label>
                                                        <Form.Control onChange={this.stateChanges} value={setValue.SFP_PR_MIN_HEIGHT} type="text" name="SFP_PR_MIN_HEIGHT" placeholder="Product Min Height" />
                                                        {this.state.errors["SFP_PR_MIN_HEIGHT"] &&
                                                            <span className='custError'>{this.state.errors["SFP_PR_MIN_HEIGHT"]}</span>
                                                        }
                                                    </Form.Group>
                                                </Col>
                                                <Col>
                                                    <Form.Group>
                                                        <Form.Label>Product Min Width</Form.Label>
                                                        <Form.Control onChange={this.stateChanges} value={setValue.SFP_PR_MAX_HEIGHT} type="text" name="SFP_PR_MAX_HEIGHT" placeholder="Product Max Height" />
                                                        {this.state.errors["SFP_PR_MAX_HEIGHT"] &&
                                                            <span className='custError'>{this.state.errors["SFP_PR_MAX_HEIGHT"]}</span>
                                                        }
                                                    </Form.Group>
                                                </Col>

                                            </Form.Row>
                                        </>
                                    ) : <></>}
                                    <button type="submit" disabled={this.state.isValid} className={this.props.mode === 'IS' ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}>{this.props.mode === 'IS' ? 'Save' : 'Update'}</button>
                                </Form>
                            </Col>
                        </Row>


                    </Modal.Body>
                </Modal>
            </div>
        )
    }
}

export default PriceFormModal;