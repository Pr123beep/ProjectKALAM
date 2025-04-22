import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import ReactDOM from 'react-dom';
import { getUserLabels, getProfilesByLabel, updateProfileLabel, removeLabelFromProfile, getAllLabelCategories } from '../supabaseClient';
import LabelButton from './LabelButton';
import { generateFounderSummary } from '../utils/geminiApi';
import wellfoundData from '../wellfndAndphantom.json'; // Import wellfound data
import './LabelsPage.css';

// Normalize label names to group similar labels
const normalizeLabel = (label) => {
  if (!label) return '';
  
  // Convert to lowercase and trim whitespace
  return label.toLowerCase().trim();
};

// Get a consistent gradient based on the label name
const getLabelGradient = (labelName) => {
  try {
    // Array of preset gradients
    const gradients = [
      'linear-gradient(135deg, #FF9D6C, #BB4E75)', // Warm pink/orange
      'linear-gradient(135deg, #6EDCD9, #3279BB)', // Blue/teal
      'linear-gradient(135deg, #58B09C, #1C7C54)', // Green
      'linear-gradient(135deg, #D897EB, #7C3AED)', // Purple
      'linear-gradient(135deg, #FFC75F, #F9484A)', // Yellow/red
      'linear-gradient(135deg, #61C695, #2E8B57)', // Emerald
      'linear-gradient(135deg, #007CF0, #00DFD8)', // Aqua
      'linear-gradient(135deg, #7928CA, #FF0080)', // Magenta
      'linear-gradient(135deg, #FF4D4D, #F9CB28)', // Red/yellow
      'linear-gradient(135deg, #0070F3, #5E60CE)', // Blue/indigo
    ];
    
    if (!labelName) {
      return gradients[0]; // Return the first one as a default
    }
    
    // Hash the label name to get a consistent index
    let hashCode = 0;
    for (let i = 0; i < labelName.length; i++) {
      hashCode = ((hashCode << 5) - hashCode) + labelName.charCodeAt(i);
      hashCode = hashCode & hashCode; // Convert to 32bit integer
    }
    
    // Ensure positive index
    hashCode = Math.abs(hashCode);
    
    // Get the gradient using the hash code
    return gradients[hashCode % gradients.length];
  } catch (e) {
    console.error('Error in getLabelGradient:', e);
    return 'linear-gradient(135deg, #e2e8f0, #a0aec0)'; // Fallback gradient
  }
};

// Icon components
const LinkedInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CompanyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const WorkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const WellfoundIcon = () => (
  <img 
    src="/wellfound.png" 
    alt="Wellfound" 
    style={{ width: '16px', height: '16px', borderRadius: '2px', verticalAlign: 'middle' }}
  />
);

const LabelsPage = () => {
  const [labels, setLabels] = useState([]);
  const [uniqueLabels, setUniqueLabels] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [profilesByLabel, setProfilesByLabel] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [editingLabel, setEditingLabel] = useState(null);
  const [newLabelName, setNewLabelName] = useState('');
  const [totalProfiles, setTotalProfiles] = useState(0);
  const [categoryCount, setCategoryCount] = useState({});
  const [profileData, setProfileData] = useState(null);

  // Use useCallback to memoize the fetchLabels function
  const fetchLabels = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch the user's labels first
      const { data, error } = await getUserLabels();
      
      if (error) throw error;
      
      console.log("LabelsPage received data:", data);
      setLabels(data || []);
      
      // Extract unique label names without using getAllLabelCategories
      // This is a fallback approach that works even if label_categories doesn't exist
      const normalizedMap = {};
      const normalizedSet = new Set();
      
      // Create normalized mapping from actual label data
      (data || []).forEach(item => {
        const normalized = normalizeLabel(item.label_name);
        normalizedSet.add(normalized);
        
        // Store the display version (original casing) for each normalized label
        // If we already have a version stored, keep the one that came first
        if (!normalizedMap[normalized]) {
          normalizedMap[normalized] = item.label_name;
        }
      });
      
      // Try to get empty categories if available, but don't fail if it doesn't work
      try {
        const { data: allCategories, error: categoriesError } = await getAllLabelCategories();
        
        if (!categoriesError && allCategories) {
          allCategories.forEach(categoryName => {
            const normalized = normalizeLabel(categoryName);
            normalizedSet.add(normalized);
            
            // Add to the map if not already there
            if (!normalizedMap[normalized]) {
              normalizedMap[normalized] = categoryName;
            }
          });
        }
      } catch (categoryError) {
        console.warn('Could not fetch empty categories:', categoryError);
        // Continue with only the labels from getUserLabels
      }
      
      // Create unique labels array using the display versions
      const uniqueLabelsArray = Array.from(normalizedSet).map(normalized => 
        normalizedMap[normalized]
      );
      
      setUniqueLabels(uniqueLabelsArray);
      
      // Count profiles per normalized label
      const counts = {};
      let total = 0;
      
      uniqueLabelsArray.forEach(labelName => {
        const normalizedName = normalizeLabel(labelName);
        const count = data ? data.filter(item => 
          normalizeLabel(item.label_name) === normalizedName
        ).length : 0;
        
        counts[labelName] = count;
        total += count;
      });
      
      setCategoryCount(counts);
      setTotalProfiles(total);
      
      // If we have labels, select the first one by default
      if (uniqueLabelsArray.length > 0) {
        setSelectedLabel(uniqueLabelsArray[0]);
        await fetchProfilesForLabel(uniqueLabelsArray[0]);
      }
    } catch (err) {
      console.error('Error fetching labels:', err);
      setError('Failed to load labels. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLabels();
  }, [fetchLabels]);

  // When profile modal is open, prevent background scrolling
  useEffect(() => {
    if (selectedProfile) {
      document.body.classList.add('body-no-scroll');
    } else {
      document.body.classList.remove('body-no-scroll');
    }
    
    return () => {
      document.body.classList.remove('body-no-scroll');
    };
  }, [selectedProfile]);

  const fetchProfilesForLabel = async (labelName) => {
    if (!labelName) return;
    
    try {
      setIsLoading(true);
      
      // Get all profiles with the normalized version of this label
      const normalizedName = normalizeLabel(labelName);
      
      // Fetch all profiles that have any version of this normalized label
      const { data, error } = await getProfilesByLabel(normalizedName, true);
      
      if (error) throw error;
      
      // Store the profiles for this label
      setProfilesByLabel(prev => ({
        ...prev,
        [labelName]: data || []
      }));
    } catch (err) {
      console.error(`Error fetching profiles for label ${labelName}:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLabelClick = async (labelName) => {
    setSelectedLabel(labelName);
    
    // Check if we already have profiles for this label
    if (!profilesByLabel[labelName]) {
      await fetchProfilesForLabel(labelName);
    }
  };

  const handleRemoveLabel = async (labelId) => {
    try {
      await removeLabelFromProfile(labelId);
      
      // Get the label that was removed
      const removedLabel = labels.find(label => label.id === labelId);
      const labelName = removedLabel?.label_name;
      
      // Update the state with the label removed
      setLabels(labels.filter(label => label.id !== labelId));
      
      // Update profiles by label to remove this profile
      setProfilesByLabel(prev => {
        const updated = {...prev};
        Object.keys(updated).forEach(name => {
          updated[name] = updated[name].filter(profile => profile.id !== labelId);
        });
        return updated;
      });
      
      // Update counts
      if (labelName) {
        setCategoryCount(prev => {
          const updated = {...prev};
          updated[labelName] = Math.max(0, (updated[labelName] || 0) - 1);
          return updated;
        });
        setTotalProfiles(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error removing label:', err);
    }
  };

  const handleEditLabel = (labelName) => {
    setEditingLabel(labelName);
    setNewLabelName(labelName);
  };

  const handleDeleteLabelCategory = async (labelName) => {
    // Show confirmation dialog before deleting
    if (!window.confirm(`Are you sure you want to delete the "${labelName}" category? This will remove all profiles with this label.`)) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Get all labels with this name and delete them manually
      // This is a more reliable approach that doesn't require the label_categories table
      const normalizedLabelName = normalizeLabel(labelName);
      
      // Find all labels with this normalized name
      const labelsToDelete = labels.filter(label => 
        normalizeLabel(label.label_name) === normalizedLabelName
      );
      
      console.log(`Deleting ${labelsToDelete.length} labels with name "${labelName}"`);
      
      // Delete each label individually
      for (const label of labelsToDelete) {
        await removeLabelFromProfile(label.id);
      }
      
      // Update the labels list
      setLabels(prevLabels => 
        prevLabels.filter(label => normalizeLabel(label.label_name) !== normalizedLabelName)
      );
      
      // Remove this label from uniqueLabels
      const updatedLabels = uniqueLabels.filter(label => 
        normalizeLabel(label) !== normalizedLabelName
      );
      
      setUniqueLabels(updatedLabels);
      
      // Update category counts
      setCategoryCount(prev => {
        const updated = {...prev};
        delete updated[labelName];
        return updated;
      });
      
      // If this was the selected label, select another one or clear selection
      if (normalizeLabel(selectedLabel) === normalizedLabelName) {
        if (updatedLabels.length > 0) {
          setSelectedLabel(updatedLabels[0]);
          await fetchProfilesForLabel(updatedLabels[0]);
        } else {
          setSelectedLabel(null);
          setProfilesByLabel({});
        }
      }
      
      // Show success message
      alert(`Successfully deleted the "${labelName}" category.`);
    } catch (err) {
      console.error('Error deleting label category:', err);
      alert(`Failed to delete the "${labelName}" category. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateLabel = async (e) => {
    e.preventDefault();
    if (!editingLabel || !newLabelName.trim() || newLabelName === editingLabel) {
      setEditingLabel(null);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Get normalized version of editing label
      const normalizedEditingLabel = normalizeLabel(editingLabel);
      
      // Update all labels with this normalized name
      const labelsToUpdate = labels.filter(label => 
        normalizeLabel(label.label_name) === normalizedEditingLabel
      );
      
      console.log(`Updating ${labelsToUpdate.length} labels from "${editingLabel}" to "${newLabelName}"`);
      
      for (const label of labelsToUpdate) {
        await updateProfileLabel(label.id, newLabelName);
      }
      
      // Update local state
      setLabels(labels.map(label => 
        normalizeLabel(label.label_name) === normalizedEditingLabel
          ? {...label, label_name: newLabelName} 
          : label
      ));
      
      // Update unique labels - remove all versions of the old label and add the new one
      setUniqueLabels(prev => {
        const filteredLabels = prev.filter(l => normalizeLabel(l) !== normalizedEditingLabel);
        return [...filteredLabels, newLabelName];
      });
      
      // Update profiles by label
      setProfilesByLabel(prev => {
        const updated = {...prev};
        if (updated[editingLabel]) {
          updated[newLabelName] = updated[editingLabel];
          
          // Remove all variations of the old normalized label
          Object.keys(updated).forEach(key => {
            if (normalizeLabel(key) === normalizedEditingLabel) {
              delete updated[key];
            }
          });
        }
        return updated;
      });
      
      // Update category count
      setCategoryCount(prev => {
        const updated = {...prev};
        let totalCount = 0;
        
        // Find all labels with the same normalized name and sum their counts
        Object.keys(prev).forEach(key => {
          if (normalizeLabel(key) === normalizedEditingLabel) {
            totalCount += prev[key];
            delete updated[key];
          }
        });
        
        updated[newLabelName] = totalCount;
        return updated;
      });
      
      // If the edited label was selected, update the selected label
      if (normalizeLabel(selectedLabel) === normalizedEditingLabel) {
        setSelectedLabel(newLabelName);
      }
      
      setEditingLabel(null);
    } catch (err) {
      console.error('Error updating label:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const openProfileModal = (profile) => {
    setSelectedProfile(profile);
    
    // Convert label profile data format to StartupCard format
    if (profile && profile.founder_data) {
      const founderData = profile.founder_data;
      const nameParts = founderData.name ? founderData.name.split(' ') : ['', ''];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Try to find more detailed data from wellfound data
      let enrichedData = {};
      
      try {
        // Find matching profile in wellfound data
        const matchingProfile = wellfoundData.find(item => {
          // Match by name (first and last name)
          const nameMatch = (item.firstName && item.lastName) && 
            (item.firstName.toLowerCase() === firstName.toLowerCase() &&
             item.lastName.toLowerCase() === lastName.toLowerCase());
          
          // Match by company name if available
          const companyMatch = founderData.company && item.companyName && 
            founderData.company.toLowerCase() === item.companyName.toLowerCase();
          
          // Match by LinkedIn URL if available
          const linkedinMatch = founderData.linkedinUrl && item.linkedinProfileUrl &&
            founderData.linkedinUrl === item.linkedinProfileUrl;
            
          return nameMatch || companyMatch || linkedinMatch;
        });
        
        if (matchingProfile) {
          console.log('Found matching profile in wellfound data for', firstName, lastName);
          enrichedData = matchingProfile;
        }
      } catch (error) {
        console.error('Error finding matching profile in wellfound data:', error);
      }
      
      // Combine founder data with enriched data, preferring founder data when available
      const profileDataObj = {
        id: profile.founder_id,
        firstName: firstName,
        lastName: lastName,
        companyName: founderData.company || enrichedData.companyName || '',
        linkedinProfileUrl: founderData.linkedinUrl || enrichedData.linkedinProfileUrl || '',
        wellFoundProfileURL: founderData.wellFoundUrl || enrichedData.wellFoundProfileURL || '',
        location: founderData.location || enrichedData.location || enrichedData.currentLocation || '',
        linkedinHeadline: founderData.headline || enrichedData.linkedinHeadline || '',
        companyIndustry: founderData.industry || enrichedData.companyIndustry || '',
        linkedinDescription: founderData.linkedinDescription || enrichedData.linkedinDescription || '',
        linkedinJobTitle: founderData.linkedinJobTitle || enrichedData.linkedinJobTitle || '',
        linkedinJobDescription: founderData.linkedinJobDescription || enrichedData.linkedinJobDescription || '',
        linkedinJobLocation: founderData.linkedinJobLocation || enrichedData.linkedinJobLocation || '',
        linkedinSkillsLabel: founderData.linkedinSkillsLabel || enrichedData.linkedinSkillsLabel || '',
        linkedinPreviousJobTitle: enrichedData.linkedinPreviousJobTitle || '',
        linkedinPreviousJobDescription: enrichedData.linkedinPreviousJobDescription || '',
        colleges: enrichedData.colleges || (founderData.college ? [founderData.college] : []),
        college: founderData.college || enrichedData.college || '',
        aiSummary: founderData.aiSummary || profile.aiSummary || '',
      };
      
      console.log('Combined profile data:', profileDataObj);
      
      setProfileData(profileDataObj);
      
      // If no AI summary exists, attempt to generate one
      if (!founderData.aiSummary && !profile.aiSummary) {
        generateSummary(profileDataObj);
      }
    }
  };

  // Function to generate AI summary for profiles
  const generateSummary = async (profileData) => {
    console.log('Generating summary for:', profileData.firstName, profileData.lastName);
    
    try {
      // Check if we have enough data for a good summary
      const hasDescription = profileData.linkedinDescription && profileData.linkedinDescription.length > 30;
      const hasJobDescription = profileData.linkedinJobDescription && profileData.linkedinJobDescription.length > 30;
      const hasPrevJobDescription = profileData.linkedinPreviousJobDescription && profileData.linkedinPreviousJobDescription.length > 30;
      const hasHeadline = profileData.linkedinHeadline && profileData.linkedinHeadline.length > 10;
      const hasJobTitle = profileData.linkedinJobTitle && profileData.linkedinJobTitle.length > 5;
      const hasPrevJobTitle = profileData.linkedinPreviousJobTitle && profileData.linkedinPreviousJobTitle.length > 5;
      const hasCompany = profileData.companyName && profileData.companyName.length > 2;
      const hasCollege = (profileData.colleges && profileData.colleges.length > 0) || (profileData.college && profileData.college.length > 5);
      
      // Count available data points for summary
      const dataPoints = [
        hasDescription, hasJobDescription, hasPrevJobDescription, 
        hasHeadline, hasJobTitle, hasPrevJobTitle, hasCompany, hasCollege
      ].filter(Boolean).length;
      
      console.log('Data points available:', dataPoints);
      
      // If we have less than 2 meaningful data points, show manual summary
      if (dataPoints < 2) {
        console.log('Not enough profile data for AI summary generation');
        
        // Create manual summary with available data
        const manualSummary = `
          <div class="enhanced-profile-content">
            <div class="profile-section">
              <p class="profile-introduction">
                ${hasHeadline ? profileData.linkedinHeadline : 
                  `${profileData.firstName} ${profileData.lastName} ${hasJobTitle ? `works as ${profileData.linkedinJobTitle}` : ''} 
                   ${hasCompany ? `at ${profileData.companyName}` : ''}.`}
              </p>
              ${hasCollege ? `<p class="profile-education">Educated at ${Array.isArray(profileData.colleges) ? profileData.colleges.join(', ') : profileData.college}.</p>` : ''}
              ${hasJobDescription ? `<p class="profile-job">${profileData.linkedinJobDescription}</p>` : ''}
            </div>
          </div>
        `;
        
        setProfileData(prevData => ({
          ...prevData,
          aiSummary: manualSummary
        }));
        return;
      }
      
      // Simulate loading state
      setProfileData(prevData => ({
        ...prevData,
        aiSummary: '<p><em>Generating AI summary...</em></p>'
      }));
      
      console.log('Calling generateFounderSummary function');
      
      // Call the generator directly
      try {
        const summary = await generateFounderSummary(profileData);
        console.log('Summary generated:', summary ? 'Success' : 'Failed');
        
        if (summary) {
          // Format the summary with HTML
          const formattedSummary = `
            <div class="enhanced-profile-content">
              <div class="profile-section">
                <p class="profile-introduction">${summary}</p>
              </div>
              ${hasCollege ? `
              <div class="profile-education-section">
                <h4>Education</h4>
                <p>${Array.isArray(profileData.colleges) ? profileData.colleges.join(', ') : profileData.college}</p>
              </div>` : ''}
            </div>
          `;
          
          setProfileData(prevData => ({
            ...prevData,
            aiSummary: formattedSummary
          }));
        } else {
          throw new Error('Summary generation failed');
        }
      } catch (error) {
        console.error('Error generating AI summary:', error);
        console.log('Available profile data:', {
          headline: profileData.linkedinHeadline || profileData.wellfoundHeadline,
          description: profileData.linkedinDescription?.substring(0, 50) + '...',
          jobDesc: profileData.linkedinJobDescription?.substring(0, 50) + '...'
        });
        
        // Fallback if the generator fails
        let fallbackContent = '';
        
        if (hasDescription) {
          fallbackContent = profileData.linkedinDescription;
        } else if (hasJobDescription) {
          fallbackContent = `${profileData.linkedinJobTitle || 'Professional'} at ${profileData.companyName || 'company'}: ${profileData.linkedinJobDescription}`;
        } else if (hasPrevJobDescription) {
          fallbackContent = `Previously as ${profileData.linkedinPreviousJobTitle || 'professional'}: ${profileData.linkedinPreviousJobDescription}`;
        } else if (hasHeadline) {
          fallbackContent = profileData.linkedinHeadline;
        } else {
          fallbackContent = `${profileData.firstName} ${profileData.lastName} ${hasJobTitle ? `works as ${profileData.linkedinJobTitle}` : ''} ${hasCompany ? `at ${profileData.companyName}` : ''}.`;
        }
        
        const fallbackSummary = `
          <div class="enhanced-profile-content">
            <div class="profile-section">
              <h3 class="profile-section-title">About</h3>
              <p class="profile-introduction">${fallbackContent}</p>
            </div>
            ${hasCollege ? `
            <div class="profile-education-section">
              <h4>Education</h4>
              <p>${Array.isArray(profileData.colleges) ? profileData.colleges.join(', ') : profileData.college}</p>
            </div>` : ''}
          </div>
        `;
        
        setProfileData(prevData => ({
          ...prevData,
          aiSummary: fallbackSummary
        }));
      }
    } catch (error) {
      console.error('Error in generateSummary:', error);
      
      // Ultimate fallback
      setProfileData(prevData => ({
        ...prevData,
        aiSummary: `
          <div class="enhanced-profile-content">
            <div class="profile-section">
              <p class="profile-introduction">There was an error generating the AI summary. Please try again later.</p>
              <p>Profile information for ${profileData.firstName} ${profileData.lastName}: ${profileData.linkedinHeadline || ''}</p>
            </div>
          </div>
        `
      }));
    }
  };

  const closeProfileModal = () => {
    setSelectedProfile(null);
    setProfileData(null);
  };

  // Replace the entire renderProfileModal function with this one
  const renderProfileModal = () => {
    if (!selectedProfile || !profileData) return null;
    
    const handleClose = () => {
      closeProfileModal();
    };
    
    return ReactDOM.createPortal(
      <div className="modal-root" key="label-profile-modal-portal">
        <motion.div
          className="detail-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleClose}
        >
          <motion.div
            className="detail-modal simplified-modal"
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <motion.button 
              className="close-button" 
              onClick={handleClose}
              whileHover={{ scale: 1.1, backgroundColor: "rgba(0, 0, 0, 0.2)" }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ delay: 0.3 }}
            >
              <CloseIcon />
            </motion.button>
            
            {/* Label button */}
            <motion.div 
              className="label-button-container modal-label-button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <LabelButton 
                founderData={profileData} 
                onLabelChange={(labels) => {
                  console.log('Profile labels updated:', labels);
                  
                  const labelNames = Array.isArray(labels) 
                    ? labels.map(label => (label && typeof label === 'object' && label.label_name) ? label.label_name : label).join(', ')
                    : '';
                  
                  const toast = document.createElement('div');
                  toast.className = 'label-toast';
                  toast.textContent = labels.length ? `Labels updated: ${labelNames}` : 'Labels cleared';
                  document.body.appendChild(toast);
                  
                  setTimeout(() => {
                    toast.classList.add('label-toast-hide');
                    setTimeout(() => document.body.removeChild(toast), 500);
                  }, 2000);
                  
                  // Refresh the labels after updating
                  fetchLabels();
                }}
                className="modal-label-button"
                dropdownDirection="down"
              />
            </motion.div>
            
            {/* Simplified header */}
            <motion.div 
              className="modal-header"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="profile-info">
                <motion.div 
                  className="profile-avatar"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  {profileData.firstName?.charAt(0)}
                  {profileData.lastName?.charAt(0)}
                </motion.div>

                <div className="profile-main">
                  <motion.h2 
                    className="profile-name"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    {profileData.firstName} {profileData.lastName}
                  </motion.h2>
                  
                  <motion.p 
                    className="profile-headline"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                  >
                    {profileData.linkedinHeadline}
                  </motion.p>
                  
                  {profileData.location && (
                    <motion.p 
                      className="profile-location"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.4 }}
                    >
                      <LocationIcon /> {profileData.location}
                    </motion.p>
                  )}
                  
                  <motion.div 
                    className="profile-links"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                  >
                    {profileData.linkedinProfileUrl && (
                      <a
                        href={profileData.linkedinProfileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="profile-link linkedin-link"
                      >
                        <LinkedInIcon /> View LinkedIn Profile
                      </a>
                    )}
                    
                    {profileData.wellFoundProfileURL && (
                      <a 
                        href={profileData.wellFoundProfileURL} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="profile-link wellfound-link"
                      >
                        <WellfoundIcon /> View Wellfound Profile
                      </a>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Simplified content - focus on AI summary */}
            <motion.div 
              className="modal-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {/* AI Summary Section */}
              <motion.div 
                className="detail-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="section-title">
                  <span role="img" aria-label="AI">🤖</span> AI Profile Summary
                </h3>
                <div className="detail-card">
                  <div className="ai-summary">
                    {profileData.aiSummary ? (
                      profileData.aiSummary.includes('Generating AI summary') ? (
                        <div className="ai-summary-loading">
                          <p>Generating AI summary...</p>
                          <div className="loading-spinner"></div>
                        </div>
                      ) : (
                        <div dangerouslySetInnerHTML={{ __html: profileData.aiSummary }} />
                      )
                    ) : (
                      <div className="ai-summary-placeholder">
                        <p>AI summary not available for this profile. Generating...</p>
                        <div className="loading-spinner"></div>
                        {profileData.linkedinDescription && (
                          <div className="description">
                            <h4>Profile Description:</h4>
                            {profileData.linkedinDescription.split('\n\n').map((paragraph, idx) => (
                              <p key={idx} className="description-paragraph">{paragraph}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Basic Company Info */}
              {(profileData.companyName) && (
                <motion.div 
                  className="detail-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="section-title">
                    <CompanyIcon /> Company
                  </h3>
                  <div className="detail-card">
                    <h4>{profileData.companyName}</h4>
                    {profileData.companyIndustry && (
                      <p className="industry">
                        Industry: {profileData.companyIndustry}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Work Experience - if available */}
              {(profileData.linkedinJobTitle || profileData.linkedinPreviousJobTitle) && (
                <motion.div 
                  className="detail-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="section-title">
                    <WorkIcon /> Work Experience
                  </h3>
                  <div className="detail-card">
                    {profileData.linkedinJobTitle && (
                      <div className="work-item">
                        <h4>{profileData.linkedinJobTitle}</h4>
                        {profileData.linkedinJobDescription && (
                          <p className="job-description">{profileData.linkedinJobDescription}</p>
                        )}
                      </div>
                    )}
                    
                    {profileData.linkedinPreviousJobTitle && (
                      <div className="work-item previous-job">
                        <h4>Previous: {profileData.linkedinPreviousJobTitle}</h4>
                        {profileData.linkedinPreviousJobDescription && (
                          <p className="job-description">{profileData.linkedinPreviousJobDescription}</p>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Skills Section - if available */}
              {profileData.linkedinSkillsLabel && (
                <motion.div 
                  className="detail-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h3 className="section-title">
                    <span role="img" aria-label="Skills">🛠️</span> Skills
                  </h3>
                  <div className="skills-container">
                    {profileData.linkedinSkillsLabel.split(',').map((skill, idx) => (
                      <span key={idx} className="skill-tag">{skill.trim()}</span>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>,
      document.body
    );
  };

  if (error) {
    return (
      <div className="labels-container">
        <h2 className="labels-title">My Labels</h2>
        <div className="labels-error">
          {error}
          <button className="labels-retry-button" onClick={fetchLabels}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="labels-container">
      <h2 className="labels-title">
        My Labels 
        {totalProfiles > 0 && (
          <span className="total-count">({totalProfiles} total profiles)</span>
        )}
      </h2>
      
      {error && (
        <div className="labels-error">
          {error}
          <button className="labels-retry-button" onClick={fetchLabels}>
            Try Again
          </button>
        </div>
      )}
      
      {isLoading && !Object.keys(profilesByLabel).length ? (
        <div className="labels-loading">Loading labels...</div>
      ) : uniqueLabels.length === 0 ? (
        <div className="labels-empty">
          <p>You haven't created any labels yet.</p>
          <p>Browse through founder profiles and use the label icon to organize them into categories.</p>
        </div>
      ) : (
        <div className="labels-content">
          <div className="labels-sidebar">
            <h3 className="labels-sidebar-title">Categories</h3>
            <ul className="labels-list">
              {uniqueLabels.map(labelName => {
                const gradient = getLabelGradient(labelName);
                // Extract the end color of the gradient for the indicator with a fallback
                const accentColor = gradient.split(',')[1]?.trim()?.slice(0, -1) || '#e2e8f0';
                
                return (
                  <li 
                    key={labelName} 
                    className={`label-item ${selectedLabel === labelName ? 'active' : ''}`}
                    data-gradient={gradient}
                  >
                    <button
                      className="label-button"
                      onClick={() => handleLabelClick(labelName)}
                      style={
                        labelName !== editingLabel
                          ? { 
                              background: labelName === selectedLabel 
                                ? (() => {
                                    try {
                                      const colorStart = gradient.split(',')[0].split('(135deg,')[1]?.trim() || 'rgba(255,255,255,0.4)';
                                      return `linear-gradient(135deg, ${colorStart}40, ${accentColor}60)`;
                                    } catch (e) {
                                      return 'linear-gradient(135deg, rgba(255,255,255,0.4), rgba(200,200,200,0.6))';
                                    }
                                  })()
                                : 'none',
                              borderLeft: labelName !== selectedLabel ? `3px solid ${accentColor}` : 'none',
                              color: labelName === selectedLabel ? '#333' : undefined
                            }
                          : {}
                      }
                    >
                      {labelName === editingLabel ? (
                        <form onSubmit={handleUpdateLabel} className="edit-label-form">
                          <input
                            type="text"
                            value={newLabelName}
                            onChange={(e) => setNewLabelName(e.target.value)}
                            autoFocus
                            onBlur={handleUpdateLabel}
                            className="edit-label-input"
                          />
                        </form>
                      ) : (
                        <>
                          <span className="label-name">{labelName}</span>
                          <span className="label-count">({categoryCount[labelName] || 0})</span>
                        </>
                      )}
                    </button>
                    
                    <div className="label-actions">
                      <button 
                        className="edit-label-button"
                        onClick={() => handleEditLabel(labelName)}
                        title="Edit label"
                      >
                        ✎
                      </button>
                      <button 
                        className="delete-label-button"
                        onClick={() => handleDeleteLabelCategory(labelName)}
                        title="Delete label category"
                      >
                        🗑️
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          
          <div className="labels-profiles">
            <h3 className="labels-profiles-title">
              {selectedLabel ? (
                <>
                  Founders labeled as "{selectedLabel}" 
                  <span className="label-count">({profilesByLabel[selectedLabel]?.length || 0} profiles)</span>
                </>
              ) : 'Select a label'}
            </h3>
            
            {selectedLabel && profilesByLabel[selectedLabel] && (
              <div className="labeled-profiles-list">
                {profilesByLabel[selectedLabel].length === 0 ? (
                  <p className="no-profiles-message">No profiles with this label.</p>
                ) : (
                  profilesByLabel[selectedLabel].map(profile => {
                    const founderData = profile.founder_data || {};
                    const gradient = getLabelGradient(selectedLabel);
                    
                    // Extract the end color of the gradient for the indicator with a fallback
                    const accentColor = gradient.split(',')[1]?.trim()?.slice(0, -1) || '#e2e8f0';
                    
                    return (
                      <div 
                        key={profile.id} 
                        className="labeled-profile-card"
                        style={{
                          borderTop: `4px solid ${accentColor}80`,
                          background: (() => {
                            try {
                              return `linear-gradient(to bottom, ${accentColor}15, white 35%)`;
                            } catch (e) {
                              return 'linear-gradient(to bottom, rgba(220,220,220,0.2), white 35%)';
                            }
                          })()
                        }}
                      >
                        <div className="labeled-profile-content">
                          <h3 className="labeled-profile-name">{founderData.name || 'Unnamed Founder'}</h3>
                          
                          <div className="labeled-profile-details">
                            {founderData.company && (
                              <span className="labeled-profile-company">{founderData.company}</span>
                            )}
                            
                            {founderData.industry && (
                              <span className="labeled-profile-sector">{founderData.industry}</span>
                            )}
                          </div>
                          
                          {founderData.headline && (
                            <p className="labeled-profile-headline">{founderData.headline}</p>
                          )}
                          
                          {profile.notes && (
                            <p className="labeled-profile-notes">{profile.notes}</p>
                          )}
                          
                          <div className="labeled-profile-date">
                            Labeled on {new Date(profile.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="labeled-profile-actions">
                          <button 
                            className="view-profile-button"
                            onClick={() => openProfileModal(profile)}
                          >
                            View Full Profile
                          </button>
                          
                          <div className="social-buttons">
                            {founderData.linkedinUrl && (
                              <a 
                                href={founderData.linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="social-button linkedin-button"
                                title="View LinkedIn Profile"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                </svg>
                              </a>
                            )}
                            
                            {founderData.wellFoundUrl && (
                              <a 
                                href={founderData.wellFoundUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="social-button wellfound-button"
                                title="View Wellfound Profile"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M2 2v20h20V2H2zm18 18H4V4h16v16zM10 12H24V2H10v10zm2-8h10v6H12V4z" />
                                </svg>
                              </a>
                            )}
                          </div>
                          
                          <button 
                            className="remove-label-button"
                            onClick={() => handleRemoveLabel(profile.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Render the profile modal when a profile is selected */}
      {renderProfileModal()}
    </div>
  );
};

export default LabelsPage; 