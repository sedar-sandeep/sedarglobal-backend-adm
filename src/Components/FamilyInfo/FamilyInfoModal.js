
import React, { Component } from 'react';
import './FamilyInfo.scss';
import { Col, Row, Form, Modal, Table,Spinner } from 'react-bootstrap';
import ApiDataService from '../../services/ApiDataService';
import Select from 'react-select';
const url = 'admin/portal/familyinfo';
let newFamilyArray = [];


class FamilyInfoModal extends Component {
    state = {
        value: [],
    };
    constructor(props) {
        super(props);
        this._isMounted = true;
        this.state = {
            errors: {},
            new_family_list: [],
            isValid: false,
            modalShow: false,
            texture_lov: [],
            brandslov: [],
            patternslov: [],
            materialslov: [],
            collectionslov: [],
            country_lov: [],
            applicable_countries: [],
            selecttextureType: [],
            loader: false,

        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.addFamily = this.addFamily.bind(this);

    }



    closedialog = () => {
        this.setState({ deletedialog: false });
    }
    modalClose = () => {
        this.setState({ modalShow: false });
    }

    deleteModalRecord = (id) => {
        ApiDataService.delete(`${url}/`, id).then(response => {
            if (response.data.return_status !== "0") {
                if (response.data.error_message === 'Error') {
                    this.props.errorMessage(response.data.result, "ERR-OBJ");
                } else {
                    this.props.errorMessage(response.data.error_message, "ERR");
                }
            } else {
                this.props.errorMessage(response.data.error_message, "DONE");
                this.props.renderTable();
            }
            this.props.closeDelete();
        }).catch((error) => {
            this.props.errorMessage(error.message, "ERR");
            this.props.closeDelete();
        });
    }



    componentWillMount() {
        ApiDataService.get(url + '/getFamilyList')
            .then(response => {
                this.setState({
                    new_family_list: response.data.result
                });
            }).catch(function (error) {

            });


    }

    editModalRecord = (id) => {
        this.setState({
            loader: true
        });
        this.state.mode = 'UP';
        ApiDataService.get(`${url}/${id}/edit`).then(response => {
            let resp = response.data.result;
            let applicable_countries_list = resp.SFI_APPLICABLE_COUNTRIES && resp.SFI_APPLICABLE_COUNTRIES != null && resp.SFI_APPLICABLE_COUNTRIES != 'null' ? resp.SFI_APPLICABLE_COUNTRIES.split('|') : [];
            this.setState({
                collectionslov: response.data.collections,
                materialslov: response.data.materials,
                patternslov: response.data.patterns,
                brandslov: response.data.brands,
                texture_lov: response.data.texture_type,
                country_lov: response.data.country_lov,
                applicable_countries: applicable_countries_list
            });


            Object.entries(resp).forEach(([key, value]) => {
                this.setState({ [key]: value });
            });

            this.textureTypeFun(resp.SFI_TEXTURE_TYPE, response.data.texture_type);
            this.setState({
                loader: false
            });
        }).catch((error) => {
            console.log(error);
            this.setState({
                loader: false
            });
        });

    }


    stateChanges = (e) => {
        const { name, value } = e.target;
        console.log(e.target);
        var values = '';
        if (['SFI_CUSTOMIZABLE_YN', 'SFI_SAMPLE_APP_YN', 'SFI_ACTIVE_YN', 'SFI_LIGHT_FILTERING_APP_YN', 'SFI_BLACKOUT_LINING_APP_YN'].indexOf(name) >= 0) {
            let checkBox = e.target.checked;
            values = (checkBox ? 'Y' : 'N');
        } else if (name === 'SFI_BR_CODE') {
            var index = e.target.selectedIndex;
            var optionElement = e.target.childNodes[index];
            var optionText = optionElement.text;
            var image_path = optionElement.getAttribute('data-image_path');
            values = value;
            this.setState({ 'SFI_BR_DESC': optionText });
            this.setState({ 'SFI_BR_IMAGE_PATH': image_path });
        } else if (name === 'SFI_BR_CODE') {
            var index = e.target.selectedIndex;
            var optionElement = e.target.childNodes[index];
            var optionText = optionElement.text;
            var image_path = optionElement.getAttribute('data-image_path');
            values = value;
            this.setState({ 'SFI_BR_DESC': optionText });
            this.setState({ 'SFI_BR_IMAGE_PATH': image_path });
        } else if (name === 'SFI_PATTERN_CODE') {
            var index = e.target.selectedIndex;
            var optionElement = e.target.childNodes[index];
            var optionText = optionElement.text;
            values = value;
            this.setState({ 'SFI_PATTERN_DESC': optionText });
        } else if (name === 'SFI_MT_CODE') {
            var index = e.target.selectedIndex;
            var optionElement = e.target.childNodes[index];
            var optionText = optionElement.text;
            values = value;
            this.setState({ 'SFI_MT_DESC': optionText });
        } else if (name === 'SFI_COLLECTION_CODE') {
            var index = e.target.selectedIndex;
            var optionElement = e.target.childNodes[index];
            var optionText = optionElement.text;
            values = value;
            this.setState({ 'SFI_COLLECTION_DESC': optionText });
        } else {
            values = value;
        }
        this.setState({ [name]: values });
    }

    validation = () => {
        let fields = this.state;
        let errors = {};
        let formIsValid = true;

        if (!fields["SFI_CODE"]) {
            errors["SFI_CODE"] = "Family Code is required";
            formIsValid = false;
        } else if (!fields["SFI_DESC"]) {
            errors["SFI_DESC"] = "Family description is required";
            formIsValid = false;
        } else if (!fields["SFI_COLLECTION_DESC"]) {
            errors["SFI_COLLECTION_DESC"] = "Collection description is required";
            formIsValid = false;
        } else if (!fields["SFI_BR_DESC"]) {
            errors["SFI_BR_DESC"] = "Brand description is required";
            formIsValid = false;
        } else if (!fields["SFI_PATTERN_DESC"]) {
            errors["SFI_PATTERN_DESC"] = "Pattern description is required";
            formIsValid = false;
        }

        this.setState({ errors: errors });
        return formIsValid;
    }

    handleSubmit(event) {
        event.preventDefault();
        if (!this.validation()) {
            return false;
        }



        var formData = new FormData();

        let Properties = this.state;
        for (var key in Properties) {
            formData.append(key, Properties[key]);
        }


        if (this.props.mode === 'IS') {

        } else {
            let update_url = `${url}/update/${this.state.SFI_CODE}`;
            ApiDataService.update(update_url, formData).then(response => {
                if (response.data.return_status !== "0") {
                    if (response.data.error_message === 'Error') {
                        this.props.errorMessage(response.data.result, "ERR-OBJ");
                    } else {
                        this.props.errorMessage(response.data.error_message, "ERR");
                    }
                } else {
                    this.props.errorMessage(response.data.error_message, "DONE");
                    this.props.closeModal();
                    this.props.renderTable();
                }
            }).catch((error) => {
                console.log(error);
                this.props.errorMessage(error.message, "ERR");
            });
        }

    }
    addStateChangesFamily = (e) => {
        const { name, value } = e.target;
        var values = e.target.checked;
        if (e.target.checked) {
            newFamilyArray.push(value);
        } else {
            for (var i = 0; i < newFamilyArray.length; i++) {
                if (newFamilyArray[i] === value) {
                    newFamilyArray.splice(i, 1);
                }
            }
        }

    }
    addFamily = () => {
        if (newFamilyArray.length == 0) {
            this.props.errorMessage('Please select Checkbox', "ERR");
        } else {
            var formData = new FormData();
            formData.append('sfi_code_array', newFamilyArray);
            // let post_data = { sfi_code_array: newFamilyArray.toString() };
            console.log(formData);
            ApiDataService.post(url, formData).then(response => {
                if (response.data.return_status !== "0") {
                    if (response.data.error_message === 'Error') {
                        this.props.errorMessage(response.data.result, "ERR-OBJ");
                    } else {
                        this.props.errorMessage(response.data.error_message, "ERR");
                    }
                } else {
                    this.props.errorMessage(response.data.error_message, "DONE");
                    this.props.closeModal();
                    this.props.renderTable();
                }
            }).catch((error) => {
                console.log(error);
                this.props.errorMessage(error.message, "ERR");
            });
        }
    }

    selectFlag = (iso_code) => {
        let checkFlagExist = this.state.applicable_countries;

        if (checkFlagExist.indexOf(iso_code) != -1) {
            checkFlagExist.splice(checkFlagExist.indexOf(iso_code), 1);
        } else {
            checkFlagExist.push(iso_code);
        }
        console.log(checkFlagExist);
        this.setState({
            applicable_countries: checkFlagExist,
            SFI_APPLICABLE_COUNTRIES: checkFlagExist
        });
        console.log(this.state);
    }
    handleChangeTextureType(value, actionMeta) {

        let texture_type_array = [];
        value.map((val) => {
            texture_type_array.push(val.value);
        })
        this.setState({ selecttextureType: value, SFI_TEXTURE_TYPE: texture_type_array.toString() });

    }
    textureTypeFun(texture_type, texture_lov) {


        let texture_type_array = texture_type && texture_type.split(',');

        console.log(texture_lov, texture_type, texture_type_array, 'texture_type_array');

        var select_val = [];
        texture_lov && texture_lov.map((val) => {
            if (texture_type_array && texture_type_array.indexOf(val.SS_CODE) >= 0) {
                select_val.push({ value: val.SS_CODE, label: val.SS_DESC });
            }
        });

        console.log(texture_lov, texture_type, texture_type_array, 'texture_type_array', select_val);

        this.setState({ selecttextureType: select_val });

    }



    render() {

        const setValue = this.state;
        let theis = this;

        let $imagePreview = (<div className="previewText"><center><img className="imgWidth" src={this.state.no_image_path} /></center></div>);
        let applicable_countries = this.state.applicable_countries;

        console.log(setValue.texture_lov, 'texture_lov');

        return (
            <div>
                <Modal animation={false} size="xl" show={this.props.show} onHide={this.props.closeModal} >
                    <Modal.Header closeButton className="">
                        <Modal.Title id="modalTitle">
                            ItemFamily
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>

                        {setValue.loader == true ?
                            <Col className="popupSpinner">
                                <Spinner animation="grow" variant="dark" />
                            </Col>
                            : ''}

                        {this.props.mode == 'UP' ?
                            <Row>
                                <Col>
                                    <Form noValidate onSubmit={this.handleSubmit} autoComplete="off">
                                        <Form.Row className='d-none'>
                                            <Form.Control value={setValue.SFI_BR_DESC} type="text" name="SFI_BR_DESC" placeholder="Brand Description" />
                                            <Form.Control value={setValue.SFI_BR_IMAGE_PATH} type="text" name="SFI_BR_IMAGE_PATH" placeholder="Brand Image Path" />
                                            <Form.Control value={setValue.SFI_PATTERN_DESC} type="text" name="SFI_PATTERN_DESC" placeholder="Pattern" />
                                            <Form.Control value={setValue.SFI_MT_DESC} type="text" name="SFI_MT_DESC" placeholder="Material" />
                                            <Form.Control value={setValue.SFI_COLLECTION_DESC} type="text" name="SFI_COLLECTION_DESC" placeholder="Collection" />
                                        </Form.Row>
                                        <Form.Row>
                                            <Col md={2}>
                                                <Form.Group>
                                                    <Form.Label>Family Code</Form.Label>
                                                    <Form.Control onChange={this.stateChanges} value={setValue.SFI_CODE} type="text" name="SFI_CODE" placeholder="Family Code" readOnly={true} />
                                                </Form.Group>
                                            </Col>
                                            <Col md={3}>
                                                <Form.Group>
                                                    <Form.Label>Family Description</Form.Label>
                                                    <Form.Control onChange={this.stateChanges} value={setValue.SFI_DESC} type="text" name="SFI_DESC" placeholder="Family Description" />
                                                    {this.state.errors["SFI_DESC"] &&
                                                        <span className='custError'>{this.state.errors["SFI_DESC"]}</span>
                                                    }
                                                </Form.Group>
                                            </Col>
                                            <Col>
                                                <Form.Group>
                                                    <Form.Label>Ordering</Form.Label>
                                                    <Form.Control onChange={this.stateChanges} value={setValue.SFI_ORDERING} type="text" name="SFI_ORDERING" placeholder="Ordering" />
                                                    {this.state.errors["SFI_ORDERING"] &&
                                                        <span className='custError'>{this.state.errors["SFI_ORDERING"]}</span>
                                                    }
                                                </Form.Group>
                                            </Col>

                                            <Col style={{ textAlign: 'center' }}>
                                                <Form.Group controlId="formBasicCheckbox">
                                                    <Form.Label>Active?</Form.Label>
                                                    <Form.Check onChange={this.stateChanges} checked={setValue.SFI_ACTIVE_YN === 'Y' ? true : false} type="checkbox" name="SFI_ACTIVE_YN" />
                                                </Form.Group>
                                            </Col>
                                            <Col style={{ textAlign: 'center' }}>
                                                <Form.Group controlId="formBasicCheckbox">
                                                    <Form.Label>Customizable?</Form.Label>
                                                    <Form.Check onChange={this.stateChanges} checked={setValue.SFI_CUSTOMIZABLE_YN === 'Y' ? true : false} type="checkbox" name="SFI_CUSTOMIZABLE_YN" />
                                                </Form.Group>
                                            </Col>
                                            <Col style={{ textAlign: 'center' }}>
                                                <Form.Group controlId="formBasicCheckbox">
                                                    <Form.Label>Free Sample ?</Form.Label>
                                                    <Form.Check onChange={this.stateChanges} checked={setValue.SFI_SAMPLE_APP_YN === 'Y' ? true : false} type="checkbox" name="SFI_SAMPLE_APP_YN" />
                                                </Form.Group>
                                            </Col>

                                        </Form.Row>

                                        <Form.Row>
                                            <Col md={4}>
                                                <Form.Group>
                                                    <Form.Label>Tag(s)</Form.Label>
                                                    <Form.Control onChange={this.stateChanges} value={setValue.SFI_TAG} type="text" name="SFI_TAG" placeholder="Tag" />
                                                    {this.state.errors["SFI_TAG"] &&
                                                        <span className='custError'>{this.state.errors["SFI_TAG"]}</span>
                                                    }
                                                </Form.Group>
                                            </Col>
                                            <Col md={4}>
                                                <Form.Group>
                                                    <Form.Label>Texture type</Form.Label>

                                                    <Select
                                                        defaultValue={setValue.selecttextureType}
                                                        value={setValue.selecttextureType}
                                                        isMulti
                                                        name="SFI_TEXTURE_TYPE"
                                                        options={setValue.texture_lov && setValue.texture_lov.map((val) => {
                                                            return { value: val.SS_CODE, label: val.SS_DESC }
                                                        })}
                                                        className="basic-multi-select"
                                                        classNamePrefix="select"
                                                        onChange={this.handleChangeTextureType.bind(this)}
                                                    />
                                                    {/* <Form.Control as="select" value={setValue.SFI_TEXTURE_TYPE} name="SFI_TEXTURE_TYPE" onChange={this.stateChanges}>
                                                        <option>Texture type</option>
                                                        {setValue.texture_type.map((data, i) => (
                                                            <option value={data.SS_CODE} key={i}>{data.SS_TEXTURE_TYPE}</option>
                                                        ))}
                                                    </Form.Control> */}
                                                    {this.state.errors["SFI_TEXTURE_TYPE"] &&
                                                        <span className='custError'>{this.state.errors["SFI_TEXTURE_TYPE"]}</span>
                                                    }
                                                </Form.Group>
                                            </Col>
                                            <Col style={{ textAlign: 'center' }}>
                                                <Form.Group controlId="formBasicCheckbox">
                                                    <Form.Label>Light Filtering Y/N?</Form.Label>
                                                    <Form.Check onChange={this.stateChanges} checked={setValue.SFI_LIGHT_FILTERING_APP_YN === 'Y' ? true : false} type="checkbox" name="SFI_LIGHT_FILTERING_APP_YN" />
                                                </Form.Group>
                                            </Col>
                                            <Col style={{ textAlign: 'center' }}>
                                                <Form.Group controlId="formBasicCheckbox">
                                                    <Form.Label>Blackout Lining Y/N?</Form.Label>
                                                    <Form.Check onChange={this.stateChanges} checked={setValue.SFI_BLACKOUT_LINING_APP_YN === 'Y' ? true : false} type="checkbox" name="SFI_BLACKOUT_LINING_APP_YN" />
                                                </Form.Group>
                                            </Col>
                                        </Form.Row>

                                        <Form.Row>
                                            <Col>
                                                <Form.Group>
                                                    <Form.Label>Collection</Form.Label>
                                                    <Form.Control as="select" value={setValue.SFI_COLLECTION_CODE} name="SFI_COLLECTION_CODE" onChange={this.stateChanges}>
                                                        <option>Select Collection</option>
                                                        {setValue.collectionslov.map((data, i) => (
                                                            <option value={data.SICL_CODE} key={i} >{data.SICL_DESC}</option>
                                                        ))}
                                                    </Form.Control>
                                                    {this.state.errors["SFI_COLLECTION_DESC"] &&
                                                        <span className='custError'>{this.state.errors["SFI_COLLECTION_DESC"]}</span>
                                                    }
                                                </Form.Group>
                                            </Col>
                                            <Col>
                                                <Form.Group>
                                                    <Form.Label>Brand</Form.Label>
                                                    <Form.Control as="select" value={setValue.SFI_BR_CODE} name="SFI_BR_CODE" onChange={this.stateChanges}>
                                                        <option>Select Brand</option>
                                                        {setValue.brandslov.map((data, i) => (
                                                            <option value={data.BR_CODE} key={i} data-image_path={data.BR_IMAGE_PATH}>{data.BR_DESC}</option>
                                                        ))}
                                                    </Form.Control>
                                                    {this.state.errors["SFI_BR_CODE"] &&
                                                        <span className='custError'>{this.state.errors["SFI_BR_CODE"]}</span>
                                                    }
                                                </Form.Group>
                                            </Col>
                                            <Col>
                                                <Form.Group>
                                                    <Form.Label>Pattern</Form.Label>
                                                    <Form.Control as="select" value={setValue.SFI_PATTERN_CODE} name="SFI_PATTERN_CODE" onChange={this.stateChanges}>
                                                        <option>Select Pattern</option>
                                                        {setValue.patternslov.map((data, i) => (
                                                            <option value={data.SIPT_CODE} key={i}>{data.SIPT_DESC}</option>
                                                        ))}
                                                    </Form.Control>
                                                    {this.state.errors["SFI_PATTERN_DESC"] &&
                                                        <span className='custError'>{this.state.errors["SFI_PATTERN_DESC"]}</span>
                                                    }
                                                </Form.Group>
                                            </Col>
                                            <Col>
                                                <Form.Group>
                                                    <Form.Label>Material</Form.Label>
                                                    <Form.Control as="select" value={setValue.SFI_MT_CODE} name="SFI_MT_CODE" onChange={this.stateChanges}>
                                                        <option>Select Material</option>
                                                        {setValue.materialslov.map((data, i) => (
                                                            <option value={data.SIMT_CODE} key={i}>{data.SIMT_DESC}</option>
                                                        ))}
                                                    </Form.Control>
                                                    {this.state.errors["SFI_MT_DESC"] &&
                                                        <span className='custError'>{this.state.errors["SFI_MT_DESC"]}</span>
                                                    }
                                                </Form.Group>
                                            </Col>

                                        </Form.Row>
                                        <Form.Row>

                                            <Col>
                                                <Form.Group>
                                                    <Form.Label>Max Width</Form.Label>
                                                    <Form.Control onChange={this.stateChanges} value={setValue.SFI_MAX_WIDTH} type="text" name="SFI_MAX_WIDTH" placeholder="MAX WIDTH" readOnly={true} />
                                                    {this.state.errors["SFI_MAX_WIDTH"] &&
                                                        <span className='custError'>{this.state.errors["SFI_MAX_WIDTH"]}</span>
                                                    }
                                                </Form.Group>
                                            </Col>
                                            <Col>
                                                <Form.Group>
                                                    <Form.Label>Length</Form.Label>
                                                    <Form.Control onChange={this.stateChanges} value={setValue.SFI_LENGTH} type="text" name="SFI_LENGTH" placeholder="Lenght" readOnly={true} />
                                                    {this.state.errors["SFI_LENGTH"] &&
                                                        <span className='custError'>{this.state.errors["SFI_LENGTH"]}</span>
                                                    }
                                                </Form.Group>
                                            </Col>
                                            <Col>
                                                <Form.Group>
                                                    <Form.Label>Family Status</Form.Label>
                                                    <Form.Control as="select" value={setValue.SFI_STATUS} name="SFI_STATUS" onChange={this.stateChanges}>
                                                        <option>Family Status</option>
                                                        <option value="INSTOCK">In Stock</option>
                                                        <option value="ONDEMAND">On Demand</option>
                                                    </Form.Control>
                                                    {/* <Form.Control onChange={this.stateChanges} value={setValue.SFI_STATUS} type="text" name="SFI_STATUS" placeholder="SFI STATUS" />
                                                    {this.state.errors["SFI_STATUS"] &&
                                                        <span className='custError'>{this.state.errors["SFI_STATUS"]}</span>
                                                    }*/}
                                                </Form.Group>
                                            </Col>

                                        </Form.Row>
                                        <Form.Row>
                                            <Col className="countryParent">
                                                {this.state.country_lov.map(function (data, index) {
                                                    return (
                                                        <div title={data.desc} key={index} onClick={() => theis.selectFlag(data.iso_code)} className={applicable_countries.indexOf(data.iso_code) >= 0 ? 'countryFlag activeFlag' : 'countryFlag '}>
                                                            <img alt={data.iso_code} src={data.image_path} />
                                                            <span className="flagName"> {data.iso_code}</span>
                                                        </div>
                                                    )
                                                })
                                                }
                                            </Col>
                                        </Form.Row>
                                        <Form.Row>
                                            <button type="submit" disabled={this.state.isValid} className={this.props.mode === 'IS' ? "btn btn-primary btn-sm mt-3" : "btn btn-secondary btn-sm mt-3"}>{this.props.mode === 'IS' ? 'Save' : 'Update'}</button>
                                        </Form.Row>
                                    </Form>
                                </Col>
                            </Row>

                            : <Row>
                                <Col md={12}>
                                    <Table striped bordered hover width={'100%'} >
                                        <thead>
                                            <tr>
                                                <th>CheckBox</th>
                                                <th>Family Code</th>
                                                <th>Family Desc</th>
                                                <th>Collection</th>
                                                <th>Brand</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {setValue.new_family_list && setValue.new_family_list.map((e, i) => {
                                                return (
                                                    <tr key={i}>
                                                        <td>
                                                            <Form.Check value={e.SFI_CODE} type="checkbox" name="sfi_code_list" onChange={this.addStateChangesFamily} />
                                                        </td>
                                                        <td>{e.SFI_CODE}</td>
                                                        <td>{e.SFI_DESC}</td>
                                                        <td>{e.SFI_COLLECTION_DESC}</td>
                                                        <td>{e.SFI_BR_DESC}</td>
                                                    </tr>
                                                )

                                            })

                                            }
                                        </tbody>

                                    </Table>
                                    {setValue.new_family_list && setValue.new_family_list ? <button type="submit" disabled={this.state.isValid} className={"btn btn-primary btn-sm"} onClick={() => { this.addFamily() }}>Add Family</button> : "Data have not found"}
                                </Col>
                            </Row>
                        }


                    </Modal.Body>
                </Modal>
            </div>
        )
    }
}

export default FamilyInfoModal;