import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import React, { useState } from 'react';

// Set the workerSrc property for PDF.js
GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${getDocument.version}/build/pdf.worker.min.js`;

const SummarisePolicy = () => {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = 'http://127.0.0.1:3000/summarize/';

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      alert('Please upload a valid PDF file.');
    }
  };

  const handleSummarize = async () => {
    if (file) {
      setLoading(true);
      try {
        const text = await extractText(file);
        console.log('Text to send to API:', text); // Debugging line

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data); // Debugging line

        if (data && Array.isArray(data.summary)) {
          setSummary(data.summary);
        } else {
          console.error('Unexpected response format:', data);
          setSummary([]);
        }
      } catch (error) {
        console.error('Error processing file:', error);
        alert('An error occurred while processing the file. Please try again.');
        setSummary([]);
      } finally {
        setLoading(false);
      }
    } else {
      alert('Please upload a file before summarizing.');
    }
  };

  const extractText = async (file) => {
    const pdfUrl = URL.createObjectURL(file);
  
    try {
      const pdf = await getDocument(pdfUrl).promise;
      let fullText = '';
  
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const text = textContent.items.map(item => item.str).join(' ');
        fullText += text + ' ';
      }
  
      URL.revokeObjectURL(pdfUrl); // Clean up the object URL
      console.log('Full extracted text:', fullText); // Debugging line
      return fullText.trim();
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw error; // Propagate the error
    }
  };

  return (
    <div className="summarize-container">
      <h2>Summarize Policy</h2>
      <div className="file-upload">
        <label htmlFor="file">Upload Policy (PDF):</label>
        <input type="file" id="file" accept="application/pdf" onChange={handleFileChange} />
      </div>
      <button className="summarize-button" onClick={handleSummarize} disabled={loading}>
        {loading ? 'Summarizing...' : 'Summarize Policy'}
      </button>
      {summary && (
        <div className="summary">
          <h3>Summary</h3>
          <table>
            <thead>
              <tr>
                <th>Heading</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((item, index) => (
                <tr key={index}>
                  <td>{item.heading}</td>
                  <td>{item.details.trim()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SummarisePolicy;