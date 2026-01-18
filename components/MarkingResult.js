"use client";
import ReactMarkdown from 'react-markdown';
import styles from './MarkingResult.module.css';

export default function MarkingResult({ result }) {
    if (!result) return null;

    // The result might contain the JSON block at the end. We should try to strip it from display if possible,
    // or just let it render if it's not too ugly. Ideally, we separate it.
    // The system prompt puts JSON at the end.

    // Simple logic to separate markdown from JSON if present
    let markdownContent = result;

    try {
        const jsonStart = result.lastIndexOf('{');
        if (jsonStart !== -1) {
            // Check if it looks like the progress_log_entry
            const remaining = result.substring(jsonStart);
            if (remaining.includes("progress_log_entry")) {
                markdownContent = result.substring(0, jsonStart);
            }
        }
    } catch (e) {
        // ignore
    }

    return (
        <div className={styles.container}>
            <div className={styles.markdown}>
                <ReactMarkdown>{markdownContent}</ReactMarkdown>
            </div>
        </div>
    );
}
