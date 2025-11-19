
import React, { Component } from 'react';
import './ItemFamily.scss';
import { Col, Row, Form, Modal } from 'react-bootstrap';
import ApiDataService from '../../services/ApiDataService';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const insertUrl = 'admin/portal/itemfamily';
const Api_Filterlov = 'admin/portal/itemfamily/filter_type_lov';

const PER_PAGE = process.env.REACT_APP_PER_PAGE;

class ItemFamilyModal extends Component {
  state = {
    value: [],
  };
  constructor(props) {
    super(props);
    this._isMounted = true;
    this.state = {
      ItemFamily_active_yn:'N',
      ItemFamily_desc:'',
      filter_type:'',
      avtar:'',
      errors: {},
      ItemFamily_id:null,
      filterlov: [],
      isValid : false,
      modalShow: false,
      imagePreviewUrl: '',
      ItemFamily_ordering: '',
      ItemFamily_from_dt: moment(new Date(), 'DD-MMM-YYYY').toDate(),
		  ItemFamily_upto_dt: moment('31-DEC-2099', 'DD-MMM-YYYY').toDate()	
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

  

  componentWillMount(){
    ApiDataService.get(process.env.REACT_APP_SERVER_URL + Api_Filterlov)
	.then(response => {	
		this.setState({
          filterlov: response.data.result
        });
    }).catch(function(error){			
      
    });

   
  }

  editModalRecord=(id)=>{
    this.state.mode = 'UP';
    ApiDataService.get(`${insertUrl}/${id}/edit`).then(response => {
      let resp = response.data.result[0];
      Object.entries(resp).forEach(([key, value]) => {
        if (key == 'ItemFamily_from_dt') {
          this.setState({ [key]: moment(value == '' ? new Date() : value, 'DD-MMM-YYYY').toDate()});
        } else if (key == 'ItemFamily_upto_dt') {
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
	  if (name === 'ItemFamily_active_yn'){
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
	
    if (!fields["ItemFamily_desc"]) {
		errors["ItemFamily_desc"] = "ItemFamily is required";
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

    let fromDateVar = moment(this.state.ItemFamily_from_dt);
			let newFromDateVar = fromDateVar.format('DD-MMM-YYYY');
			formData.append('ItemFamily_from_dt', newFromDateVar);			
			let uptoDateVar = moment(this.state.ItemFamily_upto_dt);
			let newUptoDateVar = uptoDateVar.format('DD-MMM-YYYY');
    formData.append('ItemFamily_upto_dt', newUptoDateVar);		
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
      url = `${insertUrl}/update/${this.state.ItemFamily_id}`;
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

  ItemFamilyDesc = (e) => {
	const { name, value } = e.target;
	let fields = this.state;
	let errors={};
	let formIsValid = true;

	ApiDataService.get(`${insertUrl}/ItemFamilysearch/${this.state.filter_type}/${value}`).then(response => {
		let resp = response.data.result[0];
		if(resp.row == 0){
			this.setState({ name: value, errors: errors, isValid : false });
			return formIsValid;
		}else{
			//this.setState({ name: '' });

			errors["ItemFamily_desc"] = "ItemFamily already exists";
			formIsValid = false;
			this.setState({ errors: errors, isValid : true });
    		return formIsValid;
		}
		
	  }).catch((error)=>{
  
	  });
  }


  _imageChange(e) {
    e.preventDefault();

    if(e.target.name == 'ItemFamily_image'){
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

  render(){

    const setValue = this.state;
    let {filterlov, imagePreviewUrl} = this.state;

    let $imagePreview = (<div className="previewText"><center><img className="imgWidth" src={this.state.no_image_path}/></center></div>);

    let $imagePreviewUrl =   imagePreviewUrl ? (<center><img className="imgWidth" src={imagePreviewUrl} /></center>) : $imagePreview;
    
    return (
      <div>
        <Modal animation={false} size="xl" show={this.props.show} onHide={this.props.closeModal} >
        <Modal.Header closeButton className="">
          <Modal.Title id="modalTitle">
            ItemFamily
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col>
              <Form noValidate onSubmit={this.handleSubmit} autoComplete="off">
                <Form.Row>
                  <Col>
                    <Form.Group> 
                      <Form.Label>Family</Form.Label>
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
                      <Form.Label>Collection</Form.Label>
                        <Form.Control onBlur={this.ItemFamilyDesc} onChange={this.stateChanges} value={setValue.ItemFamily_desc} type="text" name="ItemFamily_desc" placeholder="ItemFamily Description" />
                        {this.state.errors["ItemFamily_desc"] &&
                          <span className='custError'>{this.state.errors["ItemFamily_desc"]}</span>
                        }
                    </Form.Group>
                    </Col>
                    <Col>
                    <Form.Group>
                      <Form.Label>Brand</Form.Label>
                        <Form.Control onBlur={this.ItemFamilyDesc} onChange={this.stateChanges} value={setValue.ItemFamily_desc} type="text" name="ItemFamily_desc" placeholder="ItemFamily Description" />
                        {this.state.errors["ItemFamily_desc"] &&
                          <span className='custError'>{this.state.errors["ItemFamily_desc"]}</span>
                        }
                    </Form.Group>
                  </Col>
                </Form.Row>
                <Form.Row>
                  <Col>
                    <Form.Group>
                      <Form.Label>ItemFamily Ordering</Form.Label>
                        <Form.Control onBlur={this.ItemFamilyDesc} onChange={this.stateChanges} value={setValue.ItemFamily_ordering} type="text" name="ItemFamily_ordering" placeholder="ItemFamily Ordering" />
                        {this.state.errors["ItemFamily_ordering"] &&
                          <span className='custError'>{this.state.errors["ItemFamily_ordering"]}</span>
                        }
                    </Form.Group>
                  </Col>
                  </Form.Row>
                  <Form.Row>
                  <Col>
                    <Form.Group controlId="ItemFamily_from_dt">
                      <Form.Label>From Date</Form.Label>								
                      <DatePicker
                        selected={ this.state.ItemFamily_from_dt }
                        onChange={ this.handleDateChange.bind(this,'ItemFamily_from_dt') }
                        value={ this.state.ItemFamily_from_dt }
                        name="ItemFamily_from_dt"
                        dateFormat="dd-MMM-yyyy" 
                        className="form-control"
                      />
                    </Form.Group>
                    <div className='errorMsg'>{this.state.errors.ItemFamily_from_dt}</div>								
                    </Col>
                    </Form.Row>
                  <Form.Row>
                    <Col>
                      <Form.Group controlId="ItemFamily_upto_dt">
                        <Form.Label>Upto Date</Form.Label>
                        
                        <DatePicker
                          selected={ this.state.ItemFamily_upto_dt } 
                          onChange={ this.handleDateChange.bind(this,'ItemFamily_upto_dt') }
                          value={ this.state.ItemFamily_upto_dt }
                          name="ItemFamily_upto_dt" 
                          dateFormat="dd-MMM-yyyy" 
                          className="form-control"
                        />
                      </Form.Group>
                      <div className='errorMsg'>{this.state.errors.ItemFamily_upto_dt}</div>
                    </Col>
                  </Form.Row>
                <Form.Row>
                  <Col>
                    <Form.Group controlId="formBasicCheckbox">
                    <Form.Label>Active ?</Form.Label>
                      <Form.Check onChange={this.stateChanges} checked={setValue.ItemFamily_active_yn==='Y' ? true : false} type="checkbox" name="ItemFamily_active_yn"/>
                    </Form.Group>
                  </Col>
                </Form.Row>
          


                    <Form.Group controlId="formFile" className="mb-3">
                      
                     
                        <Form.Label>Image Upload</Form.Label>
                      
                        <Form.Control type="file" name="ItemFamily_image" onChange={(e)=>this._imageChange(e)} />
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

export default ItemFamilyModal;