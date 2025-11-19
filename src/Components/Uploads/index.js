// FileUpload.js
import React, { useState } from 'react';
import ApiDataService from '../../services/ApiDataService';

const insertUrl = `signature/imageUpload`;
const FileUpload = () => {
    const [selectedFile, setSelectedFile] = useState(null);

    // const handleFileChange = (event) => {
    //     const file = event.target.files[0];
    //     if (file && file.type === 'application/pdf') {
    //         setSelectedFile(file);
    //     } else {
    //         alert('Please select a PDF file');
    //     }
    // };

    // const handleUpload = async () => {
    //     if (!selectedFile) {
    //         alert('Please select a file');
    //         return;
    //     }

    //     const formData = new FormData();
    //     formData.append('file', selectedFile);

    //     try {
    //         const response = await fetch('https://api.github.com/repos/:owner/:repo/contents/:path', {
    //             method: 'PUT',
    //             headers: {
    //                 Authorization: 'Bearer YOUR_GITHUB_TOKEN', // Replace with your GitHub token
    //             },
    //             body: JSON.stringify({
    //                 message: 'Upload PDF file',
    //                 content: Buffer.from(formData).toString('base64'),
    //             }),
    //         });

    //         if (response.ok) {
    //             alert('PDF file uploaded successfully!');
    //         } else {
    //             const errorMessage = await response.text();
    //             alert(`Error uploading PDF file: ${errorMessage}`);
    //         }
    //     } catch (error) {
    //         console.error('Error uploading PDF file:', error);
    //         alert('An error occurred while uploading the PDF file.');
    //     }
    // };

    const [selectedOption, setSelectedOption] = useState("index");

    const handleChange = (event) => {
      setSelectedOption(event.target.value);
    };
  

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
        } else {
            alert('Please select a file');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            alert('Please select a file');
            return;
        }

        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('filename', selectedOption);
        
        console.log(formData);
        try {
           
            ApiDataService.post(insertUrl, formData).then(response => {
               console.log(response);
            }).catch((error) => {
                console.log(error);
            });

        } catch (error) {
            console.error('Error uploading PDF file:', error);
            alert('An error occurred while uploading the PDF file.');
        }
    };

    return (
        <div>
            <div>
                <input type="radio" id="index" name="filename" value="index" checked={selectedOption === "index"} onChange={handleChange}
            />
                <label for="index">Index (Announcement)</label>
                <input type="radio" id="facebook" name="filename" value="facebook" checked={selectedOption === "facebook"} onChange={handleChange}/>
                <label for="facebook">Facebook</label>
                <input type="radio" id="x" name="filename" value="x" checked={selectedOption === "x"} onChange={handleChange}/>
                <label for="x">X</label>
                <input type="radio" id="instagram" name="filename" value="instagram" checked={selectedOption === "instagram"} onChange={handleChange}/>
                <label for="instagram">Instagram</label>
                <input type="radio" id="pintrest" name="filename" value="pintrest" checked={selectedOption === "pintrest"} onChange={handleChange}/>
                <label for="pintrest">pintrest</label>
                <input type="radio" id="youtube" name="filename" value="youtube" checked={selectedOption === "youtube"} onChange={handleChange}/>
                <label for="youtube">Youtube</label>
                <input type="radio" id="yourspaceyourart" name="filename" value="yourspaceyourart" checked={selectedOption === "yourspaceyourart"} onChange={handleChange}/>
                <label for="yourspaceyourart">Your Space Your Art</label>
            </div>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload PDF File</button>
        </div>
    );
};

export default FileUpload;
