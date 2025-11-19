import React, { Component } from 'react';
import { Col, Row, Form, Modal } from 'react-bootstrap';
import ApiDataService from '../../services/ApiDataService';

const insertUrl = `admin/portal/brand`;

class BrandModel extends Component {
    state = {
        value: [],
    };
    constructor(props) {
        super(props);
        this._isMounted = true;
        this.state = {
            BR_ACTIVE_YN: 'Y',
            BR_DESC: '',
            avtar: '',
            errors: {},
            id: '',
            isValid: false,
            modalShow: false,
            BR_IMAGE_PATH: '',
            language: 'en',
            brand_http_path: ''
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
            BR_ACTIVE_YN: 'Y',
            BR_DESC: '',
            errors: {},
            id: '',
            language: 'en',
            BR_IMAGE_PATH: '',
        });
    }


    editModalRecord = (id, desc, lang) => {
        this.state.mode = 'UP';
        ApiDataService.get(`${insertUrl}/${id}/edit?language=` + lang).then(response => {
            let resp = response.data.result;

            Object.entries(resp).forEach(([key, value]) => {
                if (key === 'BR_IMAGE_PATH') {
                    this.setState({ BR_IMAGE_PATH: value });
                }
                this.setState({ [key]: value });
            });

            this.setState({ sysid: id, product_desc: desc, language: lang, brand_http_path: response.data.brand_http_path });

        }).catch((error) => {
            console.log(error)
        });


    }


    stateChanges = (e) => {
        const { name, value } = e.target;
        var values = '';
        if (name === 'BR_ACTIVE_YN') {
            let checkBox = e.target.checked;
            values = (checkBox ? 'Y' : 'N');
        } else {
            values = value;
        }
        this.setState({ [name]: values });
    }

    validation = () => {
        let fields = this.state;
        let errors = {};
        let formIsValid = true;

        if (!fields["BR_DESC"]) {
            errors["BR_DESC"] = "Brand Desc is required";
            formIsValid = false;
        }
        if (!fields["BR_CODE"]) {
            errors["BR_CODE"] = "Brand Code is required";
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
                    BR_IMAGE_PATH: reader.result,
                    brand_http_path: ''
                });
            }
            reader.readAsDataURL(image_path);

        }
    }


    render() {

        const setValue = this.state;
        let { BR_IMAGE_PATH, brand_http_path } = this.state;

        let $imagePreview = (<div className="previewText"><center><img className="imgWidth" src={this.state.no_image_path} /></center></div>);

        let $imagePreviewUrl = BR_IMAGE_PATH ? (<center><img className="imgWidth" src={brand_http_path + BR_IMAGE_PATH} /></center>) : $imagePreview;
        if (BR_IMAGE_PATH && BR_IMAGE_PATH.match("https://s3-ap-southeast-1.amazonaws.com")) {
            $imagePreviewUrl = BR_IMAGE_PATH ? (<center><img className="imgWidth" src={BR_IMAGE_PATH} /></center>) : $imagePreview;
        }


        return (
            <div>
                <Modal animation={false} size="lg" show={this.props.show} onHide={this.props.closeModal} >
                    <Modal.Header closeButton className="">
                        <Modal.Title id="modalTitle">
                            Brand {this.state.BR_DESC ? this.state.BR_DESC : ''}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body dir={setValue.language == 'ar' ? 'rtl' : 'ltr'}>
                        <Row>
                            <Col>
                                <Form noValidate onSubmit={this.handleSubmit} autoComplete="off">
                                    <Form.Row>
                                        <Col>
                                            <Form.Group>
                                                <Form.Label>Brand DESC</Form.Label>
                                                <Form.Control onChange={this.stateChanges} value={setValue.BR_DESC} type="text" name="BR_DESC" placeholder="Brand Desc" />
                                                {this.state.errors["BR_DESC"] &&
                                                    <span className='custError'>{this.state.errors["BR_DESC"]}</span>
                                                }
                                            </Form.Group>
                                        </Col>
                                     
                                        <Col>
                                            <Form.Group>
                                                <Form.Label>Brand CODE</Form.Label>
                                                <Form.Control onChange={this.stateChanges} value={setValue.BR_CODE} type="text" name="BR_CODE" placeholder="Brand Code" />
                                                {this.state.errors["BR_CODE"] &&
                                                    <span className='custError'>{this.state.errors["BR_CODE"]}</span>
                                                }
                                            </Form.Group>
                                        </Col>
                                        <Col md={2} style={{ textAlign: 'center' }}>
                                            <Form.Group controlId="formBasicCheckbox">
                                                <Form.Label>Active Y/N ?</Form.Label>
                                                <Form.Check onChange={this.stateChanges} checked={setValue.BR_ACTIVE_YN === 'Y' ? true : false} type="checkbox" name="BR_ACTIVE_YN" />
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
export default BrandModel;