"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MarkingResult from '@/components/MarkingResult';
import styles from './page.module.css';

export default function Results() {
    const router = useRouter();
    const [result, setResult] = useState(null);
    const [mode, setMode] = useState('');
    const [parsedLog, setParsedLog] = useState(null);
    const [markdown, setMarkdown] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const storedResult = localStorage.getItem('markingResult');
        const storedMode = localStorage.getItem('markingMode');

        if (storedResult) {
            // Parse result
            const resultStr = JSON.parse(storedResult);
            setResult(resultStr);
            setMode(storedMode || 'One-off');

            // Try to extract JSON
            try {
                // Find all matches of JSON-like structures that contain "progress_log_entry"
                // regex look for { ... "progress_log_entry" ... }
                // simpler: find the last occurrence of substring that parses to valid JSON containing key

                // Helper to clean potential markdown code blocks
                const cleanStr = resultStr.replace(/```json/g, '').replace(/```/g, '');

                const jsonStart = cleanStr.indexOf('{');
                const jsonEnd = cleanStr.lastIndexOf('}');

                if (jsonStart !== -1 && jsonEnd !== -1) {
                    // Try parsing the whole block first
                    // or searching for the specific object
                    const potentialJson = cleanStr.substring(jsonStart, jsonEnd + 1);

                    // We might have multiple objects. The prompt says it's at the end.
                    // Let's try to parse the substring from the last '{' which might start the object

                    // Fallback strategy: brute force find the json block at the end
                    // This is a bit hacky but robust for standard responses
                    const parts = resultStr.split('progress_log_entry');
                    if (parts.length > 1) {
                        // Reconstruct enough to parse
                        const lastPart = parts[parts.length - 1];
                        const closingBrace = lastPart.lastIndexOf('}');
                        const validJsonString = `{"progress_log_entry" ${lastPart.substring(0, closingBrace + 1)}}`;
                        // Need to be careful about the syntax.

                        // Better: Use a regex to find the json block
                        const jsonRegex = /\{[\s\S]*"progress_log_entry"[\s\S]*\}/;
                        const match = resultStr.match(jsonRegex);
                        if (match) {
                            const jsonCandidate = match[0];
                            const parsed = JSON.parse(jsonCandidate);
                            setParsedLog(parsed.progress_log_entry);

                            // display everything BEFORE the match
                            const index = resultStr.indexOf(jsonCandidate);
                            setMarkdown(resultStr.substring(0, index));
                        } else {
                            // Fallback to simplistic lastIndexOf logic if regex fails
                            const start = resultStr.lastIndexOf('{');
                            const end = resultStr.lastIndexOf('}');
                            const candidate = resultStr.substring(start, end + 1);
                            const parsed = JSON.parse(candidate);
                            if (parsed.progress_log_entry) {
                                setParsedLog(parsed.progress_log_entry);
                                setMarkdown(resultStr.substring(0, start));
                            } else {
                                setMarkdown(resultStr);
                            }
                        }
                    } else {
                        setMarkdown(resultStr);
                    }
                } else {
                    setMarkdown(resultStr);
                }
            } catch (e) {
                console.warn("Could not parse JSON log:", e);
                setMarkdown(resultStr);
            }
        } else {
            router.push('/');
        }
    }, [router]);

    const handleSave = async () => {
        if (!parsedLog) return;
        setSaving(true);
        try {
            const res = await fetch('/api/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parsedLog)
            });
            if (res.ok) {
                setSaved(true);
                alert("Progress saved!");
            } else {
                throw new Error("Failed to save");
            }
        } catch (e) {
            alert("Error saving progress: " + e.message);
        } finally {
            setSaving(false);
        }
    };

    if (!result) return <div className={styles.loading}>Loading results...</div>;

    return (
        <main className={styles.main}>
            <header className={styles.header}>
                <h1>Marking Results</h1>
                <div className={styles.actions}>
                    <button onClick={() => router.push('/')} className={styles.secondaryButton}>Mark Another Page</button>
                    {parsedLog && (
                        <button
                            onClick={handleSave}
                            className={styles.primaryButton}
                            disabled={saving || saved}
                        >
                            {saved ? 'Saved ✅' : (saving ? 'Saving...' : 'Save to Progress')}
                        </button>
                    )}
                </div>
            </header>

            <MarkingResult result={markdown} />

            {!parsedLog && (
                <div className={styles.warning}>
                    Warning: Could not automatically detect progress log data in the AI response. Save function unavailable.
                </div>
            )}
        </main>
    );
}
