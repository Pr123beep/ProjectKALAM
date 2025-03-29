// src/dataUtils.js

/**
 * Transforms a row of data into a structured object.
 * @param {Object} row - An object representing a single row from your data source.
 * @returns {Object} A structured data object containing relevant properties.
 */
export function createStructuredData(row) {
    const structured = {
      college: row.college || null,
      companyIndustry: row.companyIndustry || null,
      companyName: row.companyName || null,
      firstName: row.firstName || null,
      lastName: row.lastName || null,
      linkedinCompanyUrl: row.linkedinCompanyUrl || null,
      linkedinDescription: row.linkedinDescription || null,
      linkedinFollowersCount: row.linkedinFollowersCount || null,
      linkedinHeadline: row.linkedinHeadline || null,
      linkedinProfileUrl: row.linkedinProfileUrl || null,
      location: row.location || null,
      previousCompanyName: row.previousCompanyName || null,
      linkedinSkillsLabel: row.linkedinSkillsLabel || null,
    };
  
    // Current Job details (only if a job title is available)
    if (row.linkedinJobTitle) {
      structured.currentJob = {
        jobTitle: row.linkedinJobTitle,
        jobDateRange: row.linkedinJobDateRange || null,
        jobDescription: row.linkedinJobDescription || null,
        jobLocation: row.linkedinJobLocation || null,
      };
    }
  
    // Previous Job details (only if a previous job title is available)
    if (row.linkedinPreviousJobTitle) {
      structured.previousJob = {
        previousJobTitle: row.linkedinPreviousJobTitle,
        previousJobDateRange: row.linkedinPreviousJobDateRange || null,
        previousJobLocation: row.linkedinPreviousJobLocation || null,
        previousJobDescription: row.linkedinPreviousJobDescription || null,
      };
    }
  
    // School/Education details (only if a school name is available)
    if (row.linkedinSchoolName) {
      structured.currentSchool = {
        schoolName: row.linkedinSchoolName,
        schoolDegree: row.linkedinSchoolDegree || null,
        schoolDateRange: row.linkedinSchoolDateRange || null,
        schoolDescription: row.linkedinSchoolDescription || null,
        schoolUrl: row.linkedinSchoolUrl || null,
      };
    }
  
    // Previous School details (only if a previous school name is available)
    if (row.linkedinPreviousSchoolName) {
      structured.previousSchool = {
        previousSchoolName: row.linkedinPreviousSchoolName,
        previousSchoolDegree: row.linkedinPreviousSchoolDegree || null,
        previousSchoolDateRange: row.linkedinPreviousSchoolDateRange || null,
        previousSchoolDescription: row.linkedinPreviousSchoolDescription || null,
        previousSchoolUrl: row.linkedinPreviousSchoolUrl || null,
      };
    }
  
    return structured;
  }
  