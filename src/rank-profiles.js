// rank_profiles.js
const fs = require('fs-extra');
const { createObjectCsvWriter } = require('csv-writer');

// ————— your in-JS versions of computeRuleBasedScore & sortByRanking —————

function computeRuleBasedScore(item) {
  const school   = parseFloat(item.college_score)   || 0; // 0–10
  const company  = parseFloat(item.best_score)      || 0; // 0–10
  const jobTitle = parseFloat(item.job_title_score) || 0; // 0–10

  // weights (out of the 0.5 total bucket)
  const wSchool   = 0.20;
  const wCompany  = 0.18;
  const wJobTitle = 0.12;

  // normalized to 0–1 * weight
  return (school   / 10) * wSchool
       + (company  / 10) * wCompany
       + (jobTitle / 10) * wJobTitle;
}

function sortByRanking(data) {
  return data
    .slice()
    .sort((a, b) => {
      // 1) rule-based score
      const sa = computeRuleBasedScore(a);
      const sb = computeRuleBasedScore(b);
      if (sb !== sa) return sb - sa;

      // 2) linkedinFollowersCount
      const fa = parseInt(a.linkedinFollowersCount, 10) || 0;
      const fb = parseInt(b.linkedinFollowersCount, 10) || 0;
      if (fb !== fa) return fb - fa;

      // 3) best_score
      const ca = parseFloat(a.best_score) || 0;
      const cb = parseFloat(b.best_score) || 0;
      if (cb !== ca) return cb - ca;

      // 4) alphabetical lastName+firstName
      const na = (a.lastName + a.firstName).toLowerCase();
      const nb = (b.lastName + b.firstName).toLowerCase();
      return na.localeCompare(nb);
    })
    .map((item, idx) => ({
      ...item,
      uniqueRank:   idx + 1,
      uniquePoints: Math.round(computeRuleBasedScore(item) * 100)
    }));
}

// ————— main: read JSON, sort, write CSV —————

async function main() {
  try {
    // 1) load your JSON (adjust path as needed)
    const raw = await fs.readFile('./wellfndAndphantom.json', 'utf-8');
    const profiles = JSON.parse(raw);

    // 2) sort + annotate
    const sorted = sortByRanking(profiles);

    // 3) build CSV writer including all original keys + our two new ones
    const headers = Object.keys(sorted[0]).map(k => ({ id: k, title: k }));
    const csvWriter = createObjectCsvWriter({
      path: 'ranked_profiles.csv',
      header: headers
    });

    // 4) write out
    await csvWriter.writeRecords(sorted);
    console.log('✅  Wrote ranked_profiles.csv with uniqueRank & uniquePoints');
  } catch (err) {
    console.error(err);
  }
}

main();
