import React, { Component } from 'react';
import { Col, Row, Form, Modal } from 'react-bootstrap';
import ApiDataService from '../../services/ApiDataService';

const insertUrl = `admin/portal/ecard`;
const imagePath = process.env.REACT_APP_SERVER_URL + 'uploads/ecard/';

class EcardModel extends Component {
    state = {
        value: [],
    };
    constructor(props) {
        super(props);
        this._isMounted = true;
        this.state = {
            ee_active_yn: 'Y',
            name: '',
            avtar: '',
            errors: {},
            id: '',
            isValid: false,
            modalShow: false,
            ee_image_path: '',
            language: 'en',
        };

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    closedialog = () => {
        this.setState({ deletedialog: false });
    }
    modalClose = () => {
        this.setState({ modalShow: false });
    }

    deleteModalRecord = (id) => {
        ApiDataService.delete(`${insertUrl}/`, id).then(response => {
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

    setform_input() {
        this.setState({
            ee_active_yn: 'Y',
            ee_name: '',
            errors: {},
            id: '',
            language: 'en',
            ee_image_path: '',
        });
    }


    editModalRecord = (id, name) => {
        this.state.mode = 'UP';
        ApiDataService.get(`${insertUrl}/${id}/edit?`).then(response => {
            let resp = response.data.result;

            Object.entries(resp).forEach(([key, value]) => {
                if (key === 'ee_image_path') {
                    this.setState({ ee_image_path: value });
                }
                this.setState({ [key]: value });
            });

            this.setState({ sysid: id, name: name });

        }).catch((error) => {
            console.log(error)
        });


    }


    stateChanges = (e) => {
        const { name, value } = e.target;
        var values = '';
        if (name === 'ee_active_yn') {
            let checkBox = e.target.checked;
            values = (checkBox ? 'Y' : 'N');
        } else {
            values = value;
        }
        this.setState({ [name]: values });
        this.setState({ 'ee_website': 'https://www.sedarglobal.com' });
        this.setState({ 'ee_company': 'Sedar Global' });
    }

    validation = () => {
        let fields = this.state;
        let errors = {};
        let formIsValid = true;

        if (!fields["ee_name"]) {
            errors["ee_name"] = "Name is required";
            formIsValid = false;
        }
        if (!fields["ee_email"]) {
            errors["ee_email"] = "Email is required";
            formIsValid = false;
        }
        this.setState({ errors: errors });
        return formIsValid;
    }

    handleSubmit(event) {
        event.preventDefault();
        if (!this.validation()) {
            return false;
        }

        var formData = new FormData();

        let Properties = this.state;
        for (var key in Properties) {
            formData.append(key, Properties[key]);
        }

        var url = '';
        if (this.props.mode === 'IS') {
            url = insertUrl;
            ApiDataService.post(url, formData).then(response => {
                if (response.data.return_status !== "0") {
                    if (response.data.error_message === 'Error') {
                        this.props.errorMessage(response.data.result, "ERR-OBJ");
                    } else {
                        this.props.errorMessage(response.data.error_message, "ERR");
                    }
                } else {
                    this.props.errorMessage(response.data.error_message, "DONE");
                    this.props.renderTable();
                    this.props.closeModal();
                }
            }).catch((error) => {
                console.log(error);
                this.props.errorMessage(error.message, "ERR");
            });
        } else {
            url = `${insertUrl}/update/${this.state.sysid}`;
            ApiDataService.update(url, formData).then(response => {
                if (response.data.return_status !== "0") {
                    if (response.data.error_message === 'Error') {
                        this.props.errorMessage(response.data.result, "ERR-OBJ");
                    } else {
                        this.props.errorMessage(response.data.error_message, "ERR");
                    }
                } else {
                    this.props.errorMessage(response.data.error_message, "DONE");
                    this.props.renderTable();
                    this.props.closeModal();
                }
            }).catch((error) => {
                console.log(error);
                this.props.errorMessage(error.message, "ERR");
            });
        }

    }



    _imageChange(e) {
        e.preventDefault();

        if (e.target.name == 'image') {
            let reader = new FileReader();
            let image_path = e.target.files[0];
            reader.onloadend = () => {
                this.setState({
                    avatar: image_path,
                    ee_image_path: reader.result,
                });
            }
            reader.readAsDataURL(image_path);

        }
    }


    render() {

        const setValue = this.state;
        let { ee_image_path } = this.state;

        let $imagePreview = (<div className="previewText"><center><img className="imgWidth" src={this.state.no_image_path} /></center></div>);
        let $imagePreviewUrl = ee_image_path ? (<center><img className="imgWidth" src={imagePath + ee_image_path} /></center>) : $imagePreview;
      
        return (
            <div>
                <Modal animation={false} size="lg" show={this.props.show} onHide={this.props.closeModal} >
                    <Modal.Header closeButton className="">
                        <Modal.Title id="modalTitle">
                            Ecard {this.state.name ? this.state.name : ''}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body dir={setValue.language == 'ar' ? 'rtl' : 'ltr'}>
                        <Row>
                            <Col>
                                <Form noValidate onSubmit={this.handleSubmit} autoComplete="off">
                                    <Form.Row>
                                        <Col>
                                            <Form.Group>
                                                <Form.Label>Name</Form.Label>
                                                <Form.Control onChange={this.stateChanges} value={setValue.ee_name} type="text" name="ee_name" placeholder="Name" />
                                                {this.state.errors["ee_name"] &&
                                                    <span className='custError'>{this.state.errors["ee_name"]}</span>
                                                }
                                            </Form.Group>
                                        </Col>
                                     
                                        <Col>
                                            <Form.Group>
                                                <Form.Label>Designation</Form.Label>
                                                <Form.Control onChange={this.stateChanges} value={setValue.ee_designation} type="text" name="ee_designation" placeholder="Designation" />
                                                {this.state.errors["ee_designation"] &&
                                                    <span className='custError'>{this.state.errors["ee_designation"]}</span>
                                                }
                                            </Form.Group>
                                        </Col>
                                        <Col md={2} style={{ textAlign: 'center' }}>
                                            <Form.Group controlId="formBasicCheckbox">
                                                <Form.Label>Active Y/N ?</Form.Label>
                                                <Form.Check onChange={this.stateChanges} checked={setValue.ee_active_yn === 'Y' ? true : false} type="checkbox" name="ee_active_yn" />
                                            </Form.Group>
                                        </Col>
                                    </Form.Row>
                                    <Form.Row>
                                        <Col>
                                            <Form.Group>
                                                <Form.Label>Mobile</Form.Label>
                                                <Form.Control onChange={this.stateChanges} value={setValue.ee_mobile} type="text" name="ee_mobile" placeholder="Mobile" />
                                                {this.state.errors["ee_mobile"] &&
                                                    <span className='custError'>{this.state.errors["ee_mobile"]}</span>
                                                }
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group>
                                                <Form.Label>Company Phone</Form.Label>
                                                <Form.Control onChange={this.stateChanges} value={setValue.ee_comp_phone} type="text" name="ee_comp_phone" placeholder="Company Phone" />
                                                {this.state.errors["ee_comp_phone"] &&
                                                    <span className='custError'>{this.state.errors["ee_comp_phone"]}</span>
                                                }
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group>
                                                <Form.Label>Personal Email</Form.Label>
                                                <Form.Control onChange={this.stateChanges} value={setValue.ee_email} type="text" name="ee_email" placeholder="Personal Email" />
                                                {this.state.errors["ee_email"] &&
                                                    <span className='custError'>{this.state.errors["ee_email"]}</span>
                                                }
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group>
                                                <Form.Label>Company Email</Form.Label>
                                                <Form.Control onChange={this.stateChanges} value={setValue.ee_comp_email} type="text" name="ee_comp_email" placeholder="Company Email" />
                                                {this.state.errors["ee_comp_email"] &&
                                                    <span className='custError'>{this.state.errors["ee_comp_email"]}</span>
                                                }
                                            </Form.Group>
                                        </Col>
                                    </Form.Row>
                                    <Form.Row>
                                        <Col>
                                            <Form.Group>
                                                <Form.Label>Company</Form.Label>
                                                <Form.Control onChange={this.stateChanges} value={setValue.ee_company || 'Sedar Global'} type="text" name="ee_company" placeholder="Company" />
                                                {this.state.errors["ee_company"] &&
                                                    <span className='custError'>{this.state.errors["ee_company"]}</span>
                                                }
                                            </Form.Group>
                                        </Col>

                                        
                                        <Col>
                                            <Form.Group>
                                                <Form.Label>Website</Form.Label>
                                                <Form.Control onChange={this.stateChanges} value={setValue.ee_website || 'https://www.sedarglobal.com'} type="text" name="ee_website" placeholder="Website" />
                                                {this.state.errors["ee_website"] &&
                                                    <span className='custError'>{this.state.errors["ee_website"]}</span>
                                                }
                                            </Form.Group>
                                        </Col>

                                        <Col>
                                            <Form.Group>
                                                <Form.Label>Linkedin</Form.Label>
                                                <Form.Control onChange={this.stateChanges} value={setValue.ee_linkedin} type="text" name="ee_linkedin" placeholder="Linkedin" />
                                                {this.state.errors["ee_linkedin"] &&
                                                    <span className='custError'>{this.state.errors["ee_linkedin"]}</span>
                                                }
                                            </Form.Group>
                                        </Col>
                                       
                                    </Form.Row>
                                   

                               


                                    <Form.Group controlId="formFile" className="mb-3">
                                        <Form.Label>Image Upload</Form.Label>
                                        <Form.Control type="file" name="image" onChange={(e) => this._imageChange(e)} />
                                        <div className="previewComponent">
                                            <div className="imgPreview">
                                                {$imagePreviewUrl}
                                            </div>
                                        </div>
                                    </Form.Group>

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
export default EcardModel;