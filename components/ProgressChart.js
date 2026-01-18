"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ProgressChart({ data }) {
    // Process data for chart
    const processedData = data.map(item => {
        let numericScore = 0;
        if (item.score) {
            if (item.score.includes('/')) {
                const parts = item.score.split('/');
                numericScore = (parseFloat(parts[0]) / parseFloat(parts[1])) * 100;
            } else if (item.score.includes('%')) {
                numericScore = parseFloat(item.score.replace('%', ''));
            } else {
                numericScore = parseFloat(item.score);
            }
        }
        return {
            date: new Date(item.date).toLocaleDateString(),
            score: isNaN(numericScore) ? 0 : numericScore,
            topic: item.topic
        };
    }).reverse(); // Recharts creates left-to-right, but our list is desc (newest first). We want oldest left.

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#4f46e5" activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
