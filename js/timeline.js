/**
 * CivicGuide — Timeline Module
 * Renders and manages the interactive election timeline.
 */

'use strict';

const TimelineModule = (() => {

  /** Timeline step data */
  const STEPS = [
    {
      id: 1, icon: '🪪', title: 'Voter ID & Electoral Roll',
      summary: 'Get your Voter ID (EPIC) and ensure your name is on the electoral roll managed by ECI.',
      details: 'The Election Commission of India (ECI) maintains the electoral roll. Every Indian citizen aged 18+ must register to be eligible to vote.',
      points: [
        'Apply for Voter ID (EPIC) online via voters.eci.gov.in or NVSP portal',
        'Fill Form 6 for new registration or Form 8 for corrections',
        'Carry Aadhaar, passport, or other ID proof for verification',
        'Check your name on the electoral roll before election day',
        'NRIs can register under Section 20A using Form 6A'
      ]
    },
    {
      id: 2, icon: '📢', title: 'ECI Announcement & Campaigning',
      summary: 'ECI announces election dates. The Model Code of Conduct (MCC) comes into effect immediately.',
      details: 'Once the Election Commission announces the schedule, the Model Code of Conduct kicks in. Political parties file nominations, campaign, and hold rallies within ECI guidelines.',
      points: [
        'ECI announces election schedule and the MCC takes effect',
        'Candidates file nominations within the deadline set by ECI',
        'Campaigning must stop 48 hours before polling day (silent period)',
        'ECI monitors campaign spending — ₹95 lakh limit for Lok Sabha candidates',
        'cVIGIL app allows citizens to report MCC violations'
      ]
    },
    {
      id: 3, icon: '🗳️', title: 'Polling Day & EVM Voting',
      summary: 'Citizens vote using Electronic Voting Machines (EVMs) and receive VVPAT verification.',
      details: 'India uses EVMs (Electronic Voting Machines) paired with VVPAT (Voter Verifiable Paper Audit Trail) printers for a secure and transparent voting process.',
      points: [
        'Carry your Voter ID (EPIC) or any ECI-approved photo ID to the booth',
        'Vote is cast by pressing the button next to your candidate on the EVM',
        'VVPAT slip displays your vote for 7 seconds for verification',
        'Indelible ink is applied on your left index finger to prevent repeat voting',
        'NOTA (None Of The Above) option is available on every EVM'
      ]
    },
    {
      id: 4, icon: '🔢', title: 'Counting & Result Declaration',
      summary: 'EVMs are securely stored and counted on the designated date under ECI supervision.',
      details: 'After polling concludes across all phases, EVMs are stored in strong rooms under 24/7 CCTV and CAPF security. On counting day, results are tallied at designated centres.',
      points: [
        'EVMs are stored in strong rooms with multi-level security',
        'Counting happens in the presence of candidates\' agents and observers',
        'VVPAT slips of 5 random booths per constituency are matched with EVM counts',
        'Trends and results are displayed live on the ECI results portal',
        'The Returning Officer officially declares the winning candidate'
      ]
    },
    {
      id: 5, icon: '🏛️', title: 'Government Formation & Oath',
      summary: 'The winning party or coalition forms the government. Elected members take the oath of office.',
      details: 'The party or coalition with a majority (272+ seats in Lok Sabha) is invited by the President/Governor to form the government. The leader takes oath as PM/CM.',
      points: [
        'President/Governor invites the majority party leader to form government',
        'Prime Minister / Chief Minister takes oath at Rashtrapati Bhavan / Raj Bhavan',
        'Council of Ministers is appointed and portfolios are assigned',
        'The first session of the new Lok Sabha / Vidhan Sabha begins',
        'The opposition leader is recognized as Leader of Opposition'
      ]
    }
  ];

  /**
   * Get all timeline steps (used for testing).
   * @returns {Array}
   */
  function getSteps() {
    return STEPS;
  }

  /**
   * Get a step by ID.
   * @param {number} stepId
   * @returns {object|undefined}
   */
  function getStepById(stepId) {
    return STEPS.find((s) => s.id === stepId);
  }

  /**
   * Render the timeline into the DOM.
   * @param {Element} container - The wrapper element (#timeline-list)
   */
  function render(container) {
    if (!container) return;
    container.innerHTML = '';

    STEPS.forEach((step, index) => {
      // Card
      const card = document.createElement('article');
      card.className = 'timeline-card animate-on-scroll';
      card.setAttribute('role', 'listitem');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-expanded', 'false');
      card.setAttribute('aria-controls', `timeline-detail-${step.id}`);
      card.setAttribute('data-step', step.id);
      card.id = `timeline-step-${step.id}`;
      card.style.transitionDelay = `${index * 80}ms`;

      card.innerHTML = `
        <div class="timeline-card-indicator" aria-hidden="true">
          <span class="step-number">${String(step.id).padStart(2, '0')}</span>
          <div class="step-connector"></div>
        </div>
        <div class="timeline-card-content">
          <div class="timeline-card-icon" aria-hidden="true">${step.icon}</div>
          <h3 class="timeline-card-title">${CivicUtils.sanitizeInput(step.title)}</h3>
          <p class="timeline-card-summary">${CivicUtils.sanitizeInput(step.summary)}</p>
          <span class="timeline-card-cta" aria-hidden="true">Click to learn more →</span>
        </div>`;
      container.appendChild(card);

      // Detail panel
      const detail = document.createElement('div');
      detail.className = 'timeline-detail';
      detail.id = `timeline-detail-${step.id}`;
      detail.setAttribute('role', 'region');
      detail.setAttribute('aria-labelledby', `timeline-detail-heading-${step.id}`);
      detail.hidden = true;

      const pointsHtml = step.points.map((p) => `<li>${CivicUtils.sanitizeInput(p)}</li>`).join('');
      detail.innerHTML = `
        <div class="timeline-detail-inner">
          <h4 id="timeline-detail-heading-${step.id}">${CivicUtils.sanitizeInput(step.title)}</h4>
          <p>${CivicUtils.sanitizeInput(step.details)}</p>
          <ul class="detail-list">${pointsHtml}</ul>
          <button class="btn btn-ghost timeline-close-btn" aria-label="Close ${step.title} details" data-close-step="${step.id}" type="button">Close</button>
        </div>`;
      container.appendChild(detail);
    });
  }

  /**
   * Toggle a timeline step's expanded state.
   * @param {number} stepId
   */
  function toggleStep(stepId) {
    const card = document.getElementById(`timeline-step-${stepId}`);
    const detail = document.getElementById(`timeline-detail-${stepId}`);
    if (!card || !detail) return;

    const isExpanded = card.getAttribute('aria-expanded') === 'true';

    // Close all other steps
    document.querySelectorAll('.timeline-card[aria-expanded="true"]').forEach((c) => {
      if (c !== card) {
        c.setAttribute('aria-expanded', 'false');
        const otherId = c.getAttribute('data-step');
        const otherDetail = document.getElementById(`timeline-detail-${otherId}`);
        if (otherDetail) otherDetail.hidden = true;
      }
    });

    // Toggle current
    card.setAttribute('aria-expanded', String(!isExpanded));
    detail.hidden = isExpanded;

    if (!isExpanded) {
      detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /**
   * Bind event listeners for timeline interaction.
   */
  function bindEvents() {
    const wrapper = document.getElementById('timeline-list');
    if (!wrapper) return;

    wrapper.addEventListener('click', (e) => {
      const card = e.target.closest('.timeline-card');
      const closeBtn = e.target.closest('.timeline-close-btn');
      if (closeBtn) {
        toggleStep(Number(closeBtn.dataset.closeStep));
      } else if (card) {
        toggleStep(Number(card.dataset.step));
      }
    });

    wrapper.addEventListener('keydown', (e) => {
      const card = e.target.closest('.timeline-card');
      if (card && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        toggleStep(Number(card.dataset.step));
      }
    });
  }

  /**
   * Initialize the timeline module.
   */
  function init() {
    const container = document.getElementById('timeline-list');
    render(container);
    bindEvents();
  }

  return { init, render, toggleStep, getSteps, getStepById, STEPS };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TimelineModule;
}
