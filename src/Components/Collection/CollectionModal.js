
import React, { Component } from 'react';
import './Collection.scss';
import { Col, Row, Form, Modal } from 'react-bootstrap';
import ApiDataService from '../../services/ApiDataService';


const insertUrl = 'admin/portal/collection';
const Api_Collectionlov = 'admin/portal/collection/collection_type_lov';
const Api_Langlov = 'admin/portal/collection/lang/lov';


const PER_PAGE = process.env.REACT_APP_PER_PAGE;

class CollectionModal extends Component {
  state = {
    value: [],
  };
  constructor(props) {
    super(props);
    this._isMounted = true;
    this.state = {
      collection_active_yn: 'N',
      delivery_days: '',
      collection_desc: '',
      collection_code: '',
      errors: {},
      collectionlov: [],
      isValid: false,
      modalShow: false,
      langDrop: [],
      language: 'en',
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  setInput_value() {
    this.setState({
      collection_code: '',
      collection_desc: '',
      collection_active_yn: 'N',
      delivery_days: '',
      errors: {},
      mode: '',
      language: 'en',
    });
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

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.show && !prevProps.show) {
      this.setInput_value();
      ApiDataService.get(process.env.REACT_APP_SERVER_URL + Api_Collectionlov + '?type=' + this.state.mode)
        .then(response => {
          this.setState({
            collectionlov: response.data.result
          });
        }).catch(function (error) {

        });

      if (this.props.language != 'en') {

        ApiDataService.get(process.env.REACT_APP_SERVER_URL + Api_Langlov, null).then(response => {
          let data = response.data.result;
          this.setState({
            langDrop: data,
            language: this.props.language,
          });
        });
      }

    }
  }


  editModalRecord = (id, desc, lang) => {
    this.state.mode = 'UP';
    ApiDataService.get(`${insertUrl}/${id}/edit?language=` + lang).then(response => {
      let resp = response.data.result[0];
      Object.entries(resp).forEach(([key, value]) => {
        this.setState({ [key]: value });
      });
    }).catch((error) => {

    });

    this.setState({ desc: desc });


  }


  stateChanges = (e) => {
    const { name, value } = e.target;
    console.log(e.target);
    var values = '';
    if (name === 'collection_active_yn') {
      let checkBox = e.target.checked;
      values = (checkBox ? 'Y' : 'N');
      this.setState({ [name]: values });
    } else if (name === 'collection_code') {
      this.setState({ 'collection_desc': e.target.selectedOptions[0].dataset.desc });
      this.setState({ [name]: value });
    } else {
      this.setState({ [name]: value });
    }
    
    console.log(this.state);
  }

  validation = () => {
    let fields = this.state;
    let errors = {};
    let formIsValid = true;

    if (!fields["collection_desc"]) {
      errors["collection_desc"] = "Collection Type is required";
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
      url = `${insertUrl}/update/${this.state.collection_code}`;
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


  render() {

    const setValue = this.state;
    let { collectionlov, langDrop } = this.state;

    return (
      <div>
        <Modal animation={false} size="sm" show={this.props.show} onHide={this.props.closeModal} >
          <Modal.Header closeButton className="">
            <Modal.Title id="modalTitle">
              Collection
            </Modal.Title>
          </Modal.Header>
          <Modal.Body dir={setValue.language == 'ar' ? 'rtl' : 'ltr'}>
            <Row>
              <Col>
                <Form noValidate onSubmit={this.handleSubmit} autoComplete="off">
                  <Form.Row>
                    <Col className={this.props.language == 'en' ? 'd-none' : ''}>

                      <Form.Group>
                        <Form.Label>Language</Form.Label>
                        <Form.Control as="select" value={setValue.language} name="language" onChange={this.stateChanges}>
                          <option>Select Language</option>
                          {langDrop.map((data, i) => (
                            <option value={data.code} key={i}>{data.desc}</option>
                          ))}
                        </Form.Control>
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group>
                        <Form.Label>Collection</Form.Label>
                        <Form.Control as="select" value={setValue.collection_code} name="collection_code" onChange={this.stateChanges} disabled={this.props.language != 'en'}>
                          <option>Select Collection</option>
                          {collectionlov.map((data, i) => (
                            <option value={data.id} key={i} data-desc={data.desc}>{data.desc}</option>
                          ))}
                        </Form.Control>
                      </Form.Group>
                    </Col>
                  </Form.Row>


                  <Form.Row>
                    <Col>
                      <Form.Group>
                        <Form.Label>Description</Form.Label>
                        <Form.Control onChange={this.stateChanges} value={setValue.collection_desc} type="text" name="collection_desc" placeholder="Description" />
                        {this.state.errors["collection_desc"] &&
                          <span className='custError'>{this.state.errors["collection_desc"]}</span>
                        }
                      </Form.Group>
                    </Col>
                  </Form.Row>

                  <Form.Row>
                    <Col>
                      <Form.Group>
                        <Form.Label>Delivery Days</Form.Label>
                        <Form.Control onChange={this.stateChanges} value={setValue.delivery_days} type="text" name="delivery_days" placeholder="Delivery Days" disabled={this.props.language != 'en'} />
                        {this.state.errors["delivery_days"] &&
                          <span className='custError'>{this.state.errors["delivery_days"]}</span>
                        }
                      </Form.Group>
                    </Col>
                  </Form.Row>

                  <Form.Row>
                    <Col>
                      <Form.Group controlId="formBasicCheckbox">
                        <Form.Label>Active ?</Form.Label>
                        <Form.Check onChange={this.stateChanges} checked={setValue.collection_active_yn === 'Y' ? true : false} type="checkbox" name="collection_active_yn" />
                      </Form.Group>
                    </Col>
                  </Form.Row>

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

export default CollectionModal;