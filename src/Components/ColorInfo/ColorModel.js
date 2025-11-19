import React, { Component } from 'react';
import { Col, Row, Form, Modal } from 'react-bootstrap';
import ApiDataService from '../../services/ApiDataService';
const insertUrl = `admin/portal/color`;

const PER_PAGE = process.env.REACT_APP_PER_PAGE;

class ColorModel extends Component {
    state = {
        value: [],
    };
    constructor(props) {
        super(props);
        this._isMounted = true;
        this.state = {
            CL_ACTIVE_YN: 'Y',
            CL_DESC: '',
            CL_BASE_CODE: '',
            avtar: '',
            errors: {},
            id: '',
            isValid: false,
            modalShow: false,
            CL_IMAGE_PATH: '',
            language: 'en',
            color_http_path: ''
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
            CL_ACTIVE_YN: 'Y',
            CL_DESC: '',
            CL_BASE_CODE: '',
            errors: {},
            id: '',
            language: 'en',
            CL_IMAGE_PATH: '',
        });
    }


    editModalRecord = (id, desc, lang) => {
        this.state.mode = 'UP';
        ApiDataService.get(`${insertUrl}/${id}/edit?language=` + lang).then(response => {
            let resp = response.data.result;

            Object.entries(resp).forEach(([key, value]) => {
                if (key === 'CL_IMAGE_PATH') {
                    this.setState({ CL_IMAGE_PATH: value });
                }
                this.setState({ [key]: value });
            });

            this.setState({ sysid: id, product_desc: desc, language: lang, color_http_path: response.data.color_http_path });

        }).catch((error) => {
            console.log(error)
        });


    }


    stateChanges = (e) => {
        const { name, value } = e.target;
        var values = '';
        if (name === 'CL_ACTIVE_YN') {
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

        if (!fields["CL_BASE_CODE"]) {
            errors["CL_BASE_CODE"] = "Base Code is required";
            formIsValid = false;
        }
        if (!fields["CL_DESC"]) {
            errors["CL_BASE_CODE"] = "Color Desc is required";
            formIsValid = false;
        }
        if (!fields["CL_CODE"]) {
            errors["CL_BASE_CODE"] = "Color Code is required";
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
                    CL_IMAGE_PATH: reader.result,
                    color_http_path: ''
                });
            }
            reader.readAsDataURL(image_path);

        }
    }


    render() {

        const setValue = this.state;
        let { CL_IMAGE_PATH, color_http_path } = this.state;

        let $imagePreview = (<div className="previewText"><center><img className="imgWidth" src={this.state.no_image_path} /></center></div>);

        let $imagePreviewUrl = CL_IMAGE_PATH ? (<center><img className="imgWidth" src={color_http_path + CL_IMAGE_PATH} /></center>) : $imagePreview;
        if (CL_IMAGE_PATH && CL_IMAGE_PATH.match("https://s3-ap-southeast-1.amazonaws.com")) {
            $imagePreviewUrl = CL_IMAGE_PATH ? (<center><img className="imgWidth" src={CL_IMAGE_PATH} /></center>) : $imagePreview;
        }


        return (
            <div>
                <Modal animation={false} size="lg" show={this.props.show} onHide={this.props.closeModal} >
                    <Modal.Header closeButton className="">
                        <Modal.Title id="modalTitle">
                            Color {this.state.CL_DESC ? this.state.CL_DESC : ''}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body dir={setValue.language == 'ar' ? 'rtl' : 'ltr'}>
                        <Row>
                            <Col>
                                <Form noValidate onSubmit={this.handleSubmit} autoComplete="off">
                                    <Form.Row>
                                        <Col>
                                            <Form.Group>
                                                <Form.Label>Color DESC</Form.Label>
                                                <Form.Control onChange={this.stateChanges} value={setValue.CL_DESC} type="text" name="CL_DESC" placeholder="Color Desc" />
                                                {this.state.errors["CL_DESC"] &&
                                                    <span className='custError'>{this.state.errors["CL_DESC"]}</span>
                                                }
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group>
                                                <Form.Label>BASE CODE</Form.Label>
                                                <Form.Control onChange={this.stateChanges} value={setValue.CL_BASE_CODE} type="text" name="CL_BASE_CODE" placeholder="Base Code" />
                                                {this.state.errors["CL_BASE_CODE"] &&
                                                    <span className='custError'>{this.state.errors["CL_BASE_CODE"]}</span>
                                                }
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group>
                                                <Form.Label>Color CODE</Form.Label>
                                                <Form.Control onChange={this.stateChanges} value={setValue.CL_CODE} type="text" name="CL_CODE" placeholder="Color Code" />
                                                {this.state.errors["CL_CODE"] &&
                                                    <span className='custError'>{this.state.errors["CL_CODE"]}</span>
                                                }
                                            </Form.Group>
                                        </Col>
                                        <Col md={2} style={{ textAlign: 'center' }}>
                                            <Form.Group controlId="formBasicCheckbox">
                                                <Form.Label>Active Y/N ?</Form.Label>
                                                <Form.Check onChange={this.stateChanges} checked={setValue.CL_ACTIVE_YN === 'Y' ? true : false} type="checkbox" name="CL_ACTIVE_YN" />
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
export default ColorModel;