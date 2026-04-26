/**
 * CivicGuide — Civic Information Module (Stub)
 * Handles address lookup for polling stations and representatives.
 * Full Google Civic API integration will be added in Step 4.
 */

'use strict';

const CivicModule = (() => {

  /**
   * Validate address input.
   * @param {string} address
   * @returns {{ valid: boolean, message: string }}
   */
  function validateAddress(address) {
    const result = CivicUtils.validateInput(address, 200);
    if (!result.valid) return result;
    if (address.trim().length < 3) {
      return { valid: false, message: 'Please enter a valid address or zip code.' };
    }
    return { valid: true, message: '' };
  }

  /**
   * Display simulated civic results (stub).
   * @param {string} address
   */
  function displayResults(address) {
    const results = document.getElementById('civic-results');
    const repsContent = document.getElementById('civic-reps-content');
    const pollingContent = document.getElementById('civic-polling-content');
    const electionContent = document.getElementById('civic-election-content');
    if (!results || !repsContent || !pollingContent || !electionContent) return;

    const sanitized = CivicUtils.sanitizeInput(address.trim());

    // Show loading state
    repsContent.innerHTML = '<p>Loading representatives...</p>';
    pollingContent.innerHTML = '<p>Loading polling stations...</p>';
    electionContent.innerHTML = '<p>Loading election information...</p>';

    results.hidden = false;
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });

    fetch('/api/civic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: sanitized })
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) throw new Error(data.error);

      // Render Representatives
      if (data.representatives && data.representatives.length > 0) {
        repsContent.innerHTML = '<ul class="detail-list">' + data.representatives.map(rep => `
          <li>
            <strong>${CivicUtils.sanitizeInput(rep.name)}</strong><br/>
            ${CivicUtils.sanitizeInput(rep.office)} (${CivicUtils.sanitizeInput(rep.party)})
          </li>
        `).join('') + '</ul>';
      } else {
        repsContent.innerHTML = '<p>No representative data found for this address.</p>';
      }

      // Render Polling Locations
      if (data.pollingLocations && data.pollingLocations.length > 0) {
        pollingContent.innerHTML = '<ul class="detail-list">' + data.pollingLocations.map(loc => `
          <li>
            <strong>${CivicUtils.sanitizeInput(loc.address.locationName || '')}</strong><br/>
            ${CivicUtils.sanitizeInput(loc.address.line1 || '')}, ${CivicUtils.sanitizeInput(loc.address.city || '')}, ${CivicUtils.sanitizeInput(loc.address.state || '')} ${CivicUtils.sanitizeInput(loc.address.zip || '')}<br/>
            Hours: ${CivicUtils.sanitizeInput(loc.pollingHours || 'Not specified')}
          </li>
        `).join('') + '</ul>';
      } else {
        pollingContent.innerHTML = '<p>No polling location data currently available for this address.</p>';
      }

      // Render Elections
      if (data.elections && data.elections.length > 0) {
        electionContent.innerHTML = '<ul class="detail-list">' + data.elections.map(elec => `
          <li>
            <strong>${CivicUtils.sanitizeInput(elec.name)}</strong><br/>
            Date: ${CivicUtils.sanitizeInput(elec.electionDay)}
          </li>
        `).join('') + '</ul>';
      } else {
        electionContent.innerHTML = '<p>No upcoming election data available for this address.</p>';
      }
    })
    .catch(err => {
      console.error('Civic API Error:', err);
      repsContent.innerHTML = `<p>Error fetching data: ${CivicUtils.sanitizeInput(err.message)}</p>`;
      pollingContent.innerHTML = '<p>Could not fetch polling data.</p>';
      electionContent.innerHTML = '<p>Could not fetch election data.</p>';
    });
  }

  /**
   * Handle civic form submission.
   * @param {Event} e
   */
  function handleSubmit(e) {
    e.preventDefault();
    const input = document.getElementById('civic-address-input');
    if (!input) return;

    const validation = validateAddress(input.value);
    if (!validation.valid) {
      input.setAttribute('aria-invalid', 'true');
      return;
    }

    input.setAttribute('aria-invalid', 'false');
    displayResults(input.value);
  }

  /**
   * Initialize civic module.
   */
  function init() {
    const form = document.getElementById('civic-form');
    if (form) form.addEventListener('submit', handleSubmit);
  }

  return { init, validateAddress, displayResults, handleSubmit };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CivicModule;
}
