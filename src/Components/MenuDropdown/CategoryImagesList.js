import React from 'react';
import './Category.scss';
import { Dropdown, DropdownButton, OverlayTrigger, Tooltip } from 'react-bootstrap';
import ServerTable from '../../services/server-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faCog, faPlus, faLanguage, faEye } from '@fortawesome/free-solid-svg-icons';
import AccessSecurity from '../../AccessSecurity';
import AddUpdateCategoryImage from './AddUpdateCategoryImage';
import { ConfirmationDialog, SnapBarError } from "../../ConfirmationDialog";
import Config from '../Config';
import ApiDataService from '../../services/ApiDataService';
const apiUrl = `admin/portal/category`;

const PER_PAGE = process.env.REACT_APP_PER_PAGE;

class CategoryImagesList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			renderTable: false,
			deletedialog: false,
			deletesysid: false,
			page: 1,
			security: '',
			category_id: props.category_id ? props.category_id : 0,
			image_form_isOpen: false,
			category_data: props.category_data ? props.category_data : [],
			cat_img_data: []
		};
		this.modalRef = React.createRef();
	}

	securityAccess = (param) => {
		this.setState({
			security: param
		});
	}
	renderTable = () => {
		this.setState({
			renderTable: true
		}, () => {
			this.setState({ renderTable: false });
		});
	}

	showHideFun = (type) => {
		this.setState({
			image_form_isOpen: type,
			cat_img_data: []
		});

		if (type) {
			this.modalRef.current.addCategoryImgFun('en');
		}
	}
	editCategoryImgFun = (data, lang) => {
		this.setState({
			image_form_isOpen: true,
			cat_img_data: data
		})
		this.modalRef.current.handleLanguageChange(data.SCI_SYS_ID, lang);
	}
	deleteCategoryImgFun = (data) => {
		this.setState({ deletedialog: true, deletesysid: data.SCI_SYS_ID });
	}
	closedialog = () => {
		this.setState({ deletedialog: false });
	}
	proceedDelete = (params) => {
		let sysid = this.state.deletesysid;
		if (params && sysid && sysid > 0) {

			ApiDataService.delete(`${apiUrl}/imagesDelete/`, sysid+'/en').then(response => {
				if (response.data.return_status !== "0") {
					if (response.data.error_message === 'Error') {
						Config.createNotification('error', response.data.result);
					} else {
						Config.createNotification('warning', response.data.error_message);
					}
				} else {
					Config.createNotification('success', response.data.error_message);
					this.renderTable();
				}
				this.closedialog();
			}).catch((error) => {
				Config.createNotification('error', error.message);
				this.closedialog();
			});
		} else {
			console.log('here111...');
		}
	}


	render() {
		let self = this;
		const url = `admin/portal/category/imagesListing/${this.state.category_id}`;
		const columns = ['sr_no', 'SC_DESC', 'SCI_CN_ISO', 'SCI_IMAGE_PATH', 'SCI_IMAGE_PATH_03', 'SCI_ICON_PATH_01', 'SCI_ACTIVE_YN', 'actions'];
		let propsObj = self.props;
		let $button = (<OverlayTrigger overlay={<Tooltip id="tooltip">Add Category Image</Tooltip>}>
			<span className="d-inline-block">
				<button disabled={self.state.security.INSERT_YN !== 'Y' ? true : false} className="btn btn-primary form-control-sm" onClick={() => this.showHideFun(true)}>{<FontAwesomeIcon icon={faPlus} />}</button>
			</span>
		</OverlayTrigger>);
		const options = {
			perPage: PER_PAGE,
			headings: {
				sr_no: '#',
				SC_DESC: 'Desc',
				SCI_CN_ISO: 'Countries',
				SCI_IMAGE_PATH: 'Banner',
				SCI_IMAGE_PATH_03: 'Thumbnail',
				SCI_ICON_PATH_01: 'Icon',
				SCI_ACTIVE_YN: 'Active?',
			},
			search_key: {
				SCI_CN_ISO: 'Applicable Countries',
				SCI_ACTIVE_YN: 'Active?',
			},
			//	sortable: ['cate_desc', 'cate_parent_desc', 'cate_parent_yn', 'cate_from_date'],
			columnsWidth: { sr_no: 5, cate_desc: 30, cate_parent_desc: 30 },
			//	columnsAlign: {sr_no: 'left', cate_desc: 'left', cate_parent_desc: 'left', cate_image_path: 'center', cate_from_date: 'center', cate_upto_date: 'center', actions: 'center'},
			//requestParametersNames: {search_value: 'search_value', search_column: 'search_column', direction: 'order'},
			responseAdapter: function (resp_data) {
				//console.log('resp_data',resp_data.page);
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
				<ConfirmationDialog
					dialogopen={this.state.deletedialog}
					dialogclose={this.closedialog}
					agreeProcess={this.proceedDelete}
				/>
				<AccessSecurity accessecurity={this.securityAccess} />
				<ServerTable renderView={this.state.renderTable} columns={columns} url={url} options={options} addme={$button} bordered hover updateUrl hist_table="SITE_M_CATEGORY_HIST">
					{
						function (row, column, index) {
							switch (column) {
								case 'sr_no':
									return (
										(index + 1) + (PER_PAGE * ((self.state.page) - 1))
									);
								case 'SCI_IMAGE_PATH':
									return (
										row.SCI_IMAGE_PATH && <img src={row.HTTP_PATH + '/' + row.SCI_IMAGE_PATH} width="120" className="table-image" alt={row.SCI_IMAGE_PATH} />
									);
								case 'SCI_IMAGE_PATH_03':
									return (
										row.SCI_IMAGE_PATH_03 && <img src={row.HTTP_PATH + '/thumbnail/' + row.SCI_IMAGE_PATH_03} width="100" className="table-image" alt={row.SCI_IMAGE_PATH} />
									);
								case 'SCI_ICON_PATH_01':
									return (
										row.SCI_ICON_PATH_01 && <img src={row.HTTP_PATH + '/icon/' + row.SCI_ICON_PATH_01} width="60" className="table-image" alt={row.SCI_ICON_PATH_01} />
									);
								case 'actions':
									return (
										<div className="form-control-sm" style={{ textAlign: 'center' }}>
											<DropdownButton id="dropdown-basic-button" title={<FontAwesomeIcon icon={faCog} />}>
												<Dropdown.Item disabled={self.state.security.UPDATE_YN !== 'Y' ? true : false} onClick={() => self.editCategoryImgFun(row, 'en')}><FontAwesomeIcon icon={faEdit} /> Edit</Dropdown.Item>
												<Dropdown.Item disabled={self.state.security.LANGUAGE_YN !== 'Y' ? true : false} onClick={() => self.editCategoryImgFun(row, 'ar')}><FontAwesomeIcon icon={faLanguage} /> Edit Language</Dropdown.Item>
												<Dropdown.Item disabled={self.state.security.LANGUAGE_YN !== 'Y' ? true : false} onClick={() => self.deleteCategoryImgFun(row)}><FontAwesomeIcon icon={faTrash} /> Delete</Dropdown.Item>
											</DropdownButton>
										</div>
									);
								default:
									return (row[column]);
							}
						}
					}
				</ServerTable>
				<AddUpdateCategoryImage
					ref={this.modalRef}
					renderTable={this.renderTable}
					category_data={propsObj.category_data}
					showHideFun={this.showHideFun}
					isOpen={this.state.image_form_isOpen}
					cat_img_data={this.state.cat_img_data}
				/>
			</>
		);
	}
}

export default CategoryImagesList;