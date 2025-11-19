
import React, { Component } from 'react';
import './Campaign.scss';
import { Col, Row, Form, Modal } from 'react-bootstrap';
import ApiDataService from '../../services/ApiDataService';
import { Editor } from "react-draft-wysiwyg";
import { EditorState, ContentState, convertToRaw } from 'draft-js';
import moment from 'moment';
import DatePicker from "react-datepicker";
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';



import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import PropTypes from 'prop-types';

const insertUrl = 'admin/portal/campaign';
const Api_Countrylov = 'admin/portal/campaign/country_access/list';
const Api_Langlov = 'admin/portal/campaign/lang/lov';


const PER_PAGE = process.env.REACT_APP_PER_PAGE;

class CampaignModal extends Component {
  state = {
    value: [],
  };
  constructor(props) {
    super(props);
    this._isMounted = true;
    this.state = {
      startDate: new Date(),
      endDate: moment(new Date()).add(1, 'M').toDate(),
      active_yn:'Y',
      campaign_text: '',
      campaign_max_count: '',
      campaign_avail_count: '',
      voucher_count:'',
      campaign_desc:'',
      campaign_type: '',
      campaign_pct: '',
      manager_email_id: '',
      minimum_order_value: '',
      promo_code: '',
      campaign_max_value: '',
      locn_code: '',
      campaign_value: '',
      campaign_on_service_yn: 'N',
      distr_centre_yn: 'N',
      send_email_yn:'N',
      scn_iso:'',
      errors: {},
      id:'',
      countrylov: [],
      isValid : false,
      modalShow: false,
      editor: EditorState.createEmpty(),
      editorHTML: '',
      editorState: '',
      language: 'en',
      langDrop: [],
      from_date: '',
      upto_date: '',
      campaign_type_lov: [],
      discountType: true,
      discount: 'amount',
      discountSelect: 'amount',
      email_image_url_path: '',
      email_image_path: '',
      image_path_error: '',
      classSix: 12
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  static propTypes = {
    editorState: PropTypes.instanceOf(EditorState),
    onEditorStateChange: PropTypes.func
  }


  closedialog = () => {
    this.setState({ deletedialog: false });
  }
  modalClose = () => {
    this.setState({ modalShow: false });
  }

  deleteModalRecord=(id)=>{
    ApiDataService.delete(`${insertUrl}/`,id).then(response => {
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
      startDate: new Date(),
      endDate: moment(new Date()).add(1, 'M').toDate(),
      active_yn: 'Y',
      campaign_max_count: '',
      campaign_avail_count: '',
      voucher_count: '',
      campaign_type: '',
      campaign_desc: '',
      campaign_pct: '',
      manager_email_id: '',
      minimum_order_value: '',
      promo_code: '',
      campaign_max_value: '',
      locn_code: '',
      campaign_value: '',
      campaign_on_service_yn: 'N',
      distr_centre_yn: 'N',
      send_email_yn: 'N',
      scn_iso: '',
      errors: {},
      id: '',
      editorHTML: '',
      editorState: '',
      language: 'en',
      langDrop: [],
      from_date: '',
      upto_date: '',
      campaign_type_lov: [],
      discountType: true,
      discount: 'amount',
      discountSelect: 'amount',
      email_image_url_path: '',
      email_image_path: '',
      image_path_error: '',
      classSix : 12
    });
  }

  _handleImageChange(e) {
    e.preventDefault();
    let reader = new FileReader();
    let file = e.target.files[0];
    var fileSize = parseFloat(file.size / 1024).toFixed(2);
    let name = e.target.name;

    reader.onloadend = () => {
      if (name == 'email_image_path') {
        if (fileSize <= 500) {
          this.setState({
            email_image_path: file,
            email_image_url_path: reader.result,
            image_path_error: false
          });
        } else {
          this.setState({
            image_path_error: true
          });
        }
      }
    }
    reader.readAsDataURL(file)
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.show && !prevProps.show) {

      ApiDataService.get(`${insertUrl}/campaignType`).then(response => {
        this.setState({
          campaign_type_lov: response.data
        });
      });


      this.setform_input();
      var format = moment(new Date()).format('DD-MMM-YYYY');
      this.setState({ from_date: format });
      this.setState({ upto_date: moment(new Date()).add(1, 'M').format('DD-MMM-YYYY') });
      ApiDataService.get(process.env.REACT_APP_SERVER_URL + Api_Countrylov)
        .then(response => {
          this.setState({ countrylov: response.data.result });
        }).catch(function (error) {
        
        });
      if (this.props.language != 'en') {
        ApiDataService.get(process.env.REACT_APP_SERVER_URL + Api_Langlov, null).then(response => {
          let data = response.data.result;
          this.setState({
            langDrop: data
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
        if (key === 'campaign_text') {
          this.setState({ value, editorState: CampaignModal.generateEditorStateFromValue(value) })
        }
        else if (key === 'from_date') {
          let fdate = moment(value, 'DD-MMM-YYYY').toDate();
          this.setState({ startDate: fdate });
          this.setState({ from_date: value });
        } else if (key === 'upto_date') {
          let udate = moment(value, 'DD-MMM-YYYY').toDate();
          this.setState({ upto_date: value });
          this.setState({ endDate: udate });
        } else if (key === 'campaign_pct') {
          if (value > 0){
            this.setState({ discountType: false});
            this.setState({ 'discountSelect': 'percent' });
            this.setState({ 'campaign_max_value': 0 });
            this.setState({ 'campaign_value': 0 });
          }
        } else if (key === 'campaign_value') {
          if (value > 0) {
            this.setState({ discountType: true });
            this.setState({ 'discountSelect': 'amount' });
            this.setState({ 'campaign_pct': 0 });
          }
        }
        this.setState({ [key]: value });
      });

      this.setState({ sysid: id, product_desc: desc, language: lang });

    }).catch((error)=>{

    });
    
    
  }

  changeDate = (data, mode) => {
    var format = moment(data).format('DD-MMM-YYYY');
    let fdate = moment(data, 'DD-MMM-YYYY').toDate();
   
    if (mode === 'FD') {
      this.setState({ startDate: fdate });
      this.setState({ from_date: format });
    }
    if (mode === 'UD') {
      this.setState({ endDate: fdate });
      this.setState({ upto_date: format });
    }
  }
 
  stateChanges = (e) => {
    const { name, value } = e.target;
    var values = '';
	  if (name === 'active_yn'){
      let checkBox = e.target.checked;
      values = (checkBox ? 'Y' : 'N');
    } else if (name === 'campaign_on_service_yn'){
      let checkBox = e.target.checked;
      values = (checkBox ? 'Y' : 'N');
    } else if (name === 'distr_centre_yn') {
      let checkBox = e.target.checked;
      values = (checkBox ? 'Y' : 'N');
    } else if (name === 'send_email_yn') {
      let checkBox = e.target.checked;
      values = (checkBox ? 'Y' : 'N');
      this.setState({ classSix: values == 'Y' ? 6 : 12 });
    } else if (name === 'discount') {
      this.setState({ discountType: value == 'amount' ? true : false });
      this.setState({ 'discountSelect': value });
      if (value == 'amount') {
        this.setState({ 'campaign_pct': 0 });
      } else {
        this.setState({ 'campaign_max_value': 0 });
        this.setState({ 'campaign_value': 0 });
      }
      values = value;
    } else if (this.state.discountSelect === 'amount' && name == 'campaign_value') {
      this.setState({ 'campaign_max_value': value });
      values = value;
    } else{
      values = value;
    }
    this.setState({ [name]: values });
  }

  validation = () => {
    let fields = this.state;
    let errors={};
    let formIsValid = true;
	
    if (!fields["campaign_max_count"]) {
      errors["campaign_max_count"] = "Coupon Count is Required";
		  formIsValid = false;
    }
    if (!fields["promo_code"]) {
      errors["promo_code"] = "Promo Code is Required";
      formIsValid = false;
    }

    if (fields['discountSelect'] == 'amount') {
      if (!fields["campaign_value"]) {
        errors["campaign_value"] = "Coupon Code is Required";
        formIsValid = false;
      }
    }

    if (fields['discountSelect'] == 'percent') {
      if (!fields["campaign_pct"]) {
        errors["campaign_pct"] = "Coupon Code is Required";
        formIsValid = false;
      }

      if (!fields["campaign_max_value"]) {
        errors["campaign_max_value"] = "Maximum Redeem Amount is Required";
        formIsValid = false;
      }
    }

    if (this.state.send_email_yn == 'Y' && this.state.email_image_url_path == '') {
      if (!fields["email_image_path"]) {
        errors["email_image_path"] = "Email Attachment is Required";
        formIsValid = false;
      }
    
    }

    this.setState({ errors: errors });
    return formIsValid;
  }
  
  handleSubmit(event){
    event.preventDefault();
    if(!this.validation()){
      return false;
    }
    
    var formData = new FormData();

    let Properties = this.state;
    for (var key in Properties) {
      formData.append(key, Properties[key]);
    }
	var serverSet = '';
    var url = '';
	  if (this.props.mode==='IS'){
      url = insertUrl;
      ApiDataService.post(url, formData).then(response => {
        if (response.data.return_status !== "0") {
          if (response.data.error_message === 'Error') {
            this.props.errorMessage(response.data.result, "ERR-OBJ");
          } else {
            this.props.errorMessage(response.data.error_message, "ERR");
          }
        }else{
          this.props.errorMessage(response.data.error_message, "DONE");
          this.props.renderTable();
          this.props.closeModal();
        }
      }).catch((error) => {
        console.log(error);
        this.props.errorMessage(error.message, "ERR");
      });
    }else{
      url = `${insertUrl}/update/${this.state.id}`;
      ApiDataService.update(url, formData).then(response => {
        if (response.data.return_status !== "0") {
          if (response.data.error_message === 'Error') {
            this.props.errorMessage(response.data.result, "ERR-OBJ");
          } else {
            this.props.errorMessage(response.data.error_message, "ERR");
          }
        }else{
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

 

 


  onEditorStateChange = editorState => {
    console.log(editorState)
    this.setState(
      {
        editorState,
        campaign_text: draftToHtml(
          convertToRaw(editorState.getCurrentContent())
        )
      }
    )
  }


  static generateEditorStateFromValue(value) {
    const contentBlock = htmlToDraft(value || '')
    const contentState = ContentState.createFromBlockArray(
      contentBlock.contentBlocks
    )
    return EditorState.createWithContent(contentState)
  }

  render(){

    const setValue = this.state;
    let { email_image_url_path, countrylov, langDrop, campaign_type_lov } = this.state;

    let $imagePreview = null;
    if (email_image_url_path) {
      $imagePreview = (<img src={email_image_url_path} style={{ width: '100%' }} />);
    } else {
      $imagePreview = (<div className="previewText"></div>);
    }

    return (
      <div>
        <Modal animation={false} size="lg" show={this.props.show} onHide={this.props.closeModal} >
        <Modal.Header closeButton className="">
          <Modal.Title id="modalTitle">
              Campaign {this.state.campaign_desc ? this.state.campaign_desc : ''}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col>
              <Form noValidate onSubmit={this.handleSubmit} autoComplete="off">
                  <Form.Row>
                    <Col className={this.state.language == 'en' ? 'd-none' : ''}>
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
                    <Col className={this.state.language != 'en' ? 'd-none' : ''}>
                    <Form.Group>
                        <Form.Label>Campaign Type</Form.Label>
                        <Form.Control as="select" value={setValue.campaign_type} name="campaign_type" onChange={this.stateChanges}>
                          <option>Select Campaign Type</option>
                          {campaign_type_lov.map((data, i) => (
                            <option value={data.VSL_CODE} key={i}>{data.VSL_DESC}</option>
                          ))}
                        </Form.Control>
                      </Form.Group>
                    </Col>
                
                    <Col>
                      <Form.Group>
                        <Form.Label>Description</Form.Label>
                        <Form.Control onChange={this.stateChanges} value={setValue.campaign_desc} type="text" name="campaign_desc" placeholder="Description" />
                        {this.state.errors["campaign_desc"] &&
                          <span className='custError'>{this.state.errors["campaign_desc"]}</span>
                        }
                      </Form.Group>
                    </Col>
                    <Col className={this.state.language != 'en' ? 'd-none' : ''}>
                    <Form.Group> 
                      <Form.Label>Country</Form.Label>
                        <Form.Control as="select" value={setValue.scn_iso} name="scn_iso" onChange={this.stateChanges}>
                          <option>Select Country</option>
                        {countrylov.map((data,i) => (
                          <option value={data.ref_cn_iso} key={i}>{data.desc}</option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                    </Col>
                
                  </Form.Row> 
                  
                  <Form.Row className={this.state.language != 'en' ? 'd-none' : ''}>
                    <Col sm={4}>
                      <Form.Label>Coupon {this.state.discountSelect}</Form.Label>
                      <Form.Group>
                        
                        <Form.Check
                          inline
                          value="amount"
                          label="Amount"
                          name="discount"
                          type="radio"
                          id={`inline-radio-1`}
                          onChange={this.stateChanges}
                          checked={this.state.discountSelect === 'amount'}
                        />
                        <Form.Check
                          inline
                          value="percent"
                          label="Percent"
                          name="discount"
                          type="radio"
                          id={`inline-radio-2`}
                          onChange={this.stateChanges}
                          checked={this.state.discountSelect === 'percent'}
                        />
                      </Form.Group>
                    </Col>
                    <Col sm={4}>
                      <Form.Group controlId="formBasicCheckbox">
                        <Form.Label>Active ?</Form.Label>
                        <Form.Check onChange={this.stateChanges} checked={setValue.active_yn === 'Y' ? true : false} type="checkbox" name="active_yn" />
                      </Form.Group>
                    </Col>

                    <Col className={'d-none'}>
                      <Form.Group controlId="formBasicCheckbox">
                        <Form.Label>Service Y/N ?</Form.Label>
                        <Form.Check onChange={this.stateChanges} checked={setValue.campaign_on_service_yn === 'Y' ? true : false} type="checkbox" name="campaign_on_service_yn" />
                      </Form.Group>
                    </Col>

                    <Col sm={4}>
                      <Form.Group controlId="formBasicCheckbox">
                        <Form.Label>Email Attachment Y/N ?</Form.Label>
                        <Form.Check onChange={this.stateChanges} checked={setValue.send_email_yn === 'Y' ? true : false} type="checkbox" name="send_email_yn" />
                      </Form.Group>
                    </Col>
                  </Form.Row>
                  
                  <Form.Row>
                    <Col sm={setValue.send_email_yn === 'N' ? this.state.classSix : 6}>
                      <Form.Row className={this.state.language != 'en' ? 'd-none' : ''}>
                        {this.state.discountType && (
                        <Col>
                          <Form.Group>
                            <Form.Label>Coupon Amount</Form.Label>
                              <Form.Control onChange={this.stateChanges} value={setValue.campaign_value} type="text" name="campaign_value" placeholder="Coupon Amount" />
                            {this.state.errors["campaign_value"] &&
                              <span className='custError'>{this.state.errors["campaign_value"]}</span>
                            }
                          </Form.Group>
                        </Col>
                        )}
                        {!this.state.discountType && (
                          <>
                            <Col sm={4}>
                              <Form.Group>
                                <Form.Label>Coupon %</Form.Label>
                                <Form.Control onChange={this.stateChanges} value={setValue.campaign_pct} type="text" name="campaign_pct" placeholder="" />
                                {this.state.errors["campaign_pct"] &&
                                  <span className='custError'>{this.state.errors["campaign_pct"]}</span>
                                }
                              </Form.Group>
                            </Col>
                            <Col className={this.state.language != 'en' ? 'd-none' : ''}>
                              <Form.Group>
                                <Form.Label>Maximum Redeem Amount </Form.Label>
                                <Form.Control onChange={this.stateChanges} value={setValue.campaign_max_value} type="text" name="campaign_max_value" placeholder="Maximum Redeem Amount" />
                                {this.state.errors["campaign_max_value"] &&
                                  <span className='custError'>{this.state.errors["campaign_max_value"]}</span>
                                }
                              </Form.Group>
                            </Col>
                          </>
                        )}
                      </Form.Row>
                      <Form.Row>
                        
                      
                        <Col className={this.state.language != 'en' ? 'd-none' : ''}>
                          <Form.Group>
                            <Form.Label>Minimum Order Value</Form.Label>
                            <Form.Control onChange={this.stateChanges} value={setValue.minimum_order_value} type="text" name="minimum_order_value" placeholder="Minimum Order Value" />
                            {this.state.errors["minimum_order_value"] &&
                              <span className='custError'>{this.state.errors["minimum_order_value"]}</span>
                            }
                          </Form.Group>
                        </Col>
                      
                        <Col className={this.state.language != 'en' ? 'd-none' : ''}>
                          <Form.Group>
                            <Form.Label>Promo Code</Form.Label>
                            <Form.Control onChange={this.stateChanges} value={setValue.promo_code.toUpperCase()} type="text" name="promo_code" placeholder="Promo Code" maxLength={10}/>
                            {this.state.errors["promo_code"] &&
                              <span className='custError'>{this.state.errors["promo_code"]}</span>
                            }
                          </Form.Group>
                        </Col>
                      </Form.Row>
                    
                      <Form.Row className={this.state.language != 'en' ? 'd-none' : ''}>
                      <Col>
                        <Form.Group>
                            <Form.Label>Coupon Count  <FontAwesomeIcon icon={faQuestionCircle} title='Total number of Coupons for Avail' color='#f08700' /></Form.Label> 
                            <Form.Control onChange={this.stateChanges} value={setValue.campaign_max_count} type="text" name="campaign_max_count" placeholder="Coupon Count" />
                            {this.state.errors["campaign_max_count"] &&
                              <span className='custError'>{this.state.errors["campaign_max_count"]}</span>
                            }
                        </Form.Group>
                        </Col>
                        <Col className='d-none'>
                          <Form.Group>
                            <Form.Label>Avail Count</Form.Label>
                            <Form.Control onChange={this.stateChanges} value={setValue.campaign_avail_count} type="text" name="campaign_avail_count" placeholder="Avail Count"/>
                            {this.state.errors["campaign_avail_count"] &&
                              <span className='custError'>{this.state.errors["campaign_avail_count"]}</span>
                            }
                          </Form.Group>
                        
                          <Form.Group>
                            <Form.Label>Voucher Count</Form.Label>
                            <Form.Control onChange={this.stateChanges} value={setValue.voucher_count} type="text" name="voucher_count" placeholder="Voucher Count" />
                            {this.state.errors["voucher_count"] &&
                              <span className='custError'>{this.state.errors["voucher_count"]}</span>
                            }
                          </Form.Group>
                        </Col>
                      </Form.Row>
                      <Form.Row className={this.state.language != 'en' ? 'd-none' : ''}>
                        <Col>
                          <Form.Group>
                            <Form.Label>From Date</Form.Label>
                            <DatePicker selected={this.state.startDate} className="form-control form-control-sm" name="from_date" dateFormat="dd-MMM-yyyy" onChange={date => this.changeDate(date, 'FD')} required />
                            <Form.Control.Feedback type="invalid">Start Date is a required field</Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col>
                          <Form.Group>
                            <Form.Label>Upto Date</Form.Label>
                            <DatePicker selected={this.state.endDate} className="form-control form-control-sm" name="upto_date" dateFormat="dd-MMM-yyyy" onChange={date => this.changeDate(date, 'UD')} required />
                            <Form.Control.Feedback type="invalid">Upto Date is a required field</Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Form.Row>  
                    </Col>
                    <Col sm={setValue.send_email_yn === 'N' ? this.state.classSix : 6} className={setValue.send_email_yn === 'N' ? 'd-none' : ''}>
                      <Form.Row>
                        <Col>
                          <Form.Label>Email Attachment Image</Form.Label>
                          {setValue.image_path_error &&
                            <Col sm={12}><p className="text-danger">* Image Maximum size 500KB</p></Col>
                          }
                          {this.state.errors["email_image_path"] &&
                            <Col sm={12}><p className="text-danger">{this.state.errors["email_image_path"]}</p></Col>
                          }
                          <Form.Group>
                            <div className="previewComponent">
                              <input className="fileInput" type="file" name="email_image_path" onChange={(e) => this._handleImageChange(e)} />
                              <div className="imgPreview">
                                {$imagePreview}
                              </div>
                            </div>
                          </Form.Group>
                        </Col>

                      </Form.Row>
                      
                    </Col>
                  </Form.Row>
                  <Form.Row>
                    <Col>
                      <Form.Group>
                        <Form.Label>Terms and Contitions (optional)
                        </Form.Label>
                        <Editor editorState={this.state.editorState} onEditorStateChange={this.onEditorStateChange} required />

                        <Form.Control.Feedback type="invalid">Terms and Contitions</Form.Control.Feedback>
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

export default CampaignModal;