
import React, { Component } from 'react';
import './ProductInfo.scss';
import { Col, Row, Form, Modal } from 'react-bootstrap';
import Select from 'react-select';
import ApiDataService from '../../services/ApiDataService';



const insertUrl = 'admin/portal/productinfo/product_clone';
const Api_Productlov = 'admin/portal/productinfo/fetchProduct_lov';


class CloneModal extends Component {
  state = {
    value: [],
  };
  constructor(props) {
    super(props);
    this._isMounted = true;
    this.state = {
      errors: {},
      pr_sys_id: '',
      cloneModalShow: false,
      mode: '',
      dataview: [],
      prod_select_product: '',
      productlov: '',
      product_desc: ''
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.modalRef = React.createRef();
    //this.clonemodalRef = React.createRef();
  }



  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.show && !prevProps.show) {

      ApiDataService.get(process.env.REACT_APP_SERVER_URL + Api_Productlov)
        .then(response => {

          let product_select = this.filterFun(response.data.result.product_lov, 'id', this.state.prod_info_pr_code ? this.state.prod_info_pr_code : 0);
          this.setState({
            productlov: response.data.result.product_lov,

            prod_select_product: product_select
          });

        }).catch(function (error) {

        });

    }
  }

  filterFun = (list, col_name, val) => {
    if (val != undefined) {
      return list.filter(function (data) {
        if (data[col_name] == val) {
          return data;
        }
      });
    } else {
      return false;
    }
  }

  setModalShow = () => {
    this.setInput_value();
    this.setState({
      cloneModalShow: true,
      language: 'en'
    });
  }

  errorThrough = (error, argu) => {
    console.log(error, "RULING");
    var erroMessage = '';
    if (argu === 'ERR-OBJ') {
      erroMessage = Object.keys(error).map(function (key) {
        return <ul key={key} className="mrgnone list-unstyled"><li>{error[key]}</li></ul>;
      });
    } else {
      erroMessage = <ul className="mrgnone list-unstyled"><li>{error}</li></ul>;
    }
    var backColor = ((argu === 'ERR' || argu === 'ERR-OBJ') ? '#ff4c4ceb' : '#20bb20eb');
    this.setState({ snapopen: true, snapcolor: backColor });
    this.setState({ error: erroMessage });
  }



  SelectFun = (val) => {
    let _url = val.description.replace(/[^A-Z0-9]+/ig, "-") || '';
    this.setState({
      prod_select_product: [val],
      prod_info_pr_code: val.id,
      prod_info_pr_desc: val.description,
      prod_info_pr_link: _url.replace(/-$/, "").toLowerCase()
    });

  }
  validation = () => {
    let fields = this.state;
    let errors = {};
    let formIsValid = true;

    if (!fields['prod_instru_desc']) {
      errors["prod_instru_desc"] = "Description is required";
      formIsValid = false;
    }
    if (!fields['prod_instru_ordering']) {
      errors["prod_instru_ordering"] = "Instruction ordering is required";
      formIsValid = false;
    }
    this.setState({ errors: errors });
    return formIsValid;
  }

  cloneModalRecord = (id, desc) => {
    this.setState({
      pr_sys_id: id,
      product_desc: desc
    });
  }

  handleSubmit(event) {
    event.preventDefault();

    var formData = new FormData();

    formData.append('pr_sys_id', this.state.pr_sys_id);
    formData.append('product_desc', this.state.product_desc);
    formData.append('prod_info_pr_code', this.state.prod_info_pr_code);
    formData.append('prod_info_pr_desc', this.state.prod_info_pr_desc);
    formData.append('prod_info_pr_link', this.state.prod_info_pr_link);

    formData.append('lang_code', 'en');



    ApiDataService.post(insertUrl, formData).then(response => {
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
      this.errorThrough(error.message, "ERR");
    });



  };


  render() {
    let { prod_select_product, productlov } = this.state;
    return (
      <div>
        <Modal animation={false} size="md" show={this.props.show} onHide={this.props.closeModal} >
          <Modal.Header closeButton className="">
            <Modal.Title id="modalTitle">
              Clone {this.state.product_desc != '' ? '(' + this.state.product_desc + ')' : ''}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body >
            <Row>
              <Col>
                <Form noValidate onSubmit={this.handleSubmit} autoComplete="off">

                  <Form.Group>
                    <Form.Label>Product</Form.Label>
                    <Select
                      className="basic-single"
                      defaultValue={prod_select_product.length > 0 && prod_select_product ? prod_select_product : []}
                      value={prod_select_product.length > 0 && prod_select_product ? prod_select_product : []}
                      name="prod_info_pr_code"
                      options={productlov ? productlov : []}
                      getOptionLabel={(productlov) => productlov['desc']}
                      getOptionValue={(productlov) => productlov['id']}
                      onChange={(e) => this.SelectFun(e)}
                    />
                    <Form.Control.Feedback type="invalid">Product is a required field</Form.Control.Feedback>
                  </Form.Group>



                  <button type="submit" className={"btn btn-primary btn-sm"}>{'Save'}</button>
                </Form>
              </Col>


            </Row>
          </Modal.Body>
        </Modal>
      </div>
    )
  }
}

export default CloneModal;