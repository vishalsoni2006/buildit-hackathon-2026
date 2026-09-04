// ==========================================
// PARTICIPANT DATABASE & AUTHENTICATION STORE
// Manages registered participants, credentials, teams & invite requests
// ==========================================

import { firebaseSync } from './firebaseSync.js';

const SEED_PARTICIPANTS = [
  {
    id: 'p-aarav',
    name: 'Aarav Sharma',
    email: 'aarav@vitbhopal.ac.in',
    password: 'Aarav@2026',
    college: 'VIT Bhopal University',
    track: 'Autonomous AI & Multi-Agent Systems',
    role: 'AI / ML Researcher',
    ticketId: 'BLD-2026-1084-VIP',
    mode: 'In-Person (VIT Bhopal Central Campus)',
    teamName: 'Neural Vanguard',
    isLeader: true
  },
  {
    id: 'p-ananya',
    name: 'Ananya Verma',
    email: 'ananya@vitbhopal.ac.in',
    password: 'Ananya@2026',
    college: 'VIT Bhopal University',
    track: 'Autonomous AI & Multi-Agent Systems',
    role: 'Fullstack & WebGL Engineer',
    ticketId: 'BLD-2026-2491-VIP',
    mode: 'In-Person (VIT Bhopal Central Campus)',
    teamName: "Ananya's Squad",
    isLeader: true
  },
  {
    id: 'p-siddharth',
    name: 'Siddharth Rao',
    email: 'siddharth@iitb.ac.in',
    password: 'Sid@2026',
    college: 'IIT Bombay',
    track: 'Decentralized Protocols & Web3 Infrastructure',
    role: 'Web3 & Cryptography Architect',
    ticketId: 'BLD-2026-4190-VIP',
    mode: 'Virtual (Pan-India)',
    teamName: "Siddharth's Squad",
    isLeader: true
  },
  {
    id: 'p-priya',
    name: 'Priya Patel',
    email: 'priya@iiitd.ac.in',
    password: 'Priya@2026',
    college: 'IIIT Delhi',
    track: 'Spatial Computing, XR & Cyber-Physical Tech',
    role: 'Lead UI/UX Designer',
    ticketId: 'BLD-2026-8832-VIP',
    mode: 'In-Person (VIT Bhopal Central Campus)',
    teamName: "Priya's Squad",
    isLeader: true
  },
  {
    id: 'p-rohan',
    name: 'Rohan Iyer',
    email: 'rohan@nitt.edu',
    password: 'Rohan@2026',
    college: 'NIT Trichy',
    track: 'Autonomous AI & Multi-Agent Systems',
    role: 'Distributed Backend Engineer',
    ticketId: 'BLD-2026-7731-VIP',
    mode: 'Virtual (Pan-India)',
    teamName: "Rohan's Squad",
    isLeader: true
  },
  {
    id: 'p-devansh',
    name: 'Devansh Mehta',
    email: 'devansh.gupta@vitbhopal.ac.in',
    password: 'Devansh@2026',
    college: 'VIT Bhopal University',
    track: 'Spatial Computing, XR & Cyber-Physical Tech',
    role: 'Spatial Computing / XR',
    ticketId: 'BLD-2026-3301-VIP',
    mode: 'In-Person (VIT Bhopal Central Campus)',
    teamName: "Devansh's Squad",
    isLeader: true
  }
];

const SEED_TEAMS = [
  {
    id: 'team-neural-vanguard',
    name: 'Neural Vanguard',
    leaderId: 'p-aarav',
    track: 'Autonomous AI & Multi-Agent Systems',
    members: ['p-aarav']
  },
  {
    id: 'team-ananya',
    name: "Ananya's Squad",
    leaderId: 'p-ananya',
    track: 'Autonomous AI & Multi-Agent Systems',
    members: ['p-ananya']
  },
  {
    id: 'team-siddharth',
    name: "Siddharth's Squad",
    leaderId: 'p-siddharth',
    track: 'Decentralized Protocols & Web3 Infrastructure',
    members: ['p-siddharth']
  },
  {
    id: 'team-priya',
    name: "Priya's Squad",
    leaderId: 'p-priya',
    track: 'Spatial Computing, XR & Cyber-Physical Tech',
    members: ['p-priya']
  },
  {
    id: 'team-rohan',
    name: "Rohan's Squad",
    leaderId: 'p-rohan',
    track: 'Autonomous AI & Multi-Agent Systems',
    members: ['p-rohan']
  },
  {
    id: 'team-devansh',
    name: "Devansh's Squad",
    leaderId: 'p-devansh',
    track: 'Spatial Computing, XR & Cyber-Physical Tech',
    members: ['p-devansh']
  }
];

class ParticipantStore {
  constructor() {
    this.initDatabase();
    this.triggerSync();
  }

  triggerSync() {
    setTimeout(() => {
      try {
        firebaseSync.syncAllToFirestore(this.exportDataset()).catch(() => {});
      } catch (e) {
        // graceful offline fallback
      }
    }, 400);
  }

  initDatabase() {
    // Reset/seed if not initialized or sync participants to default as leaders
    const savedParts = localStorage.getItem('buildit_database_participants');
    if (!savedParts) {
      localStorage.setItem('buildit_database_participants', JSON.stringify(SEED_PARTICIPANTS));
      localStorage.setItem('buildit_database_teams', JSON.stringify(SEED_TEAMS));
      localStorage.setItem('buildit_database_requests', JSON.stringify([]));
    } else {
      // Ensure any participant not in another team defaults to Leader of their squad
      const participants = JSON.parse(savedParts);
      const teams = JSON.parse(localStorage.getItem('buildit_database_teams') || '[]');
      let updated = false;

      participants.forEach(p => {
        // If participant has no team or is alone in their squad
        const inTeam = teams.find(t => t.members.includes(p.id) && t.leaderId !== p.id);
        if (!inTeam) {
          // They are leader of their own squad
          p.isLeader = true;
          if (!p.teamName) {
            p.teamName = `${p.name}'s Squad`;
            updated = true;
          }
          // Ensure team exists in teams list
          let userTeam = teams.find(t => t.leaderId === p.id);
          if (!userTeam) {
            teams.push({
              id: 'team-' + p.id,
              name: p.teamName,
              leaderId: p.id,
              track: p.track,
              members: [p.id]
            });
            updated = true;
          }
        }
      });

      // Ensure Devansh is present in participants & teams
      if (!participants.find(p => p.id === 'p-devansh' || p.email === 'devansh.gupta@vitbhopal.ac.in')) {
        participants.push({
          id: 'p-devansh',
          name: 'Devansh Mehta',
          email: 'devansh.gupta@vitbhopal.ac.in',
          password: 'Devansh@2026',
          college: 'VIT Bhopal University',
          track: 'Spatial Computing, XR & Cyber-Physical Tech',
          role: 'Spatial Computing / XR',
          ticketId: 'BLD-2026-3301-VIP',
          mode: 'In-Person (VIT Bhopal Central Campus)',
          teamName: "Devansh's Squad",
          isLeader: true
        });
        teams.push({
          id: 'team-devansh',
          name: "Devansh's Squad",
          leaderId: 'p-devansh',
          track: 'Spatial Computing, XR & Cyber-Physical Tech',
          members: ['p-devansh']
        });
        updated = true;
      }

      if (updated) {
        localStorage.setItem('buildit_database_participants', JSON.stringify(participants));
        localStorage.setItem('buildit_database_teams', JSON.stringify(teams));
      }
    }
  }

  // --- Session Management ---
  getCurrentUser() {
    const userJson = localStorage.getItem('buildit_session_user');
    if (!userJson) return null;
    try {
      const user = JSON.parse(userJson);
      // Refresh user data from db
      return this.getParticipantById(user.id) || user;
    } catch {
      return null;
    }
  }

  login(email, password) {
    const participants = this.getParticipants();
    const cleanEmail = email.trim().toLowerCase();
    const user = participants.find(p => p.email.toLowerCase() === cleanEmail);

    if (!user) {
      return { success: false, error: 'No registered participant found with this email. Please apply/register first!' };
    }

    if (user.password !== password) {
      return { success: false, error: 'Incorrect credentials/password. Please try again.' };
    }

    localStorage.setItem('buildit_session_user', JSON.stringify(user));
    return { success: true, user };
  }

  logout() {
    localStorage.removeItem('buildit_session_user');
    window.dispatchEvent(new CustomEvent('buildit_auth_changed', { detail: null }));
  }

  getParticipantByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();
    return this.getParticipants().find(p => p.email.toLowerCase() === cleanEmail) || null;
  }

  loginWithGoogleExisting(googleProfile) {
    if (!googleProfile || !googleProfile.email) {
      return { success: false, error: 'Valid Google email is required.' };
    }

    const participants = this.getParticipants();
    const cleanEmail = googleProfile.email.trim().toLowerCase();
    let user = participants.find(p => p.email.toLowerCase() === cleanEmail);

    if (!user) {
      return {
        success: false,
        notRegistered: true,
        profile: googleProfile,
        error: 'No account registered with this Google email.'
      };
    }

    user.authProvider = 'google';
    user.lastLogin = new Date().toISOString();
    if (googleProfile.photoURL && !user.avatar) {
      user.avatar = googleProfile.photoURL;
    }
    this.updateParticipant(user);
    localStorage.setItem('buildit_session_user', JSON.stringify(user));
    window.dispatchEvent(new CustomEvent('buildit_auth_changed', { detail: user }));
    this.triggerSync();
    return { success: true, user };
  }

  loginOrCreateWithGoogle(googleProfile) {
    // If user exists, log in; if not, return notRegistered flag so personal info can be pre-filled
    return this.loginWithGoogleExisting(googleProfile);
  }

  // --- Participants Database ---
  getParticipants() {
    return JSON.parse(localStorage.getItem('buildit_database_participants') || '[]');
  }

  getParticipantById(id) {
    return this.getParticipants().find(p => p.id === id) || null;
  }

  registerUser(data) {
    const participants = this.getParticipants();
    const cleanEmail = data.email.trim().toLowerCase();

    // Check if email already registered
    const existing = participants.find(p => p.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, error: 'This email is already registered in our participant database!' };
    }

    const newId = 'p-' + Date.now();
    const ticketId = `BLD-2026-${Math.floor(1000 + Math.random() * 9000)}-VIP`;

    const newUser = {
      id: newId,
      name: data.name.trim(),
      email: data.email.trim(),
      password: data.password || 'Builder@2026',
      college: data.college?.trim() || 'VIT Bhopal University',
      track: data.track || 'Autonomous AI & Multi-Agent Systems',
      role: data.role || 'Fullstack Engineer',
      ticketId,
      mode: data.mode || 'In-Person (VIT Bhopal Central Campus)',
      teamName: data.teamName?.trim() || `${data.name.trim()}'s Squad`,
      isLeader: true,
      avatar: data.avatar || '',
      authProvider: data.authProvider || 'local',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    participants.push(newUser);
    localStorage.setItem('buildit_database_participants', JSON.stringify(participants));

    // Create user's team where they are leader by default
    const teams = this.getTeams();
    const newTeam = {
      id: 'team-' + Date.now(),
      name: newUser.teamName,
      leaderId: newUser.id,
      track: newUser.track,
      members: [newUser.id]
    };
    teams.push(newTeam);
    localStorage.setItem('buildit_database_teams', JSON.stringify(teams));

    // Auto-login newly registered user
    localStorage.setItem('buildit_session_user', JSON.stringify(newUser));
    window.dispatchEvent(new CustomEvent('buildit_auth_changed', { detail: newUser }));

    // Store participant account & team in Google Firebase
    firebaseSync.syncParticipant(newUser);
    firebaseSync.syncTeam(newTeam);
    this.triggerSync();

    return { success: true, user: newUser };
  }

  searchRegisteredParticipants(query) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return [];

    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return [];

    const all = this.getParticipants();
    const currentTeam = this.getCurrentUserTeam();
    const existingMemberIds = currentTeam ? currentTeam.members : [currentUser.id];

    return all.filter(p => {
      // Cannot invite oneself or existing team members
      if (existingMemberIds.includes(p.id)) return false;

      // Match name, email, or college
      return (
        p.name.toLowerCase().includes(cleanQuery) ||
        p.email.toLowerCase().includes(cleanQuery) ||
        p.college.toLowerCase().includes(cleanQuery)
      );
    });
  }

  // --- Team Management ---
  getTeams() {
    return JSON.parse(localStorage.getItem('buildit_database_teams') || '[]');
  }

  getCurrentUserTeam() {
    const user = this.getCurrentUser();
    if (!user) return null;

    const teams = this.getTeams();
    // Check if user is leader or member of any team
    return teams.find(t => t.members.includes(user.id)) || null;
  }

  getTeamByParticipantId(participantId) {
    if (!participantId) return null;
    const teams = this.getTeams();
    return teams.find(t => t.members.includes(participantId)) || null;
  }

  createTeamForCurrentUser(teamName, track) {
    const user = this.getCurrentUser();
    if (!user) return { success: false, error: 'Must be logged in to create a team.' };

    const teams = this.getTeams();
    const existing = teams.find(t => t.members.includes(user.id));
    if (existing) {
      return { success: false, error: 'You are already part of team "' + existing.name + '".' };
    }

    const newTeam = {
      id: 'team-' + Date.now(),
      name: teamName.trim(),
      leaderId: user.id,
      track: track || user.track,
      members: [user.id]
    };

    teams.push(newTeam);
    localStorage.setItem('buildit_database_teams', JSON.stringify(teams));

    // Update user record
    user.teamName = newTeam.name;
    user.isLeader = true;
    this.updateParticipant(user);

    // Sync team to Firebase
    firebaseSync.syncTeam(newTeam);
    this.triggerSync();

    return { success: true, team: newTeam };
  }

  updateParticipant(updatedUser) {
    const participants = this.getParticipants().map(p => p.id === updatedUser.id ? updatedUser : p);
    localStorage.setItem('buildit_database_participants', JSON.stringify(participants));
    if (this.getCurrentUser()?.id === updatedUser.id) {
      localStorage.setItem('buildit_session_user', JSON.stringify(updatedUser));
    }
    firebaseSync.syncParticipant(updatedUser);
  }

  // --- Team Invites with Security Verification Code ---
  getRequests() {
    return JSON.parse(localStorage.getItem('buildit_database_requests') || '[]');
  }

  sendTeamInvite(recipientId) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'You must be logged in to send invitations.' };
    }

    let team = this.getCurrentUserTeam();
    if (team && team.isConfirmed) {
      return { 
        success: false, 
        error: 'Your team entries are already locked and your Team Pass has been generated. You cannot invite additional members.' 
      };
    }
    if (!team) {
      // Auto-create a team if user doesn't have one yet
      const createRes = this.createTeamForCurrentUser(`${currentUser.name}'s Squad`, currentUser.track);
      if (!createRes.success) return createRes;
      team = createRes.team;
    }

    if (team.members.length >= 4) {
      return { success: false, error: 'Team is already at maximum capacity (4 members).' };
    }

    const recipient = this.getParticipantById(recipientId);
    if (!recipient) {
      return { success: false, error: 'Participant not found in database.' };
    }

    // Check if recipient already has pending request from this team
    const requests = this.getRequests();
    const alreadyPending = requests.find(r => 
      r.teamId === team.id && 
      r.toParticipantId === recipientId && 
      r.status === 'pending'
    );

    if (alreadyPending) {
      return { 
        success: false, 
        error: `Invitation already sent to ${recipient.name}. Security code is ${alreadyPending.code}.` 
      };
    }

    // Generate unique verification code (e.g. BLD-7492)
    const verificationCode = `BLD-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRequest = {
      id: 'req-' + Date.now(),
      teamId: team.id,
      teamName: team.name,
      track: team.track,
      fromParticipantId: currentUser.id,
      fromParticipantName: currentUser.name,
      fromParticipantEmail: currentUser.email,
      toParticipantId: recipient.id,
      toParticipantName: recipient.name,
      toParticipantEmail: recipient.email,
      code: verificationCode,
      status: 'pending',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    requests.push(newRequest);
    localStorage.setItem('buildit_database_requests', JSON.stringify(requests));
    firebaseSync.syncRequest(newRequest);
    this.triggerSync();

    return { 
      success: true, 
      code: verificationCode, 
      recipientName: recipient.name,
      teamName: team.name 
    };
  }

  ensureParticipantForListing({ name, email, role, college }) {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();
    let participant = this.getParticipantByEmail(cleanEmail);
    if (participant) return participant;

    // Create participant record
    const id = 'p-tf-' + Date.now();
    participant = {
      id,
      name: name || 'Builder',
      email: cleanEmail,
      password: 'Password@2026',
      college: college || 'VIT Bhopal University',
      track: 'Autonomous AI & Multi-Agent Systems',
      role: role || 'Fullstack & Systems',
      teamName: `${name || 'Builder'}'s Squad`,
      isLeader: true,
      mode: 'offline',
      ticketId: `BLD-2026-${Math.floor(1000 + Math.random() * 9000)}-TF`,
      registeredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const participants = this.getParticipants();
    participants.push(participant);
    localStorage.setItem('buildit_database_participants', JSON.stringify(participants));

    // Create default squad
    const teams = this.getTeams();
    teams.push({
      id: 'team-' + id,
      name: participant.teamName,
      leaderId: id,
      track: participant.track,
      members: [id],
      isConfirmed: false
    });
    localStorage.setItem('buildit_database_teams', JSON.stringify(teams));

    firebaseSync.syncParticipant(participant);
    this.triggerSync();
    return participant;
  }

  sendConnectionRequest({ toParticipantId, toEmail, toName, senderName, senderEmail, senderRole, pitch }) {
    const participants = this.getParticipants();

    // Find recipient participant either by ID or by clean email or by name
    let recipient = null;
    if (toParticipantId) {
      recipient = this.getParticipantById(toParticipantId);
    }
    if (!recipient && toEmail) {
      const cleanToEmail = toEmail.trim().toLowerCase();
      recipient = participants.find(p => p.email && p.email.toLowerCase() === cleanToEmail);
    }
    if (!recipient && toName) {
      const cleanName = toName.trim().toLowerCase();
      recipient = participants.find(p => p.name && p.name.toLowerCase() === cleanName);
    }

    // If still no participant record found (e.g. guest posted on Team Finder), register account for them
    if (!recipient && toEmail) {
      recipient = this.ensureParticipantForListing({
        name: toName,
        email: toEmail,
        role: senderRole,
        college: 'VIT Bhopal University'
      });
    }

    if (!recipient) {
      return { 
        success: false, 
        error: `Could not find account for ${toName || toEmail || 'this builder'}. Make sure their email is provided!` 
      };
    }

    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return { 
        success: false, 
        notLoggedIn: true,
        error: 'Login first to connect' 
      };
    }

    // Check if sender's team is locked, confirmed, or already made team
    const senderTeam = this.getCurrentUserTeam();
    if (senderTeam && (senderTeam.isConfirmed || (senderTeam.members && senderTeam.members.length > 1) || currentUser.isLeader === false)) {
      return {
        success: false,
        isTeamLocked: true,
        error: 'Already made team'
      };
    }

    // Check if recipient's team is locked or pass has generated
    const recipientTeam = this.getTeamByParticipantId(recipient.id);
    if (recipientTeam && (recipientTeam.isConfirmed || (recipientTeam.members && recipientTeam.members.length > 1))) {
      return {
        success: false,
        isTeamLocked: true,
        error: 'Already made team'
      };
    }

    const effectiveSender = {
      id: currentUser.id,
      name: currentUser.name || (senderName || 'Anonymous Builder'),
      email: currentUser.email || (senderEmail || 'builder@vitbhopal.ac.in'),
      role: currentUser.role || (senderRole || 'Hacker'),
      college: currentUser.college || 'VIT Bhopal University'
    };

    // Prevent connecting to self
    if (recipient.email.toLowerCase() === effectiveSender.email.toLowerCase() || recipient.id === effectiveSender.id) {
      return { success: false, error: 'You cannot send a connection request to your own account.' };
    }

    // Check if duplicate pending request already exists
    const requests = this.getRequests();
    const duplicate = requests.find(r => 
      (r.toParticipantId === recipient.id || (r.toParticipantEmail && r.toParticipantEmail.toLowerCase() === recipient.email.toLowerCase())) &&
      r.fromParticipantEmail.toLowerCase() === effectiveSender.email.toLowerCase() &&
      r.status === 'pending'
    );

    if (duplicate) {
      return { 
        success: false, 
        error: `A pending connection request to ${recipient.name} is already awaiting review in their dashboard!` 
      };
    }

    const newRequest = {
      id: 'req-tf-' + Date.now(),
      type: 'team_finder_connect',
      fromParticipantId: effectiveSender.id,
      fromParticipantName: effectiveSender.name,
      fromParticipantEmail: effectiveSender.email,
      fromRole: effectiveSender.role,
      fromCollege: effectiveSender.college,
      toParticipantId: recipient.id,
      toParticipantName: recipient.name,
      toParticipantEmail: recipient.email,
      pitch: pitch || `Interested in connecting and teaming up with ${recipient.name} from the Team Finder board!`,
      status: 'pending',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    requests.push(newRequest);
    localStorage.setItem('buildit_database_requests', JSON.stringify(requests));
    
    // Sync to Firebase
    firebaseSync.syncRequest(newRequest);
    this.triggerSync();

    // Dispatch event so any open dashboard or navbar badge updates immediately
    window.dispatchEvent(new CustomEvent('buildit_requests_updated', { detail: newRequest }));

    return {
      success: true,
      recipientName: recipient.name,
      recipientEmail: recipient.email
    };
  }

  getIncomingRequests() {
    const user = this.getCurrentUser();
    if (!user) return [];

    const requests = this.getRequests();
    const userEmail = (user.email || '').trim().toLowerCase();
    // Return only pending requests targeted specifically to this logged-in user (by ID or email)
    return requests.filter(r => {
      if (r.status !== 'pending') return false;
      if (r.toParticipantId === user.id) return true;
      if (r.toParticipantEmail && userEmail && r.toParticipantEmail.trim().toLowerCase() === userEmail) return true;
      return false;
    });
  }

  approveRequest(requestId) {
    const user = this.getCurrentUser();
    if (!user) return { success: false, error: 'You must be logged in to approve invitations.' };

    const requests = this.getRequests();
    const request = requests.find(r => r.id === requestId);

    if (!request) return { success: false, error: 'Invitation request not found.' };

    const userEmail = (user.email || '').trim().toLowerCase();
    const isRecipient = request.toParticipantId === user.id || 
      (request.toParticipantEmail && userEmail && request.toParticipantEmail.trim().toLowerCase() === userEmail);

    if (!isRecipient) {
      return { success: false, error: 'Unauthorized: You can only approve invitations addressed to your personal credentials!' };
    }

    const currentTeam = this.getCurrentUserTeam();
    if (currentTeam && currentTeam.isConfirmed) {
      return { success: false, error: 'Already made team' };
    }

    // Handle Team Finder connection requests
    if (request.type === 'team_finder_connect') {
      request.status = 'approved';
      localStorage.setItem('buildit_database_requests', JSON.stringify(requests));

      // If the recipient has an active squad, add sender to their squad if space is available
      let teams = this.getTeams();
      let myTeam = teams.find(t => t.leaderId === user.id || t.members.includes(user.id));
      const senderParticipant = this.getParticipantById(request.fromParticipantId) || 
                                this.getParticipantByEmail(request.fromParticipantEmail);

      if (myTeam && senderParticipant && myTeam.members.length < 4) {
        if (!myTeam.members.includes(senderParticipant.id)) {
          myTeam.members.push(senderParticipant.id);
          localStorage.setItem('buildit_database_teams', JSON.stringify(teams));
          senderParticipant.teamName = myTeam.name;
          senderParticipant.isLeader = false;
          this.updateParticipant(senderParticipant);
          firebaseSync.syncTeam(myTeam);
        }
      }

      window.dispatchEvent(new CustomEvent('buildit_team_updated'));
      window.dispatchEvent(new CustomEvent('buildit_requests_updated'));
      firebaseSync.syncRequest(request);
      this.triggerSync();
      return { 
        success: true, 
        isConnection: true, 
        senderName: request.fromParticipantName,
        teamName: myTeam ? myTeam.name : 'Squad' 
      };
    }

    // Standard Team Invites: Add user to inviting team & dissolve previous solo team
    let teams = this.getTeams();
    teams = teams.filter(t => !(t.leaderId === user.id && t.members.length === 1 && t.id !== request.teamId));

    const team = teams.find(t => t.id === request.teamId);

    if (!team) return { success: false, error: 'Inviting team no longer exists.' };

    if (team.members.length >= 4) {
      return { success: false, error: 'Team has already reached max capacity (4 members).' };
    }

    if (!team.members.includes(user.id)) {
      team.members.push(user.id);
    }
    localStorage.setItem('buildit_database_teams', JSON.stringify(teams));

    // Update request status
    request.status = 'approved';
    localStorage.setItem('buildit_database_requests', JSON.stringify(requests));

    // Update user profile: role becomes member
    user.teamName = team.name;
    user.isLeader = false;
    this.updateParticipant(user);

    window.dispatchEvent(new CustomEvent('buildit_team_updated'));
    window.dispatchEvent(new CustomEvent('buildit_requests_updated'));
    firebaseSync.syncRequest(request);
    firebaseSync.syncTeam(team);
    this.triggerSync();
    return { success: true, teamName: team.name };
  }

  declineRequest(requestId) {
    const user = this.getCurrentUser();
    if (!user) return { success: false, error: 'Must be logged in to decline.' };

    const requests = this.getRequests();
    const request = requests.find(r => r.id === requestId);

    if (!request) return { success: false, error: 'Request not found.' };

    const userEmail = (user.email || '').trim().toLowerCase();
    const isRecipient = request.toParticipantId === user.id || 
      (request.toParticipantEmail && userEmail && request.toParticipantEmail.trim().toLowerCase() === userEmail);

    if (!isRecipient) {
      return { success: false, error: 'Unauthorized request operation.' };
    }

    request.status = 'declined';
    localStorage.setItem('buildit_database_requests', JSON.stringify(requests));
    window.dispatchEvent(new CustomEvent('buildit_team_updated'));
    window.dispatchEvent(new CustomEvent('buildit_requests_updated'));
    firebaseSync.syncRequest(request);
    this.triggerSync();
    return { success: true };
  }

  confirmTeamEntries(teamId) {
    const user = this.getCurrentUser();
    if (!user) return { success: false, error: 'You must be logged in to confirm team entries.' };

    const teams = this.getTeams();
    const team = teams.find(t => t.id === teamId);
    if (!team) return { success: false, error: 'Team not found.' };

    if (team.leaderId !== user.id) {
      return { success: false, error: 'Only the Team Leader can confirm and lock team entries!' };
    }

    if (team.isConfirmed) {
      return { success: false, error: 'Team entries are already confirmed and locked!' };
    }

    // Generate unique Team Pass ID and QR payload
    const teamInitials = team.name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase() || 'BLD';
    const teamPassId = `BLD-TEAM-${teamInitials}${Math.floor(1000 + Math.random() * 9000)}-PASS`;
    const confirmedAt = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const qrData = JSON.stringify({
      event: "BuildIt '26",
      team: team.name,
      track: team.track,
      passId: teamPassId,
      members: team.members.length,
      organizer: "Mozilla Firefox Club • VIT Bhopal"
    });

    team.isConfirmed = true;
    team.confirmedAt = confirmedAt;
    team.teamPassId = teamPassId;
    team.qrData = qrData;

    localStorage.setItem('buildit_database_teams', JSON.stringify(teams));
    window.dispatchEvent(new CustomEvent('buildit_team_updated'));
    firebaseSync.syncTeam(team);
    this.triggerSync();
    return { success: true, team };
  }

  exportDataset() {
    return {
      metadata: {
        event: "BuildIt '26 Hackathon",
        organizer: "Mozilla Firefox Club (MFC)",
        institution: "VIT Bhopal University, India",
        exportedAt: new Date().toISOString(),
        totalParticipants: this.getParticipants().length,
        totalTeams: this.getTeams().length
      },
      participants: this.getParticipants(),
      teams: this.getTeams(),
      requests: this.getRequests()
    };
  }
}

export const participantStore = new ParticipantStore();
