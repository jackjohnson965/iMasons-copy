/**
 * Default MSW handlers that return sensible happy-path responses for every
 * backend endpoint the app calls. Individual tests call server.use(...) to
 * override a handler with a scenario-specific response.
 */
import { http, HttpResponse } from 'msw';

const BASE = '/api';

// In-memory stores reset between tests via the `resetStores` helper called
// from server's resetHandlers hook — see src/test/setup.js.
export const stores = {
  students: [],
  employers: [],
  jobs: [],
  mentors: [],
  applications: [],
  saved: [],
  resources: [],
  users: [],
  analytics: [],
};

export function resetStores() {
  for (const k of Object.keys(stores)) stores[k].length = 0;
}

// Helper: next integer id for a given collection.
function nextId(col) {
  return col.length ? Math.max(...col.map((x) => x.id)) + 1 : 1;
}

export const handlers = [
  // ---- auth ----
  http.post(`${BASE}/auth/register`, async ({ request }) => {
    const body = await request.json();
    const user = {
      id: nextId(stores.users),
      email: body.email,
      role: body.role,
      imasonsIdentifier: body.imasonsIdentifier,
      linkedProfileId: null,
    };
    stores.users.push(user);
    return HttpResponse.json(
      {
        access_token: 'fake-token-register',
        token_type: 'bearer',
        role: user.role,
        userId: user.id,
        linkedProfileId: null,
      },
      { status: 201 },
    );
  }),

  http.post(`${BASE}/auth/login`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      access_token: 'fake-token-login',
      token_type: 'bearer',
      role: body.email.includes('admin') ? 'admin' : body.email.includes('employer') ? 'employer' : 'student',
      userId: 1,
      linkedProfileId: null,
    });
  }),

  http.post(`${BASE}/auth/link-profile/:id`, ({ params }) => {
    return HttpResponse.json({
      access_token: 'fake-token-linked',
      token_type: 'bearer',
      role: 'student',
      userId: 1,
      linkedProfileId: Number(params.id),
    });
  }),

  // ---- students ----
  http.get(`${BASE}/students`, () => HttpResponse.json(stores.students)),
  http.get(`${BASE}/students/:id`, ({ params }) => {
    const s = stores.students.find((x) => x.id === Number(params.id));
    return s ? HttpResponse.json(s) : new HttpResponse(null, { status: 404 });
  }),
  http.post(`${BASE}/students`, async ({ request }) => {
    const body = await request.json();
    const student = {
      id: nextId(stores.students),
      firstName: '',
      lastName: '',
      bio: '',
      location: '',
      skills: '',
      resumeLink: '',
      profileImageLink: '',
      linkedinUrl: '',
      githubUrl: '',
      portfolioUrl: '',
      isActive: 1,
      ...body,
    };
    stores.students.push(student);
    return HttpResponse.json(student, { status: 201 });
  }),
  http.put(`${BASE}/students/:id`, async ({ params, request }) => {
    const body = await request.json();
    const s = stores.students.find((x) => x.id === Number(params.id));
    if (!s) return new HttpResponse(null, { status: 404 });
    Object.assign(s, body);
    return HttpResponse.json(s);
  }),
  http.post(`${BASE}/students/:id/resume`, ({ params }) => {
    const s = stores.students.find((x) => x.id === Number(params.id));
    if (!s) return new HttpResponse(null, { status: 404 });
    s.resumeLink = `/api/students/${s.id}/resume/download`;
    return HttpResponse.json(s);
  }),
  http.post(`${BASE}/students/:id/profile-photo`, ({ params }) => {
    const s = stores.students.find((x) => x.id === Number(params.id));
    if (!s) return new HttpResponse(null, { status: 404 });
    s.profileImageLink = `/api/students/${s.id}/profile-photo/download`;
    return HttpResponse.json(s);
  }),

  // ---- employers ----
  http.get(`${BASE}/employers`, () => HttpResponse.json(stores.employers)),
  http.get(`${BASE}/employers/:id`, ({ params }) => {
    const e = stores.employers.find((x) => x.id === Number(params.id));
    return e ? HttpResponse.json(e) : new HttpResponse(null, { status: 404 });
  }),
  http.post(`${BASE}/employers`, async ({ request }) => {
    const body = await request.json();
    const employer = {
      id: nextId(stores.employers),
      industry: '',
      location: '',
      description: '',
      websiteUrl: '',
      ...body,
    };
    stores.employers.push(employer);
    return HttpResponse.json(employer, { status: 201 });
  }),
  http.put(`${BASE}/employers/:id`, async ({ params, request }) => {
    const body = await request.json();
    const e = stores.employers.find((x) => x.id === Number(params.id));
    if (!e) return new HttpResponse(null, { status: 404 });
    Object.assign(e, body);
    return HttpResponse.json(e);
  }),

  // ---- job postings ----
  http.get(`${BASE}/job-postings`, () => HttpResponse.json(stores.jobs)),
  http.get(`${BASE}/job-postings/:id`, ({ params }) => {
    const j = stores.jobs.find((x) => x.id === Number(params.id));
    if (!j) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({ ...j, customQuestions: j.customQuestions || [] });
  }),
  http.post(`${BASE}/job-postings`, async ({ request }) => {
    const body = await request.json();
    const job = {
      id: nextId(stores.jobs),
      isActive: 1,
      status: 'active',
      location: '',
      industry: '',
      customQuestions: [],
      ...body,
    };
    stores.jobs.push(job);
    return HttpResponse.json(job, { status: 201 });
  }),
  http.put(`${BASE}/job-postings/:id`, async ({ params, request }) => {
    const body = await request.json();
    const j = stores.jobs.find((x) => x.id === Number(params.id));
    if (!j) return new HttpResponse(null, { status: 404 });
    Object.assign(j, body);
    return HttpResponse.json(j);
  }),
  http.delete(`${BASE}/job-postings/:id`, ({ params }) => {
    const j = stores.jobs.find((x) => x.id === Number(params.id));
    if (!j) return new HttpResponse(null, { status: 404 });
    j.status = 'closed';
    j.isActive = 0;
    return HttpResponse.json({ message: 'Job posting closed' });
  }),

 // ---- applications ----
  http.get(`${BASE}/applications`, ({ request }) => {
    const url = new URL(request.url);
    const jobPostingId = Number(url.searchParams.get('jobPostingId'));
    const employerId = Number(url.searchParams.get('employerId'));
    let rows = stores.applications;

    if (!Number.isNaN(jobPostingId) && jobPostingId > 0) {
      rows = rows.filter((a) => a.jobPostingId === jobPostingId);
    }
    if (!Number.isNaN(employerId) && employerId > 0) {
      const employerPostingIds = stores.jobs
        .filter((j) => j.employerId === employerId)
        .map((j) => j.id);
      rows = rows.filter((a) => employerPostingIds.includes(a.jobPostingId));
    }

    return HttpResponse.json(rows);
  }),
  http.post(`${BASE}/applications`, async ({ request }) => {
    const body = await request.json();
    const student = stores.students.find((s) => s.id === Number(body.studentId));
    const posting = stores.jobs.find((j) => j.id === Number(body.jobPostingId));
    if (!student || !posting) {
      return HttpResponse.json({ detail: 'Student or posting not found' }, { status: 404 });
    }

    const dup = stores.applications.find(
      (a) => a.studentId === Number(body.studentId) && a.jobPostingId === Number(body.jobPostingId),
    );
    if (dup) {
      return HttpResponse.json({ detail: 'Already applied to this posting' }, { status: 409 });
    }

    const row = {
      id: nextId(stores.applications),
      studentId: Number(body.studentId),
      jobPostingId: Number(body.jobPostingId),
      status: 'submitted',
      createdAt: new Date().toISOString(),
      answers: body.answers || [],
      student,
    };
    stores.applications.push(row);
    return HttpResponse.json(row, { status: 201 });
  }),

  // ---- mentors ----
  http.get(`${BASE}/mentors`, () => HttpResponse.json(stores.mentors)),
  http.get(`${BASE}/mentors/:id`, ({ params }) => {
    const m = stores.mentors.find((x) => x.id === Number(params.id));
    if (!m) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({ ...m, customQuestions: m.customQuestions || [] });
  }),
  http.post(`${BASE}/mentors`, async ({ request }) => {
    const body = await request.json();
    const m = {
      id: nextId(stores.mentors),
      jobType: 'mentorship',
      isActive: 1,
      status: 'active',
      location: '',
      industry: '',
      customQuestions: [],
      ...body,
    };
    stores.mentors.push(m);
    return HttpResponse.json(m, { status: 201 });
  }),

  // ---- saved postings ----
  http.get(`${BASE}/saved-postings`, ({ request }) => {
    const url = new URL(request.url);
    const studentId = Number(url.searchParams.get('studentId'));
    const mine = stores.saved
      .filter((s) => s.studentId === studentId)
      .map((s) => ({
        ...s,
        jobPosting: stores.jobs.find((j) => j.id === s.jobPostingId) || { id: s.jobPostingId, title: 'Unknown' },
      }));
    return HttpResponse.json(mine);
  }),
  http.post(`${BASE}/saved-postings`, async ({ request }) => {
    const body = await request.json();
    const row = { id: nextId(stores.saved), ...body };
    stores.saved.push(row);
    return HttpResponse.json(row, { status: 201 });
  }),
  http.delete(`${BASE}/saved-postings/:id`, ({ params }) => {
    const idx = stores.saved.findIndex((s) => s.id === Number(params.id));
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    stores.saved.splice(idx, 1);
    return HttpResponse.json({ message: 'Posting unsaved' });
  }),

  // ---- analytics ----
  http.post(`${BASE}/analytics/events`, async ({ request }) => {
    const body = await request.json();
    const row = { id: nextId(stores.analytics), ...body };
    stores.analytics.push(row);
    return HttpResponse.json(row, { status: 201 });
  }),
  http.get(`${BASE}/analytics/student/:id`, ({ params }) => {
    const views = stores.analytics.filter(
      (e) => e.eventType === 'profile_view' && e.targetId === Number(params.id),
    );
    return HttpResponse.json({ totalViews: views.length, recentViews: views.slice(0, 10) });
  }),
  http.get(`${BASE}/analytics/posting/:id`, ({ params }) => {
    const views = stores.analytics.filter(
      (e) => e.eventType === 'posting_view' && e.targetId === Number(params.id),
    );
    return HttpResponse.json({ totalViews: views.length, recentViews: views.slice(0, 10) });
  }),
  http.get(`${BASE}/analytics/employer/:id`, ({ params }) => {
    const myJobs = stores.jobs.filter((j) => j.employerId === Number(params.id));
    const ids = myJobs.map((j) => j.id);
    const views = stores.analytics.filter((e) => e.eventType === 'posting_view' && ids.includes(e.targetId));
    const clicks = stores.analytics.filter((e) => e.eventType === 'email_click' && ids.includes(e.targetId));
    return HttpResponse.json({
      totalViews: views.length,
      totalEmailClicks: clicks.length,
      postingBreakdown: myJobs.map((j) => ({
        postingId: j.id,
        title: j.title,
        views: views.filter((v) => v.targetId === j.id).length,
        emailClicks: clicks.filter((v) => v.targetId === j.id).length,
      })),
    });
  }),

  // ---- resources ----
  http.get(`${BASE}/resources`, () => HttpResponse.json(stores.resources)),
  http.post(`${BASE}/resources`, async ({ request }) => {
    const body = await request.json();
    const r = { id: nextId(stores.resources), ...body };
    stores.resources.push(r);
    return HttpResponse.json(r, { status: 201 });
  }),
  http.put(`${BASE}/resources/:id`, async ({ params, request }) => {
    const body = await request.json();
    const r = stores.resources.find((x) => x.id === Number(params.id));
    if (!r) return new HttpResponse(null, { status: 404 });
    Object.assign(r, body);
    return HttpResponse.json(r);
  }),
  http.delete(`${BASE}/resources/:id`, ({ params }) => {
    const idx = stores.resources.findIndex((r) => r.id === Number(params.id));
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    stores.resources.splice(idx, 1);
    return HttpResponse.json({ message: 'Resource deleted' });
  }),

  // ---- admin ----
  http.get(`${BASE}/admin/students`, () => HttpResponse.json(stores.students)),
  http.put(`${BASE}/admin/students/:id/status`, async ({ params, request }) => {
    const body = await request.json();
    const s = stores.students.find((x) => x.id === Number(params.id));
    if (!s) return new HttpResponse(null, { status: 404 });
    s.isActive = body.status === 'active' ? 1 : 0;
    return HttpResponse.json(s);
  }),
  http.get(`${BASE}/admin/job-postings`, () => HttpResponse.json(stores.jobs)),
  http.put(`${BASE}/admin/job-postings/:id/status`, async ({ params, request }) => {
    const body = await request.json();
    const j = stores.jobs.find((x) => x.id === Number(params.id));
    if (!j) return new HttpResponse(null, { status: 404 });
    j.status = body.status;
    j.isActive = body.status === 'active' ? 1 : 0;
    return HttpResponse.json(j);
  }),
  http.get(`${BASE}/admin/users`, () => HttpResponse.json(stores.users)),
  http.post(`${BASE}/admin/users/:id/password-reset`, () => {
    return HttpResponse.json({
      tempPassword: 'Temp12345!@#',
      message: 'Temporary password set',
    });
  }),
];
