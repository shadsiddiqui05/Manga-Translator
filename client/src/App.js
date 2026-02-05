// client/src/App.js
import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  // --- HANDLER: SCRAPE URL ---
  const handleScrape = async () => {
    if (!url) return;
    startProcess("Scanning URL & Translating Chapter...");
    try {
      const res = await axios.post('http://localhost:5000/api/scrape', { url });
      finishProcess(res.data.images);
    } catch (err) {
      handleError(err);
    }
  };

  // --- HANDLER: UPLOAD FILE ---
  const handleUpload = async (e) => {
    if (!e.target.files[0]) return;
    startProcess("Uploading & Processing Image...");
    const formData = new FormData();
    formData.append('image', e.target.files[0]);
    try {
      const res = await axios.post('http://localhost:5000/api/upload', formData);
      finishProcess(res.data.images);
    } catch (err) {
      handleError(err);
    }
  };

  // --- HELPERS ---
  const startProcess = (msg) => {
    setLoading(true);
    setStatus(msg);
    setImages([]);
  };

  const finishProcess = (imgs) => {
    setImages(imgs);
    setLoading(false);
    setStatus("");
  };

  const handleError = (err) => {
    console.error(err);
    setStatus("Error: " + (err.response?.data?.error || "Server Connection Failed"));
    setLoading(false);
  };

  return (
    <div className="container">
      {/* 1. HERO SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: -50 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.8 }}
      >
        <h1 className="hero-title">Neuro Manga Translator</h1>
        <p className="subtitle">Real-time Translation & In-painting using Deep Learning</p>
      </motion.div>

      {/* 2. INPUT CARD */}
      <motion.div 
        className="input-card"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {/* URL Input */}
        <div className="input-group">
          <input 
            type="text" 
            placeholder="Paste Chapter URL (e.g., mangakakalot.com/chapter-1)" 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary"
            onClick={handleScrape}
            disabled={loading}
          >
            {loading ? "Processing..." : "Translate URL"}
          </motion.button>
        </div>

        <div style={{ margin: '20px 0', color: '#555' }}>— OR —</div>

        {/* File Upload Button */}
        <motion.label 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="file-upload-label"
        >
          {loading ? "Uploading..." : "Upload Local File"}
          <input type="file" onChange={handleUpload} disabled={loading} accept="image/*" />
        </motion.label>
      </motion.div>

      {/* 3. STATUS & LOADER */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
          >
            <div className="loading-spinner"></div>
            <p style={{ color: '#aaa', marginTop: '10px' }}>{status}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. RESULTS GRID */}
      <div className="manga-grid">
        {images.map((imgSrc, index) => (
          <motion.img 
            key={index}
            src={imgSrc} 
            alt={`Page ${index}`}
            className="manga-page"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }} // Staggered animation
          />
        ))}
      </div>
      
      {/* Error Message */}
      {status.includes("Error") && <p style={{ color: '#ff4757', fontWeight: 'bold' }}>{status}</p>}

    </div>
  );
}

export default App;