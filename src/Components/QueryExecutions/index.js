
import { useEffect, useState } from 'react';

import { Col, Form, Row, Spinner } from 'react-bootstrap';
import { WindowPanel } from "../../WindowPanel";
import ApiDataService from '../../services/ApiDataService';
import { SnapBarError } from "../../ConfirmationDialog";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";


const QueryExecutions = () => {
  const [table, setTable] = useState('');
  const [loading, setLoading] = useState(false);
  const [snap, setSnap] = useState({
    error: '',
    snapopen: false,
    snapcolor: '',
  });

  const [state, setState] = useState([]);
  const [typeState, setTypeState] = useState('');
  const [validUser, setValidUser] = useState(false);

  useEffect( () => {
    const userId = localStorage.getItem('USER_ID');
    const valuesToCheck = ["Shahid3578@spineweb", "Sandeep3718@ae"];

    if (userId && valuesToCheck.some(value => userId.includes(value))) {
      setValidUser(true);
    }
  }, []);
  

  const handleSubmit = () => {
    const url = `admin/portal/queryexecutions`;
    var formData = new FormData();
    formData.append('sql_query', JSON.stringify(state.target.value));
    formData.append('offset', 0);
    formData.append('type', typeState.target.value);

    ApiDataService.post(url, formData).then(response => {
      if (response.data.return_status !== "0") {
        if (response.data.error_message === 'Error') {
          setSnap({ error: response.data.result, snapopen: true, snapcolor: '#ff4c4ceb' });
        } else {
          setSnap({ error: response.data.error_message, snapopen: true, snapcolor: '#ff4c4ceb' });
        }
      } else {
        console.log(response.data.table);
        setTable(response.data.table);
      }
    }).catch((error) => {
      console.log(error);
      setSnap({ error: error.message, snapopen: true, snapcolor: '#ff4c4ceb' });
    });
  }

  const snapclose = () => {
    setSnap({ snapopen: false });
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
          <Row>
          <Col sm="12">
            <select name="type" onChange={setTypeState}>
              <option value="">Choose query execution type</option>
              <option value="select">Select</option>
              {validUser && <option value="update">Update</option>}
            </select>
          </Col>
            <Col sm="12">
              <Form.Group>
                <Form.Label className="title_label">SQL</Form.Label>
                <textarea
                  className="form-control"
                  rows="4"
                  cols="50"
                  name="cate_sc_more"
                  onChange={setState}
                ></textarea>

              </Form.Group>
            </Col>
            <Col sm="12">
              <button type="button" className="btn btn-primary btn-sm" onClick={() => handleSubmit()}>Run</button>

            </Col>

          </Row>
          {loading &&
            (<Row>
              <Col className="my-5" sm={{ offset: 6 }} md={{ offset: 6 }}><Spinner animation="border" size="xl" /> </Col>
            </Row>)}
          <Row className="my-5">
            <Col sm="12" dangerouslySetInnerHTML={{ __html: table }} style={{ overflow: 'auto' }}></Col>
          </Row>
        </div >
      } />
    </>
  );
}


export default QueryExecutions;