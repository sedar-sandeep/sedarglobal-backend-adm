import { CKEditor } from '@ckeditor/ckeditor5-react';
import { CkEditorImageUpload } from './CkEditorImageUpload'; // Import the custom plugin
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import './WysiwygCustom.scss';

function Wysiwyg({ onChange, editorLoaded, name, value, disabled = false, lang = 'en' }) {


    return (
        <div className='wysiwyg_CKEditor'>
            {editorLoaded ? (

                <CKEditor
                    name={name}
                    editor={ClassicEditor}
                    disabled={disabled}
                    config={{
                        extraPlugins: [CkEditorImageUpload],
                        language: lang,
                        heading: {
                            options: [
                                { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                                { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
                                { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
                                { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
                            ],
                        },
                    }}
                    data={value}
                    onChange={(event, editor) => {
                        const data = editor.getData();
                        //console.log({ event, editor, data })
                        onChange(data);
                    }}
                />
            ) : (
                <div>Editor loading</div>
            )}
        </div>
    );
}

export default Wysiwyg;
