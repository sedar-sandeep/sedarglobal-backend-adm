import React, { Component } from 'react';
import './Category.scss';
import { Modal, Col, Row, Form, Button, Container } from 'react-bootstrap';
import "react-datepicker/dist/react-datepicker.css";
import Config from '../Config';
import ApiDataService from '../../services/ApiDataService';
const apiUrl = `admin/portal/category`;
const Api_country = 'admin/portal/category/country_lov';


class AddUpdateCategoryImage extends Component {

    constructor(props) {
        super(props);

        this.state = {
            img_sys_id: 0,
            cate_id: props.category_data ? props.category_data.cate_id : 0,
            cate_desc: props.category_data ? props.category_data.cate_desc : '',
            cate_active_yn: 'Y',
            isActiveChecked: true,
            avatar: '',
            old_avatar: '',
            avatar_thumbnail: '',
            old_avatar_thumbnail: '',
            avatar_icon: '',
            old_avatar_icon: '',
            avatar_icon_2: '',
            old_avatar_icon_two: '',
            avatar_mobile_p: '',
            old_avatar_mobile_p: '',
            avatar_mobile_l: '',
            old_avatar_mobile_l: '',
            language_code: props.language_code ? props.language_code : 'en',
            errors: {},
            set: [],
            country_lov: [],
            flaglist: [],
            selectedFlag: [],
            HTTP_PATH: ''
        }

    }


    componentWillMount() {

        ApiDataService.get(Api_country)
            .then(response => {
                this.setState({
                    country_lov: response.data.result
                });
            }).catch(function (error) {
                console.log(error);
                Config.createNotification('warning', error);
            });
    }
    selectFlag = (e, ind, param) => {
        let checkFlagExist = this.state.selectedFlag;
        let checkActive = this.state.set;
        if (checkFlagExist.indexOf(param) != -1) {
            checkFlagExist.splice(checkFlagExist.indexOf(param), 1);
            checkActive[ind] = 'N';
        } else {
            checkFlagExist.push(param);
            checkActive[ind] = ind;
        }
        this.setState({
            set: checkActive,
            selectedFlag: checkFlagExist
        });
        console.log(this.state);
    }
    addCategoryImgFun = (lang) => {
        this.setState({
            img_sys_id: 0,
            HTTP_PATH: '',
            old_avatar: '',
            old_avatar_icon: '',
            old_avatar_icon_two: '',
            old_avatar_mobile_p: '',
            old_avatar_mobile_l: '',
            old_avatar_thumbnail: '',
            cate_active_yn: 'Y',
            isActiveChecked: true,
            set: [],
            selectedFlag: [],
            language_code: lang
        });
    }


    handleLanguageChange(cat_img_id, lang = 'en') {

        let flag = [];
        let setIndex = [];
        let $url = `${apiUrl}/getImageById/${this.state.cate_id}/${cat_img_id}/${lang}`;

        ApiDataService.get($url)
            .then(res => {
                //     console.log(res.data, this.state.country_lov);
                if (res.data.return_status === "0") {
                    let select_countries = res.data.result.SCI_CN_ISO != null ? res.data.result.SCI_CN_ISO.split(',') : [];
                    let countries_list = this.state.country_lov;

                    countries_list.forEach(function (val, key) {
                        select_countries.filter(function (e) {
                            if (e == val.ref_cn_iso) {
                                setIndex[key] = Number(key);
                                flag[key] = val.ref_cn_iso;
                            }
                        });
                    });

                    let http_path = res.data.result.HTTP_PATH;
                    this.setState({
                        img_sys_id: res.data.result.SCI_SYS_ID,
                        cate_desc: res.data.result.SC_DESC,
                        HTTP_PATH: res.data.result.HTTP_PATH,
                        old_avatar: res.data.result.SCI_IMAGE_PATH ? http_path + '/' + res.data.result.SCI_IMAGE_PATH : '',
                        old_avatar_icon: res.data.result.SCI_ICON_PATH_01 ? http_path + '/icon/' + res.data.result.SCI_ICON_PATH_01 : '',
                        old_avatar_icon_two: res.data.result.SCI_ICON_PATH_02 ? http_path + '/icon/' + res.data.result.SCI_ICON_PATH_02 : '',
                        old_avatar_mobile_p: res.data.result.SCI_IMAGE_PATH_04 ? http_path + '/portrait/' + res.data.result.SCI_IMAGE_PATH_04 : '',
                        old_avatar_mobile_l: res.data.result.SCI_IMAGE_PATH_05 ? http_path + '/landscape/' + res.data.result.SCI_IMAGE_PATH_05 : '',
                        old_avatar_thumbnail: res.data.result.SCI_IMAGE_PATH_03 ? http_path + '/thumbnail/' + res.data.result.SCI_IMAGE_PATH_03 : '',
                        cate_active_yn: res.data.result.SCI_ACTIVE_YN,
                        isActiveChecked: res.data.result.SCI_ACTIVE_YN === 'Y' ? true : false,
                        set: setIndex,
                        selectedFlag: flag,
                        language_code: lang
                    });
                } else {
                    Config.createNotification('warning', res.data.error_message);
                }
            }).catch(function (error) {
                if (error) { Config.createNotification('error', error); }
            });
    }

    handleCheckboxChange(isChecked, event) {
        const name = event.target.name;
        var value = event.target.value;
        value = (value === 'Y') ? 'N' : 'Y';
        let checkedAttr = (value === 'Y') ? 'checked' : '';

        this.setState({
            [name]: value,
            [isChecked]: checkedAttr,

        });
    }



    onFileChangeHandler(preview_type, e) {
        //alert(e.target.name);
        //alert(preview_type)
        this.setState({
            [e.target.name]: e.target.files[0],
            [preview_type]: URL.createObjectURL(e.target.files[0])
        });
        //alert(this.state.preview_type)
    }



    categoryHandler = event => {
        event.preventDefault();
        if (this.validateForm()) {
            const lang = this.state.language_code;
            const fmData = new FormData();

            fmData.append('cate_active_yn', this.state.cate_active_yn);

            fmData.append('lang_code', lang);
            let $cateId = this.state.cate_id;
            fmData.append('cate_id', $cateId);
            fmData.append('old_avatar', this.state.old_avatar);
            fmData.append('avatar', this.state.avatar);

            fmData.append('old_avatar_icon', this.state.old_avatar_icon);
            fmData.append('avatar_icon', this.state.avatar_icon);
            fmData.append('old_avatar_icon_two', this.state.old_avatar_icon_two);
            fmData.append('avatar_icon_2', this.state.avatar_icon_2);
            fmData.append('old_avatar_mobile_p', this.state.old_avatar_mobile_p);
            fmData.append('avatar_mobile_P', this.state.avatar_mobile_p);
            fmData.append('old_avatar_mobile_l', this.state.old_avatar_mobile_l);
            fmData.append('avatar_mobile_L', this.state.avatar_mobile_l);
            fmData.append('old_avatar_thumbnail', this.state.old_avatar_thumbnail);
            fmData.append('avatar_thumbnail', this.state.avatar_thumbnail);
            fmData.append('applicable_countries', this.state.selectedFlag);


            let $url = `${apiUrl}/imagesInsertUpdate/${this.state.cate_id}`;

            if (this.state.img_sys_id && this.state.img_sys_id > 0 && lang === 'en') {
                $url = `${apiUrl}/imagesInsertUpdate/${this.state.cate_id}/${this.state.img_sys_id}`;
            } else if (this.state.img_sys_id && this.state.img_sys_id > 0 && lang === 'ar') {
                $url = `${apiUrl}/imagesInsertUpdateLang/${this.state.cate_id}/${this.state.img_sys_id}`;
            }


            ApiDataService.post($url, fmData)
                .then(res => {

                    console.log(res.data, 'sdasdas');
                    if (res.data.return_status == "0") {
                        Config.createNotification('success', 'Category successfully added');

                        //  Config.createNotification('refresh', '');
                        this.props.renderTable();
                        this.props.showHideFun(false);

                    } else {
                        // var obj = res.data.result;
                        Config.createNotification('error', res.data.error_message);

                    }
                }).catch(function (error) {
                    //console.log(error.mesage,error, 'error');
                    if (error) { Config.createNotification('error', error); }
                });
        }
    }




    validateForm = () => {
        let errors = {}
        let formIsValid = true;

        if (!this.state.cate_desc) {
            formIsValid = false
            errors['cate_desc'] = '*Please enter category title'
        }
        this.setState({ errors });
        return formIsValid;
    }

    render() {
        let $props = this.props;
        let poputSize = 'lg';
        const theis = this;
        const { set } = this.state;
        return (
            <>
                <Modal animation={false} size={poputSize} id="categoryModal" show={$props.isOpen} onHide={() => $props.showHideFun(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Image</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>

                        <Container className="themed-container" fluid="true">

                            <Form>
                                <Row noGutters>

                                    <Col xs={9}>
                                        <Form.Group controlId="cate_desc">
                                            <Form.Label>Category Title</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="cate_desc"
                                                value={this.state.cate_desc}
                                                onChange={() => { console.log(this.state.cate_desc) }}
                                                readOnly={true}
                                            />
                                        </Form.Group>
                                        <div className='errorMsg'>{this.state.errors && this.state.errors.cate_desc}</div>
                                    </Col>
                                    <Col className={this.state.language_code == 'ar' ? 'd-none' : ''} style={{ padding: '15px', marginTop: '15px' }}>
                                        <Form.Group controlId="cate_active_yn">
                                            <Form.Check
                                                type="checkbox"
                                                value={(this.state.cate_active_yn) ? this.state.cate_active_yn : ''}
                                                name="cate_active_yn"
                                                checked={this.state.isActiveChecked}
                                                onChange={this.handleCheckboxChange.bind(this, 'isActiveChecked')}
                                                id="cate_active_yn"
                                                label="Active ?"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>


                                <Row noGutters>
                                    <Col>
                                        <Form.Group controlId="avatar">
                                            <Form.Control
                                                type="file"
                                                name="avatar"
                                                style={{ display: 'none' }}
                                                onChange={this.onFileChangeHandler.bind(this, 'old_avatar')}
                                                placeholder="Category Banner"
                                                ref={fileInput => this.fileInput = fileInput}
                                            />
                                            &nbsp;
                                            <Button onClick={() => this.fileInput.click()} variant="info">Upload</Button>
                                            &nbsp;
                                            <Form.Label>Banner</Form.Label>
                                        </Form.Group>
                                        <div className='errorMsg'>{this.state.errors.avatar}</div>
                                    </Col>
                                    {(this.state.old_avatar) &&
                                        <Col>
                                            <img src={this.state.old_avatar} width={'100%'} alt={this.state.cate_desc} />
                                        </Col>
                                    }
                                </Row>

                                <Row noGutters>
                                    <Col>
                                        <Form.Group controlId="avatar_icon">
                                            <Form.Control
                                                type="file"
                                                name="avatar_icon"
                                                style={{ display: 'none' }}
                                                onChange={this.onFileChangeHandler.bind(this, 'old_avatar_icon')}
                                                placeholder="Category Icon"
                                                ref={fileInputAvatarIcon => this.fileInputAvatarIcon = fileInputAvatarIcon}
                                            />
                                            &nbsp;
                                            <Button onClick={() => this.fileInputAvatarIcon.click()} variant="info">Upload</Button>
                                            &nbsp;
                                            <Form.Label>Icon</Form.Label>
                                        </Form.Group>
                                        <div className='errorMsg'>{this.state.errors.avatar_icon}</div>
                                    </Col>
                                    {(this.state.old_avatar_icon) &&
                                        <Col>
                                            <img src={this.state.old_avatar_icon} width={80} height={80} alt={this.state.cate_desc} />
                                        </Col>
                                    }
                                </Row>
                                <Row noGutters>
                                    <Col>
                                        <Form.Group controlId="avatar_icon_2">
                                            <Form.Control
                                                type="file"
                                                name="avatar_icon_2"
                                                style={{ display: 'none' }}
                                                onChange={this.onFileChangeHandler.bind(this, 'old_avatar_icon_two')}
                                                placeholder="Category Icon 2"
                                                ref={fileInputAvatarIcon2 => this.fileInputAvatarIcon2 = fileInputAvatarIcon2}
                                            />
                                            &nbsp;
                                            <Button onClick={() => this.fileInputAvatarIcon2.click()} variant="info">Upload</Button>
                                            &nbsp;
                                            <Form.Label>Icon 2</Form.Label>
                                        </Form.Group>
                                        <div className='errorMsg'>{this.state.errors.avatar_icon_2}</div>
                                    </Col>
                                    {(this.state.old_avatar_icon_two) &&
                                        <Col>
                                            <img src={this.state.old_avatar_icon_two} width={80} height={80} alt={this.state.cate_desc} />
                                        </Col>
                                    }
                                </Row>
                                <Row noGutters>
                                    <Col>
                                        <Form.Group controlId="avatar_mobile_p">
                                            <Form.Control
                                                type="file"
                                                name="avatar_mobile_p"
                                                style={{ display: 'none' }}
                                                onChange={this.onFileChangeHandler.bind(this, 'old_avatar_mobile_p')}
                                                placeholder="Category Mobile Portrait"
                                                ref={fileInputAvatarMobileP => this.fileInputAvatarMobileP = fileInputAvatarMobileP}
                                            />
                                            &nbsp;
                                            <Button onClick={() => this.fileInputAvatarMobileP.click()} variant="info">Upload</Button>
                                            &nbsp;
                                            <Form.Label>Mobile Portrait</Form.Label>
                                        </Form.Group>

                                        <div className='errorMsg'>{this.state.errors.avatar_mobile_p}</div>
                                    </Col>
                                    {(this.state.old_avatar_mobile_p) &&
                                        <Col>
                                            <img src={this.state.old_avatar_mobile_p} width={80} height={80} alt={this.state.cate_desc} />
                                        </Col>
                                    }
                                </Row>

                                <Row noGutters>
                                    <Col>
                                        <Form.Group controlId="avatar_mobile_l">

                                            <Form.Control
                                                type="file"
                                                name="avatar_mobile_l"
                                                style={{ display: 'none' }}
                                                onChange={this.onFileChangeHandler.bind(this, 'old_avatar_mobile_l')}
                                                placeholder="Category Mobile Landscape"
                                                ref={fileInputAvatarMobileL => this.fileInputAvatarMobileL = fileInputAvatarMobileL}
                                            />
                                            &nbsp;
                                            <Button onClick={() => this.fileInputAvatarMobileL.click()} variant="info">Upload</Button>
                                            &nbsp;
                                            <Form.Label>Mobile Landscape</Form.Label>
                                        </Form.Group>

                                        <div className='errorMsg'>{this.state.errors.avatar_mobile_l}</div>
                                    </Col>
                                    {(this.state.old_avatar_mobile_l) &&
                                        <Col>
                                            <img src={this.state.old_avatar_mobile_l} width={80} height={80} alt={this.state.cate_desc} />
                                        </Col>
                                    }
                                </Row>

                                <Row noGutters>
                                    <Col>
                                        <Form.Group controlId="avatar_thumbnail">
                                            <Form.Control
                                                type="file"
                                                name="avatar_thumbnail"
                                                style={{ display: 'none' }}
                                                onChange={this.onFileChangeHandler.bind(this, 'old_avatar_thumbnail')}
                                                placeholder="Category Thumbnail"
                                                ref={fileInputAvatarThumbnail => this.fileInputAvatarThumbnail = fileInputAvatarThumbnail}
                                            />
                                            &nbsp;
                                            <Button onClick={() => this.fileInputAvatarThumbnail.click()} variant="info">Upload</Button>
                                            &nbsp;
                                            <Form.Label>Thumbnail</Form.Label>
                                        </Form.Group>
                                        <div className='errorMsg'>{this.state.errors.avatar_thumbnail}</div>
                                    </Col>
                                    {(this.state.old_avatar_thumbnail) &&
                                        <Col>
                                            <img src={this.state.old_avatar_thumbnail} width={80} height={80} alt={this.state.cate_desc} />
                                        </Col>
                                    }
                                </Row>


                                <Row className={this.state.language_code == 'ar' ? 'd-none' : ''}>
                                    <Col className="mb-4">
                                        <div className="countryParent">
                                            {this.state.country_lov.map(function (data, index) {
                                                return (
                                                    <div title={data.code} key={index} onClick={(e) => theis.selectFlag(e, index, data.ref_cn_iso)} className={`countryFlag ${set != '' ? set[index] === index ? 'activeFlag' : '' : ''}`}>
                                                        <img alt={data.code} src={data.image_path} />
                                                        <span className="flagName"> {data.code}</span>
                                                    </div>
                                                )
                                            })
                                            }
                                        </div>
                                    </Col>
                                </Row>

                                {$props.btnType != 'view' && (
                                    <Form.Group>
                                        <Form.Control type="hidden" name="cate_id" value={this.state.cate_id} />
                                        <Form.Control type="hidden" name="old_avatar" value={this.state.old_avatar} />
                                        <Row noGutters>
                                            <Col xs={4}></Col>
                                            <Col xs={4} className="alignCenter">
                                                <Button onClick={this.categoryHandler} variant={this.state.img_sys_id && this.state.img_sys_id > 0 ? 'info' : 'success'} type="submit">{this.state.img_sys_id && this.state.img_sys_id > 0 ? 'Update' : 'Save'}</Button>
                                                &nbsp;&nbsp;&nbsp;
                                                <Button variant="secondary" onClick={() => $props.showHideFun(false)}>Close</Button>
                                            </Col>
                                            <Col xs={4}></Col>
                                        </Row>
                                    </Form.Group>
                                )}
                            </Form>
                        </Container>
                    </Modal.Body>
                </Modal>
            </>
        );
    }
}

export default AddUpdateCategoryImage;