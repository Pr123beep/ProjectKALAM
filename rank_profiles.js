// rank_profiles.js
import fs from 'fs/promises';
import path from 'path';
import { parse } from 'json2csv';

// === Ranking Helpers ===
function computeRuleBasedScore(item) {
  const school   = parseFloat(item.college_score)     || 0;
  const company  = parseFloat(item.best_score)        || 0;
  const jobTitle = parseFloat(item.job_title_score)   || 0;

  const wSchool   = 0.20;
  const wCompany  = 0.18;
  const wJobTitle = 0.12;

  return (school   / 10) * wSchool
       + (company  / 10) * wCompany
       + (jobTitle / 10) * wJobTitle;
}

function sortByRanking(data) {
  const sorted = [...data].sort((a, b) => {
    const sa = computeRuleBasedScore(a);
    const sb = computeRuleBasedScore(b);
    if (sb !== sa) return sb - sa;

    const fa = parseInt(a.linkedinFollowersCount, 10) || 0;
    const fb = parseInt(b.linkedinFollowersCount, 10) || 0;
    if (fb !== fa) return fb - fa;

    const ca = parseFloat(a.best_score) || 0;
    const cb = parseFloat(b.best_score) || 0;
    if (cb !== ca) return cb - ca;

    const na = (`${a.lastName}${a.firstName}`).toLowerCase();
    const nb = (`${b.lastName}${b.firstName}`).toLowerCase();
    return na.localeCompare(nb);
  });

  return sorted.map((item, idx) => ({
    ...item,
    uniqueRank:   idx + 1,
    uniquePoints: Math.round(computeRuleBasedScore(item) * 100)
  }));
}

// === Main ===
async function main() {
  try {
    const jsonPath = process.argv[2] || './wellfndAndphantom.json';
    const raw       = await fs.readFile(jsonPath, 'utf-8');
    const data      = JSON.parse(raw);

    const ranked = sortByRanking(data);

    // Pick fields you want in CSV
    const fields = [
      'uniqueRank',
      'uniquePoints',
      'firstName',
      'lastName',
      'companyName',
      'college_score',
      'best_score',
      'job_title_score',
      'linkedinFollowersCount'
    ];

    const csv = parse(ranked, { fields });
    const outPath = path.join(process.cwd(), 'ranked_profiles.csv');
    await fs.writeFile(outPath, csv);

    console.log(`✅ Wrote ${ranked.length} rows to ${outPath}`);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

main();
