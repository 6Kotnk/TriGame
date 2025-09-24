// Leaderboard service for statistics and histogram generation
export class Leaderboard {
  constructor(database) {
    this.database = database;
  }

  // Calculate user's percentile ranking
  calculatePercentile(userScore, allScores) {
    if (allScores.length === 0) return 100;
    
    const betterScores = allScores.filter(score => score > userScore).length;
    return Math.round((1 - ((betterScores) / allScores.length)) * 100);
  }

  // Calculate average score
  calculateAverage(allScores) {
    if (allScores.length === 0) return 0;
    return allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
  }

  // Create histogram data for visualization
  createHistogram(scores, numBins = 10) {
    if (scores.length === 0) return [];

    const binSize = 1 / numBins;
    const histogram = [];

    for (let bin = 0; bin < numBins; bin++) {
      const binStart = bin * binSize;
      const binEnd = binStart + binSize;
      const count = scores.filter(score => 
        score >= binStart && (bin === numBins - 1 ? score <= binEnd : score < binEnd)
      ).length;

      histogram.push(count / scores.length);
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
    let html = '<div>';
    html += '<h4>Score Distribution</h4>';
    const numBins = 10;
    html += '<table>';

    for (let bin = 0; bin < numBins; bin++) {
      const barHeight = histogram[bin];
      const isUserBin = (userScore >= (bin/numBins))  && (userScore < ((bin + 1)/numBins))
      html += '<tr>';
      html += '<td>';
      html += `<div style="background-color:${isUserBin ? "red" : "white"}; height:16px; width: ${barHeight * 500}px">`
      /*
      if(isUserBin){
        html += '<td>';
        html += '←You are here'
        html += '</td>';
      }
      */
      html += '</div>';
      html += '</tr>';
      html += '</td>';
    }

    html += '</table>';
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