import React, { Component } from 'react';
import { Col, Row, Button, Modal } from 'react-bootstrap';
import ApiDataService from '../../services/ApiDataService';

const insertUrl = `admin/portal/ecard`;
const imagePath = process.env.REACT_APP_SERVER_URL + 'uploads/ecard/';

class QRCodeModal extends Component {
    state = {
        value: [],
    };
    constructor(props) {
        super(props);
        this._isMounted = true;
        this.state = {
            image_path: '',
            name: '',
           errors: {},
            id: '',
            modalShow: false
        };

    }

    closedialog = () => {
        this.setState({ deletedialog: false });
    }
    modalClose = () => {
        this.setState({ modalShow: false });
    }



    qrcodeModalRecord = (id, name) => {
        ApiDataService.get(`${process.env.REACT_APP_SERVER_URL}ecard/qrcode/${id}`).then(response => {
            let resp = response.data.result;
            this.setState({ image_path: resp, id: id, name: name });

        }).catch((error) => {
            console.log(error)
        });

        // this.setState({ id: id });
    }


    downloadFile = async (id, name) => {
        try {
            const response = await ApiDataService.get(`${process.env.REACT_APP_SERVER_URL}ecard/qrcode/${id}`).then(response => {
                let resp = response.data.result;
                const blob = new Blob([resp], { type: response.headers['content-type'] });

                // Create a download link and trigger a click to download the file
                const downloadLink = document.createElement('a');
                downloadLink.href = window.URL.createObjectURL(blob);
                downloadLink.download = `${name}.svg`;
                downloadLink.click();
            }).catch((error) => {
                console.log(error)
            });
            // // Create a Blob from the response data
           
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    }

    render() {

        const setValue = this.state;
        let { id, image_path, name } = this.state;

        return (
            <div>
                <Modal animation={false} size="lg" show={this.props.show} onHide={this.props.closeModal} >
                    <Modal.Header closeButton className="">
                        <Modal.Title id="modalTitle">
                            Ecard {this.state.name ? this.state.name : ''}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Col><Button className='col-12 mb-5' onClick={() => this.downloadFile(id, name)}>Download File</Button></Col>
                            <Col>
                                <center> <div className="bg-dark" dangerouslySetInnerHTML={{ __html: image_path }} /></center>
                                
                            </Col>
                            
                            

                        
                    </Modal.Body>
                </Modal>
            </div>
        )
    }
}
export default QRCodeModal;