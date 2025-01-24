import * as pdfjs from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker';
import React, { useState } from 'react';
import Sidebar from './Navbar';
import './stylesheets/CompareFiles.css';

const CompareFiles = () => {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [comparisonResults, setComparisonResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event, setFile) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      alert('Please upload a valid PDF file.');
    }
  };

  const handleCompare = async () => {
    if (file1 && file2) {
      setLoading(true);
      try {
        const [policy1Text, policy2Text] = await Promise.all([extractText(file1), extractText(file2)]);
        const [policy1Data, policy2Data] = [parsePolicyText(policy1Text), parsePolicyText(policy2Text)];
        setComparisonResults(comparePolicies(policy1Data, policy2Data));
      } catch (error) {
        console.error('Error processing files:', error);
      } finally {
        setLoading(false);
      }
    } else {
      alert('Please upload both files before comparing.');
    }
  };

  const extractText = async (file) => {
    const pdf = await pdfjs.getDocument(URL.createObjectURL(file)).promise;
    let fullText = '';

    for (let i = 0; i < pdf.numPages; i++) {
      const page = await pdf.getPage(i + 1);
      const textContent = await page.getTextContent();
      const text = textContent.items.map(item => item.str).join(' ');
      fullText += text + ' ';
    }

    // Debugging: log extracted text
    console.log('Extracted Text:', fullText);

    return fullText;
  };

  const parsePolicyText = (text) => {
    const extractDetail = (sectionTitle) => {
      const regex = new RegExp(`${sectionTitle}[:\\s]*([\\s\\S]*?)(?=\\n[A-Z]|\\n$)`, 'i');
      const match = text.match(regex);
      console.log(`Section: ${sectionTitle}, Match: ${match ? match[1].trim() : 'Not found'}`);
      return match ? match[1].trim() : 'Not specified';
    };

    // Define a list of sections to look for
    const sections = [
      'Public liability cover',
      'Products liability cover',
      'Court attendance costs',
      'Criminal defence costs',
      'Data protection legislation',
      'Environmental clean-up costs',
    ];

    // Extract details dynamically based on the defined sections
    const policyDetails = {};
    sections.forEach(section => {
      policyDetails[section] = extractDetail(section);
    });

    return policyDetails;
  };

  const comparePolicies = (policy1, policy2) => {
    const results = {};
    const allKeys = new Set([...Object.keys(policy1), ...Object.keys(policy2)]);

    allKeys.forEach(key => {
      results[key] = {
        policy1: policy1[key] || 'Not specified',
        policy2: policy2[key] || 'Not specified',
        comparison: policy1[key] === policy2[key] ? 'Same' : 'Different'
      };
    });

    return results;
  };

  return (
    <div>
    <Sidebar/>
    <div className="compare-container">
      <h2 className="compare-header">Compare Policies</h2>
      <div className="file-upload">
        <label htmlFor="file1" className = "upload-policy">Upload Policy 1 (PDF):</label>
        <input type="file" id="file1" accept="application/pdf" onChange={(e) => handleFileChange(e, setFile1)} />
      </div>
      <div className="file-upload">
        <label htmlFor="file2" className = "upload-policy">Upload Policy 2 (PDF):</label>
        <input type="file" id="file2" accept="application/pdf" onChange={(e) => handleFileChange(e, setFile2)} />
      </div>
      <button className="compare-button" onClick={handleCompare} disabled={loading}>
        {loading ? 'Comparing...' : 'Compare Policies'}
      </button>
      {comparisonResults && (
        <div className="results">
          <h3>Comparison Results</h3>
          {Object.keys(comparisonResults).map(key => (
            <div key={key}>
              <h4>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</h4>
              <p>Policy 1: {comparisonResults[key].policy1}</p>
              <p>Policy 2: {comparisonResults[key].policy2}</p>
              <p>Comparison: {comparisonResults[key].comparison}</p>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
};

export default CompareFiles;