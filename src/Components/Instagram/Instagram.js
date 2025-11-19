import React, { Component } from 'react';
import './Instagram.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';
import Config from '../Config'

import ApiDataService from '../../services/ApiDataService';

class Instagram extends Component {
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
      deletesysid: '',
      security: [],
    };
    this.modalRef = React.createRef();
  }

  pushInstagram = () => {
    let $url = `pushInstagram`;
    ApiDataService.get($url)
      .then(res => {
          Config.createNotification('success', 'Instagram images push on live.');
        
      }).catch(function (error) {
        if (error) { Config.createNotification('error', error); }
      });
  }
  
  render() {
    
    return (
      <>
        <center>
      <button className="btn btn-primary form-control-sm my-5" onClick={(e) => this.pushInstagram(e)} style={{lineHeight: '0'}}>
      Instagram Api Refresh
          </button>
        </center>
      </>
    );
  }
}

export default Instagram;