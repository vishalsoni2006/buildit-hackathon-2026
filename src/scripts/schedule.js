export const SCHEDULE_DATA = {
  day1: [
    {
      id: 'd1-1',
      time: '08:00 AM',
      category: 'food',
      categoryLabel: 'Check-In & Breakfast',
      title: 'Hacker Check-In, NFC Badging & Morning Fuel',
      desc: 'Pick up your official BuildIt pass, collect hackathon kit, and enjoy artisan coffee & breakfast.',
      location: 'Central Atrium & MFC Welcome Desk, VIT Bhopal',
      isLive: false
    },
    {
      id: 'd1-2',
      time: '08:45 AM',
      category: 'keynote',
      categoryLabel: 'Opening Ceremony',
      title: 'Opening Ceremony: "Innovating at Velocity"',
      desc: 'Welcome address by Mozilla Firefox Club (MFC) leads, with inaugural speech by Jury Chairs Dr. Balaji A and Dr. Suresh Dara.',
      location: 'Main Auditorium, VIT Bhopal & Live Stream',
      isLive: true
    },
    {
      id: 'd1-3',
      time: '09:30 AM',
      category: 'milestone',
      categoryLabel: 'Problem Briefing',
      title: 'Innovation Tracks Reveal & Squad Strategy Setup',
      desc: 'Detailed breakdown of the 4 track challenges, API compute resources, evaluation criteria, and team setup.',
      location: 'Main Auditorium & Track Pods',
      isLive: false
    },
    {
      id: 'd1-4',
      time: '10:00 AM',
      category: 'milestone',
      categoryLabel: 'Sprint Kickoff',
      title: '⚡ 12-HOUR HACKING SPRINT OFFICIALLY BEGINS (T-12:00:00)',
      desc: 'Clocks start ticking! Git repositories initialized, live development commences across all tracks.',
      location: 'All Hacking Arenas & Discord',
      isLive: false
    },
    {
      id: 'd1-5',
      time: '11:00 AM',
      category: 'workshop',
      categoryLabel: 'Tech Deep-Dive',
      title: 'Hands-On: Autonomous Agent Tooling & High-Throughput Web Architectures',
      desc: 'Fast 30-minute masterclass on connecting MCP APIs, local vector pipelines, and rapid UI deployment.',
      location: 'Workshop Arena Alpha',
      isLive: false
    }
  ],
  day2: [
    {
      id: 'd2-1',
      time: '12:30 PM',
      category: 'food',
      categoryLabel: 'Lunch Break',
      title: 'Midday Power Lunch & Sponsor Tech Lounge',
      desc: 'Recharge with hot lunch bowls, desserts, and quick networking with student club developers.',
      location: 'Dining Hall & Tech Hub',
      isLive: false
    },
    {
      id: 'd2-2',
      time: '01:15 PM',
      category: 'mentoring',
      categoryLabel: 'Faculty Mentorship',
      title: 'Mentor Round 1: Code Review & Architecture Guidance',
      desc: '1-on-1 technical review with faculty jury mentors Dr. Balaji A and Dr. Suresh Dara to refine prototype roadmaps.',
      location: 'Mentorship Arena Pods 1-8',
      isLive: false
    },
    {
      id: 'd2-3',
      time: '02:30 PM',
      category: 'milestone',
      categoryLabel: 'Mid-Sprint Milestone',
      title: 'Mid-Sprint Progress Checkpoint & Feature Freeze',
      desc: 'Teams lock in their minimum viable features to ensure ample testing time before the final deadline.',
      location: 'Online Portal & Arena Floor',
      isLive: false
    },
    {
      id: 'd2-4',
      time: '03:15 PM',
      category: 'food',
      categoryLabel: 'Energy Boost',
      title: 'High-Energy Refreshments & Pitch Rehearsals',
      desc: 'Cold brew, masala chai, energy bars, and fast 1-minute slide review sessions with peer leads.',
      location: 'Grand Atrium Lounge',
      isLive: false
    }
  ],
  day3: [
    {
      id: 'd3-1',
      time: '04:30 PM',
      category: 'workshop',
      categoryLabel: 'Final Sprint',
      title: 'Final Sprint: Polish, Edge Cases & Deployment',
      desc: 'Final test suites, UI responsiveness polishing, and cloud deployment verification.',
      location: 'All Hacking Pods',
      isLive: false
    },
    {
      id: 'd3-2',
      time: '05:30 PM',
      category: 'milestone',
      categoryLabel: 'Deadline',
      title: '🛑 HARD CODE FREEZE & SUBMISSION DEADLINE (T-00:00:00)',
      desc: 'All code commits, public demo URLs, and project summaries must be finalized. The 12-hour build sprint concludes!',
      location: 'BuildIt Submission Portal',
      isLive: false
    },
    {
      id: 'd3-3',
      time: '06:00 PM',
      category: 'keynote',
      categoryLabel: 'Live Evaluation',
      title: 'Science-Fair Live Interactive Demonstrations & Jury Q&A',
      desc: 'All teams demonstrate their live working solutions before Jury Chairs Dr. Balaji A, Dr. Suresh Dara, and visiting evaluators.',
      location: 'Exhibition Hall & Demo Stage',
      isLive: false
    },
    {
      id: 'd3-4',
      time: '07:15 PM',
      category: 'milestone',
      categoryLabel: 'Deliberation',
      title: 'Jury Deliberation & Final Score Aggregation',
      desc: 'Judges convene to finalize winners based on innovation, technical complexity, and execution quality.',
      location: 'Jury Chamber',
      isLive: false
    },
    {
      id: 'd3-5',
      time: '07:45 PM',
      category: 'keynote',
      categoryLabel: 'Grand Finale',
      title: '🏆 Grand Prize Ceremony & ₹50,000 Cash Pool Distribution',
      desc: 'Celebration of 1st, 2nd, and 3rd place champions, track honors, laser-engraved trophies, and closing addresses.',
      location: 'Main Auditorium & Worldwide Live Broadcast',
      isLive: false
    }
  ]
};

export function initSchedule() {
  let currentDay = 'day1';
  let currentCategory = 'all';
  let bookmarks = JSON.parse(localStorage.getItem('buildit_bookmarks') || '[]');

  const timelineContainer = document.getElementById('schedule-timeline');
  const dayButtons = document.querySelectorAll('.day-tab-btn');
  const filterButtons = document.querySelectorAll('.filter-chip-btn');
  const bookmarkBadge = document.getElementById('schedule-bookmark-count');

  function updateBookmarkBadge() {
    if (bookmarkBadge) {
      bookmarkBadge.textContent = bookmarks.length;
      bookmarkBadge.style.display = bookmarks.length > 0 ? 'inline-block' : 'none';
    }
  }

  function renderTimeline() {
    if (!timelineContainer) return;
    const items = SCHEDULE_DATA[currentDay] || [];

    const filtered = items.filter(item => {
      if (currentCategory === 'all') return true;
      if (currentCategory === 'bookmarks') return bookmarks.includes(item.id);
      return item.category === currentCategory;
    });

    if (filtered.length === 0) {
      timelineContainer.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--text-muted); background: rgba(18, 19, 29, 0.4); border-radius: var(--radius-lg); border: 1px dashed var(--border-glass);">
          <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">No events match this filter.</p>
          <p style="font-size: 0.85rem; color: var(--text-dim);">Try selecting "All Events" or bookmark items to see them here.</p>
        </div>
      `;
      return;
    }

    timelineContainer.innerHTML = filtered.map(item => {
      const isBookmarked = bookmarks.includes(item.id);
      return `
        <div class="timeline-item ${item.isLive ? 'active-event' : ''}" data-event-id="${item.id}">
          <div class="timeline-time-col">
            <div class="timeline-time">${item.time}</div>
            <div class="timeline-tag">${item.categoryLabel}</div>
          </div>
          <div class="timeline-content">
            <h4 class="timeline-title">${item.title}</h4>
            <p class="timeline-desc">${item.desc}</p>
            <div class="timeline-location">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>${item.location}</span>
              ${item.isLive ? '<span class="badge badge-amber" style="margin-left: 0.5rem; font-size: 0.65rem;">LIVE NOW</span>' : ''}
            </div>
          </div>
          <button class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" title="${isBookmarked ? 'Remove Bookmark' : 'Add to My Schedule'}" data-id="${item.id}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
            </svg>
          </button>
        </div>
      `;
    }).join('');

    // Attach bookmark click handlers
    timelineContainer.querySelectorAll('.bookmark-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        toggleBookmark(id);
      });
    });
  }

  function toggleBookmark(id) {
    if (bookmarks.includes(id)) {
      bookmarks = bookmarks.filter(bId => bId !== id);
    } else {
      bookmarks.push(id);
    }
    localStorage.setItem('buildit_bookmarks', JSON.stringify(bookmarks));
    updateBookmarkBadge();
    renderTimeline();
  }

  dayButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      dayButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentDay = btn.getAttribute('data-day');
      renderTimeline();
    });
  });

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-category');
      renderTimeline();
    });
  });

  updateBookmarkBadge();
  renderTimeline();
}
