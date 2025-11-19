import React, { Component } from 'react';
import './DeliveryZone.scss';
import ServerTable from '../../services/server-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faCog, faTrash, faPlus, faEye } from '@fortawesome/free-solid-svg-icons';
import { Dropdown, DropdownButton, OverlayTrigger, Tooltip } from 'react-bootstrap';
import DeliveryZoneModal from "../DeliveryZone/DeliveryZoneModal";
import { ConfirmationDialog, SnapBarError } from "../../ConfirmationDialog";
import { WindowPanel } from "../../WindowPanel";
const PER_PAGE = process.env.REACT_APP_PER_PAGE;
const url = 'admin/portal/deliveryzone';

class DeliveryZoneList extends Component {
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
      deletesysid: ''
    };
    this.modalRef = React.createRef();
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
    this.setState({ modalShow: false });
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



  render() {
    let self = this;

    let $button = (<OverlayTrigger overlay={<Tooltip id="tooltip">Add Zone</Tooltip>}>
      <button className="btn btn-primary btn-sm" onClick={this.setModalShow}>{<FontAwesomeIcon icon={faPlus} />}</button></OverlayTrigger>);
    const columns = ['sr_no', 'DS_DESC', 'DS_CART_VALUE_FROM', 'DS_CART_VALUE_UPTO','DS_DELIVERY_ZONE_FEES', 'DS_INSTALLATION_ZONE_FEES', 'DS_FROM_DT', 'DS_UPTO_DT', 'DS_ACTIVE_YN', 'actions'];
    const options = {
      perPage: PER_PAGE,
      headings: {
        sr_no: '#',
        DS_DESC: 'Description',
        DS_CART_VALUE_FROM: 'From value',
        DS_CART_VALUE_UPTO: 'Upto value',
        DS_DELIVERY_ZONE_FEES: "Delivery fees",
        DS_INSTALLATION_ZONE_FEES: "Installation fees",
        DS_FROM_DT: "Form Date",
        DS_UPTO_DT: "Upto Date",
        DS_ACTIVE_YN: "Active"
      },
      search_key: {
        DS_DESC: 'Description',
        DS_COUNTRY_CODE:'Country code',
        DS_ZONE:'Zone',
        DS_DELIVERY_ZONE_FEES: "Delivery fees",
        DS_INSTALLATION_ZONE_FEES: "Installation fee",
        DS_CART_VALUE_FROM: 'From value',
        DS_CART_VALUE_UPTO: 'Upto value',
        DS_ACTIVE_YN: 'Active',
      
      },
      sortable: ['DS_DESC', 'DS_SYS_ID', 'DS_CART_VALUE_FROM', 'DS_CART_VALUE_UPTO', 'DS_ACTIVE_YN'],
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
            <ServerTable renderView={this.state.renderTable} columns={columns} url={url} options={options} addme={$button} bordered hover updateUrl hist_table="SITE_M_FAMILY_INFO">
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
                            <Dropdown.Item onClick={() => self.editRecord(row.DS_SYS_ID)}><FontAwesomeIcon icon={faEdit} /> Edit</Dropdown.Item>
                            <Dropdown.Item onClick={() => self.deletRecord(row.DS_SYS_ID)}><FontAwesomeIcon icon={faTrash} /> Delete</Dropdown.Item>
                          </DropdownButton>
                        </div>
                      );
                    default:
                      return (row[column]);
                  }
                }
              }
            </ServerTable>

            <DeliveryZoneModal
              ref={this.modalRef}
              renderTable={this.renderTable}
              editModal={this.editModal}
              mode={this.state.mode}
              show={this.state.modalShow}
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

export default DeliveryZoneList;