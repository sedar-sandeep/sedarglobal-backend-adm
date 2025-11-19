
import React, { Component } from 'react';
import './DeliveryZone.scss';
import { Col, Row, Form, Modal } from 'react-bootstrap';
import ApiDataService from '../../services/ApiDataService';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const url = 'admin/portal/deliveryzone';


class ItemFamilyModal extends Component {
  state = {
    value: [],
  };
  constructor(props) {
    super(props);
    this._isMounted = true;
    this.state = {
      DS_ACTIVE_YN: 'Y',
      errors: {},
      isValid: false,
      modalShow: false,
      countrylov: [],
      DS_FROM_DT: moment(new Date(), 'DD-MMM-YYYY').toDate(),
      DS_UPTO_DT: moment('31-DEC-2099', 'DD-MMM-YYYY').toDate()
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.countryList();
  }



  closedialog = () => {
    this.setState({ deletedialog: false });
  }
  modalClose = () => {
    this.setState({ modalShow: false });
  }

  countryList() {
    ApiDataService.get(url + '/country_access/list')
      .then(response => {
        this.setState({ countrylov: response.data.result });
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
        if (key == 'DS_FROM_DT') {
          this.setState({ [key]: moment(value == '' ? new Date() : value, 'DD-MMM-YYYY').toDate() });
        } else if (key == 'DS_UPTO_DT') {
          this.setState({ [key]: moment(value == '' ? '31-DEC-2099' : value, 'DD-MMM-YYYY').toDate() });
        } else {
          this.setState({ [key]: value });
        }
      });
    }).catch((error) => {

    });

  }


  stateChanges = (e) => {
    const { name, value } = e.target;
    var values = '';
    if (name === 'DS_ACTIVE_YN') {
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

    if (!fields["DS_DESC"]) {
      errors["DS_DESC"] = "Description is required";
      formIsValid = false;
    } if (!fields["DS_CART_VALUE_FROM"]) {
      errors["DS_CART_VALUE_FROM"] = "From value is required";
      formIsValid = false;
    } if (!fields["DS_CART_VALUE_UPTO"]) {
      errors["DS_CART_VALUE_UPTO"] = "Upto value is required";
      formIsValid = false;
    } if (!fields["DS_DELIVERY_ZONE_FEES"]) {
      errors["DS_DELIVERY_ZONE_FEES"] = "Delivery fee is required";
      formIsValid = false;
    } if (!fields["DS_INSTALLATION_ZONE_FEES"]) {
      errors["DS_INSTALLATION_ZONE_FEES"] = "Installation fee is required";
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

    let fromDateVar = moment(this.state.DS_FROM_DT);
    let newFromDateVar = fromDateVar.format('DD-MMM-YYYY');
    formData.append('DS_FROM_DT', newFromDateVar);
    let uptoDateVar = moment(this.state.DS_UPTO_DT);
    let newUptoDateVar = uptoDateVar.format('DD-MMM-YYYY');
    formData.append('DS_UPTO_DT', newUptoDateVar);
    console.log(formData)

    if (this.props.mode === 'IS') {

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
    } else {
      let update_url = `${url}/update/${this.state.DS_SYS_ID}`;
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
          this.props.renderTable();
        }
      }).catch((error) => {
        console.log(error);
        this.props.errorMessage(error.message, "ERR");
      });
    }

  }


  handleDateChange(name, date) {
    if (moment(date).isValid()) {
      this.setState({
        [name]: moment(date).toDate()
      });
    }
  }

  render() {
    const setValue = this.state;

    return (
      <div>
        <Modal animation={false} size="xl" show={this.props.show} onHide={this.props.closeModal} >
          <Modal.Header closeButton className="">
            <Modal.Title id="modalTitle">
              Zone
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col>
                <Form noValidate onSubmit={this.handleSubmit} autoComplete="off">


                  <Form.Row>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Description</Form.Label>
                        <Form.Control onBlur={this.DS_DESC} onChange={this.stateChanges} value={setValue.DS_DESC} type="text" name="DS_DESC" placeholder="Description" />
                        {this.state.errors["DS_DESC"] &&
                          <span className='custError'>{this.state.errors["DS_DESC"]}</span>
                        }
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Country</Form.Label>
                        <Form.Control as="select" value={setValue.DS_COUNTRY_CODE} name="DS_COUNTRY_CODE" onChange={this.stateChanges}>
                          <option>Select Country</option>
                          {setValue.countrylov.map((data, i) => (
                            <option value={data.ref_cn_iso} key={i}>{data.desc}</option>
                          ))}
                        </Form.Control>
                      </Form.Group>
                    </Col>

                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Zone</Form.Label>
                        <Form.Control as="select" value={setValue.DS_ZONE} name="DS_ZONE" onChange={this.stateChanges}>
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
                    <Col md={2} style={{ textAlign: 'center' }}>
                      <Form.Group controlId="formBasicCheckbox">
                        <Form.Label>Active ?</Form.Label>
                        <Form.Check onChange={this.stateChanges} checked={setValue.DS_ACTIVE_YN === 'Y' ? true : false} type="checkbox" name="DS_ACTIVE_YN" />
                      </Form.Group>
                    </Col>

                  </Form.Row>

                  <Form.Row>
                    <Col>
                      <Form.Group>
                        <Form.Label>Cart From Value</Form.Label>
                        <Form.Control onBlur={this.DS_CART_VALUE_FROM} onChange={this.stateChanges} value={setValue.DS_CART_VALUE_FROM} type="text" name="DS_CART_VALUE_FROM" placeholder="From Value" />
                        {this.state.errors["DS_CART_VALUE_FROM"] &&
                          <span className='custError'>{this.state.errors["DS_CART_VALUE_FROM"]}</span>
                        }
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group>
                        <Form.Label>Cart Upto Value</Form.Label>
                        <Form.Control onBlur={this.DS_CART_VALUE_UPTO} onChange={this.stateChanges} value={setValue.DS_CART_VALUE_UPTO} type="text" name="DS_CART_VALUE_UPTO" placeholder="Upto Value" />
                        {this.state.errors["DS_CART_VALUE_UPTO"] &&
                          <span className='custError'>{this.state.errors["DS_CART_VALUE_UPTO"]}</span>
                        }
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group>
                        <Form.Label>Delivery Fees</Form.Label>
                        <Form.Control onBlur={this.DS_DELIVERY_ZONE_FEES} onChange={this.stateChanges} value={setValue.DS_DELIVERY_ZONE_FEES} type="text" name="DS_DELIVERY_ZONE_FEES" placeholder="Delivery Free" />
                        {this.state.errors["DS_DELIVERY_ZONE_FEES"] &&
                          <span className='custError'>{this.state.errors["DS_DELIVERY_ZONE_FEES"]}</span>
                        }
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group>
                        <Form.Label>Installation Fees</Form.Label>
                        <Form.Control onBlur={this.DS_INSTALLATION_ZONE_FEES} onChange={this.stateChanges} value={setValue.DS_INSTALLATION_ZONE_FEES} type="text" name="DS_INSTALLATION_ZONE_FEES" placeholder="Installation Fee" />
                        {this.state.errors["DS_INSTALLATION_ZONE_FEES"] &&
                          <span className='custError'>{this.state.errors["DS_INSTALLATION_ZONE_FEES"]}</span>
                        }
                      </Form.Group>
                    </Col>

                    <Col>
                      <Form.Group controlId="DS_FROM_DT">
                        <Form.Label>From Date</Form.Label>
                        <DatePicker
                          selected={this.state.DS_FROM_DT}
                          onChange={this.handleDateChange.bind(this, 'DS_FROM_DT')}
                          value={this.state.DS_FROM_DT}
                          name="DS_FROM_DT"
                          dateFormat="dd-MMM-yyyy"
                          className="form-control"
                        />
                      </Form.Group>
                      <div className='errorMsg'>{this.state.errors.DS_FROM_DT}</div>
                    </Col>
                    <Col>
                      <Form.Group controlId="DS_UPTO_DT">
                        <Form.Label>Upto Date</Form.Label>

                        <DatePicker
                          selected={this.state.DS_UPTO_DT}
                          onChange={this.handleDateChange.bind(this, 'DS_UPTO_DT')}
                          value={this.state.DS_UPTO_DT}
                          name="DS_UPTO_DT"
                          dateFormat="dd-MMM-yyyy"
                          className="form-control"
                        />
                      </Form.Group>
                      <div className='errorMsg'>{this.state.errors.DS_UPTO_DT}</div>
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

export default ItemFamilyModal;