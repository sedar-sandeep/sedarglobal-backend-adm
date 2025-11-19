import React, { useEffect, useState } from 'react';
import './HomePage.scss';
import ReactDatatable from '../Datatable/ReactDatatable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faCog, faPlus, faCopy, faLanguage, faChartLine, faHistory, faEye } from '@fortawesome/free-solid-svg-icons';
import { Dropdown, DropdownButton, Form } from 'react-bootstrap';
import Select from 'react-select';
import AccessSecurity from '../../AccessSecurity';
import History from '../History/History';
import ApiDataService from '../../services/ApiDataService';

const customStyles = {
  control: base => ({
    ...base,
    height: 32,
    minHeight: 32
  })
};
function DataTableView(props) {
  const [pageNames, setPageNames] = useState("");
  const [modalShow, setmodal] = useState(false);
  const [slug, setSlug] = useState("");
  const [globalContents, setGlobalContent] = useState(false);
  const [security, setSecurity] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const pageFilter = async (e, param) => {
    if (param === 'P') {
      await setPageNames(e.value);
      setSlug('');
      setGlobalContent(false);
    } else if (param === 'S') {
      await setSlug(e.value);
      setGlobalContent(false);
    } else {
      await setGlobalContent(true);
      setSlug('');
      setPageNames('global');
    }
  }
  useEffect(() => {
    props.pageName(pageNames);
  }, [pageNames]);
  useEffect(() => {
    props.slugName(slug);
  }, [slug]);
  useEffect(() => {
    props.langCode(selectedLanguage);
  }, [selectedLanguage]);
  useEffect(() => {
    props.globalContent(globalContents);
  }, [globalContents]); useEffect(() => {
    props.globalContent(globalContents);
  }, [globalContents]);
  const securityAccess = (param) => {
    setSecurity(param);
  }

  const modalClose = () => {
    setmodal(false);
  }

  const handleHistory = () => {
    setmodal(true);
  }

  let actionButton = (<button disabled={security.INSERT_YN !== 'Y' ? true : false} onClick={props.callAdd} type="button" className="btn btn-sm btn-primary"><FontAwesomeIcon icon={faPlus} /></button>);


  const [isChecked, setIsChecked] = useState(false);
  const [languageOptions, setLanguageOptions] = useState([]);
  
  // Fetch language options from API
  const fetchLanguageOptions = async () => {
    try {
      const response = await ApiDataService.get('admin/portal/homepage/lang/lov', null);
      const languages = response.data.result;
      const options = languages.map(lang => ({
        value: lang.code,
        label: lang.desc
      }));
      setLanguageOptions(options);
    } catch (error) {
      console.error('Error fetching languages:', error);
      // Fallback to default options if API fails
      setLanguageOptions([
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Spanish' },
        { value: 'ar', label: 'Arabic' }
      ]);
    }
  };

  useEffect(() => {
    fetchLanguageOptions();
  }, []);

  useEffect(() => {
    console.log('Datatable language changed to:', selectedLanguage);
    if (props.onLanguageChange) {
      props.onLanguageChange(selectedLanguage);
    }
  }, [selectedLanguage, props.onLanguageChange]);

  const handleCheckboxChange = (e) => {
    pageFilter(true, "x");
    setPageNames('');
    setIsChecked(e.target.checked);
    setGlobalContent(true);
  };
  const selectDrop = (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <div className="mt-2">
        <span class="p-3"> Global Content</span>
        <input
          type="checkbox"
          onChange={handleCheckboxChange}
          checked={isChecked}
        />
      </div>
      {!isChecked && (
        <div style={{ flex: 1 }}>
          <Select
            onChange={(e) => pageFilter(e, "P")}
            options={props.pageDrop}
            className="custdropdwn pointerr"
            styles={customStyles}
          />
        </div>
      )}



    </div>
  );
  const selectDrops = (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>


      <div style={{ flex: 1 }}>
        {/* <select onChange={(e) => {
          e.preventDefault();
          setSelectedLanguage(e.target.value);
        }}
          className="form-control form-control-sm" name="lang_code_header" value={selectedLanguage}>
          {(languageOptions ?
            languageOptions.map((data, inx) => {
              return (
                <option key={inx} value={data.value}>{data.label}</option>
              )
            }) : '')
          }
        </select> */}
        <Select
          placeholder="Language"
          onChange={(e) => {
            setSelectedLanguage(e.value);
          }}
          options={languageOptions}
          className="custdropdwn pointerr"
          styles={customStyles}
        />
      </div>

    </div>
  );
  const slugDrop = (
    !isChecked && (
      <div>

        <Select
          value={props.slugDrop.filter(function (option) {
            return option.value === slug;
          })}
          onChange={(e) => pageFilter(e, 'S')}
          options={props.slugDrop}
          className="custdropdwn pointerr"
          styles={customStyles}
        />
      </div>
    )

  );

  const history_btn = (
    <div className="input-group-append history-btn" styles={customStyles}>
      <button id="btn-id" onClick={() => handleHistory()} className="ml-2 btn btn-danger form-control form-control-sm" style={{ fontSize: '0.9rem' }}><FontAwesomeIcon icon={faHistory} /></button >
    </div>
  );

  const columns = [
    /*{
      key: "hp_desc",
      text: 'Desc',
      sortable: true,
    },*/
    {
      key: 'hp_root',
      text: 'Parent / Child',
      sortable: true,
    },
    {
      key: 'shp_applicable_countries',
      text: 'Applicable Countries',
      sortable: true,
    },
    {
      key: 'hp_ordering',
      text: 'Ordering',
      sortable: true,
    },
    {
      key: 'hp_file_path',
      text: 'Image',
      sortable: true,
    },
    {
      key: 'hp_from_date',
      text: 'From Date',
      sortable: true,
    },
    {
      key: 'hp_upto_date',
      text: 'Upto Date',
      sortable: true,
    },
    {
      key: 'hp_active_yn',
      text: 'Active',
      sortable: true,
    },
    {
      key: 'null',
      text: actionButton,
      align: 'right',
      className: 'text-right',
      button: true,
      cell: record => {
        return (<div className="actioncol1">
          <DropdownButton size="sm" id="dropdown-basic-button" title={<FontAwesomeIcon icon={faCog} />}>
            <Dropdown.Item disabled={security.UPDATE_YN !== 'Y' ? true : false} onClick={() => props.childRow(record.hp_id, "E")}><FontAwesomeIcon icon={faEdit} /> Edit</Dropdown.Item>
            <Dropdown.Item onClick={() => props.childRow(record.hp_id, "view")}><FontAwesomeIcon icon={faEye} /> View</Dropdown.Item>
            <Dropdown.Item disabled={security.UPDATE_YN !== 'Y' ? true : false} onClick={() => props.childRow(record.hp_id, "DU", record.hp_desc)}><FontAwesomeIcon icon={faCopy} /> Duplicate</Dropdown.Item>
            <Dropdown.Item disabled={security.LANGUAGE_YN !== 'Y' ? true : false} onClick={() => props.childRow(record.hp_id, "LG")}><FontAwesomeIcon icon={faLanguage} /> Language</Dropdown.Item>
            <Dropdown.Item disabled={security.DELETE_YN !== 'Y' ? true : false} onClick={() => props.childRow(record.hp_id, "D")}><FontAwesomeIcon icon={faTrash} /> Delete</Dropdown.Item>
            <Dropdown.Item disabled={security.SEO_YN !== 'Y' ? true : false} onClick={() => props.seoCategory(record.hp_id)}><FontAwesomeIcon icon={faChartLine} /> SEO</Dropdown.Item>
          </DropdownButton>
        </div>);
      }
    },
    {
      key: 'created_user_id',
      text: 'Created User ID',
      className: 'childColumn'
    },
    {
      key: 'updated_user_id',
      text: 'Updated User ID',
      className: 'childColumn'
    },
    {
      key: 'created_date',
      text: 'Created Date',
      className: 'childColumn'
    },
    {
      key: 'updated_date',
      text: 'Updated Date',
      className: 'childColumn'
    }
  ];
  const config = {
    page_size: 10,
    page_set: 1,
    length_menu: [10, 20, 40, 50],
    show_filter: true,
    show_pagination: true,
    pagination: 'advance',
    key_column: 'hp_id',
  }

  const tableChangeHandler = data => {
    let queryString = Object.keys(data).map((key) => {
      if (key === "sort_order" && data[key]) {
        return encodeURIComponent("sort_by") + '=' + encodeURIComponent(data[key].order) + '&' + encodeURIComponent("search_column") + '=' + encodeURIComponent(data[key].column)
      } else {
        var chngKey = key;
        if (key === 'page_number') {
          chngKey = 'page';
        } else if (key === 'page_size') {
          chngKey = 'limit';
        }
        return encodeURIComponent(chngKey) + '=' + encodeURIComponent(data[key])
      }

    }).join('&');
    props.renderTable(queryString);
  }
  useEffect(() => {
    //console.log(props.datajson,"test");
  }, [props.datajson]);
  useEffect(() => () => [props.datajson]);
  return (

    <div className="DataTableView">
      <AccessSecurity
        accessecurity={securityAccess}
      />
      <ReactDatatable
        className="table custom-style-table"
        tHeadClassName="custom-header-style"
        config={config}
        records={props.datajson.results}
        columns={columns}
        dropdown={[selectDrop,]}
        dropdowns={[selectDrops,]}
        dropdownslug={slugDrop}
        history_btn={history_btn}
        dynamic={true}
        total_record={props.datajson.row_count}
        onChange={tableChangeHandler}
      />

      <History
        url={'admin/portal/homepage'}
        hist_table={'SITE_M_HOME_PAGE_HIST'}
        show={modalShow}
        closeModal={modalClose}
      />
    </div>
  );
}
export default DataTableView;
