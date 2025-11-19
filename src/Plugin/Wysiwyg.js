import { CKEditor } from '@ckeditor/ckeditor5-react';
import { CkEditorImageUpload } from './CkEditorImageUpload'; // Import the custom plugin
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import './WysiwygCustom.scss';
import { useEffect } from 'react';

function Wysiwyg({ onChange, editorLoaded, name, value, disabled = false, lang = 'en' }) {

    useEffect(() => {
        // Simple fix for Bootstrap modal focus trap with CKEditor dialogs
        if (window.$ && window.$.fn && window.$.fn.modal) {
            window.$.fn.modal.Constructor.prototype._enforceFocus = function () { };
        }

        // Simple focus trap fix for CKEditor dialogs
        const handler = (e) => {
            const ckPanel = document.querySelector('.ck.ck-balloon-panel');
            if (ckPanel && ckPanel.contains(e.target)) {
                e.stopPropagation();
            }
        };

        document.addEventListener('focusin', handler, true);

        return () => {
            document.removeEventListener('focusin', handler, true);
        };
    }, []);

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
                        toolbar: [
                            'heading', '|',
                            'bold', 'italic', 'link', '|',
                            'bulletedList', 'numberedList', '|',
                            'outdent', 'indent', '|',
                            'blockQuote', '|',
                            'imageUpload', 'mediaEmbed', '|',
                            'insertTable', '|',
                            'undo', 'redo'
                        ]
                    }}
                    data={value}
                    onChange={(event, editor) => {
                        const data = editor.getData();
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
