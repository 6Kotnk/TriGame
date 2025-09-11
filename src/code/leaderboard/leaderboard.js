// Leaderboard service for statistics and histogram generation
export class Leaderboard {
  constructor(database) {
    this.database = database;
  }

  // Calculate user's percentile ranking
  calculatePercentile(userScore, allScores) {
    if (allScores.length === 0) return 100;
    
    const betterScores = allScores.filter(score => score > userScore).length;
    return Math.round(((betterScores) / allScores.length) * 100);
  }

  // Calculate average score
  calculateAverage(allScores) {
    if (allScores.length === 0) return 0;
    return allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
  }

  // Create histogram data for visualization
  createHistogram(scores, bins = 10) {
    if (scores.length === 0) return [];

    const min = Math.min(...scores);
    const max = Math.max(...scores);
    const binSize = (max - min) / bins;
    
    const histogram = [];
    for (let i = 0; i < bins; i++) {
      const binStart = min + (i * binSize);
      const binEnd = binStart + binSize;
      const count = scores.filter(score => 
        score >= binStart && (i === bins - 1 ? score <= binEnd : score < binEnd)
      ).length;
      
      histogram.push({
        range: `${binStart.toFixed(2)}-${binEnd.toFixed(2)}`,
        count,
        percentage: ((count / scores.length) * 100).toFixed(1)
      });
    }
    
    return histogram;
  }

  // Get comprehensive stats for a user's score
  async getStats(userScore) {
    try {
      const allScoresData = await this.database.getAllScores();
      const scores = allScoresData.map(s => s.score);

      if (scores.length === 0) {
        return {
          percentile: 100,
          totalPlayers: 0,
          average: 0,
          histogram: [],
          topScores: []
        };
      }

      const percentile = this.calculatePercentile(userScore, scores);
      const average = this.calculateAverage(scores);
      const histogram = this.createHistogram(scores);
      const topScores = await this.database.getTopScores();

      return {
        percentile,
        totalPlayers: scores.length,
        average: average.toFixed(3),
        histogram,
        topScores
      };
    } catch (error) {
      console.error('Error getting leaderboard stats:', error);
      return {
        percentile: 0,
        totalPlayers: 0,
        average: 0,
        histogram: [],
        topScores: []
      };
    }
  }

  // Generate HTML for histogram display
  generateHistogramHTML(histogram, userScore) {
    if (histogram.length === 0) {
      return '<p>No data available yet.</p>';
    }

    let html = '<div class="histogram">';
    html += '<h4>Score Distribution</h4>';
    
    const maxCount = Math.max(...histogram.map(bin => bin.count));
    
    histogram.forEach(bin => {
      const barHeight = (bin.count / maxCount) * 100;
      const isUserBin = userScore >= parseFloat(bin.range.split('-')[0]) && 
                       userScore <= parseFloat(bin.range.split('-')[1]);
      
      html += `
        <div class="histogram-bar ${isUserBin ? 'user-bin' : ''}">
          <div class="bar" style="height: ${barHeight}%"></div>
          <div class="label">${bin.range}</div>
          <div class="count">${bin.count}</div>
        </div>
      `;
    });
    
    html += '</div>';
    return html;
  }

  // Generate HTML for top scores display
  generateTopScoresHTML(topScores, userScore, username = null) {
    if (topScores.length === 0) {
      return '<p>No scores recorded yet.</p>';
    }

    let html = '<div class="top-scores">';
    html += '<h4>Top Scores</h4>';
    html += '<ol>';
    
    topScores.forEach((scoreData) => {
      const isUser = Math.abs(scoreData.score - userScore) < 0.001 && 
                     scoreData.username === username;
      const displayName = scoreData.username || 'Anonymous';
      const date = new Date(scoreData.created_at).toLocaleDateString();
      
      html += `
        <li class="${isUser ? 'user-score' : ''}">
          <span class="player">${displayName}</span>
          <span class="score">${scoreData.score.toFixed(3)}</span>
          <span class="date">${date}</span>
        </li>
      `;
    });
    
    html += '</ol>';
    html += '</div>';
    return html;
  }
}