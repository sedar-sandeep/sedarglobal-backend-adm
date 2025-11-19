import React, { Component } from 'react';
import ServerTable from '../../services/server-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faCog, faTrash, faPlus, faEye } from '@fortawesome/free-solid-svg-icons';
import { Dropdown, DropdownButton, OverlayTrigger, Tooltip } from 'react-bootstrap';
import TabbyModal from "../Tabby/TabbyModal";
import { ConfirmationDialog, SnapBarError } from "../../ConfirmationDialog";
import { WindowPanel } from "../../WindowPanel";
import ApiDataService from '../../services/ApiDataService';
import { data } from 'jquery';
const PER_PAGE = process.env.REACT_APP_PER_PAGE;

const url = `admin/portal/tabby`;

class Tabby extends Component {
  constructor(props) {
    super(props);
    this._isMounted = true;
    this.state = {
      modalShow: false,
      mode: '',
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
      mode: 'IS',
      sysid: ''
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

  editRecord = (data) => {
    this.modalRef.current.editModalRecord(data);
    this.setState({ modalShow: true, mode: 'UP' });
  }

  deletRecord = (data) => {
    this.setState({ deletedialog: true, deletesysid: data.id, merchant_code: data.merchant_code });
  }

  pagePreview = (page_info_code) => {
    //this.setState({ deletedialog: true });
    this.setState({ modalShow: true, mode: 'PR', sysid: page_info_code },
      () => { this.setState({ sysid: null }); });
  }

  proceedDelete = (params) => {
    let sysid = this.state.deletesysid;
    let merchant_code = this.state.merchant_code;
    if (params) {

      ApiDataService.delete(`${url}/${merchant_code}/`, sysid).then(response => {
        if (response.data.return_status !== "0") {
          if (response.data.error_message === 'Error') {
            this.errorThrough(response.data.result, "ERR-OBJ");
          } else {
            this.errorThrough(response.data.error_message, "ERR");
          }
          this.setState({ sysid: null });
        } else {
          this.errorThrough(response.data.error_message, "DONE");
          this.renderTable();
        }
        this.closedialog();
      }).catch((error) => {
        this.errorThrough(error.message, "ERR");
        this.closedialog();
      });

    }
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

  render() {
    let self = this;
    let $button = (<OverlayTrigger overlay={<Tooltip id="tooltip">Add PageInfo</Tooltip>}>
      <button className="btn btn-primary btn-sm" onClick={this.setModalShow}>{<FontAwesomeIcon icon={faPlus} />}</button></OverlayTrigger>);
    const columns = ['sr_no', 'country_iso', 'title', 'value', 'id', 'url', 'actions'];
    const options = {
      perPage: PER_PAGE,
      headings: {
        sr_no: '#',
        id: 'ID',
        url: 'URL',
        value: 'Value',
        title: 'Title',
        country_iso: 'Country'
      },
      search_key: {
        country_iso: 'Country',
      },
      sortable: ['id', 'url'],
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
            <ServerTable renderView={this.state.renderTable} columns={columns} url={url} options={options} addme={$button} bordered hover updateUrl hist_table="SITE_M_MENU_HIST">
              {
                function (row, column, index) {
                  switch (column) {
                    case 'sr_no':
                      return (
                        (index + 1) + (PER_PAGE * ((self.state.page) - 1))
                      );
                    case 'title':
                      return (
                        row.header.title
                      )
                    case 'value':
                      return (
                        row.header.value
                      )
                    case 'actions':
                      return (
                        <div className="form-control-sm" style={{ textAlign: 'center' }}>
                          <DropdownButton size="sm" id="dropdown-basic-button" title={<FontAwesomeIcon icon={faCog} />}>
                            <Dropdown.Item onClick={() => self.editRecord(row)}><FontAwesomeIcon icon={faEdit} /> Edit</Dropdown.Item>
                            <Dropdown.Item onClick={() => self.deletRecord(row)}><FontAwesomeIcon icon={faTrash} /> Delete</Dropdown.Item>
                          </DropdownButton>
                        </div>
                      );
                    default:
                      return (row[column]);
                  }
                }
              }
            </ServerTable>
            <TabbyModal
              ref={this.modalRef}
              sysid={this.state.sysid}
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

export default Tabby;