"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import UploadWidget from '@/components/UploadWidget';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    studentLevel: 'P1',
    subject: 'Math',
    topic: '',
    mode: 'Ongoing'
  });
  const [workbookFiles, setWorkbookFiles] = useState([]);
  const [answerKeyFiles, setAnswerKeyFiles] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (workbookFiles.length === 0) {
      alert("Please upload at least one workbook page.");
      return;
    }

    setLoading(true);

    // In a real app, we might upload first, then redirect. 
    // Here we will send the request to the API, get the result, and then navigate to results page with data.
    // Or to keep state clean, we can clear component state and use context/localstorage. 
    // For simplicity, passing data via query params is limited by size.
    // Better: Helper function to store result in localStorage and redirect.

    try {
      const data = new FormData();
      data.append('studentLevel', formData.studentLevel);
      data.append('subject', formData.subject);
      data.append('topic', formData.topic);
      data.append('mode', formData.mode);
      workbookFiles.forEach(f => data.append('workbookFiles', f));
      answerKeyFiles.forEach(f => data.append('answerKeyFiles', f));

      const res = await fetch('/api/mark', {
        method: 'POST',
        body: data,
      });

      if (!res.ok) {
        throw new Error("Failed to mark.");
      }

      const json = await res.json();
      // Save result to localStorage to pass to results page
      localStorage.setItem('markingResult', JSON.stringify(json.result));
      localStorage.setItem('markingMode', formData.mode);
      localStorage.setItem('markingMetadata', JSON.stringify(formData));

      router.push('/results');
    } catch (error) {
      alert("Error processing request: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <h1>Workbook Marker</h1>
        <p className={styles.subtitle}>Upload your Singapore Primary workbook pages for instant AI marking.</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.grid}>
            <div className={styles.inputGroup}>
              <label>Student Level</label>
              <select name="studentLevel" value={formData.studentLevel} onChange={handleChange}>
                {['P1', 'P2', 'P3', 'P4', 'P5', 'P6'].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label>Subject</label>
              <select name="subject" value={formData.subject} onChange={handleChange}>
                {['Math', 'Science', 'English', 'Chinese'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label>Topic (Optional)</label>
              <input type="text" name="topic" value={formData.topic} onChange={handleChange} placeholder="e.g. Fractions" />
            </div>


          </div>

          <UploadWidget
            label="Workbook Page Photos (Max 5)"
            id="workbook-upload"
            maxFiles={5}
            onChange={setWorkbookFiles}
          />

          <UploadWidget
            label="Answer Key / Marking Scheme (Optional)"
            id="answer-upload"
            maxFiles={5}
            onChange={setAnswerKeyFiles}
          />

          <button type="submit" className={styles.markButton} disabled={loading}>
            {loading ? 'Marking...' : 'Mark Now'}
          </button>
        </form>
      </div>
    </main>
  );
}
