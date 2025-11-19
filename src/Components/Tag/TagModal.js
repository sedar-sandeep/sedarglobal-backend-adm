
import React, { Component } from 'react';
import './Tag.scss';
import { Col, Row, Form, Modal } from 'react-bootstrap';
import ApiDataService from '../../services/ApiDataService';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const insertUrl = 'admin/portal/tag';
const Api_Filterlov = 'admin/portal/tag/filter_type_lov';
const Api_Langlov = 'admin/portal/tag/lang/lov';


const PER_PAGE = process.env.REACT_APP_PER_PAGE;

class TagModal extends Component {
  state = {
    value: [],
  };
  constructor(props) {
    super(props);
    this._isMounted = true;
    this.state = {
      tag_active_yn:'Y',
      tag_desc:'',
      filter_type:'',
      avtar:'',
      errors: {},
      tag_id:null,
      filterlov: [],
      isValid : false,
      modalShow: false,
      imagePreviewUrl: '',
      tag_ordering: '',
      langDrop: [],
      language: 'en',
      tag_from_dt: moment(new Date(), 'DD-MMM-YYYY').toDate(),
		  tag_upto_dt: moment('31-DEC-2099', 'DD-MMM-YYYY').toDate()	
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
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

  

  
  editModalRecord = (id, desc, lang, type = false)=>{
    this.state.mode = 'UP';
    ApiDataService.get(`${insertUrl}/${id}/edit?language=${lang}`).then(response => {
      let resp = response.data.result[0];
      this.setState({ language: lang, tag_desc: desc });

      Object.entries(resp).forEach(([key, value]) => {
        if (key == 'tag_from_dt') {
          this.setState({ [key]: moment(value == '' ? new Date() : value, 'DD-MMM-YYYY').toDate()});
        } else if (key == 'tag_upto_dt') {
          this.setState({ [key]: moment(value == '' ? '31-DEC-2099' : value, 'DD-MMM-YYYY').toDate()});
        } else {
          this.setState({ [key]: value });
        }
      });
    }).catch((error)=>{

    });
    
  }

 
  stateChanges = (e) => {
    const { name, value } = e.target;
    var values = '';
	  if (name === 'tag_active_yn'){
      let checkBox = e.target.checked;
      values = (checkBox ? 'Y' : 'N');
    }else{
      values = value;
    }
    this.setState({ [name]: values });
  }

  validation = () => {
    let fields = this.state;
    let errors={};
    let formIsValid = true;
	
    if (!fields["tag_desc"]) {
		errors["tag_desc"] = "Tag is required";
		formIsValid = false;
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

    let fromDateVar = moment(this.state.tag_from_dt);
			let newFromDateVar = fromDateVar.format('DD-MMM-YYYY');
			formData.append('tag_from_dt', newFromDateVar);			
			let uptoDateVar = moment(this.state.tag_upto_dt);
			let newUptoDateVar = uptoDateVar.format('DD-MMM-YYYY');
    formData.append('tag_upto_dt', newUptoDateVar);		
    console.log(formData)

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
          this.props.closeModal();
        }
      }).catch((error) => {
        console.log(error);
        this.props.errorMessage(error.message, "ERR");
      });
    }else{
      url = `${insertUrl}/update/${this.state.tag_id}`;
      ApiDataService.update(url, formData).then(response => {
        if (response.data.return_status !== "0") {
          if (response.data.error_message === 'Error') {
            this.props.errorMessage(response.data.result, "ERR-OBJ");
          } else {
            this.props.errorMessage(response.data.error_message, "ERR");
          }
        }else{
          this.props.errorMessage(response.data.error_message, "DONE");
          this.props.closeModal();
        }
      }).catch((error) => {
        console.log(error);
        this.props.errorMessage(error.message, "ERR");
      });
    }
   
  }

  tagDesc = (e) => {
	const { name, value } = e.target;
	let fields = this.state;
	let errors={};
	let formIsValid = true;

    ApiDataService.get(`${insertUrl}/tagsearch/${this.state.filter_type}/${value}?language=${this.state.language}`).then(response => {
		let resp = response.data.result[0];
		if(resp.row == 0){
			this.setState({ name: value, errors: errors, isValid : false });
			return formIsValid;
		}else{
			//this.setState({ name: '' });

			errors["tag_desc"] = "Tag already exists";
			formIsValid = false;
			this.setState({ errors: errors, isValid : true });
    		return formIsValid;
		}
		
	  }).catch((error)=>{
  
	  });
  }


  _imageChange(e) {
    e.preventDefault();

    if(e.target.name == 'tag_image'){
      let reader = new FileReader();
      let image_path = e.target.files[0];
      reader.onloadend = () => {
        this.setState({
          avatar : image_path,
          imagePreviewUrl: reader.result
        });
      }
      reader.readAsDataURL(image_path);

    }
  }

  handleDateChange(name, date) {
		if(moment(date).isValid()){
			this.setState({
				[name]: moment(date).toDate()
			});
		}
  }
  

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.show && !prevProps.show) {
      this.setform_input();

      ApiDataService.get(process.env.REACT_APP_SERVER_URL + Api_Filterlov)
        .then(response => {
          this.setState({
            filterlov: response.data.result
          });
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


  setform_input() {
    this.setState({
      tag_active_yn: 'Y',
      tag_desc: '',
      filter_type: '',
      avtar: '',
      errors: {},
      tag_id: null,
      filterlov: [],
      isValid: false,
      modalShow: false,
      imagePreviewUrl: '',
      tag_ordering: '',
      language: 'en',
      tag_from_dt: moment(new Date(), 'DD-MMM-YYYY').toDate(),
      tag_upto_dt: moment('31-DEC-2099', 'DD-MMM-YYYY').toDate()
    });
  }

  render(){

    const setValue = this.state;
    let { filterlov, imagePreviewUrl, langDrop } = this.state;

    let $imagePreview = (<div className="previewText"><center><img className="imgWidth" src={this.state.no_image_path}/></center></div>);

    let $imagePreviewUrl =   imagePreviewUrl ? (<center><img className="imgWidth" src={imagePreviewUrl} /></center>) : $imagePreview;
    
    return (
      <div>
        <Modal animation={false} size="sm" show={this.props.show} onHide={this.props.closeModal} >
        <Modal.Header closeButton className="">
          <Modal.Title id="modalTitle">
              Tag {this.state.tag_desc}
          </Modal.Title>
        </Modal.Header>
          <Modal.Body dir={this.state.language == 'ar' ? 'rtl' : 'ltr'}>
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
                </Form.Row>
                  <Form.Row className={this.state.language != 'en' ? 'd-none' : ''}>
                  <Col>
                    <Form.Group> 
                      <Form.Label>Filter Type</Form.Label>
                      <Form.Control as="select" value={setValue.filter_type} name="filter_type" onChange={this.stateChanges}>
                        <option>Select Filter</option>
                        {filterlov.map((data,i) => (
                          <option value={data.id} key={i}>{data.desc}</option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                  </Col>
                </Form.Row> 

                
                <Form.Row>
                  <Col>
                    <Form.Group>
                      <Form.Label>Tag</Form.Label>
                        <Form.Control onBlur={this.tagDesc} onChange={this.stateChanges} value={setValue.tag_desc} type="text" name="tag_desc" placeholder="Tag Description" />
                        {this.state.errors["tag_desc"] &&
                          <span className='custError'>{this.state.errors["tag_desc"]}</span>
                        }
                    </Form.Group>
                  </Col>
                </Form.Row>
                  <Form.Row className={this.state.language != 'en' ? 'd-none' : ''}>
                  <Col>
                    <Form.Group>
                      <Form.Label>Tag Ordering</Form.Label>
                        <Form.Control onBlur={this.tagDesc} onChange={this.stateChanges} value={setValue.tag_ordering} type="text" name="tag_ordering" placeholder="Tag Ordering" />
                        {this.state.errors["tag_ordering"] &&
                          <span className='custError'>{this.state.errors["tag_ordering"]}</span>
                        }
                    </Form.Group>
                  </Col>
                  </Form.Row>
                  <Form.Row className={this.state.language != 'en' ? 'd-none' : ''}>
                  <Col>
                    <Form.Group controlId="tag_from_dt">
                      <Form.Label>From Date</Form.Label>								
                      <DatePicker
                        selected={ this.state.tag_from_dt }
                        onChange={ this.handleDateChange.bind(this,'tag_from_dt') }
                        value={ this.state.tag_from_dt }
                        name="tag_from_dt"
                        dateFormat="dd-MMM-yyyy" 
                        className="form-control"
                      />
                    </Form.Group>
                    <div className='errorMsg'>{this.state.errors.tag_from_dt}</div>								
                    </Col>
                    </Form.Row>
                  <Form.Row className={this.state.language != 'en' ? 'd-none' : ''}>
                    <Col>
                      <Form.Group controlId="tag_upto_dt">
                        <Form.Label>Upto Date</Form.Label>
                        
                        <DatePicker
                          selected={ this.state.tag_upto_dt } 
                          onChange={ this.handleDateChange.bind(this,'tag_upto_dt') }
                          value={ this.state.tag_upto_dt }
                          name="tag_upto_dt" 
                          dateFormat="dd-MMM-yyyy" 
                          className="form-control"
                        />
                      </Form.Group>
                      <div className='errorMsg'>{this.state.errors.tag_upto_dt}</div>
                    </Col>
                  </Form.Row>
                  <Form.Row className={this.state.language != 'en' ? 'd-none' : ''}>
                  <Col>
                    <Form.Group controlId="formBasicCheckbox">
                    <Form.Label>Active ?</Form.Label>
                      <Form.Check onChange={this.stateChanges} checked={setValue.tag_active_yn==='Y' ? true : false} type="checkbox" name="tag_active_yn"/>
                    </Form.Group>
                  </Col>
                </Form.Row>
          


                  <Form.Group controlId="formFile" className={this.state.language != 'en' ? 'd-none' : 'mb-3'}>
                      
                     
                        <Form.Label>Image Upload</Form.Label>
                      
                        <Form.Control type="file" name="tag_image" onChange={(e)=>this._imageChange(e)} />
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

export default TagModal;