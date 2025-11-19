
import React, { Component } from 'react';
import './ItemInfo.scss';
import { Col, Row, Form, Modal } from 'react-bootstrap';
import { WindowPanel } from "../../WindowPanel";
import ApiDataService from '../../services/ApiDataService';

import ServerTable from '../../services/server-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faCog, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Dropdown, DropdownButton, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { ConfirmationDialog, SnapBarError } from "../../ConfirmationDialog";

const insertUrl = 'admin/portal/iteminfo/stock';
const item_product_lov = 'admin/portal/iteminfo/product';

const PER_PAGE = process.env.REACT_APP_PER_PAGE;

class StockModal extends Component {
  state = {
    value: [],
  };
  constructor(props) {
    super(props);
    this._isMounted = true;
    this.state = {
      errors: {},
      
      stockModalShow: false,
      mode: '',
      dataview: [],
      totaldata: null,
      snapopen: false,
      snapcolor: null,
      error: null,
      deletedialog: false,
      proceed: false,
      page: 1,
      item_desc: ''
    };

    this.modalRef = React.createRef();
    this.stockModalRef = React.createRef();
  }



  setModalShow = () => {
    this.setInput_value();
    this.setState({
      stockModalShow: true,
      mode: 'IS'
    });
  }

  closedialog = () => {
    this.setState({ deletedialog: false });
  }
  modalClose = () => {
    this.setState({ stockModalShow: false });
  }

  stockrenderTable = () => {
    this.setState({
      stockrenderTable: true
    }, () => {
      this.setState({ stockrenderTable: false });
    });
  }

  
  snapclose = () => {
    this.setState({ snapopen: false });
  };
  handleClose = () => {
    this.setState({ open: false });
  };
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



  stockModalRecord = (id, desc) => {
    ApiDataService.get(process.env.REACT_APP_SERVER_URL + item_product_lov + '/' + id)
      .then(response => {
        this.setState({
          productlov: response.data.result
        });
      }).catch(function (error) {

      });

    this.setState({ item_info_id: id, mode: '', item_desc: desc });
  }


  render() {

    let { imagePreviewUrl, productlov, use_type } = this.state;
    let $imagePreview = null;
    if (imagePreviewUrl) {
      $imagePreview = (<img src={imagePreviewUrl} style={{ width: '100%' }} />);
    } else {
      $imagePreview = (<div className="previewText"></div>);
    }

    let self = this;
    const url = `admin/portal/iteminfo/stock`;
    
    const columns = [
      'sr_no',
      'item_id',
      'width',
      'free_stock',
      'added_on',
      'sis_leader_yn'
    ];

    const options = {
      perPage: PER_PAGE,
      headings: {
        sr_no: '#',
        item_id: 'Item',
        width: 'Width',
        free_stock: 'Free Stock',
        added_on: 'Added On',
        sis_leader_yn:'Leader YN?'

      },
      search_key: {
        item_id: 'Product',
        width: 'Ordering',
        free_stock: 'Free Stock',
        added_on: 'Added On',
        sis_leader_yn:'Leader YN?'
      },
      sortable: [],
      requestParametersNames: { search_value: 'search_value', search_column: 'search_column', direction: 'order' },
      columnsAlign: { actions: 'center' },
      responseAdapter: function (resp_data) {
        self.setState({ page: resp_data.page });
        return { data: resp_data.result, total: resp_data.row_count }
      },
      texts: {
        show: ''
      },
      search_lov: {
        pages: []
      }
    };


    return (
      <div>
        <Modal animation={false} size="xl" show={this.props.show} onHide={this.props.closeModal} >
          <Modal.Header closeButton className="">
            <Modal.Title id="modalTitle">
              stock {this.state.item_desc != '' ? '(' + this.state.item_desc + ')' : ''}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
             

              <Col className="col-sm-12">

                <SnapBarError
                  message={this.state.error}
                  snapopen={this.state.snapopen}
                  snapcolor={this.state.snapcolor}
                  snapclose={this.snapclose} />
                <ConfirmationDialog
                  dialogopen={this.state.deletedialog}
                  dialogclose={this.closedialog}
                  agreeProcess={this.proceedDelete}
                />
                <WindowPanel rawHtml={
                  <div className="windowContent">
                    <ServerTable renderView={this.state.stockrenderTable} columns={columns} url={`${url + `?item_info_id=` + this.state.item_info_id}`} options={options} bordered hover updateUrl hist_table="SITE_M_LIFESTYLE_IMAGES_HIST">
                      {
                        function (row, column, index) {

                          switch (column) {
                            case 'sr_no':
                              return (
                                (index + 1) + (PER_PAGE * ((self.state.page) - 1))
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

export default StockModal;