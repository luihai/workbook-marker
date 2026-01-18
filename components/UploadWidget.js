"use client";
import { useState, useRef } from 'react';
import styles from './UploadWidget.module.css';

export default function UploadWidget({ label, id, maxFiles = 5, onChange }) {
    const [previews, setPreviews] = useState([]);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > maxFiles) {
            alert(`You can only upload up to ${maxFiles} images.`);
            return;
        }

        // Generate previews
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(newPreviews);

        if (onChange) {
            onChange(files);
        }
    };

    const clearSelection = () => {
        setPreviews([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        if (onChange) onChange([]);
    };

    return (
        <div className={styles.widget}>
            <label className={styles.label} htmlFor={id}>{label}</label>

            <div className={styles.uploadArea}>
                <input
                    type="file"
                    id={id}
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className={styles.fileInput}
                    ref={fileInputRef}
                />
                <div className={styles.dropZone} onClick={() => fileInputRef.current?.click()}>
                    <p>Click to upload images (Max {maxFiles})</p>
                </div>
            </div>

            {previews.length > 0 && (
                <div className={styles.previews}>
                    {previews.map((src, i) => (
                        <div key={i} className={styles.previewContainer}>
                            <img src={src} alt={`Preview ${i}`} className={styles.previewImage} />
                        </div>
                    ))}
                    <button type="button" onClick={clearSelection} className={styles.clearBtn}>Clear</button>
                </div>
            )}
        </div>
    );
}
