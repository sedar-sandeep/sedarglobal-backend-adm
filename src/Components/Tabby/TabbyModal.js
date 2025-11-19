
import React, { Component } from 'react';
import { Col, Row, Form, Modal, Table } from 'react-bootstrap';
import ApiDataService from '../../services/ApiDataService';

const url = `admin/portal/tabby`;

class TabbyModal extends Component {
    state = {
        value: [],
    };
    constructor(props) {
        super(props);
        this._isMounted = true;
        this.state = {
            errors: {},
            isValid: false,
            modalShow: false,
            country_iso: 'AE',

        };

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    closedialog = () => {
        this.setState({ deletedialog: false });
    }
    modalClose = () => {
        this.setState({ modalShow: false });
    }


    editModalRecord = (data) => {
        this.state.mode = 'UP';
        let id = data.id;
        let country_iso = data.country_iso;
        ApiDataService.get(`${url}/${id}/${country_iso}/edit`).then(response => {
            let resp = response.data.result;
            // console.log(resp);
            Object.entries(resp).forEach(([key, value]) => {
                this.setState({ [key]: value });
            });
        }).catch((error) => {
            console.log(error);
        });

    }


    stateChanges = (e) => {
        const { name, value } = e.target;
        this.setState({ [name]: value });
    }

    validation = () => {
        let fields = this.state;
        let errors = {};
        let formIsValid = true;

        if (!fields["webhook_title"]) {
            errors["webhook_title"] = "Webhook Title is required";
            formIsValid = false;
        } else if (!fields["webhook_value"]) {
            errors["webhook_value"] = "Webhook value is required";
            formIsValid = false;
        } else if (!fields["webhook_url"]) {
            errors["webhook_url"] = "Webhook URL is required";
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
        //console.log(this.webhook_id, this.props.mode,Properties);

        if (this.props.mode == 'UP' && Properties.webhook_id && Properties.webhook_id.length > 10) {
            let tabby_url = url + '/update/' + Properties.webhook_id;
           // console.log(Properties, ' Properties', tabby_url);

            ApiDataService.update(tabby_url, formData).then(response => {
                if (response.data.return_status !== "0") {
                    if (response.data.error_message === 'Error') {
                        this.props.errorMessage(response.data.result, "ERR-OBJ");
                    } else {
                        this.props.errorMessage(response.data.error_message, "ERR");
                    }
                } else {
                    this.props.errorMessage(response.data.error_message, "DONE");
                    this.props.closeModal();
                    this.props.renderTable();
                }
            }).catch((error) => {
                console.log(error);
                this.props.errorMessage(error.message, "ERR");
            });
        } else {
            ApiDataService.post(url, formData).then(response => {
                if (response.data.return_status !== "0") {
                    if (response.data.error_message === 'Error') {
                        this.props.errorMessage(response.data.result, "ERR-OBJ");
                    } else {
                        this.props.errorMessage(response.data.error_message, "ERR");
                    }
                } else {
                    this.props.errorMessage(response.data.error_message, "DONE");
                    this.props.closeModal();
                    this.props.renderTable();
                }
            }).catch((error) => {
                console.log(error);
                this.props.errorMessage(error.message, "ERR");
            });
        }


    }

    render() {

        const setValue = this.state;
        let theis = this;

        return (
            <div>
                <Modal animation={false} size="xl" show={this.props.show} onHide={this.props.closeModal} >
                    <Modal.Header closeButton className="">
                        <Modal.Title id="modalTitle">
                            Tabby
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row>
                            <Col>
                                <Form noValidate onSubmit={this.handleSubmit} autoComplete="off">

                                    <Form.Row>
                                        <Col>
                                            <Form.Group>
                                                <Form.Label>Country</Form.Label>
                                                <Form.Control as="select" value={setValue.country_iso} name="country_iso" onChange={(e) => { this.stateChanges(e) }}>
                                                    <option value={'AE'}>United Arab Emirates</option>
                                                    <option value={'SA'}>Saudi Arabia</option>
                                                    <option value={'BH'}>Bahrain</option>
                                                </Form.Control>
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group>
                                                <Form.Label>Webhook Title</Form.Label>
                                                <Form.Control onChange={this.stateChanges} value={setValue.webhook_title} type="text" name="webhook_title" placeholder="Webhook Title" />
                                                {this.state.errors["webhook_title"] &&
                                                    <span className='custError'>{this.state.errors["webhook_title"]}</span>
                                                }
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group>
                                                <Form.Label>Webhook Value</Form.Label>
                                                <Form.Control onChange={this.stateChanges} value={setValue.webhook_value} type="text" name="webhook_value" placeholder="Webhook Value" />
                                                {this.state.errors["webhook_value"] &&
                                                    <span className='custError'>{this.state.errors["webhook_value"]}</span>
                                                }
                                            </Form.Group>
                                        </Col>
                                    </Form.Row>
                                    <Form.Row>

                                        <Col>
                                            <Form.Group>
                                                <Form.Label>Webhook URL</Form.Label>
                                                <Form.Control onChange={this.stateChanges} value={setValue.webhook_url} type="text" name="webhook_url" placeholder="webhook URL" />
                                                {this.state.errors["webhook_url"] &&
                                                    <span className='custError'>{this.state.errors["webhook_url"]}</span>
                                                }
                                            </Form.Group>
                                        </Col>

                                        <Col className={this.props.mode == 'UP' && setValue.webhook_id && setValue.webhook_id.length > 10 ? '' : 'd-none'}>
                                            <Form.Group>
                                                <Form.Label>Webhook ID</Form.Label>
                                                <Form.Control onChange={this.stateChanges} value={setValue.webhook_id} type="text" name="webhook_id" placeholder="webhook_id" readOnly={true} />
                                                {this.state.errors["webhook_id"] &&
                                                    <span className='custError'>{this.state.errors["webhook_url"]}</span>
                                                }
                                            </Form.Group>
                                        </Col>
                                    </Form.Row>
                                    <Form.Row>
                                        <button type="submit" disabled={this.state.isValid} className={this.props.mode === 'IS' ? "btn btn-primary btn-sm mt-3" : "btn btn-secondary btn-sm mt-3"}>{this.props.mode === 'IS' ? 'Save' : 'Update'}</button>
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

export default TabbyModal;