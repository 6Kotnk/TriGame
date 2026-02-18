// Database service for Supabase operations
export class Database {
  constructor() {
    // These will need to be replaced with your actual Supabase project values

    this.supabaseReadUrl = 'https://clmquoqxsfesbjpseuhj.supabase.co/rest/v1'; 
    this.supabaseWriteUrl = 'https://clmquoqxsfesbjpseuhj.supabase.co/functions/v1/submit-score';
    this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsbXF1b3F4c2Zlc2JqcHNldWhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNjQ3NjMsImV4cCI6MjA3MTY0MDc2M30.PnByNeob1w9h2lLWcuOoKR0k7wRtxJj-w8R0fjuKe_s'; // Your anon/public key
  }

  // Save a score to the database
  async saveScore(score, username = null, leaderboards) {
    try {
      const response = await fetch(this.supabaseWriteUrl, {
        method: 'POST',
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          score: score,
          username: username,
          leaderboards: leaderboards,
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to save score: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error saving score:', error);
      return false;
    }
  }

  // Get all scores from database
  async getAllScores() {
    try {
      const response = await fetch(`${this.supabaseReadUrl}/scores?select=*`, {
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch scores: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching scores:', error);
      return [];
    }
  }

  // Get top scores for leaderboard
  async getTopScores(limit = 10) {
    try {
      const response = await fetch(`${this.supabaseReadUrl}/scores?select=*&order=score.desc&limit=${limit}`, {
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch top scores: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching top scores:', error);
      return [];
    }
  }
}