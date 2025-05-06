import React from 'react';
import './RankingDetails.css';

export default function RankingDetails({ data }) {
  // weights must match computeRuleBasedScore
  const weights = {
    College: 0.20,
    Company: 0.18,
    Title:   0.12
  };

  const components = [
    {
      name: 'College',
      raw:    parseFloat(data.college_score) || 0,
      tier:   data.college_tier || '-'
    },
    {
      name: 'Company',
      raw:    parseFloat(data.best_score) || 0,
      tier:   data.best_tier || '-'
    },
    {
      name: 'Title',
      raw:    parseFloat(data.job_title_score) || 0,
      tier:   data.job_title_tier || '-'
    },
  ];

  return (
    <div className="ranking-details">
      <h4>🔍 Ranking Breakdown</h4>
      <table className="ranking-table">
        <thead>
          <tr>
            <th>Component</th>
            <th>Raw Score</th>
            <th>Weight</th>
            <th>Weighted</th>
            <th>Tier</th>
          </tr>
        </thead>
        <tbody>
          {components.map(c => {
            const weighted = ((c.raw / 10) * weights[c.name]).toFixed(2);
            return (
              <tr key={c.name}>
                <td>{c.name}</td>
                <td>{c.raw.toFixed(1)}</td>
                <td>{(weights[c.name] * 100).toFixed(0)}%</td>
                <td>{weighted}</td>
                <td>{c.tier}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
