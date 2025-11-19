import React, { Component } from 'react';
import './ItemFamily.scss';
import ServerTable from '../../services/server-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faCog, faTrash, faPlus, faMoneyBillAlt } from '@fortawesome/free-solid-svg-icons';
import { Dropdown, DropdownButton, OverlayTrigger, Tooltip } from 'react-bootstrap';
import ItemFamilyModal from "../ItemFamily/ItemFamilyModal";
import { ConfirmationDialog, SnapBarError } from "../../ConfirmationDialog";
import { WindowPanel } from "../../WindowPanel";
import BulkModal from "./BulkModal";
const PER_PAGE = process.env.REACT_APP_PER_PAGE;

class ItemFamily extends Component {
  constructor(props) {
    super(props);
    this._isMounted = true;
    this.state = {
      modalShow: false,
      mode: '',
      dataview: [],
      totaldata: null,
      snapopen: false,
      snapcolor: null,
      error: null,
      deletedialog: false,
      proceed: false,
      renderTable: false,
      bulkUploadModal: false,
      sysid: null,
      page: 1,
      deletesysid:'',
      security: []
    };
    this.modalRef = React.createRef();
    this.bulkUploadModalRef = React.createRef();

  }
  setModalShow = () => {
    this.setState({
      modalShow: true,
      mode: 'IS'
    });
  }

  setsecurity = (param) => {
    //console.log(param.USER_ROLE)
    this.setState({ security: param });
  }

  closedialog = () => {
    this.setState({ deletedialog: false });
  }
  modalClose = () => {
    this.setState({ modalShow: false, bulkUploadModal: false });
  }

  renderTable = () => {
    this.setState({
      renderTable: true
    }, () => {
      this.setState({ renderTable: false });
    });
  }

  editRecord = (id) => {
    this.modalRef.current.editModalRecord(id);

    this.setState({ modalShow: true, mode: 'UP', sysid: id },
      () => { this.setState({ sysid: null }); });
  }

  deletRecord = (id) => {
    this.setState({ deletedialog: true, sysid: id });
  }
  

  proceedDelete = (params) => {
    if (params) {
      this.modalRef.current.deleteModalRecord(this.state.sysid);
    }else{

    }

  }

  snapclose = () => {
    this.setState({ snapopen: false });
  };
  handleClose = () => {
    this.setState({ open: false });
  };
  errorThrough = (error, argu) => {
    var erroMessage ='';
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
  
  itemPriceRecord = (id) => {
    this.bulkUploadModalRef.current.itemPriceRecord(id);
    this.setState({ bulkUploadModal: true, mode: 'IS' });
  }

  render() {
    let self = this;	
    let security = this.state.security;
    const url = `admin/portal/itemfamily`;
    let $addModal = (<button className="btn btn-primary btn-sm mr-3" onClick={() => self.itemPriceRecord()} disabled={security.USER_ROLE != 'TECHNICAL' ? true : false}><FontAwesomeIcon icon={faMoneyBillAlt} /> Price </button>);

    let $button = (<OverlayTrigger overlay={<Tooltip id="tooltip">Add Family</Tooltip>}>
      <button className="btn btn-primary btn-sm" onClick={this.setModalShow}>{<FontAwesomeIcon icon={faPlus} />}</button></OverlayTrigger>);
    const columns = ['sr_no', 'tag_desc', 'filter_type', 'tag_ordering',  'tag_active_yn', 'actions']; //, 'tag_id'
    const options = {
      perPage: PER_PAGE,
      headings: {
        sr_no: '#',
        tag_desc: 'Tag Description',
        filter_type: 'Filter Type',
        tag_ordering: 'Ordering',
        tag_active_yn: 'Active',
        
      },
      search_key: {
        tag_desc: 'Tag Description',
        filter_type: 'Filter Type',
        tag_ordering: 'Ordering'
      },
      sortable: ['tag_id', 'tag_desc', 'filter_type', 'tag_active_yn', 'tag_ordering'], //'tag_id', 
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
        pages:[]
      }
    };
    
    return (
      <div>
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
            <ServerTable renderView={this.state.renderTable} columns={columns} url={url} options={options} addme={$button} bordered hover updateUrl addModal={$addModal} hist_table="SITE_M_FAMILY_INFO">
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
                            <Dropdown.Item onClick={() => self.editRecord(row.tag_id)}><FontAwesomeIcon icon={faEdit} /> Edit</Dropdown.Item>
                            <Dropdown.Item onClick={() => self.priceRecord(row.item_info_code)}><FontAwesomeIcon icon={faMoneyBillAlt} /> Add Product and Price</Dropdown.Item>
                            <Dropdown.Item onClick={() => self.deletRecord(row.tag_id)}><FontAwesomeIcon icon={faTrash} /> Delete</Dropdown.Item>
                          </DropdownButton>
                        </div>
                      );
                    default:
                      return (row[column]);
                  }
                }
              }
            </ServerTable>
            
            <ItemFamilyModal
              ref={this.modalRef}
              renderTable={this.renderTable}
              editModal={this.editModal}
              mode={this.state.mode}
              show={this.state.modalShow}
              closeModal={this.modalClose}
              closeDelete={this.closedialog}
              errorMessage={this.errorThrough}
            />

            <BulkModal
              ref={this.bulkUploadModalRef}
              renderTable={this.renderTable}
              mode={this.state.mode}
              show={this.state.bulkUploadModal}
              closeModal={this.modalClose}
              closeDelete={this.closedialog}
              errorMessage={this.errorThrough}
            />
          </div>
        } />
      </div>
    );
  }
}

export default ItemFamily;