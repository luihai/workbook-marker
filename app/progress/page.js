"use client";
import { useEffect, useState } from 'react';
import ProgressChart from '@/components/ProgressChart';
import styles from './page.module.css';

export default function Progress() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ subject: 'All', topic: '' });

    useEffect(() => {
        fetch('/api/progress')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setLogs(data);
                } else {
                    console.error("API returned non-array:", data);
                    setLogs([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLogs([]);
                setLoading(false);
            });
    }, []);

    const filteredLogs = logs.filter(log => {
        const matchSubject = filter.subject === 'All' || log.subject === filter.subject;
        const matchTopic = !filter.topic || (log.topic && log.topic.toLowerCase().includes(filter.topic.toLowerCase()));
        return matchSubject && matchTopic;
    });

    return (
        <main className={styles.main}>
            <h1>Student Progress</h1>

            <div className={styles.controls}>
                <select
                    value={filter.subject}
                    onChange={e => setFilter({ ...filter, subject: e.target.value })}
                    className={styles.select}
                >
                    <option value="All">All Subjects</option>
                    <option value="Math">Math</option>
                    <option value="Science">Science</option>
                    <option value="English">English</option>
                    <option value="Chinese">Chinese</option>
                </select>

                <input
                    type="text"
                    placeholder="Filter by Topic..."
                    value={filter.topic}
                    onChange={e => setFilter({ ...filter, topic: e.target.value })}
                    className={styles.input}
                />
            </div>

            <div className={styles.chartContainer}>
                <h2>Score Trend</h2>
                {!loading && filteredLogs.length > 0 ? (
                    <ProgressChart data={filteredLogs} />
                ) : (
                    <p className={styles.empty}>No data for chart</p>
                )}
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Subject</th>
                            <th>Topic</th>
                            <th>Score</th>
                            <th>Mistakes</th>
                            <th>Fix Strategy</th>
                            <th>Next Drill</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center' }}>Loading...</td></tr>
                        ) : filteredLogs.length === 0 ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center' }}>No logs found.</td></tr>
                        ) : (
                            filteredLogs.map(log => (
                                <tr key={log.id}>
                                    <td>{new Date(log.date).toLocaleDateString()}</td>
                                    <td>{log.subject}</td>
                                    <td>{log.topic || '-'}</td>
                                    <td>{log.score}</td>
                                    <td>{log.mistakes}</td>
                                    <td>{log.fixStrategy}</td>
                                    <td>{log.nextDrill}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
