// Leaderboard service for statistics and histogram generation
export class Leaderboard {
  constructor(HTMLElements, database) {
    this.HTMLElements = HTMLElements;
    this.database = database;
  }

  // Calculate average score
  calculateAverage(allScores) {
    if (allScores.length === 0) return 0;
    return allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
  }

  // Calculate user's percentile ranking
  calculatePercentile(userScore, allScores) {
    if (allScores.length === 0) return 100;
    
    const betterScores = allScores.filter(score => score > userScore).length;
    return Math.round((1 - ((betterScores) / allScores.length)) * 100);
  }

  createHistogram(scores, numBins = 10) {
    if (scores.length === 0) return [];

    const normalizedScores = scores.map(s => s / 100);

    const binSize = 1 / numBins;
    const histogram = [];

    for (let bin = 0; bin < numBins; bin++) {
      const binStart = bin * binSize;
      const binEnd = binStart + binSize;

      const count = normalizedScores.filter(score =>
        score >= binStart && (bin === numBins - 1 ? score <= binEnd : score < binEnd)
      ).length;

      histogram.push(count / normalizedScores.length);
    }

    return histogram;
  }

  // Get comprehensive stats for a user's score
  async getStats() {
    try {
      const allScoresData = await this.database.getAllScores();
      const scores = allScoresData.map(s => s.score);

      if (scores.length === 0) {
        return {
          scores: [],
          totalPlayers: 0,
          average: 0,
          histogram: [],
          topScores: []
        };
      }

      const average = this.calculateAverage(scores);
      const histogram = this.createHistogram(scores);
      const topScores = await this.database.getTopScores();

      return {
        //percentile,
        scores: scores,
        totalPlayers: scores.length,
        average: average.toFixed(0),
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

  generateHistogramHTML(histogram, userScore) {
    if (!histogram || histogram.length === 0) {
      return '<p>No data available yet.</p>';
    }

    const normalizedUserScore = userScore / 100;

    const numBins = histogram.length;
    const maxVal = Math.max(...histogram);
    const maxHeight = 200; // tallest bar in px

    let html = '<div class="histogram">';
    html += '<h4>Score Distribution</h4>';

    html += '<div class="histogram-wrapper">';
    html += '<div class="histogram-bars">';

    for (let bin = 0; bin < numBins; bin++) {
      let barHeight = maxVal > 0 ? (histogram[bin] / maxVal) * maxHeight : 0;

      let isUserBin = false;

      if(normalizedUserScore != 0)
      {
        isUserBin = (normalizedUserScore === 1)
        ? (bin === numBins - 1)
        : (normalizedUserScore >= (bin / numBins) && normalizedUserScore < ((bin + 1) / numBins));
      }

      html += '<div class="histogram-bin">';
      html += `<div class="bar ${isUserBin ? 'user' : ''}" style="height:${barHeight}px;"></div>`;
      html += '</div>';
    }

    html += '</div>'; // close bars row

    // Axis line
    html += '<div class="histogram-axis"></div>';

    // Axis ticks + labels
    for (let i = 0; i <= numBins; i++) {
      const leftPercent = (i / numBins) * 100;
      const label = Math.round((i / numBins) * 100);

      html += `<div class="tick" style="left:${leftPercent}%;"></div>`;
      html += `<div class="tick-label" style="left:${leftPercent}%; ">${label}</div>`;
    }

    html += '</div>'; // wrapper
    html += '</div>'; // histogram outer

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

      let isUser = false;

      if(userScore != 0)
      {
        isUser = scoreData.score == userScore && 
                 scoreData.username === username;
      }

      const displayName = scoreData.username || 'Anonymous';
      
      html += `
        <li class="${isUser ? 'user-score' : ''}">
          <span class="player">${displayName}</span>
          <span class="score">${scoreData.score.toFixed(0)}</span>
        </li>
      `;
    });
    
    html += '</ol>';
    html += '</div>';
    return html;
  }

  async showLeaderboard(score, username = null, leaderboards){
    this.HTMLElements.leaderboard.style.display = 'block';

    let leaderboardHTML = this.HTMLElements.leaderboard.innerHTML;

    const stats = await this.getStats();

    if( score != 0) // game won
    {
      const percentile = this.calculatePercentile(score, stats.scores);
      leaderboardHTML += `<h3>Your Score: ${score.toFixed(0)}</h3>`;
      leaderboardHTML += `<p>You scored better than ${percentile}% of players!</p>`;
    }

    leaderboardHTML += `<p>Average score: ${stats.average} (${stats.totalPlayers} total players)</p>`;
    
    // Add histogram
    leaderboardHTML += this.generateHistogramHTML(stats.histogram, score);
    
    // Add top scores
    leaderboardHTML += this.generateTopScoresHTML(stats.topScores, score, username);
    
    // Show leaderboard stats
    this.HTMLElements.leaderboard.innerHTML = leaderboardHTML;
  }

}