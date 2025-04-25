// src/LabelsPage.js
import React, { useState, useEffect, useCallback } from 'react'
import {
  getUserLabels,
  getProfilesByLabel,
  removeLabelFromProfile,
  getAllLabelCategories
} from '../supabaseClient'
import wellfoundData from '../wellfndAndphantom.json'
import StartupCard from './StartupCard'
import '../App.css'
import './LabelsPage.css'

const normalizeLabel = label =>
  label ? label.toLowerCase().trim() : ''

const getLabelGradient = labelName => {
  const gradients = [
    'linear-gradient(135deg, #FF9D6C, #BB4E75)',
    'linear-gradient(135deg, #6EDCD9, #3279BB)',
    'linear-gradient(135deg, #58B09C, #1C7C54)',
    'linear-gradient(135deg, #D897EB, #7C3AED)',
    'linear-gradient(135deg, #FFC75F, #F9484A)',
    'linear-gradient(135deg, #61C695, #2E8B57)',
    'linear-gradient(135deg, #007CF0, #00DFD8)',
    'linear-gradient(135deg, #7928CA, #FF0080)',
    'linear-gradient(135deg, #FF4D4D, #F9CB28)',
    'linear-gradient(135deg, #0070F3, #5E60CE)',
  ]
  let hash = 0
  for (let i = 0; i < labelName.length; i++) {
    hash = (hash << 5) - hash + labelName.charCodeAt(i)
    hash |= 0
  }
  return gradients[Math.abs(hash) % gradients.length]
}

const LabelsPage = () => {
  // ── state ─────────────────────────────
  // eslint-disable-next-line
  const [labels, setLabels] = useState([])
  
  const [uniqueLabels, setUniqueLabels] = useState([])
  const [selectedLabel, setSelectedLabel] = useState(null)
  const [profilesByLabel, setProfilesByLabel] = useState({})
  const [totalProfiles, setTotalProfiles] = useState(0)
  const [categoryCount, setCategoryCount] = useState({})
  // eslint-disable-next-line
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // when you click “View Full Profile” → this holds the JSON record
  const [selectedFounder, setSelectedFounder] = useState(null)

  // ── fetch labels & counts ─────────────
  const fetchLabels = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await getUserLabels()
      if (fetchError) throw fetchError

      setLabels(data || [])

      // build uniqueCategories + counts
      const normMap = {}
      ;(data || []).forEach(item => {
        const n = normalizeLabel(item.label_name)
        if (!normMap[n]) normMap[n] = item.label_name
      })

      // include empty categories
      const { data: cats = [] } = await getAllLabelCategories()
      cats.forEach(cat => {
        const n = normalizeLabel(cat)
        if (!normMap[n]) normMap[n] = cat
      })

      const uniq = Object.values(normMap)
      setUniqueLabels(uniq)

      const counts = {}
      let tot = 0
      uniq.forEach(name => {
        const n = normalizeLabel(name)
        const c = data.filter(i => normalizeLabel(i.label_name) === n).length
        counts[name] = c
        tot += c
      })
      setCategoryCount(counts)
      setTotalProfiles(tot)

      // select first by default
      if (uniq.length) {
        setSelectedLabel(uniq[0])
        await fetchProfilesForLabel(uniq[0])
      }
    } catch (err) {
      console.error(err)
      setError('Failed to load labels.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLabels()
  }, [fetchLabels])

  // ── fetch profiles for a category ──────
  const fetchProfilesForLabel = async labelName => {
    setIsLoading(true)
    try {
      const norm = normalizeLabel(labelName)
      const { data, error } = await getProfilesByLabel(norm, true)
      if (error) throw error
      setProfilesByLabel(prev => ({ ...prev, [labelName]: data || [] }))
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // ── handlers ─────────────────────────
  const handleLabelClick = async name => {
    setSelectedLabel(name)
    if (!profilesByLabel[name]) await fetchProfilesForLabel(name)
  }

   // ── handlers ─────────────────────────
   const handleRemove = async id => {
    try {
      await removeLabelFromProfile(id)
      setSelectedFounder(null)

      // — locally remove from this category’s list
      setProfilesByLabel(prev => ({
        ...prev,
        [selectedLabel]: prev[selectedLabel].filter(p => p.id !== id)
      }))

      // — decrement your counts so the header stays in sync
      setTotalProfiles(tp => tp - 1)
      setCategoryCount(cc => ({
        ...cc,
        [selectedLabel]: (cc[selectedLabel] || 1) - 1
      }))
    } catch (err) {
      console.error(err)
    }
  }


  // ── render ────────────────────────────
  if (error)
    return (
      <div className="labels-container">
        <div className="labels-error">
          {error}
          <button onClick={fetchLabels}>Retry</button>
        </div>
      </div>
    )

  return (
    <div className="labels-container">
      <h2 className="labels-title">
        My Labels {totalProfiles > 0 && <span className="total-count">({totalProfiles} profiles)</span>}
      </h2>

      <div className="labels-content">
        {/* ─── Sidebar ─── */}
        <aside className="labels-sidebar">
          <h3 className="labels-sidebar-title">Categories</h3>
          <ul className="labels-list">
            {uniqueLabels.map(name => {
              const grad = getLabelGradient(name)
              const accent = grad.split(',')[1].trim().slice(0, -1)
              return (
                <li
                  key={name}
                  className={`label-item ${selectedLabel === name ? 'active' : ''}`}
                  style={{ borderLeft: `4px solid ${accent}` }}
                >
                  <button className="label-button" onClick={() => handleLabelClick(name)}>
                    <span>{name}</span>
                    <span className="label-count">({categoryCount[name] || 0})</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </aside>

        {/* ─── Main pane (either grid or detail) ─── */}
        {selectedFounder ? (
          // ─── DETAIL VIEW ─────────────────
          <section className="labels-profiles">
            <button
              style={{ marginBottom: 20 }}
              onClick={() => setSelectedFounder(null)}
            >
              ← Back to list
            </button>
            <StartupCard
              data={selectedFounder}
              inSeenProfilesPage={true}
              isSortByRankingEnabled={false}
            />
          </section>
        ) : (
          // ─── GRID VIEW ───────────────────
          <section className="labels-profiles">
            <h3 className="labels-profiles-title">
              {selectedLabel
                ? `Profiles for “${selectedLabel}” (${profilesByLabel[selectedLabel]?.length || 0})`
                : 'Select a label'}
            </h3>

            <div className="labeled-profiles-list">
              {profilesByLabel[selectedLabel]?.map(profile => {
                const fd = profile.founder_data || {}
                const grad = getLabelGradient(selectedLabel)
                const accent = grad.split(',')[1].trim().slice(0, -1)

                return (
                  <div
                    key={profile.id}
                    className="labeled-profile-card"
                    style={{ borderTop: `4px solid ${accent}` }}
                  >
                    {/* ← NEW “pill” up here */}
                    <div className="card-header-pill">
                      {fd.company && (
                        <span className="company-pill">{fd.company}</span>
                      )}
                      <span className="labeled-on">
                        Labeled on {new Date(profile.created_at).toLocaleDateString()}
                      </span>
                    </div>
                
                    <div className="labeled-profile-content">
                      <h4 className="labeled-profile-name">
                        {fd.name || 'Unnamed'}
                      </h4>
                      {fd.company && (
                        <p><strong>Company:</strong> {fd.company}</p>
                      )}
                      {fd.industry && (
                        <p><strong>Industry:</strong> {fd.industry}</p>
                      )}
                    </div>
                
                    <div className="labeled-profile-actions">
                    <button
  className="view-profile-button"
  onClick={() => {
    const fullName = fd.name || ''
    const tokens = fullName.split(' ').filter(Boolean)
    if (tokens.length === 0) return

    const last = tokens.pop()             // Alam
    const first = tokens.join(' ')        // Sohel Rana

    const json = wellfoundData.find(
      item =>
        item.firstName === first &&
        item.lastName === last
    )

    if (json) {
      setSelectedFounder(json)
    } else {
      console.warn(`No JSON for ${fullName}`)
    }
  }}
>
  View Full Profile
</button>

                      <button
                        className="remove-label-button"
                        onClick={() => handleRemove(profile.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )
                
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default LabelsPage
