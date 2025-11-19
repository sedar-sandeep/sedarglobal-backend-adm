
import React, { Component } from 'react';
import './Language.scss';
import { Col, Row, Form, Modal } from 'react-bootstrap';
import ApiDataService from '../../services/ApiDataService';


const insertUrl = 'admin/portal/language';
const Api_Langlov = 'admin/portal/language/lang/lov';


const PER_PAGE = process.env.REACT_APP_PER_PAGE;

class LanguageModal extends Component {
  state = {
    value: [],
  };
  constructor(props) {
    super(props);
    this._isMounted = true;
    this.state = {
      language_active_yn:'N',
      language_desc:'',
      errors: {},
      language_code:'',
      isValid : false,
      modalShow: false,
      langDrop: [],
      language: 'en',
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  setInput_value(){
    this.setState({
      language_desc:'',
      language_active_yn:'N',
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

  proceedLang = (id, desc) => {

    var formData = new FormData();

    formData.append('desc', desc);
    

    ApiDataService.post(`${insertUrl}/generate/${id}`, formData).then(response => {
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
        if(this.props.language != 'en'){
          
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


  editModalRecord=(id, desc, lang)=>{
    this.state.mode = 'UP';
    ApiDataService.get(`${insertUrl}/${id}/edit?language=` + lang).then(response => {
      let resp = response.data.result[0];
      Object.entries(resp).forEach(([key, value]) => {
        this.setState({ [key]: value });
      });
    }).catch((error)=>{

    });

    this.setState({ desc: desc});

    
  }

 
  stateChanges = (e) => {
    const { name, value } = e.target;
    var values = '';
	  if (name === 'language_active_yn'){
      let checkBox = e.target.checked;
      values = (checkBox ? 'Y' : 'N');
    }else{
      values = value;
    }
    this.setState({ [name]: values });
    console.log(this.state);
  }

  validation = () => {
    let fields = this.state;
    let errors={};
    let formIsValid = true;
	
    if (!fields["language_desc"]) {
		errors["language_desc"] = "Language Description is required";
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
        }
      }).catch((error) => {
        console.log(error);
        this.props.errorMessage(error.message, "ERR");
      });
    }else{
      url = `${insertUrl}/update/${this.state.language_code}`;
      ApiDataService.update(url, formData).then(response => {
        if (response.data.return_status !== "0") {
          if (response.data.error_message === 'Error') {
            this.props.errorMessage(response.data.result, "ERR-OBJ");
          } else {
            this.props.errorMessage(response.data.error_message, "ERR");
          }
        }else{
          this.props.errorMessage(response.data.error_message, "DONE");
        }
      }).catch((error) => {
        console.log(error);
        this.props.errorMessage(error.message, "ERR");
      });
    }
   
  }

 
 
  render(){

    const setValue = this.state;
    let {langDrop} = this.state;
    
    return (
      <div>
        <Modal animation={false} size="sm" show={this.props.show} onHide={this.props.closeModal} >
        <Modal.Header closeButton className="">
          <Modal.Title id="modalTitle">
            Language 
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
                        {langDrop.map((data,i) => (
                          <option value={data.code} key={i}>{data.desc}</option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                  </Col>
                 
                </Form.Row> 

                
                <Form.Row>
                  <Col>
                    <Form.Group>
                      <Form.Label>Code</Form.Label>
                        <Form.Control onChange={this.stateChanges} value={setValue.language_code} type="text" name="language_code" placeholder="Code" />
                        {this.state.errors["language_code"] &&
                          <span className='custError'>{this.state.errors["language_code"]}</span>
                        }
                    </Form.Group>
                  </Col>
                  </Form.Row>
                  <Form.Row>
                    <Col>
                      <Form.Group>
                        <Form.Label>Description</Form.Label>
                        <Form.Control onChange={this.stateChanges} value={setValue.language_desc} type="text" name="language_desc" placeholder="Description" />
                        {this.state.errors["language_desc"] &&
                          <span className='custError'>{this.state.errors["language_desc"]}</span>
                        }
                      </Form.Group>
                    </Col>
                  </Form.Row>
                
                <Form.Row>
                  <Col>
                    <Form.Group controlId="formBasicCheckbox">
                    <Form.Label>Active ?</Form.Label>
                      <Form.Check onChange={this.stateChanges} checked={setValue.language_active_yn==='Y' ? true : false} type="checkbox" name="language_active_yn"/>
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

export default LanguageModal;