import React, { Component } from 'react';
import './SeoManagement.scss';
import AddUpdateSeoManagement from './AddUpdateSeoManagement';
import Config from '../Config'
import ApiDataService from '../../services/ApiDataService';
import { Dropdown, DropdownButton, OverlayTrigger, Tooltip, Button } from 'react-bootstrap';
import { ConfirmationDialog, SnapBarError } from "../../ConfirmationDialog";
import ServerTable from '../../services/server-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faChartLine, faTrash, faCog, faPlus, faLanguage } from '@fortawesome/free-solid-svg-icons';
import AccessSecurity from '../../AccessSecurity';

const PER_PAGE = process.env.REACT_APP_PER_PAGE;

const apiUrl = `admin/portal/`;


class SeoManagement extends Component {
	constructor(props) {
		super(props);
		//alert(props.isSeoOpen)
		this._isMounted = true;
		this.state = {
			error: null,
			seo_sys_id: null,
			response: {},
			security: '',
			page: 1,
			seoEditData: [],
			optionListRenderTable: false,
			snapopen: false,
			snapcolor: null,
			deletedialog: false,
			showHide: false
		};
		this.onFormSubmit = this.onFormSubmit.bind(this);
		this.modalRef = React.createRef();

		console.log(props, 'props..', props.seoFor);
	}
	securityAccess = (param) => {
		this.setState({
			security: param
		});
	}
	optionListRenderTableFun = () => {
		this.setState({
			optionListRenderTable: true
		}, () => {
			this.setState({ optionListRenderTable: false });
		});
	}
	snapclose = () => {
		this.setState({ snapopen: false });
	};

	deletRecord = (id) => {
		this.setState({ deletedialog: true, seo_sys_id: id });
	}
	closedialog = () => {
		this.setState({ deletedialog: false });
	}
	proceedDelete = (params) => {
		if (params) {
			this.deleteSeoRecord(this.state.seo_sys_id);
		}
	}

	editSeoFun = (data, lang) => {
		this.modalRef.current.editModalRecord(data, lang);
	}

	addSeoFun = (lang) => {
		this.modalRef.current.addSeoFun(lang);
	}


	// componentDidMount(){}
	componentWillUnmount() {
		this._isMounted = false;
	}



	updateDeleteSeoFlag() {
		if (this._isMounted) {
			this.setState({
				isDeleteSeo: false
			});
		}
	}

	onFormSubmit(data, seoId, forSeo, language) {

		let $url = (seoId) ? `${apiUrl}${forSeo}/seo/update/${seoId}` : `${apiUrl}${forSeo}/seo`;

		let msgType = (seoId) ? 'updated' : 'added';
		ApiDataService.post($url, data, language)
			.then(res => {
				if (res.data.return_status === "0") {
					Config.createNotification('success', 'Seo data successfully ' + msgType + ' for ' + forSeo + '.');
					if (this._isMounted) {
						this.setState({
							response: res.data
						});
					}
					//this.props.closeModal();
					this.optionListRenderTableFun();
				} else {
					var obj = res.data.result;
					console.log('obj', obj.seo_parent_id);
					if (obj) {
						if (obj.seo_ref_id) { Config.createNotification('warning', obj.seo_ref_id); }
						if (obj.seo_meta_title) { Config.createNotification('warning', obj.seo_meta_title); }
						if (obj.seo_meta_tag) { Config.createNotification('warning', obj.seo_meta_tag); }

						if (obj.seo_meta_key_words) { Config.createNotification('warning', obj.seo_meta_key_words); }

						if (obj.seo_meta_desc) { Config.createNotification('warning', obj.seo_meta_desc); }
						if (obj.avatar) { Config.createNotification('warning', obj.avatar); }
						if (obj.seo_og_title) { Config.createNotification('warning', obj.seo_og_title); }
						if (obj.seo_og_tag) { Config.createNotification('warning', obj.seo_og_tag); }

						if (obj.seo_og_key_words) { Config.createNotification('warning', obj.seo_og_key_words); }
						if (obj.seo_og_desc) { Config.createNotification('warning', obj.seo_og_desc); }
						if (obj.seo_og_image_width) { Config.createNotification('warning', obj.seo_og_image_width); }
						if (obj.seo_og_image_height) { Config.createNotification('warning', obj.seo_og_image_height); }
						if (obj.seo_twitter_title) { Config.createNotification('warning', obj.seo_twitter_title); }
						if (obj.seo_twitter_desc) { Config.createNotification('warning', obj.seo_twitter_desc); }

						if (obj.seo_twitter_card) { Config.createNotification('warning', obj.seo_twitter_card); }
						if (obj.seo_twitter_site) { Config.createNotification('warning', obj.seo_twitter_site); }
						if (obj.seo_active_yn) { Config.createNotification('warning', obj.seo_active_yn); }

					} else {
						if (res.data.error_message) { Config.createNotification('error', res.data.error_message); }
					}
				}
			}).catch(function (error) {
				if (error) { Config.createNotification('error', error); }
			});
	}


	editLanguageSEO = (seo_id, language) => {

		const $edit_url = `admin/portal/${this.props.seoFor}/seo/${seo_id}/edit`;

		ApiDataService.get($edit_url, language).then(res => {
			let res_data = res.data;
			if (res_data.return_status == '0' && res_data.error_message == 'Success' && res_data.result) {
				this.modalRef.current.editModalRecord(res_data.result[0], language);
			} else {
				console.log('error', res_data)
			}
			console.log(res_data, 'res');
		}).catch(function (error) {
			if (error) { console.log('error', error); }
		})
	}

	deleteSeoRecord = (seoId) => {
		//alert(seoId)
		let $url = `${apiUrl}${this.props.seoFor}/seo/`;
		ApiDataService.delete($url, seoId)
			.then(res => {
				if (res.data.return_status === "0") {
					Config.createNotification('success', 'Seo record successfully deleted for ' + this.props.seoFor + '.');
					//this.props.closeModal();
					this.optionListRenderTableFun();
					this.closedialog();
				} else {
					Config.createNotification('warning', res.data.error_message);
				}
			}).catch(function (error) {
				if (error) { Config.createNotification('error', error); }
			});
	}

	funcShowHide = () => {
		this.setState({ showHide: !this.state.showHide });
	};

	render() {
		let $props = this.props;

		let self = this;
		const url_list = `admin/portal/${this.props.seoFor}/seo/${$props.refSysId}`;
		const columns = ['sr_no', 'seo_meta_title', 'seo_page_name', 'seo_country', 'lang_yn', 'seo_active_yn', 'actions'];

		let $button = (<OverlayTrigger overlay={<Tooltip id="tooltip">SEO</Tooltip>}>
			<span className="d-inline-block">
				{/* disabled={self.state.security.INSERT_YN !== 'Y' ? true : false} */}
				<button className="btn btn-primary form-control-sm" onClick={() => self.addSeoFun('en')}><FontAwesomeIcon icon={faPlus} /></button>
			</span>
		</OverlayTrigger>);
		const options = {
			perPage: PER_PAGE,
			headings: {
				sr_no: '#',
				seo_meta_title: 'SEO Title',
				seo_page_name: 'SEO Page Name',
				seo_country: 'Applicable Countries',
				lang_yn: 'Status',
				seo_active_yn: 'Active YN',
			},
			search_key: {
				seo_meta_title: 'SEO Title',
				seo_country: 'Applicable Countries',
				seo_active_yn: 'Active YN'
			},

			responseAdapter: function (resp_data) {
				self.setState({ page: resp_data.page });
				return { data: resp_data.result, total: resp_data.row_count }
			},
			texts: {
				//show: 'عرض'
				show: ''
			},
			search_lov: {
				pages: []
			}
		};



		return (
			<>
				<AccessSecurity accessecurity={this.securityAccess} />

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
				
				
				<hr></hr>
				<ServerTable renderView={this.state.optionListRenderTable} columns={columns} url={url_list} options={options} addme={$button} bordered hover updateUrl hist_table="SITE_M_SEO_HIST">
					{
						function (row, column, index) {
							switch (column) {
								case 'sr_no':
									return (
										(index + 1) + (PER_PAGE * ((self.state.page) - 1))
									);
								case 'seo_active_yn':
									return (
										<div style={{ textAlign: 'center' }}>
											<button className="btn btn-primary form-control-sm">{row.seo_active_yn}</button>
										</div>
									);
								case 'lang_yn':
									if (row.lang_yn == 'N') {
										let langName = '';
										if (row.lang_code == 'ar') {
											langName = 'Arabic';
										} else if (row.lang_code == 'ru') {
											langName = 'Russian';
										}
										
										return (
											<div className="btn btn-danger col-12">
												<span style={{ fontSize: '11px' }}> {langName} SEO content dose not exists <br /> <span onClick={() => self.editLanguageSEO(row.seo_id, 'ar')}> Add {langName} SEO</span></span>
											</div>
										);
									} else {
										let langNameEN = '';
										if (row.lang_code == 'ar') {
											langNameEN = 'Arabic';
										} else if (row.lang_code == 'ru') {
											langNameEN = 'Russian';
										} else {
											langNameEN = 'English';
										}
										return (
											<div className="btn btn-success col-12">
												<span style={{ fontSize: '11px' }}>{langNameEN} SEO exists</span>
											</div>
										);
									}

								case 'actions':
									return (
										<div className="form-control-sm" style={{ textAlign: 'center' }}>
											<DropdownButton id="dropdown-basic-button" title={<FontAwesomeIcon icon={faCog} />}>
												{/* disabled={self.state.security.UPDATE_YN !== 'Y' ? true : false} */}
												{/* disabled={self.state.security.LANGUAGE_YN !== 'Y' ? true : false} */}
												<Dropdown.Item onClick={() => { row.lang_code == 'en' ? self.editSeoFun(row, 'en') : self.editLanguageSEO(row.seo_id, 'ar') }}><FontAwesomeIcon icon={faEdit} /> Edit</Dropdown.Item>
												{row.lang_yn == 'N' ? (<Dropdown.Item onClick={() => self.editLanguageSEO(row.seo_id, 'ar')}><FontAwesomeIcon icon={faLanguage} /> Edit Language</Dropdown.Item>) : ''}
												<Dropdown.Item onClick={() => self.deletRecord(row.seo_id)}><FontAwesomeIcon icon={faTrash} /> Delete</Dropdown.Item>
											</DropdownButton>
										</div>
									);
								default:
									return (row[column]);
							}
						}
					}
				</ServerTable>
				<hr></hr>
				<AddUpdateSeoManagement
					ref={this.modalRef}
					onFormSubmit={this.onFormSubmit}
					closeModal={$props.closeModal}
					seoEditData={self.state.seoEditData}
					refSysId={$props.refSysId}
					seoFor={$props.seoFor}
				/>	


			</>
		);

	}
}

export default SeoManagement;