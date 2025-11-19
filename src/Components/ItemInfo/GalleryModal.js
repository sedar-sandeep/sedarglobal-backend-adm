
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

const insertUrl = 'admin/portal/iteminfo/gallery';
const item_product_lov = 'admin/portal/iteminfo/product';

const PER_PAGE = process.env.REACT_APP_PER_PAGE;

class GalleryModal extends Component {
  state = {
    value: [],
  };
  constructor(props) {
    super(props);
    this._isMounted = true;
    this.state = {
      item_product_code: '',
      item_gy_use_type: '',
      item_gy_ordering: '',
      item_gy_active_yn: 'N',
      errors: {},
      item_gy_info_id: '',
      imagesArray: [],
      info_img_path: [],
      gallery_image_error: false,
      productlov: [],
      delete_info_id: 0,
      use_type: [
        {
          id: 'A',
          desc: 'All'
        },
        {
          id: 'M',
          desc: 'Marketplace'
        },
        {
          id: 'T',
          desc: 'The MET Only'
        },
        {
          id: 'O',
          desc: 'Online Only'
        }

      ],

      galleryModalShow: false,
      mode: '',
      dataview: [],
      totaldata: null,
      snapopen: false,
      snapcolor: null,
      error: null,
      deletedialog: false,
      proceed: false,
      galleryrenderTable: false,
      page: 1,

      avatar: '',
      imagePreviewUrl: '',
      item_desc: ''
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.modalRef = React.createRef();
    this.galleryModalRef = React.createRef();
  }



  setModalShow = () => {
    this.setInput_value();
    this.setState({
      galleryModalShow: true,
      mode: 'IS'
    });
  }

  closedialog = () => {
    this.setState({ deletedialog: false });
  }
  modalClose = () => {
    this.setState({ galleryModalShow: false });
  }

  galleryrenderTable = () => {
    this.setState({
      galleryrenderTable: true
    }, () => {
      this.setState({ galleryrenderTable: false });
    });
  }

  editRecord = (id) => {
    this.modalRef.current.editModalRecord(id);
    this.setState({ galleryModalShow: true, mode: 'UP' });
  }


  deletRecord = (id) => {
    this.setState({ deletedialog: true, delete_info_id: id });
  }

  proceedDelete = (params) => {
    if (params) {
      this.deleteModalRecord(this.state.delete_info_id);
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



  galleryModalRecord = (id, desc) => {
    ApiDataService.get(process.env.REACT_APP_SERVER_URL + item_product_lov + '/' + id)
      .then(response => {
        this.setState({
          productlov: response.data.result
        });
      }).catch(function (error) {

      });

    this.setState({ item_gy_info_id: id, mode: '', item_desc: desc });
  }

  editgalleryModalRecord = (id) => {
    this.state.mode = 'UP';
    ApiDataService.get(`${insertUrl}/${id}/edit`).then(response => {
      let resp = response.data.result[0];
      Object.entries(resp).forEach(([key, value]) => {
        this.setState({ [key]: value });

        if (key === 'item_gy_image_path') {
          this.setState({ imagePreviewUrl: value });
        }

      });
    }).catch((error) => {

    });

  }

  deleteModalRecord = (id) => {
    console.log(id, 'sdasd', insertUrl);

    ApiDataService.delete(`${insertUrl}/`, id).then(response => {
      if (response.data.return_status !== "0") {
        if (response.data.error_message === 'Error') {
          this.errorThrough(response.data.result, "ERR-OBJ");
        } else {
          this.errorThrough(response.data.error_message, "ERR");
        }
      } else {
        this.errorThrough(response.data.error_message, "DONE");
        this.galleryrenderTable();
      }
      this.closedialog();

    }).catch((error) => {
      this.errorThrough(error.message, "ERR");
      this.closedialog();

    });
  }

  stateChanges = (e) => {
    const { name, value } = e.target;
    var values = '';
    if (name === 'item_gy_active_yn') {
      let checkBox = e.target.checked;
      values = (checkBox ? 'Y' : 'N');
    } else {
      values = value;
    }
    this.setState({ [name]: values });
  }
  validation = () => {
    let fields = this.state;
    let errors = {};
    let formIsValid = true;

    if (!fields['item_gy_ordering']) {
      errors["item_gy_ordering"] = "Gallery ordering is required";
      formIsValid = false;
    }
    this.setState({ errors: errors });
    return formIsValid;
  }

  setInput_value() {
    this.setState({
      item_gy_use_type: '',
      item_product_code: '',
      item_gy_ordering: '',
      item_gy_active_yn: 'N',
      errors: {},
      mode: '',
      avatar: '',
      imagePreviewUrl: '',
      gallery_image_error: false,
    });
  }


  handleSubmit(event) {
    event.preventDefault();
    if (!this.validation() || this.state.gallery_image_error) {
      return false;
    }

    var formData = new FormData();

    //  console.log(this.state, "STATE ALL");

    let Properties = this.state;
    for (var key in Properties) {
      formData.append(key, Properties[key]);
    }
    var serverSet = '';
    var url = '';


    for (const key of Object.keys(this.state.imagesArray)) {
      formData.append('imagesArray[]', this.state.imagesArray[key]);
    }

    if (this.state.mode === 'IS') {
      //serverSet = ApiDataService.post;
      url = insertUrl + '?item_gy_info_id=' + this.state.item_gy_info_id;

      ApiDataService.post(url, formData).then(response => {
        if (response.data.return_status !== "0") {
          console.log(response, 'IF');
          if (response.data.error_message === 'Error') {
            this.errorThrough(response.data.result, "ERR-OBJ");
          } else {
            this.errorThrough(response.data.error_message, "ERR");
          }
        } else {
          console.log(response, 'ELSE');
          this.errorThrough(response.data.error_message, "DONE");
          this.galleryrenderTable();
          this.setInput_value();
          this.setState({ imagesArray: [] });
        }
      }).catch((error) => {
        console.log(error);
        this.errorThrough(error.message, "ERR");
      });

    } else {
      //serverSet = ApiDataService.update;
      url = `${insertUrl}/update/${this.state.item_gy_id}`;

      ApiDataService.update(url, formData).then(response => {
        if (response.data.return_status !== "0") {
          if (response.data.error_message === 'Error') {
            this.errorThrough(response.data.result, "ERR-OBJ");
          } else {
            this.errorThrough(response.data.error_message, "ERR");
          }
        } else {
          this.errorThrough(response.data.error_message, "DONE");
          this.galleryrenderTable();
          this.setInput_value();
          this.setState({ imagesArray: [] });
        }
      }).catch((error) => {
        console.log(error);
        this.errorThrough(error.message, "ERR");
      });
    }


  }


  _handleImageChange = (e) => {
    e.preventDefault();

    if (e.target.files) {

      this.setState({
        gallery_image_error: false
      });
      this.setState({ imagesArray: [...e.target.files, ...this.state.imagesArray] });
      /* Get files in array form */
      const files = Array.from(e.target.files);

      /* Map each file to a promise that resolves to an array of image URI's */
      Promise.all(files.map(file => {
        var fileSize = parseFloat(file.size / 1024).toFixed(2);
        console.log(fileSize, 'adsdas');
        if (fileSize <= 500) {
          return (new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.addEventListener('load', (ev) => {
              resolve(ev.target.result);
            });
            reader.addEventListener('error', reject);
            reader.readAsDataURL(file);
          }));
        } else {
          this.setState({
            gallery_image_error: true
          });
          return false
        }
      }))
        .then(images => {
          /* Once all promises are resolved, update state with image URI array */
          //this.setState({ info_img_path: images });
          this.setState({ info_img_path: this.state.info_img_path.concat(images) });

          console.log(this.state.imagesArray);
          console.log(e.target.files);
        }, error => {
          console.error(error);
        });
    }

  }

  render() {
    const setValue = this.state;

    console.log(this.state.use_type, 'use_type');

    let { imagePreviewUrl, productlov, use_type } = this.state;
    let $imagePreview = null;
    if (imagePreviewUrl) {
      $imagePreview = (<img src={imagePreviewUrl} style={{ width: '100%' }} />);
    } else {
      $imagePreview = (<div className="previewText"></div>);
    }

    let self = this;
    const url = `admin/portal/iteminfo/gallery`;
    let $button = (<OverlayTrigger overlay={<Tooltip id="tooltip">Add Gallery</Tooltip>}>
      <button className="btn btn-primary btn-sm" onClick={this.setModalShow}>{<FontAwesomeIcon icon={faPlus} />}</button></OverlayTrigger>);
    const columns = [
      'sr_no',
      'SPI_DESC',
      'item_gy_ordering',
      'item_gy_use_type',
      'item_gy_active_yn',
      'item_gy_image_path',
      'actions'
    ];

    const options = {
      perPage: PER_PAGE,
      headings: {
        sr_no: '#',
        SPI_DESC: 'Product',
        item_gy_ordering: 'Ordering',
        item_gy_use_type: 'Type',
        item_gy_active_yn: 'Active ?',
        item_gy_image_path: 'Image',

      },
      search_key: {
        SPI_DESC: 'Product',
        item_gy_ordering: 'Ordering',
        item_gy_use_type: 'Type',
        item_gy_active_yn: 'Active ?'
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
              Gallery {this.state.item_desc != '' ? '(' + this.state.item_desc + ')' : ''}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col className={this.state.mode === '' ? "d-none" : 'col-sm-4'}>
                <Form noValidate onSubmit={this.handleSubmit} autoComplete="off">
                  <Form.Row>
                    <Col>
                      <Form.Group>
                        <Form.Label>Product</Form.Label>
                        <Form.Control as="select" name="item_product_code" value={setValue.item_product_code} required onChange={this.stateChanges}>
                          <option value="">Select Product</option>
                          {productlov && productlov.map((data, i) => (
                            <option value={data.id} key={i}>{data.desc}</option>
                          ))}
                        </Form.Control>
                      </Form.Group>
                    </Col>
                  </Form.Row>

                  <Form.Row>
                    <Col>
                      <Form.Group>
                        <Form.Label>Type</Form.Label>
                        <Form.Control as="select" name="item_gy_use_type" value={setValue.item_gy_use_type} required onChange={this.stateChanges}>
                          <option value="">Select Type</option>
                          {use_type && use_type.map((data, i) => (
                            <option value={data.id} key={i}>{data.desc}</option>
                          ))}
                        </Form.Control>
                      </Form.Group>
                    </Col>
                  </Form.Row>

                  <Form.Group>
                    <Form.Label>Ordering</Form.Label>
                    <Form.Control onChange={this.stateChanges} value={setValue.item_gy_ordering} type="text" name="item_gy_ordering" placeholder="Ordering" />
                    {this.state.errors["item_gy_ordering"] &&
                      <span className='custError'>{this.state.errors["item_gy_ordering"]}</span>
                    }
                  </Form.Group>

                  <Form.Row>
                    <Col>
                      <Form.Group controlId="formBasicCheckbox">
                        <Form.Check onChange={this.stateChanges} checked={setValue.item_gy_active_yn === 'Y' ? true : false} type="checkbox" name="item_gy_active_yn" label="Active" />
                      </Form.Group>
                    </Col>
                  </Form.Row>

                  <Form.Row>
                    <Col>
                      <Form.Label>Image Upload</Form.Label>
                      <Form.Group>
                        <div className="previewComponent">
                          <Form.Control className="fileInput" accept=".jpg,.jpeg,.png" type="file" onChange={(e) => this._handleImageChange(e)} multiple />

                          {setValue.gallery_image_error &&
                            <Col sm={12}><p className="text-danger">* Image Maximum size 500 KB</p></Col>
                          }

                          <div className="imgPreview">
                            {$imagePreview}
                          </div>
                        </div>
                      </Form.Group>
                    </Col>
                  </Form.Row>

                  <button type="submit" className={this.state.mode === 'IS' ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}>{this.state.mode === 'IS' ? 'Save' : 'Update'}</button>
                </Form>
              </Col>

              <Col className={this.state.mode === '' ? "col-sm-12" : 'col-sm-8'}>

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
                    <ServerTable renderView={this.state.galleryrenderTable} columns={columns} url={`${url + `?item_gy_info_id=` + this.state.item_gy_info_id}`} options={options} addme={$button} bordered hover updateUrl hist_table="SITE_M_LIFESTYLE_IMAGES_HIST">
                      {
                        function (row, column, index) {

                          switch (column) {
                            case 'sr_no':
                              return (
                                (index + 1) + (PER_PAGE * ((self.state.page) - 1))
                              );
                            case 'item_gy_use_type':

                              return use_type && use_type.map((data) => data.id == row[column] ? data.desc : '')

                            case 'item_gy_image_path':
                              return (
                                <img src={row.item_gy_image_path} width="50" className="table-image" alt="" />
                              );
                            case 'actions':
                              return (
                                <div className="form-control-sm" style={{ textAlign: 'center' }}>
                                  <DropdownButton size="sm" id="dropdown-basic-button" title={<FontAwesomeIcon icon={faCog} />}>
                                    <Dropdown.Item onClick={() => self.editgalleryModalRecord(row.item_gy_id)}><FontAwesomeIcon icon={faEdit} /> Edit</Dropdown.Item>
                                    <Dropdown.Item onClick={() => self.deletRecord(row.item_gy_id)}><FontAwesomeIcon icon={faTrash} /> Delete</Dropdown.Item>
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

export default GalleryModal;