import React, { Component } from 'react';
import './CountryManagement.scss';
import { Col, Row, Form, Button, Container } from 'react-bootstrap';
//import { LANG_CODE, USER_ID, SITE_ID, AUTH_TOKEN, CHANNEL_ID } from '../Redux-Config/Action/ActionType';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import ApiDataService from '../../services/ApiDataService';
import Wysiwyg from "../../Plugin/Wysiwyg";

import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
const moment = require('moment');
//const AVATAR_URL = process.env.REACT_APP_AVATAR_URL;
const apiUrl = `admin/portal/country`;
class AddUpdateCountryManagement extends Component {

	constructor(props) {
		super(props);
		let $country_id = '';
		var $country_iso = '';
		let $country_desc = '';
		let $prompt_msg = '';
		let $SCN_STATE_LABEL = '';
		let $country_ccy_code = '';
		let $country_ccy_symbol = '';
		let $country_ccy_exch_rate = '';
		let $country_ccy_decimal = '';
		let $country_ccy_show_decimal = '';
		let $ref_cn_iso = '';
		let $instock_days = '';
		let $express_days = '';
		let $ondemand_days = '';
		let $measurement_days = '';
		let $country_from_date = moment(new Date(), 'DD-MMM-YYYY').toDate();
		let $country_upto_date = moment(new Date(), 'DD-MMM-YYYY').toDate();
		let $country_active_yn = 'N';
		let $shopping_yn = 'N';
		let $price_yn = 'N';
		let $promt_message_yn = 'N';
		let $priceisActiveChecked = '';
		let $promtMessageActiveChecked = '';
		let $isActiveChecked = '';
		let $shoppingisActiveChecked = '';
		let $old_avatar = '';
		let $lang_code = props.lang_code;
		if (props.countries.return_status === "0") {
			var $countryObj = props.countries.result[0];
			$country_id = $countryObj.country_iso;
			$ref_cn_iso = $countryObj.ref_cn_iso;
			$instock_days = $countryObj.instock_days;
			$express_days = $countryObj.express_days;
			$measurement_days = $countryObj.measurement_days;
			$ondemand_days = $countryObj.ondemand_days;
			$country_iso = $countryObj.country_iso;
			$country_desc = $countryObj.country_desc;
			$prompt_msg = $countryObj.prompt_msg;
			$SCN_STATE_LABEL = $countryObj.SCN_STATE_LABEL;
			$country_ccy_code = $countryObj.country_ccy_code;
			$country_ccy_symbol = $countryObj.country_ccy_symbol;
			$country_ccy_exch_rate = $countryObj.country_ccy_exch_rate;
			$country_ccy_decimal = $countryObj.country_ccy_decimal;
			$country_ccy_show_decimal = $countryObj.country_ccy_show_decimal;
			$country_from_date = moment($countryObj.country_from_date, 'DD-MMM-YYYY').toDate();
			$country_upto_date = moment($countryObj.country_upto_date, 'DD-MMM-YYYY').toDate();
			$shopping_yn = $countryObj.shopping_yn;
			$price_yn = $countryObj.price_yn;
			$promt_message_yn = $countryObj.promt_message_yn;
			$shoppingisActiveChecked = ($countryObj.shopping_yn === "Y") ? "checked" : "";
			$priceisActiveChecked = ($countryObj.price_yn === "Y") ? "checked" : "";
			$promtMessageActiveChecked = ($countryObj.promt_message_yn === "Y") ? "checked" : "";
			$country_active_yn = $countryObj.country_active_yn;
			$isActiveChecked = ($countryObj.country_active_yn === "Y") ? "checked" : "";
			$old_avatar = $countryObj.country_image_path;
			$lang_code = $countryObj.lang_code;
		}
		let $languages = [];
		if (props.languages) {
			$languages = props.languages;
		}
		this.state = {
			country_id: $country_id, //this.props.match.params.id
			country_iso: $country_iso,
			country_desc: $country_desc,
			prompt_msg: $prompt_msg,
			SCN_STATE_LABEL: $SCN_STATE_LABEL,
			country_ccy_code: $country_ccy_code,
			country_ccy_symbol: $country_ccy_symbol,
			country_ccy_exch_rate: $country_ccy_exch_rate,
			country_ccy_decimal: $country_ccy_decimal,
			country_ccy_show_decimal: $country_ccy_show_decimal,
			country_from_date: $country_from_date,
			country_upto_date: $country_upto_date,
			country_active_yn: $country_active_yn,
			shopping_yn: $shopping_yn,
			price_yn: $price_yn,
			promt_message_yn: $promt_message_yn,
			priceisActiveChecked: $priceisActiveChecked,
			promtMessageActiveChecked: $promtMessageActiveChecked,
			isActiveChecked: $isActiveChecked,
			shoppingisActiveChecked: $shoppingisActiveChecked,
			languages: $languages,
			ref_cn_iso: $ref_cn_iso,
			instock_days: $instock_days,
			express_days: $express_days,
			measurement_days: $measurement_days,
			ondemand_days: $ondemand_days,
			avatar: '',
			old_avatar: $old_avatar,
			lang_code: $lang_code,
			errors: {}
		}

		this.handleChange = this.handleChange.bind(this);
		this.handleActiveCheckboxChange = this.handleActiveCheckboxChange.bind(this);
		this.onFileChangeHandler = this.onFileChangeHandler.bind(this);
		this.handleFromDateChange = this.handleFromDateChange.bind(this);
		this.handleUptoDateChange = this.handleUptoDateChange.bind(this);
		this.handleCheckIOSKeyup = this.handleCheckIOSKeyup.bind(this);
		this.changeLang = this.changeLang.bind(this);


		console.log(props);
	}

	handleChange(event) {
		const name = event.target.name;
		var value = event.target.value;
		this.setState({
			[name]: value
		});
	}
	/*changePromtMessage(data) {
		this.setState({ 'del_prompt_msg': data });
	}*/

	changeLang(event) {
		var value = event.target.value;
		var name = event.target.name;

		this.setState({ [name]: value });
		if (value != 'en') {
			this.props.geteditCountry(this.state.country_iso, value);
		}
	}

	handleActiveCheckboxChange(event) {
		const name = event.target.name;
		var value = event.target.value;
		if (value === 'Y') {
			value = 'N';
		} else {
			value = 'Y';
		}

		let activeChecked = (value === 'Y') ? 'checked' : '';
		//this.setState({['isActiveChecked']: activeChecked});
		if (name == 'shopping_yn') {
			this.setState({
				[name]: value,
				'shoppingisActiveChecked': activeChecked
			})
		} else if (name == 'price_yn') {
			this.setState({
				[name]: value,
				'priceisActiveChecked': activeChecked
			})
		} else if (name == 'promt_message_yn') {
			this.setState({
				[name]: value,
				'promtMessageActiveChecked': activeChecked
			})
		} else {
			this.setState({
				[name]: value,
				'isActiveChecked': activeChecked
			})
		}
	}



	handleFromDateChange(date) {
		if (moment(date).isValid()) {
			this.setState({
				'country_from_date': moment(date).toDate()
			});
		}
	}

	handleUptoDateChange(date) {
		if (moment(date).isValid()) {
			this.setState({
				'country_upto_date': moment(date).toDate()
			});
		}
	}

	onFileChangeHandler(e) {
		//const name = e.target.name;		
		this.setState({
			'avatar': e.target.files[0],
			'old_avatar': URL.createObjectURL(e.target.files[0])
		});
	}

	handleCheckIOSKeyup(e) {
		//const value = e.target.value;		
		//alert(value);		
		const fmData = new FormData();
		//let $iso = this.state.country_iso;
		fmData.append('country_iso', e.target.value);

		let $url = `${apiUrl}/checkDuplicateIso`;
		let errors = {}
		let formIsValid = true;
		ApiDataService.post($url, fmData)
			.then(res => {
				if (res.data.return_status !== "0") {
					formIsValid = false
					errors['country_iso'] = res.data.error_message;
				}
				this.setState({ errors });
				return formIsValid;
			}).catch(function (error) {
				formIsValid = false
				errors['country_iso'] = error;
				this.setState({ errors });
				return formIsValid;
			});
	}

	countryHandler = event => {
		event.preventDefault();
		if (this.validateForm()) {
			const fmData = new FormData();
			let $iso = this.state.country_iso;
			fmData.append('country_iso', $iso);
			fmData.append('country_desc', this.state.country_desc);
			fmData.append('prompt_msg', this.state.prompt_msg);
			fmData.append('SCN_STATE_LABEL', this.state.SCN_STATE_LABEL);
			fmData.append('country_ccy_code', this.state.country_ccy_code);
			fmData.append('country_ccy_symbol', this.state.country_ccy_symbol);
			fmData.append('country_ccy_exch_rate', this.state.country_ccy_exch_rate);
			fmData.append('country_ccy_decimal', this.state.country_ccy_decimal);
			fmData.append('country_ccy_show_decimal', this.state.country_ccy_show_decimal);
			fmData.append('language', this.state.lang_code);

			fmData.append('ref_cn_iso', this.state.ref_cn_iso);
			fmData.append('instock_days', this.state.instock_days);
			fmData.append('express_days', this.state.express_days);
			fmData.append('measurement_days', this.state.measurement_days);
			fmData.append('ondemand_days', this.state.ondemand_days);

			let fromDateVar = moment(this.state.country_from_date);
			//let newFromDateVar = fromDateVar.utc().format('DD-MMM-YYYY');
			let newFromDateVar = fromDateVar.format('DD-MMM-YYYY');
			fmData.append('country_from_date', newFromDateVar);

			let uptoDateVar = moment(this.state.country_upto_date);
			//let newUptoDateVar = uptoDateVar.utc().format('DD-MMM-YYYY');
			let newUptoDateVar = uptoDateVar.format('DD-MMM-YYYY');
			fmData.append('country_upto_date', newUptoDateVar);

			fmData.append('country_active_yn', this.state.country_active_yn);
			fmData.append('shopping_yn', this.state.shopping_yn);
			fmData.append('price_yn', this.state.price_yn);
			fmData.append('promt_message_yn', this.state.promt_message_yn);

			let $countryId = this.state.country_id;
			fmData.append('countryId', $countryId);

			fmData.append('old_avatar', this.state.old_avatar);
			fmData.append('avatar', this.state.avatar);
			this.props.onFormSubmit(fmData, $countryId);
		}
	}

	validateForm = () => {
		let errors = {}
		let formIsValid = true;
		if (!this.state.country_iso) {
			formIsValid = false
			errors['country_iso'] = '*Please enter country ISO Code'
		} else if (this.state.errors.country_iso) {
			formIsValid = false;
			errors['country_iso'] = this.state.errors.country_iso;
		}

		if (!this.state.country_desc) {
			formIsValid = false
			errors['country_desc'] = '*Please enter country description'
		}

		if (!this.state.ref_cn_iso) {
			formIsValid = false
			errors['ref_cn_iso'] = '*Please enter country ISO'
		}


		/*if (this.state.footer_desc) {
		  if (!this.state.footer_desc.match(/^\w+$/)) {
			formIsValid = false
			errors['footer_desc'] = '*Please use alphanumeric characters only'
		  }
		}*/

		if (!this.state.country_ccy_code) {
			formIsValid = false
			errors['country_ccy_code'] = '*Please enter country currency code'
		}

		if (!this.state.country_ccy_symbol) {
			formIsValid = false
			errors['country_ccy_symbol'] = '*Please enter country currency symbol'
		}


		if (!this.state.country_ccy_exch_rate) {
			formIsValid = false
			errors['country_ccy_exch_rate'] = '*Please enter country exchange rate'
		}

		if (this.state.country_ccy_exch_rate) {
			//regular expression for footer_ordering validation
			const re = /^[0-9.\b]+$/; //rules
			if (!re.test(this.state.country_ccy_exch_rate)) {
				formIsValid = false
				errors['country_ccy_exch_rate'] = '*Please enter only number value'
			}
		}
		//alert(this.state.country_from_date)
		var dateFormat = 'DD-MM-YYYY';

		if (!moment(moment(this.state.country_from_date).format(dateFormat), dateFormat, true).isValid()) {
			formIsValid = false
			errors['country_from_date'] = '*Please enter from date'
		}

		if (!moment(moment(this.state.country_upto_date).format(dateFormat), dateFormat, true).isValid()) {
			formIsValid = false
			errors['country_upto_date'] = '*Please enter upto date'
		}

		this.setState({ errors });
		return formIsValid;
	}





	// componentWillMount(){}
	// componentDidMount(){}
	// componentWillUnmount(){}

	// componentWillReceiveProps(){}
	// shouldComponentUpdate(){}
	// componentWillUpdate(){}
	// componentDidUpdate(){}


	render() {
		//console.log('this.state',this.state);	
		//let pageTitle =(this.state.country_id)?<h2>Edit Country</h2>:<h2>Add Country</h2>;

		let $props = this.props;
		return (
			<Container className="themed-container" fluid="true">
				{/*<Form onSubmit={this.handleSubmit}>*/}
				<Form>
					<Row>

						<Col className={($props.lang_code == 'en') ? 'd-sm-none' : ''}>
							<Form.Group controlId="footer_parent_yn">
								<Form.Label>Language </Form.Label>
								<select className="form-control" name="lang_code" value={this.state.lang_code} onChange={this.changeLang}>
									{/* <option value="">Parent Footer</option> */}
									{this.state.languages.map((data, i) => (
										<option value={data.code} key={i}>{data.desc}</option>
									))}
								</select>
							</Form.Group>
						</Col>
						{$props.lang_code == 'en' ? (
							<>
								<Col>
									<Form.Group controlId="country_iso">
										<Form.Label>Country ISO</Form.Label>
										<Form.Control
											type="text"
											name="country_iso"
											value={(this.state.country_iso) ? this.state.country_iso : ""}
											onKeyUp={this.handleCheckIOSKeyup}
											onChange={this.handleChange}
											placeholder="Country ISO" />
									</Form.Group>
									<div className='errorMsg'>{this.state.errors.country_iso}</div>
								</Col>
								<Col>
									<Form.Group controlId="ref_cn_iso">
										<Form.Label>Country ISO With 2 Characters</Form.Label>
										<Form.Control
											type="text"
											name="ref_cn_iso"
											value={(this.state.ref_cn_iso) ? this.state.ref_cn_iso : ""}
											onKeyUp={this.handleCheckIOSKeyup}
											onChange={this.handleChange}
											placeholder="Country ISO With 2 Characters" />
									</Form.Group>
									<div className='errorMsg'>{this.state.errors.ref_cn_iso}</div>
								</Col>
							</>) : ('')}
					</Row>

					<Row>
						<Col>
							<Form.Group controlId="country_desc">
								<Form.Label>Country Description</Form.Label>
								<Form.Control
									type="text"
									name="country_desc"
									value={(this.state.country_desc) ? this.state.country_desc : ""}
									onChange={this.handleChange}
									placeholder="Country Description" />
							</Form.Group>
							<div className='errorMsg'>{this.state.errors.country_desc}</div>
						</Col>

						<Col>
							<Form.Group controlId="SCN_STATE_LABEL ">
								<Form.Label>Country State Label </Form.Label>
								<Form.Control
									type="text"
									name="SCN_STATE_LABEL"
									value={(this.state.SCN_STATE_LABEL) ? this.state.SCN_STATE_LABEL : ""}
									onChange={this.handleChange}
									placeholder="Country State Label" />
							</Form.Group>
							<div className='errorMsg'>{this.state.errors.scn_state_label}</div>
						</Col>
					</Row>
					{$props.lang_code == 'en' ? (
						<>
							<Row>
								<Col>
									<Form.Group controlId="country_ccy_code">
										<Form.Label>Country Currency Code</Form.Label>
										<Form.Control
											type="text"
											name="country_ccy_code"
											value={(this.state.country_ccy_code) ? this.state.country_ccy_code : ""}
											onChange={this.handleChange}
											placeholder="Country Currency Code" />
									</Form.Group>
									<div className='errorMsg'>{this.state.errors.country_ccy_code}</div>
								</Col>
								<Col>
									<Form.Group controlId="country_ccy_symbol">
										<Form.Label>Country Currency Symbol</Form.Label>
										<Form.Control
											type="text"
											name="country_ccy_symbol"
											value={(this.state.country_ccy_symbol) ? this.state.country_ccy_symbol : ""}
											onChange={this.handleChange}
											placeholder="Country Currency Symbol" />
									</Form.Group>
									<div className='errorMsg'>{this.state.errors.country_ccy_symbol}</div>
								</Col>
							</Row>

							<Row>
								<Col>
									<Form.Group controlId="country_ccy_decimal">
										<Form.Label>Currency Decimal</Form.Label>
										<Form.Control
											type="text"
											name="country_ccy_decimal"
											value={(this.state.country_ccy_decimal) ? this.state.country_ccy_decimal : ""}
											onChange={this.handleChange}
											placeholder="Currency Decimal" />
									</Form.Group>
									<div className='errorMsg'>{this.state.errors.country_ccy_decimal}</div>
								</Col>
								<Col>
									<Form.Group controlId="country_ccy_show_decimal">
										<Form.Label>Currency Show Decimal</Form.Label>
										<Form.Control
											type="text"
											name="country_ccy_show_decimal"
											value={(this.state.country_ccy_show_decimal) ? this.state.country_ccy_show_decimal : ""}
											onChange={this.handleChange}
											placeholder="Currency Show Decimal" />
									</Form.Group>
									<div className='errorMsg'>{this.state.errors.country_ccy_show_decimal}</div>
								</Col>

							</Row>


							<Row>
								<Col>
									<Form.Group controlId="instock_days">
										<Form.Label>Instock Days</Form.Label>
										<Form.Control
											type="text"
											name="instock_days"
											value={(this.state.instock_days) ? this.state.instock_days : ""}
											onChange={this.handleChange}
											placeholder="Instock Days" />
									</Form.Group>
									<div className='errorMsg'>{this.state.errors.instock_days}</div>
								</Col>
								<Col>
									<Form.Group controlId="ondemand_days">
										<Form.Label>OnDemand Days</Form.Label>
										<Form.Control
											type="text"
											name="ondemand_days"
											value={(this.state.ondemand_days) ? this.state.ondemand_days : ""}
											onChange={this.handleChange}
											placeholder="OnDemand Days" />
									</Form.Group>
									<div className='errorMsg'>{this.state.errors.ondemand_days}</div>
								</Col>
							</Row>
							<Row>
								<Col>
									<Form.Group controlId="express_days">
										<Form.Label>Express Days</Form.Label>
										<Form.Control
											type="text"
											name="express_days"
											value={(this.state.express_days) ? this.state.express_days : ""}
											onChange={this.handleChange}
											placeholder="Express Days" />
									</Form.Group>
									<div className='errorMsg'>{this.state.errors.express_days}</div>
								</Col>

								<Col>
									<Form.Group controlId="measurement_days">
										<Form.Label>Measurement Day</Form.Label>
										<Form.Control
											type="text"
											name="measurement_days"
											value={(this.state.measurement_days) ? this.state.measurement_days : ""}
											onChange={this.handleChange}
											placeholder="Measurement Day" />
									</Form.Group>
									<div className='errorMsg'>{this.state.errors.measurement_days}</div>
								</Col>

							</Row>

							<Row>
								<Col>
									<Form.Group controlId="country_ccy_exch_rate">
										<Form.Label>Exchange Rate</Form.Label>
										<Form.Control
											type="text"
											name="country_ccy_exch_rate"
											value={(this.state.country_ccy_exch_rate) ? this.state.country_ccy_exch_rate : ""}
											onChange={this.handleChange}
											placeholder="Exchange Rate" />
									</Form.Group>
									<div className='errorMsg'>{this.state.errors.country_ccy_exch_rate}</div>
								</Col>

								<Col>
									<Form.Group controlId="avatar">
										<Form.Label>Country Flag</Form.Label>
										<Form.Control
											type="file"
											name="avatar"
											style={{ display: 'none' }}
											onChange={this.onFileChangeHandler}
											placeholder="Country Flag"
											ref={fileInput => this.fileInput = fileInput}
										/>
										&nbsp;
										<Button onClick={() => this.fileInput.click()} variant="info">Upload</Button>
									</Form.Group>

									<div className='errorMsg'>{this.state.errors.avatar}</div>
								</Col>
								{(this.state.old_avatar) &&
									<Col>
										<img src={this.state.old_avatar} width={80} height={80} alt="Icon" />
									</Col>
								}
							</Row>
							<Row>
								<Col>
									<Form.Group controlId="country_from_date">
										<Form.Label>From Date</Form.Label>
										<DatePicker
											selected={this.state.country_from_date}
											onChange={this.handleFromDateChange}
											value={(this.state.country_from_date) ? this.state.country_from_date : ""}
											name="country_from_date"
											dateFormat="dd-MMM-yyyy"
											className="form-control"
										/>
									</Form.Group>
									<div className='errorMsg'>{this.state.errors.country_from_date}</div>
								</Col>
								<Col>
									<Form.Group controlId="country_upto_date">
										<Form.Label>Upto Date</Form.Label>

										<DatePicker
											selected={this.state.country_upto_date}
											onChange={this.handleUptoDateChange}
											value={(this.state.country_upto_date) ? this.state.country_upto_date : ""}
											name="country_upto_date"
											dateFormat="dd-MMM-yyyy"
											className="form-control"
										/>
									</Form.Group>
									<div className='errorMsg'>{this.state.errors.country_upto_date}</div>
								</Col>
							</Row>

							<Row noGutters>
								<Col xs={3}>
									<Form.Group controlId="country_active_yn">
										<Form.Label className="checkbox_label mr-2">Active ?</Form.Label>
										<Form.Control
											type="checkbox"
											name="country_active_yn"
											checked={this.state.isActiveChecked}
											value={(this.state.country_active_yn) ? this.state.country_active_yn : ""}
											onChange={this.handleActiveCheckboxChange}
											placeholder="Active ?"
											className="checkbox_input" />
									</Form.Group>
								</Col>

								<Col xs={4}>
									<Form.Group controlId="shopping_yn">
										<Form.Label className="checkbox_label mr-2">Shopping Y/N ?</Form.Label>
										<Form.Control
											type="checkbox"
											name="shopping_yn"
											checked={this.state.shoppingisActiveChecked}
											value={(this.state.shopping_yn) ? this.state.shopping_yn : ""}
											onChange={this.handleActiveCheckboxChange}
											placeholder="Active ?"
											className="checkbox_input" />
									</Form.Group>
								</Col>
								<Col xs={4}>
									<Form.Group controlId="price_yn">
										<Form.Label className="checkbox_label mr-2">Show Price Y/N ?</Form.Label>
										<Form.Control
											type="checkbox"
											name="price_yn"
											checked={this.state.priceisActiveChecked}
											value={(this.state.price_yn) ? this.state.price_yn : ""}
											onChange={this.handleActiveCheckboxChange}
											placeholder="Active ?"
											className="checkbox_input" />
									</Form.Group>
								</Col>

								<Col xs={5}>
									<Form.Group controlId="promt_message_yn">
										<Form.Label className="checkbox_label mr-2">Promt Message Y/N ?</Form.Label>
										<Form.Control
											type="checkbox"
											name="promt_message_yn"
											checked={this.state.promtMessageActiveChecked}
											value={(this.state.promt_message_yn) ? this.state.promt_message_yn : ""}
											onChange={this.handleActiveCheckboxChange}
											placeholder="Promt Message ?"
											className="checkbox_input" />
									</Form.Group>
								</Col>
							</Row>
						</>
					) : ('')}
					<Row>
						<Col>
							<Wysiwyg
								name="prompt_msg"
								onChange={(data) => {
									//this.changePromtMessage(data);
									this.setState({ 'prompt_msg': data });
								}}
								editorLoaded={true}
								value={this.state.prompt_msg}
							/>
						</Col>
					</Row>

					<Form.Group>
						<Row noGutters>
							<Col xs={4}></Col>
							<Col xs={4} className="alignCenter">
								<Button onClick={this.countryHandler} variant="success" type="submit">Save</Button>
								&nbsp;&nbsp;&nbsp;
								<Button variant="secondary" onClick={$props.closeModal}>Close</Button>
							</Col>
							<Col xs={4}></Col>
						</Row>
					</Form.Group>
				</Form>
			</Container>
		);
	}
}

export default AddUpdateCountryManagement;