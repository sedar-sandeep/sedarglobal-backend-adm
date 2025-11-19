
import React, { Component } from 'react';
import './history.scss';
import ServerTable from '../../services/server-table';
import { Col, Row, Form, Modal } from 'react-bootstrap';
import ApiDataService from '../../services/ApiDataService';
import Config from '../Config';
import { WindowPanel } from "../../WindowPanel";





const PER_PAGE = process.env.REACT_APP_PER_PAGE;

class History extends Component {
  state = {
    value: [],
  };
  constructor(props) {
    super(props);
    this.state = {
      modalShow: false,
      history_data:{}
    };

  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.show && !prevProps.show) {
      let $url = `${this.props.url}/history?table=${this.props.hist_table}`;
      ApiDataService.get($url)
        .then(res => {
          if (res.data.return_status === "0") {
            this.setState({
              history_data: res.data.result
            });
          } else {
            if (res.data.error_message) { Config.createNotification('error', res.data.error_message); }
          }
        }).catch(function (error) {
          if (error) { Config.createNotification('error', error); }
        });
    }
  }
  closedialog = () => {
    this.setState({ deletedialog: false });
  }
  modalClose = () => {
    this.setState({ modalShow: false });
  }

  render() {
    let self = this;
    const url = `${this.props.url}/history?table=${this.props.hist_table}`;
    
    const columns = [
      'sr_no', 
      'desc',
      'hist_mode',
      'hist_cr_uid',
      'hist_cr_dt',
      'cr_uid',
      'cr_dt',
      'upd_uid',
      'upd_dt',
      'active_yn',
    ];
	
    const options = {
      perPage: PER_PAGE,
      headings: {
		    sr_no: '#', 
        desc: 'Description',
        hist_mode: 'Mode',
        hist_cr_uid: 'User',
        hist_cr_dt: 'Date',
        cr_uid: 'Created User',
        cr_dt: 'Created Date',
        upd_uid: 'Updated User',
        upd_dt: 'Updated Date',
        active_yn: 'Active ?',
      },
	    search_key: {
        desc: 'Description',
        hist_mode: 'Mode',
        hist_cr_uid: 'User',
        hist_cr_dt: 'Date',
        cr_uid: 'Created User',
        cr_dt: 'Created Date',
        upd_uid: 'Updated User',
        upd_dt: 'Updated Date',
        active_yn: 'Active ?',
      },
      sortable: ['desc', 'hist_mode', 'hist_cr_uid', 'hist_cr_dt', 'cr_uid', 'cr_dt', 'upd_uid', 'upd_dt', 'active_yn'],
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
    }

    return (
      <div>
        <Modal animation={false} size="xl" show={this.props.show} onHide={this.props.closeModal} >
        <Modal.Header closeButton className="">
          <Modal.Title id="modalTitle">
            History
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
           <WindowPanel rawHtml={
              <div className="windowContent history">
                <ServerTable renderView={this.state.renderTable} columns={columns} url={url} options={options}  bordered hover updateUrl hist_table={this.props.hist_table}>
                {
                    function (row, column, index) {
                    switch (column) {
                        case 'sr_no':
                      return (
                        (index+1)+(PER_PAGE*((self.state.page)-1))
                      );
                
                        default:
                          return (row[column]);
                    }
                  }
                }
                </ServerTable>

              </div> 
            }/>
        </Modal.Body>
      </Modal>
    </div>
    )
  }
}

export default History;