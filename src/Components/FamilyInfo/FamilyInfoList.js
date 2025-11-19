import React, { Component } from 'react';
//import './FamilyInfo.scss';
import ServerTable from '../../services/server-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faCog, faTrash, faPlus, faMoneyBillAlt, faMoneyBill } from '@fortawesome/free-solid-svg-icons';
import { Dropdown, DropdownButton, OverlayTrigger, Tooltip } from 'react-bootstrap';
import FamilyInfoModal from "../FamilyInfo/FamilyInfoModal";
import { ConfirmationDialog, SnapBarError } from "../../ConfirmationDialog";
import { WindowPanel } from "../../WindowPanel";
import BulkModal from "./BulkModal";
import AccessSecurity from '../../AccessSecurity';
import PriceListModal from "./PriceListModal";

const PER_PAGE = process.env.REACT_APP_PER_PAGE;
const url = 'admin/portal/familyinfo';

class FamilyInfoList extends Component {
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
      sysid: null,
      page: 1,
      bulkUploadModal: false,
      priceModal: false,
      deletesysid: '',
      security: []
    };
    this.modalRef = React.createRef();
    this.bulkUploadModalRef = React.createRef();
    this.priceModalRef = React.createRef();
  }
  setModalShow = () => {
    this.setState({
      modalShow: true,
      mode: 'IS'
    });
  }

  closedialog = () => {
    this.setState({ deletedialog: false });
  }
  modalClose = () => {
    this.setState({ modalShow: false, bulkUploadModal: false, priceModal: false });
  }

  setsecurity = (param) => {
    //console.log(param.USER_ROLE)
    this.setState({ security: param });
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
  PriceRecord = (id) => {
    this.priceModalRef.current.priceModalRecord(id);
    this.setState({ priceModal: true, sysid: id },
      () => { this.setState({ sysid: null }); });
  }
  deletRecord = (id) => {
    this.setState({ deletedialog: true, sysid: id });
  }


  proceedDelete = (params) => {
    if (params) {
      this.modalRef.current.deleteModalRecord(this.state.sysid);
    } else {

    }

  }

  snapclose = () => {
    this.setState({ snapopen: false });
  };
  handleClose = () => {
    this.setState({ open: false });
  };
  errorThrough = (error, argu) => {
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

  bulkUploadModalRecord = (id) => {
    this.bulkUploadModalRef.current.bulkUploadModalRecord(id);
    this.setState({ bulkUploadModal: true, mode: 'IS' });
  }


  render() {
    let self = this;
    let security = this.state.security;
    let $addModal = (<button className="btn btn-primary btn-sm mr-3" onClick={() => self.bulkUploadModalRecord()} disabled={security.USER_ROLE != 'TECHNICAL' ? true : false}><FontAwesomeIcon icon={faMoneyBillAlt} /> Bulk Upload </button>);

    let $button = (<OverlayTrigger overlay={<Tooltip id="tooltip">Add Family</Tooltip>}>
      <button className="btn btn-primary btn-sm" onClick={this.setModalShow}>{<FontAwesomeIcon icon={faPlus} />}</button></OverlayTrigger>);
    const columns = ['sr_no', 'SFI_CODE', 'SFI_DESC', 'SFI_COLLECTION_DESC', 'SFI_BR_DESC', 'SFI_APPLICABLE_COUNTRIES', 'SFI_ORDERING', 'SFI_ACTIVE_YN', 'actions'];
    const options = {
      perPage: PER_PAGE,
      headings: {
        sr_no: '#',
        SFI_CODE: 'Family Code',
        SFI_DESC: 'Family Desc',
        SFI_COLLECTION_DESC: 'Collection',
        SFI_BR_DESC: 'Brand',
        SFI_APPLICABLE_COUNTRIES: 'Countries',
        SFI_ORDERING: 'Ordering',
        SFI_ACTIVE_YN: 'Active',

      },
      search_key: {
        SFI_DESC: 'Family Description',
        SFI_STATUS: "Family Status",
        SFI_BR_DESC: "Brand Desc",
        SFI_CODE: 'Family Code',
        SFI_COLLECTION_DESC: "Collection Desc",
        SFI_CUSTOMIZABLE_YN: "Customizable YN?",
        SFI_APPLICABLE_COUNTRIES: "Applicable Countries",
        SFI_ACTIVE_YN: "Active YN?",
        SFI_ORDERING: 'Ordering'
      },
      sortable: ['SFI_CODE', 'SFI_DESC', 'SFI_ACTIVE_YN', 'SFI_ORDERING'],
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
        <AccessSecurity
          accessecurity={this.setsecurity}
        />
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
                            <Dropdown.Item onClick={() => self.editRecord(row.SFI_CODE)}><FontAwesomeIcon icon={faEdit} /> Edit</Dropdown.Item>
                            <Dropdown.Item onClick={() => self.PriceRecord(row.SFI_CODE)}><FontAwesomeIcon icon={faMoneyBill} /> Price</Dropdown.Item>
                            <Dropdown.Item onClick={() => self.deletRecord(row.SFI_CODE)}><FontAwesomeIcon icon={faTrash} /> Delete</Dropdown.Item>
                          </DropdownButton>
                        </div>
                      );
                    default:
                      return (row[column]);
                  }
                }
              }
            </ServerTable>

            <FamilyInfoModal
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



            <PriceListModal
              ref={this.priceModalRef}
              renderTable={this.renderTable}
              mode={this.state.mode}
              show={this.state.priceModal}
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

export default FamilyInfoList;