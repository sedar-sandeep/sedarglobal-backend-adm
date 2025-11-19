// export { default } from './Imageupload.js';

import React, { Component } from 'react';
import { Col, Row, Form, Modal } from 'react-bootstrap';
import ApiDataService from '../../services/ApiDataService';

const insertUrl = `admin/signature/imageUpload`;
const imagePath = process.env.REACT_APP_SERVER_URL + 'uploads/signature/';

class ImageUpload extends Component {
    state = {
        value: [],
    };
    constructor(props) {
        super(props);
        this._isMounted = true;
        this.state = {
            errors: {},
            ee_image_path: '',
            image: '',
        };

        this.handleSubmit = this.handleSubmit.bind(this);
    }

   
    setform_input() {
        this.setState({
            errors: {},
            ee_image_path: '',
            image : ''
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

   

    handleSubmit(event) {
        event.preventDefault();
      

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

    _imageSignatureChange(e) {
        e.preventDefault();

        if (e.target.name == 'image') {
            let reader = new FileReader();
            let image_path = e.target.files[0];
            reader.onloadend = () => {
                this.setState({
                    image: image_path,
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
                                   

                                    <Form.Group controlId="formFile" className="mb-3">
                                        <Form.Label>Signature Image Upload</Form.Label>
                                        <Form.Control type="file" name="image" onChange={(e) => this._imageSignatureChange(e)} />
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
export default ImageUpload;