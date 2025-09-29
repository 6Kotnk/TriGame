// Local database implementation that mimics the Database interface
export class Database {
  constructor() {
    // In-memory storage for scores
    this.scores = [];
    this.nextId = 1;
    
    // Prepopulate with sample data
    this.generateSampleData();
  }

  // Generate Gaussian random number using Box-Muller transform
  gaussianRandom(mean = 0, stdDev = 1) {
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); // Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return z * stdDev + mean;
  }

  // Generate sample data with fun usernames
  generateSampleData( numSamples = 50) {
    const funUsernames = [
      'TriangleMaster', 'GeoGuesser', 'EarthExplorer', 'MapManiac', 'SphericalSage',
      'LatitudeLegend', 'LongitudeKing', 'GeographyGuru', 'WorldWanderer', 'GlobeGladiator',
      'TerrainTitan', 'ContinentCrusher', 'OceanicOracle', 'MountainMaven', 'RiverRunner',
      'DesertDrifter', 'ForestFinder', 'CitySlicker', 'VillageViking', 'MetropolisMan',
      'IslandHopper', 'PolarPioneer', 'TropicalTraveler', 'ArcticAdventurer', 'JungleJumper',
      'PlateauPro', 'ValleyVanguard', 'CanyonCrawler', 'PeakPerformer', 'DepthDiver',
      'CoastalCaptain', 'InlandInquisitor', 'BorderBender', 'ZonalZealot', 'RegionalRover',
      'TerritorialTitan', 'ProvinceProdigy', 'StateStrategist', 'CountyConqueror', 'DistrictDynamo',
      'MunicipalMaster', 'LocalLegend', 'NeighborhoodNinja', 'StreetSavant', 'BlockBuster',
      'CornerConnoisseur', 'AlleyAce', 'SquareScholar', 'CircleSage', 'TriangleTracker'
    ];

    for (let i = 0; i < numSamples; i++) {
      // Generate Gaussian score centered at 0.5 with std dev of 0.15
      let score = this.gaussianRandom(0.5, 0.15);
      
      // Clamp to [0, 1] range
      score = Math.max(0, Math.min(1, score)) * 100;
      
      const username = funUsernames[i % funUsernames.length];
      const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Random time in last week
      
      this.scores.push({
        id: this.nextId++,
        score: score,
        username: username,
        created_at: timestamp.toISOString()
      });
    }
  }

  // Save a score to the local array
  async saveScore(score, username = null) {
    try {
      const newScore = {
        id: this.nextId++,
        score: score,
        username: username,
        created_at: new Date().toISOString()
      };
      
      this.scores.push(newScore);
      return true;
    } catch (error) {
      console.error('Error saving score:', error);
      return false;
    }
  }

  // Get all scores from local array
  async getAllScores() {
    try {
      return [...this.scores]; // Return a copy to prevent external modification
    } catch (error) {
      console.error('Error fetching scores:', error);
      return [];
    }
  }

  // Get top scores for leaderboard
  async getTopScores(limit = 10) {
    try {
      return [...this.scores]
        .sort((a, b) => b.score - a.score) // Sort by score descending
        .slice(0, limit); // Take top N scores
    } catch (error) {
      console.error('Error fetching top scores:', error);
      return [];
    }
  }
}