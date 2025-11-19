class MyUploadAdapter {
    constructor(loader) {
        this.loader = loader;
    }

    upload() {
        return this.loader.file
            .then(file => new Promise((resolve, reject) => {
                const formData = new FormData();
                formData.append('upload', file);
                const url = `${process.env.REACT_APP_SERVER_URL}image-upload`;

                fetch(url, {
                    method: 'POST',
                    body: formData,
                })
                    .then(response => response.json())
                    .then(data => {
                        resolve({
                            default: data.url
                        });
                    })
                    .catch(error => {
                        reject(error);
                    });
            }));
    }

    abort() {
        // Implement abort functionality if necessary
    }
}

export function CkEditorImageUpload(editor) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
        return new MyUploadAdapter(loader);
    };
}
