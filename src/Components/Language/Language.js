import React, { Component } from 'react';
import './Language.scss';
import ServerTable from '../../services/server-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faCog, faTrash, faPlus, faLanguage } from '@fortawesome/free-solid-svg-icons';
import { Dropdown, DropdownButton, OverlayTrigger, Tooltip } from 'react-bootstrap';
import LanguageModal from "../Language/LanguageModal";
import { ConfirmationDialog, SnapBarError, ProceedDialog } from "../../ConfirmationDialog";
import { WindowPanel } from "../../WindowPanel";
const PER_PAGE = process.env.REACT_APP_PER_PAGE;

class Language extends Component {
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
      deletesysid:'',
      language: 'en'
    };
    this.modalRef = React.createRef();
  }
  setModalShow = () => {
    this.setState({
      modalShow: true,
      mode: 'IS',
      language: 'en'
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

  editRecord = (id, desc, lang) => {
    this.modalRef.current.editModalRecord(id, desc, lang);
    this.setState({ modalShow: true, mode: 'UP', sysid: id, language: lang },
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

  proceedLang = (id, desc) => {
    if (id) {
      this.modalRef.current.proceedLang(id, desc);
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
  


  render() {
    let self = this;	
    const url = `admin/portal/language`;
    let $button = (<OverlayTrigger overlay={<Tooltip id="tooltip">Add Language</Tooltip>}>
      <button className="btn btn-primary btn-sm" onClick={this.setModalShow}>{<FontAwesomeIcon icon={faPlus} />}</button>
    </OverlayTrigger>);
    const columns = ['sr_no','language_code', 'language_desc', 'language_active_yn', 'actions']; //, 'language_code'
    const options = {
      perPage: PER_PAGE,
      headings: {
        sr_no: '#',
        language_code: 'Language Code',
        language_desc: 'Language Description',
        language_active_yn: 'Active',
        
      },
      search_key: {
        language_code: 'Language Code',
        language_desc: 'Language Description'
      },
      sortable: ['language_code', 'language_desc',  'language_active_yn'], //'language_code', 
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
        <ProceedDialog
          dialogopen={this.state.deletedialog}
          dialogclose={this.closedialog}
          agreeProcess={this.proceedLang}
        />
        <WindowPanel rawHtml={
          <div className="windowContent">
            <ServerTable renderView={this.state.renderTable} columns={columns} url={url} options={options} addme={$button} bordered hover updateUrl hist_table="SITE_M_LANGUAGE">
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
                            <Dropdown.Item onClick={() => self.editRecord(row.language_code, row.language_desc, 'en')}><FontAwesomeIcon icon={faEdit} /> Edit</Dropdown.Item>
                            <Dropdown.Item onClick={() => self.deletRecord(row.language_code)}><FontAwesomeIcon icon={faTrash} /> Delete</Dropdown.Item>
                            {/* <Dropdown.Item onClick={() => self.proceedLang(row.language_code, row.language_desc)}><FontAwesomeIcon icon={faLanguage} /> Generate Translation</Dropdown.Item> */}
                          </DropdownButton>
                        </div>
                      );
                    default:
                      return (row[column]);
                  }
                }
              }
            </ServerTable>
            
            <LanguageModal
              ref={this.modalRef}
              renderTable={this.renderTable}
              editModal={this.editModal}
              mode={this.state.mode}
              show={this.state.modalShow}
              closeModal={this.modalClose}
              closeDelete={this.closedialog}
              errorMessage={this.errorThrough}
              language={this.state.language}
            />
          </div>
        } />
      </div>
    );
  }
}

export default Language;