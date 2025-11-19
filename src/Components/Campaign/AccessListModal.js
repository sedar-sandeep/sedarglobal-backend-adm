
import React, { Component } from 'react';
import './Campaign.scss';
import { Col, Row, Form, Modal } from 'react-bootstrap';
import ApiDataService from '../../services/ApiDataService';

import Multiselect from 'multiselect-react-dropdown';
import { ConfirmationDialog, SnapBarError } from "../../ConfirmationDialog";
import ServerTable from '../../services/server-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faChartLine, faTrash, faCog, faPlus, faLanguage } from '@fortawesome/free-solid-svg-icons';
import AccessSecurity from '../../AccessSecurity';
import { WindowPanel } from "../../WindowPanel";
import { Dropdown, DropdownButton, OverlayTrigger, Tooltip } from 'react-bootstrap';
const PER_PAGE = process.env.REACT_APP_PER_PAGE;

const Url = 'admin/portal/campaign';

class AccessListModal extends Component {
  state = {
    value: [],
  };
  constructor(props) {
    super(props);
    this._isMounted = true;
    this.state = {
      campaign_sys_id: '',
      mode: 'IS',
      product_list: [],
      brand_list: [],
      collection_list: [],
      productAccess: 'INCLUDE',
      collectionAccess: 'INCLUDE',
      brandAccess: 'INCLUDE',
      selectedProduct: '',
      selectedBrand: '',
      selectedCollection: '',
      optionListRenderTable: false,
      sca_sys_id: 0
    };


    this.handleSubmit = this.handleSubmit.bind(this);
    this.productListFun();

    this.accessListRecordFun = this.accessListRecordFun.bind(this);
  }
  accessListRecordFun = (data) => {
    this.setState({ campaign_sys_id: data.id, campaign_desc: data.campaign_desc });
  }

  optionListRenderTable = () => {
    this.setState({
      optionListRenderTable: true
    }, () => {
      this.setState({ optionListRenderTable: false });
      /*  this.setState({
            step_desc: '',
            step_ordering: '',
            image_path: '',
            info_img_path: [],
            avatar: '',
            default_selected: 'N'
        });*/
    });
  }

  productListFun = () => {
    ApiDataService.get(`${Url}/accessList`).then(response => {
      let resp = response.data;
      console.log(resp);
      this.setState(resp);

    }).catch((error) => {
      console.log(error);
      this.props.errorMessage(error.message, "ERR");
    });
  }

  accessFun = (name, val) => {
    this.setState({ [name]: val });
  }
  snapclose = () => {
    this.setState({ snapopen: false });
  };

  deletRecord = (id) => {
    this.setState({ deletedialog: true, sca_sys_id: id });
  }
  proceedDelete = (params) => {
    if (params) {
      this.deleteModalRecord(this.state.sca_sys_id);
    }
  }
  closedialog = () => {
    this.setState({ deletedialog: false });
  }

  deleteModalRecord = (id) => {
    ApiDataService.delete(`${Url}/accessDelete/`, id).then(response => {
      if (response.data.return_status !== "0") {
        if (response.data.error_message === 'Error') {
          this.props.errorMessage(response.data.result, "ERR-OBJ");
        } else {
          this.props.errorMessage(response.data.error_message, "ERR");
        }
      } else {
        this.props.errorMessage(response.data.error_message, "DONE");
        this.optionListRenderTable();
      }
      this.closedialog();
    }).catch((error) => {
      this.props.errorMessage(error.message, "ERR");
      this.closedialog();
    });
  }

  onSelect(selectedList, selectedItem, name) {

    let item_id = [];
    selectedList && selectedList.map((e, i) => {
      item_id.push(e.ID);
    })

    this.setState({
      [name]: item_id
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    var formData = new FormData();
    let Properties = this.state;

    formData.append('productAccess', this.state.productAccess);
    formData.append('collectionAccess', this.state.collectionAccess);
    formData.append('brandAccess', this.state.brandAccess);
    formData.append('selectedProduct', this.state.selectedProduct);
    formData.append('selectedBrand', this.state.selectedBrand);
    formData.append('selectedCollection', this.state.selectedCollection);
    formData.append('campaign_sys_id', this.state.campaign_sys_id);


    ApiDataService.post(Url + '/insertAccessList/' + this.state.campaign_sys_id, formData).then(response => {
      let res_product_data = response.data && response.data.PRODUCT ? response.data.PRODUCT : [];
      this.showSucessErrorMgs(res_product_data);

      let res_brand_data = response.data && response.data.BRAND ? response.data.BRAND : [];
      this.showSucessErrorMgs(res_brand_data);

      let res_collection_data = response.data && response.data.COLLECTION ? response.data.COLLECTION : [];
      this.showSucessErrorMgs(res_collection_data);
     
/*
      if (response.data.return_status !== "0") {
        if (response.data.error_message === 'Error') {
          this.props.errorMessage(response.data.result, "ERR-OBJ");
        } else {
          this.props.errorMessage(response.data.error_message, "ERR");
        }

      } else {
        this.props.errorMessage(response.data.error_message, "DONE");
        this.optionListRenderTable();
      }*/
    }).catch((error) => {
      console.log(error);
      this.props.errorMessage(error.message, "ERR");
    });


  }
  showSucessErrorMgs = (data) => {
    data.map((response, i) => {
      if (response.return_status !== "0") {
        if (response.error_message === 'Error') {
          this.props.errorMessage(response.result, "ERR-OBJ");
        } else {
          this.props.errorMessage(response.error_message, "ERR");
        }

      } else {
        this.props.errorMessage(response.error_message, "DONE");
        this.optionListRenderTable();
      }
    })
  }

  setModalShow = () => {
    this.setState({
      filterModalShow: true,

    });
  }

  render() {

    let self = this;
    const access_url = `${Url}/getAccessList/${this.state.campaign_sys_id}`;
    const columns = ['sr_no', 'SCA_ACCESS_ON_DESC', 'SCA_ACCESS_TYPE', 'SCA_ACCESS', 'actions'];


    let $button = (<OverlayTrigger overlay={<Tooltip id="tooltip">Add Product Step</Tooltip>}>
      <button className="btn btn-primary btn-sm" onClick={this.setModalShow}>{<FontAwesomeIcon icon={faPlus} />}</button>
    </OverlayTrigger>);


    const options = {
      perPage: PER_PAGE,
      headings: {
        sr_no: '#',
        SCA_ACCESS_ON_DESC: 'Name',
        SCA_ACCESS: 'Access',
        SCA_ACCESS_TYPE: 'Type',
      },
      search_key: {
        SCA_ACCESS_TYPE: 'Type',
        SCA_ACCESS: 'Access',
        SCA_ACCESS_ON_DESC: 'Name',

      },

      responseAdapter: function (resp_data) {
        self.setState({ page: resp_data.page });
        return { data: resp_data.result, total: resp_data.row_count }
      },
      texts: {
        //show: 'عرض'
        show: ''
      },
      search_lov: {
        pages: []
      }
    };

    return (
      <div>
        <Modal animation={false} size="lg" show={this.props.show} onHide={this.props.closeModal} >
          <Modal.Header closeButton className="">
            <Modal.Title id="modalTitle">
              Campaign {this.state.campaign_desc ? this.state.campaign_desc : ''}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form noValidate onSubmit={this.handleSubmit} autoComplete="off">
              <Row>
                <Col md={10}>
                  <label>Product</label>
                  <Multiselect
                    options={this.state.product_list} // Options to display in the dropdown
                    selectedValues={this.state.selectedProductValue} // Preselected value to persist in dropdown
                    onSelect={(selectedList, selectedItem) => this.onSelect(selectedList, selectedItem, 'selectedProduct')} // Function will trigger on select event
                    onRemove={(selectedList, selectedItem) => this.onSelect(selectedList, selectedItem, 'selectedProduct')} // Function will trigger on remove event
                    displayValue="NAME" // Property name to display in the dropdown options
                    displayKey="ID"
                    showCheckbox={true}
                  />
                </Col>
                <Col md={2} style={{ marginTop: '30px' }}>
                  <div className="form-check">
                    <input className="form-check-input" name="productAccess" value="INCLUDE" checked={this.state.productAccess === "INCLUDE"} onChange={(e) => this.accessFun('productAccess', 'INCLUDE')} type="radio" />
                    <label className="form-check-label">Include</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" name="productAccess" value="EXCLUDE" checked={this.state.productAccess === "EXCLUDE"} onChange={(e) => this.accessFun('productAccess', 'EXCLUDE')} type="radio" />
                    <label className="form-check-label">Exclude</label>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col md={10}>
                  <label>Brand</label>
                  <Multiselect
                    options={this.state.brand_list} // Options to display in the dropdown
                    selectedValues={this.state.selectedBrandValue} // Preselected value to persist in dropdown
                    onSelect={(selectedList, selectedItem) => this.onSelect(selectedList, selectedItem, 'selectedBrand')} // Function will trigger on select event
                    onRemove={(selectedList, selectedItem) => this.onSelect(selectedList, selectedItem, 'selectedBrand')} // Function will trigger on remove event
                    displayValue="NAME" // Property name to display in the dropdown options
                    displayKey="ID"
                    showCheckbox={true}
                  />
                </Col>
                <Col md={2} style={{ marginTop: '30px' }}>
                  <div className="form-check">
                    <input className="form-check-input" name="brandAccess" value="INCLUDE" checked={this.state.brandAccess === "INCLUDE"} onChange={(e) => this.accessFun('brandAccess', 'INCLUDE')} type="radio" />
                    <label className="form-check-label">Include</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" name="brandAccess" value="EXCLUDE" checked={this.state.brandAccess === "EXCLUDE"} onChange={(e) => this.accessFun('brandAccess', 'EXCLUDE')} type="radio" />
                    <label className="form-check-label">Exclude</label>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col md={10}>
                  <label>Collection</label>
                  <Multiselect
                    options={this.state.collection_list} // Options to display in the dropdown
                    selectedValues={this.state.selectedCollectionValue} // Preselected value to persist in dropdown
                    onSelect={(selectedList, selectedItem) => this.onSelect(selectedList, selectedItem, 'selectedCollection')} // Function will trigger on select event
                    onRemove={(selectedList, selectedItem) => this.onSelect(selectedList, selectedItem, 'selectedCollection')} // Function will trigger on remove event
                    displayValue="NAME" // Property name to display in the dropdown options
                    displayKey="ID"
                    showCheckbox={true}
                  />
                </Col>
                <Col md={2} style={{ marginTop: '30px' }}>
                  <div className="form-check">
                    <input className="form-check-input" name="collectionAccess" value="INCLUDE" checked={this.state.collectionAccess === "INCLUDE"} onChange={(e) => this.accessFun('collectionAccess', 'INCLUDE')} type="radio" />
                    <label className="form-check-label">Include</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" name="collectionAccess" value="EXCLUDE" checked={this.state.collectionAccess === "EXCLUDE"} onChange={(e) => this.accessFun('collectionAccess', 'EXCLUDE')} type="radio" />
                    <label className="form-check-label">Exclude</label>
                  </div>
                </Col>
              </Row>

              <button type="submit" className={this.state.mode === 'IS' ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}>{this.state.mode === 'IS' ? 'Save' : 'Update'}</button>
            </Form>



            <Row>
              <Col xs={12}>
                <SnapBarError
                  message={this.state.error}
                  snapopen={this.state.snapopen}
                  snapcolor={this.state.snapcolor}
                  snapclose={this.snapclose}
                />
                <ConfirmationDialog
                  dialogopen={this.state.deletedialog}
                  dialogclose={this.closedialog}
                  agreeProcess={this.proceedDelete}
                />
                <WindowPanel rawHtml={
                  <div className="windowContent">
                    <ServerTable renderView={this.state.optionListRenderTable} columns={columns} url={access_url} options={options} addme={$button} bordered hover updateUrl hist_table="SITE_M_STEP_OPTION_HIST">
                      {
                        function (row, column, index) {
                          switch (column) {
                            case 'sr_no':
                              return (
                                (index + 1) + (PER_PAGE * ((self.state.page) - 1))
                              );

                            case 'actions':
                              return (
                                <div className="form-control-sm" style={{ textAlign: 'center' }}>
                                  <DropdownButton size="sm" id="dropdown-basic-button" title={<FontAwesomeIcon icon={faCog} />}>
                                    {/* <Dropdown.Item onClick={() => self.editStepModalRecord(row.product_step_id)}><FontAwesomeIcon icon={faEdit} /> Edit</Dropdown.Item> */}
                                    <Dropdown.Item onClick={() => self.deletRecord(row.SCA_SYS_ID)}><FontAwesomeIcon icon={faTrash} /> Delete</Dropdown.Item>
                                    {/* <Dropdown.Item onClick={() => self.editStepModalRecord(row.product_step_id, 'ar')}><FontAwesomeIcon icon={faLanguage} /> Edit Language</Dropdown.Item> */}
                                  </DropdownButton>
                                </div>
                              );
                            default:
                              return (row[column]);
                          }
                        }
                      }
                    </ServerTable>

                  </div>
                } />
              </Col>
            </Row>





          </Modal.Body>
        </Modal>
      </div>
    )
  }
}
export default AccessListModal;