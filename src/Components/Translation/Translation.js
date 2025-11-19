import React, { useState, useEffect } from 'react';
import AsyncSelect from 'react-select/async';
import { Col, Form, Row, Modal, Card, Spinner, Tabs, Tab, Button, Table, Collapse } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faCog, faTrash, faPlus, faEye } from '@fortawesome/free-solid-svg-icons';
import { Editor } from "react-draft-wysiwyg";
import { EditorState, ContentState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import { WindowPanel } from "../../WindowPanel";
import ApiDataService from '../../services/ApiDataService';
import { SnapBarError } from "../../ConfirmationDialog";
import Wysiwyg from "../../Plugin/Wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { compose } from 'redux';


const url = `${process.env.REACT_APP_SERVER_URL}admin/portal/translation/page_lov`;
const langurl = `${process.env.REACT_APP_SERVER_URL}admin/portal/translation/lang/lov`;
const bulkoption = `${process.env.REACT_APP_SERVER_URL}admin/portal/translation/bulkoption`;
const pageurl = `${process.env.REACT_APP_SERVER_URL}admin/portal/translation/index`;
const limit = 20;


const Translation = () => {
  const [val, setValue] = useState('');
  const [lang, setLang] = useState('en');
  const [pageData, setPageData] = useState([]);
  const [langPageData, setLangPageData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editorStatesView, setEditorViewStates] = useState([]);
  const [editorStates, setEditorStates] = useState([]);
  let [page_no, setPageNo] = useState(1);
  let [searchVal, setSearchVal] = useState('');
  let [totalPage, setTotalPage] = useState(1);
  const [snap, setSnap] = useState({
    error: '',
    snapopen: false,
    snapcolor: '',
  });

  const [state, setState] = useState([]);
  const [arState, setArState] = useState([]);
  const [enState, setEnState] = useState([]);
  const [isLoadMore, setIsLoadMore] = useState(false);



  const loadOptions = async (val) => {
    const itemFetch = await ApiDataService.get(`${url}?search=${val}`)
      .then(response => {
        return response.data.result;
      });
    return itemFetch;
  };

  const loadLanguage = async () => {
    const itemFetch = await ApiDataService.get(`${langurl}`)
      .then(response => {
        return response.data.result;
      });
    return itemFetch;
  };

  const loadPageData = async (lang, current_page = 1, search = searchVal) => {


    let url = `${pageurl}?page=${val.value}&lang=${lang}&page_no=${current_page}&limit=${limit}&search=${search}`;
    //console.log(val, lang, 'loadPageData', url);

    if (val.value && lang && lang != 'en') {
      setLoading(true);
      setPageNo(parseInt(current_page));
      setState([]);
      setArState([]);
      setEnState([]);
      setEditorStates([]);
      setEditorViewStates([]);

      ApiDataService.get(url).then(response => {

        setLoading(false);
        setIsLoadMore(false);

        let result = response.data.result;
        setArState([]);
        setEnState([]);

        if (result && result.lang_data && result.en_data && result.en_data.result && result.en_data.count) {

          setLangPageData(result.lang_data.result);
          setPageData(result.en_data.result);

          if (parseInt(result.en_data.count) >= limit) {
            let page_count = parseInt(result.en_data.count) / (limit);
            setTotalPage(Math.ceil(page_count));
          } else {
            setTotalPage(1);
          }
        }
      });
    }

  }


  useEffect(() => {
    if (val) {
      setEditorViewStates([]);
      setEditorStates([]);
      setState([]);
      setArState([]);
      setEnState([]);
      setPageNo(1);
      setLang('en');
      setSearchVal('');
    }
  }, [val]);
  useEffect(() => {
    if (lang != 'en') {
      setLoading(true);
      setEditorStates([]);
      setState([]);
      setArState([]);
      setEnState([]);
      setPageNo(1);
      loadPageData(lang.code);

    }
  }, [lang]);

  const handleInputChange = (e) => {
    const { dataset: { key }, value, name } = e.target;
    setState(prevState => ({
      ...prevState,
      [key]: { ...prevState[key], [name]: value }
    }));
  };

  const handleSubmit = (column_type, column_value, shp_id, hp_parent_id = '') => {
    //console.log(column_type, column_value, shp_id, hp_parent_id, lang.code);

    const url = `admin/portal/translation/update/${shp_id}?lang=${lang.code}`;
    var formData = new FormData();
    formData.append('column_type', column_type);
    formData.append('sys_id', shp_id);
    formData.append('column_value', column_value);
    formData.append('parent_id', hp_parent_id);
    //formData.append('state', JSON.stringify(state));

    ApiDataService.update(url, formData).then(response => {
      if (response.data.return_status !== "0") {
        if (response.data.error_message === 'Error') {
          setSnap({ error: response.data.result, snapopen: true, snapcolor: '#ff4c4ceb' });
        } else {
          setSnap({ error: response.data.error_message, snapopen: true, snapcolor: '#ff4c4ceb' });
        }
      } else {
        setSnap({ error: response.data.error_message, snapopen: true, snapcolor: '#20bb20eb' });
      }
    }).catch((error) => {
      console.log(error);
      setSnap({ error: error.message, snapopen: true, snapcolor: '#ff4c4ceb' });
    });
  }

  const snapclose = () => {
    setSnap({ snapopen: false });
  }


  useEffect(() => {
    if (langPageData.length > 0) {

      langPageData.length > 0 && langPageData.map((row, i) => {
        const { hp_desc, hp_html, hp_link_url, hp_slug_url, hp_link_title } = row; // Adjust this based on your data structure
        let newRowObject = {
          desc: hp_desc,
          html: hp_html,
          link_url: hp_link_url,
          slug_url: hp_slug_url,
          link_title: hp_link_title,
          ...row
        };

        setState(prevStateArray => [...prevStateArray, newRowObject]);
        setArState(prevStateArray => [...prevStateArray, newRowObject]);

        setEditorStates(prevEditorStates => [...prevEditorStates, hp_html]);

        /* if (hp_html) {
           const contentBlock = htmlToDraft(hp_html);
           if (contentBlock) {
             const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
             const editorState = EditorState.createWithContent(contentState);
             setEditorStates(prevEditorStates => [...prevEditorStates, editorState]);
           } else {
             setEditorStates(prevEditorStates => [...prevEditorStates, EditorState.createEmpty()]);
           }
         } else {
           setEditorStates(prevEditorStates => [...prevEditorStates, EditorState.createEmpty()]);
         }*/

      });
      // console.log(state);
    }
  }, [langPageData]);

  useEffect(() => {
    if (pageData.length > 0) {

      pageData.length > 0 && pageData.map((row, i) => {
        /*  const { hp_desc, hp_html, hp_link_url, hp_slug_url, hp_link_title } = row; // Adjust this based on your data structure
          // let newEnRowObject = {
          //   desc: hp_desc,
          //   html: hp_html,
          //   link_url: hp_link_url,
          //   slug_url: hp_slug_url,
          //   link_title: hp_link_title,
  
          // };*/

        setEnState(prevStateArray => [...prevStateArray, row]);

        /*  if (hp_html) {
            const contentBlock = htmlToDraft(hp_html);
            if (contentBlock) {
              const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
              const editorStat = EditorState.createWithContent(contentState);
              setEditorViewStates(prevEditorStates => [...prevEditorStates, editorStat]);
            } else {
              setEditorViewStates(prevEditorStates => [...prevEditorStates, EditorState.createEmpty()]);
            }
          } else {
            setEditorViewStates(prevEditorStates => [...prevEditorStates, EditorState.createEmpty()]);
          }
  */
      });
    }
  }, [pageData]);


  const onEditorStateChange = (editorState, i) => {
    const newEditorStates = [...editorStates];
    newEditorStates[i] = editorState;
    setEditorStates(newEditorStates);
  };

  function countWords(str) {
    if (str && str.length > 0) {
      var matches = str.trim().match(/\S+/g);
      return matches ? matches.length : 0;
    } else {
      return 0;
    }
  }

  const totalWordCount = () => {
    let word_cont = 0;

    enState.length > 0 && enState.map((row, i) => {
      let { hp_desc, hp_html, hp_link_title } = row;
      word_cont += countWords(hp_desc) + countWords(hp_link_title) + countWords(hp_html)
    });
    return word_cont;

  }

  return (
    <>
      <SnapBarError
        message={snap.error}
        snapopen={snap.snapopen}
        snapcolor={snap.snapcolor}
        snapclose={snapclose}
      />

      <WindowPanel rawHtml={
        <div className="windowContent">
          <Row className="justify-content-md-center">
            <Col md={4}>
              <Form.Label>Select your page</Form.Label>
              <AsyncSelect
                cacheOptions
                defaultOptions
                value={val}
                getOptionLabel={e => e.label}
                getOptionValue={e => e.value}
                loadOptions={loadOptions}
                onChange={setValue}
              />
            </Col>
            {/* <Col md={4}>
              <Form.Label>Select Bulk Option</Form.Label>
              <AsyncSelect
                cacheOptions
                defaultOptions
                value={lang}
                getOptionLabel={e => e.desc}
                getOptionValue={e => e.code}
                loadOptions={loadBulkOption}
                onChange={setbulkOption}
              />
            </Col> */}
            <Col md={3}>
              <Form.Label>Select your Language</Form.Label>
              <AsyncSelect
                cacheOptions
                defaultOptions
                value={lang}
                getOptionLabel={e => e.desc}
                getOptionValue={e => e.code}
                loadOptions={loadLanguage}
                onChange={setLang}
              />
            </Col>

            {totalPage > 1 ?
              <Col md={1}>
                <div>Page No.</div>
                <select onChange={(e) => { setPageNo(e.target.value); loadPageData(lang.code, e.target.value); }} defaultValue={1} style={{ width: '55px', textAlign: 'center', marginTop: '5px', height: '33px' }}>
                  {Array.from(Array(totalPage), (e, i) => {
                    let sr_no = i + 1;
                    return <option key={i} value={sr_no} selected={page_no == sr_no ? true : false}>{sr_no}</option>

                  })}
                </select>

              </Col>
              : ""}
            <Col md={3}>
              <label>Total Word :</label>
              <b> {enState && enState.length ? totalWordCount() : 0}</b>
              <Col>
                <Form.Control size="sm" type="text" placeholder="Search" id="standard-full-width" value={searchVal} onChange={(e) => { setSearchVal(e.target.value); loadPageData(lang.code, 1, e.target.value) }} />
              </Col>
            </Col>

          </Row>
          {loading &&
            (<Row>
              <Col className="my-5" sm={{ offset: 6 }} md={{ offset: 6 }}><Spinner animation="border" size="xl" /> </Col>
            </Row>)}
          <Row className="my-5">
            {enState.length > 0 && (
              <Col md={6}>
                <Row><Col><strong>Reference from English language content</strong></Col></Row>
                {enState.length > 0 && enState.map((row, i) => {
                  const { hp_desc_type, hp_desc, hp_html_type, hp_html, hp_link_url_type, hp_link_url, hp_slug_url_type, hp_slug_url, hp_link_title_type, hp_link_title, lang_code } = row;
                  return (
                    <Col key={i}>
                      {(hp_desc_type && hp_desc_type?.split('-')[0] == 'VARCHAR2') ?
                        <Form.Group as={Row} className="mb-3" controlId="exampleForm.ControlInput1">
                          <Form.Label className="mb-3">Description
                            (<span>{hp_desc && hp_desc.length ? countWords(hp_desc) : 0}</span>)
                          </Form.Label>
                          <Form.Control type="text" name="" className='hp_desc' placeholder="Description" value={hp_desc} />
                        </Form.Group>
                        : ''
                      }

                      {(hp_link_title_type && hp_link_title_type?.split('-')[0] == 'VARCHAR2') ?
                        <Form.Group as={Row} className="mb-3" controlId="exampleForm.ControlInput1">
                          <Form.Label className="mb-3">Link Title
                            (<span>{hp_link_title && hp_link_title.length ? countWords(hp_link_title) : 0}</span>)
                          </Form.Label>
                          <Form.Control type="text" name="" className='hp_link_title' placeholder="name@example.com" value={hp_link_title} />
                        </Form.Group>
                        : ''
                      }

                      {(hp_html_type !== false) ?
                        <Form.Group as={Row} className="mb-3" controlId="exampleForm.ControlInput1">
                          <Col className='p-0'>
                            <Form.Label className="mb-3">Detail
                              (<span>{hp_html && hp_html.length ? countWords(hp_html) : 0}</span>)
                            </Form.Label>
                          </Col>
                          {/* <Editor
                            editorState={editorStatesView[i]}
                            toolbarClassName="toolbarClassName"
                            wrapperClassName="wrapperClassName"
                            editorClassName="editorClassName"
                            readOnly={true}
                          /> */}

                          <Wysiwyg
                            name="hp_html"
                            editorLoaded={true}
                            value={hp_html}
                            disabled={true}
                            onChange={(data) => {
                              //setEditorData(data);
                            }}
                          />

                        </Form.Group>
                        : ''}
                    </Col>

                  )
                })
                }
              </Col>
            )}
            {arState.length > 0 && (
              <Col md={6}>
                <Row><Col><strong>Edit your {lang.desc} language </strong></Col></Row>
                {arState.length > 0 && arState.map((row, i) => {

                  const { shp_id, site_id, hp_desc_type, hp_parent_id, hp_desc, hp_html_type, hp_html, hp_link_url_type, hp_link_url, hp_slug_url_type, hp_slug_url, hp_link_title_type, hp_link_title, lang_code, shp_applicable_countries } = row;
                  return (
                    <Col key={i}>
                      {(hp_desc_type && hp_desc_type?.split('-')[0] == 'VARCHAR2') ?
                        <Form.Group as={Row} className="mb-3" controlId="exampleForm.ControlInput1">
                          <Col className='p-0'>
                            <Form.Label className="mb-3">Description {shp_applicable_countries ? '(' + shp_applicable_countries + ')' : ''}</Form.Label>
                          </Col>
                          <Col className='p-0'>
                            <Button className="btn btn-primary form-control-sm float-right btnAlign" onClick={() => handleSubmit(hp_desc_type, state[i].desc, shp_id, hp_parent_id)}><FontAwesomeIcon icon={faEdit} /></Button>
                          </Col>
                          <Form.Control type="text" name="desc" data-key={i} placeholder="Description" value={state[i] && state[i].desc} onChange={handleInputChange} />
                        </Form.Group>
                        : ''
                      }

                      {(hp_link_title_type && hp_link_title_type?.split('-')[0] == 'VARCHAR2') ?
                        <Form.Group as={Row} className="mb-3" controlId="exampleForm.ControlInput1">
                          <Col className='p-0'>
                            <Form.Label className="mb-3">Link Title {shp_applicable_countries ? '(' + shp_applicable_countries + ')' : ''}</Form.Label>
                          </Col>
                          <Col className='p-0'>
                            <Button className="btn btn-primary form-control-sm float-right btnAlign" onClick={() => handleSubmit(hp_link_title_type, state[i].link_title, shp_id)}><FontAwesomeIcon icon={faEdit} /></Button>
                          </Col>
                          <Form.Control type="text" name="link_title" data-key={i} placeholder="Link Title" value={state[i] && state[i].link_title} onChange={handleInputChange} />
                        </Form.Group>
                        : ''
                      }

                      {(hp_html_type !== false) ?
                        <Form.Group as={Row} className="mb-3" controlId="exampleForm.ControlInput1">
                          <Col className='p-0'>
                            <Form.Label className="mb-3">Detail {shp_applicable_countries ? '(' + shp_applicable_countries + ')' : ''}</Form.Label>
                          </Col>
                          <Col className='p-0'>
                            <Button className="btn btn-primary form-control-sm float-right btnAlign" onClick={() => handleSubmit(hp_html_type, editorStates[i], shp_id)}><FontAwesomeIcon icon={faEdit} /></Button>
                          </Col>

                          {/* <Editor
                            editorState={editorStates[i]}
                            toolbarClassName="toolbarClassName"
                            wrapperClassName="wrapperClassName"
                            editorClassName="editorClassName"
                            onEditorStateChange={(editorState) =>
                              onEditorStateChange(editorState, i)
                            }
                          /> */}

                          <Wysiwyg
                            name="hp_html"
                            editorLoaded={true}
                            lang={lang.code}
                            onChange={(data) => {
                              onEditorStateChange(data, i)
                            }}
                            value={hp_html}
                          />


                        </Form.Group>
                        : ''}


                    </Col>

                  )
                })
                }
              </Col>
            )}
          </Row>
          {isLoadMore && totalPage >= page_no && false &&
            <Row className="justify-content-md-center">
              <Col className="my-5" md={2}>
                <Button className="btn btn-info form-control btnAlign" onClick={() => { loadPageData(lang.code); }}>Load More</Button>
              </Col>
            </Row>
          }


        </div>
      } />
    </>
  );
}


export default Translation;