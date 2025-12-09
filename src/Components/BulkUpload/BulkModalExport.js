
import React, { Component } from 'react';
import ReactExport from "react-data-export";
import * as XLSX from "xlsx";
import { Col, Row, Form, Modal, Button } from 'react-bootstrap';
import { ExportToExcel } from './ExportToExcel';
import Select from 'react-select'
import ApiDataService from '../../services/ApiDataService';
const insertUrl = 'admin/portal/bulkUploadExport/';
const Api_countrylov = 'admin/portal/bulkUploadExport/country_access/list';
const Api_product_lov = 'admin/portal/bulkUploadExport/product_lov';
const Api_Langlov = 'admin/portal/bulkUploadExport/lang/lov';


const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;




class BulkModalExport extends Component {

  constructor(props) {
    super(props);
    this._isMounted = true;
    this.state = {
      bulkModal: false,
      mode: '',
      product_desc: '',
      countrylov: [],
      priceValue: '',
      file: '',
      ccy_code: '',
      priceType: '',
      product: '',
      productlov: [],
      apiData: '',
      tagData: '',
      langDrop: [{ code: "en", desc: "English" }],
      lang: 'en',
    };

    this.handleClick = this.handleClick.bind(this);

  }
  setInput_value() {
    this.setState({
      priceValue: '',
      file: '',
      ccy_code: ''
    });
  }

  setModalShow = () => {
    this.setInput_value();
    this.setState({
      bulkModal: true,
      mode: 'IS'
    });
  }

  closedialog = () => {
    this.setState({ deletedialog: false });
  }

  modalClose = () => {
    this.setState({ bulkModal: false });
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

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.show && !prevProps.show) {
      this.setState({ priceType: '' });
      this.setInput_value();
      ApiDataService.get(process.env.REACT_APP_SERVER_URL + Api_countrylov)
        .then(response => {
          this.setState({
            countrylov: response.data.result
          });
        }).catch(function (error) {

        });
     

      ApiDataService.get(process.env.REACT_APP_SERVER_URL + Api_Langlov, null).then(response => {
        let data = response.data.result;
        this.setState({
          langDrop: data
        });
      });

    }


  }

  bulkUploadModalRecord = (id, desc) => {
    this.setState({ mode: '', product_desc: '' });
  }

  convertToJson(csv, dataType) {
    var lines = csv.split("\n");
    //console.log(lines, 'lines');
    var result = [];

    var headers = lines[0].split(",");

    for (var i = 1; i < lines.length; i++) {
      var obj = {};
      //  console.log(lines[i], 'lines');
      var currentline = lines[i].split(",");

      for (var j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentline[j];
      }

      result.push(obj);
    }

    var formData = new FormData();
    formData.append('key', JSON.stringify(result));
    formData.append('type', dataType);
    formData.append('lang', this.state.lang);

    ApiDataService.post('admin/portal/familyinfo/excel', formData).then(response => {
      if (response.data.return_status !== "0") {
        if (response.data.error_message === 'Error') {
          this.props.errorMessage(response.data.result, "ERR-OBJ");
        } else {
          this.props.errorMessage(response.data.error_message, "ERR");
        }
      } else {
        this.props.errorMessage(response.data.error_message, "DONE");
        this.props.closeModal();
      }

    }).catch((error) => {
      this.props.errorMessage(error.message, "ERR");
    });
  }

  readFile(dataType) {
    var f = this.state.file;
    var name = f.name;
    const reader = new FileReader();
    reader.onload = (evt) => {
      // evt = on_file_select event
      /* Parse data */
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      /* Get first worksheet */
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      /* Convert array of arrays */
      const data = XLSX.utils.sheet_to_csv(ws, { header: 1 });
      /* Update state */
      //console.log("Data>>>" + data);// shows that excel data is read
      this.convertToJson(data, dataType); // shows data in json format
    };
    reader.readAsBinaryString(f);
  }

  handleClick(e) {
    this.refs.fileUploader.click();
  }

  filePathset(e) {
    e.stopPropagation();
    e.preventDefault();
    var file = e.target.files[0];
    console.log(file);
    this.setState({ file });

    console.log(this.state.file);
  }


  stateChanges = (type, val) => {
     if (type == 'lang' && val.code) {
      this.setState({ lang: val.code });
      this.geExcel(val.code);
    } else {
      alert('something error.');
    }
  }

  geExcel = (lang) => {
    ApiDataService.get(process.env.REACT_APP_SERVER_URL + insertUrl + 'price' + '?lang=' + lang)
      .then(response => {
        this.setState({ apiData: response.data.result.price });

      }).catch(function (error) {

      });
  }

 

  render() {

    const { countrylov, priceType, productlov, apiData, langDrop, lang } = this.state;
    console.log(productlov, 'stateChanges', lang, langDrop);
    return (
      <div>
        <Modal animation={false} size="lg" show={this.props.show} onHide={this.props.closeModal} >
          <Modal.Header closeButton className="">
            <Modal.Title id="modalTitle">
              Bulk Export
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col>
                <Row>
                  <Col>
                    <Form.Group>
                      <Form.Label>Language</Form.Label>
                      <Select
                        className="basic-single"
                        defaultValue={langDrop[0]}
                        name="lang"
                        options={langDrop ? langDrop : []}
                        getOptionLabel={(langDrop) => langDrop['desc']}
                        getOptionValue={(langDrop) => langDrop['code']}
                        onChange={(e) => this.stateChanges('lang', e)}
                      />
                    </Form.Group>
                  </Col>
            
                    <Col sm={12}>
                      <Row>
                        <Col>
                          <ExportToExcel apiData={this.state.apiData} fileName={this.state.product_desc} btnType="Price Exports" />
                        </Col>
                      </Row>
                    </Col>
                </Row>

              </Col>


            </Row>
          </Modal.Body>
        </Modal>
      </div>
    )
  }
}

export default BulkModalExport;