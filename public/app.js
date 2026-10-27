const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
let token = localStorage.getItem("sb_token") || "";
let currentUser = JSON.parse(localStorage.getItem("sb_user") || "null");
let courses = [];
let authMode = "login";
const icons = { "Programming":"⌘", "Web Development":"⌘", "Data":"◫", "Design":"✳" };
const toast = message => { const el=$("#toast"); el.textContent=message; el.classList.add("show"); setTimeout(()=>el.classList.remove("show"),2800); };
async function api(url, options={}) {
  const response = await fetch(url, { ...options, headers: { "Content-Type":"application/json", ...(token ? {Authorization:`Bearer ${token}`} : {}), ...(options.headers||{}) } });
  const data = await response.json().catch(()=>({}));
  if (!response.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}
function setUser(user, newToken) {
  currentUser=user; token=newToken;
  if(user){localStorage.setItem("sb_user",JSON.stringify(user));localStorage.setItem("sb_token",token);}
  else{localStorage.removeItem("sb_user");localStorage.removeItem("sb_token");}
  renderUserActions();
}
function renderUserActions(){
  $("#userActions").innerHTML = currentUser
    ? `<span class="user-greeting" style="font-size:11px;color:#6f7769;margin-right:5px">Hi, ${escapeHtml(currentUser.name.split(" ")[0])}</span><button class="btn btn-quiet" id="logoutBtn">Log out</button><button class="btn btn-dark" data-view="dashboard">My dashboard ↗</button>`
    : `<button class="btn btn-quiet" id="loginOpen">Log in</button><button class="btn btn-dark" id="registerOpen">Get started <span>↗</span></button>`;
}
function escapeHtml(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function openAuth(mode){authMode=mode;$("#authModal").classList.remove("hidden");$("#authError").textContent="";$("#authForm").reset();const signup=mode==="register";$("#nameWrap").classList.toggle("hidden",!signup);$("#nameInput").required=signup;$("#authTitle").textContent=signup?"Create your account.":"Welcome back.";$("#authSubtitle").textContent=signup?"Start building your next chapter today.":"Pick up where your learning journey left off." ;$("#authEyebrow").textContent=signup?"START YOUR JOURNEY":"YOUR NEXT CHAPTER";$("#authSubmit").innerHTML=signup?'Create account <span>↗</span>':'Log in <span>↗</span>';$("#authSwitch").innerHTML=signup?'Already have an account? <button type="button" id="switchAuth">Log in</button>':'New to SkillBridge? <button type="button" id="switchAuth">Create an account</button>';$("#passwordInput").autocomplete=signup?"new-password":"current-password";}
function closeAuth(){$("#authModal").classList.add("hidden");}
async function loadCourses(){
  const q=$("#searchInput")?.value||"", category=$("#categoryFilter")?.value||"All categories";
  try{courses=await api(`/api/courses?q=${encodeURIComponent(q)}&category=${encodeURIComponent(category)}`);renderCourses();}
  catch(e){$("#courseGrid").innerHTML=`<div class="empty-state">${escapeHtml(e.message)}</div>`;}
}
function renderCourses(){
  $("#courseCount").textContent=`${courses.length} ${courses.length===1?"path":"paths"}`;
  $("#courseGrid").innerHTML=courses.length?courses.map((c,i)=>`<article class="course-card"><div class="course-top"><div class="course-symbol">${icons[c.category]||"✳"}</div><span class="pill">${escapeHtml(c.level)}</span></div><h3>${escapeHtml(c.title)}</h3><p>${escapeHtml(c.description)}</p><div class="skill-tags">${(c.skills||[]).slice(0,3).map(s=>`<span>${escapeHtml(s)}</span>`).join("")}</div><div class="course-foot"><small>◷ ${escapeHtml(c.duration)} · ${c.lessons} lessons</small><button class="course-action" data-enroll="${c.id}">View path ↗</button></div></article>`).join(""):`<div class="empty-state">No courses match that search. Try another keyword.</div>`;
}
function renderHome(){ $("#app").innerHTML=homeMarkup; }
const homeMarkup = $("#app").innerHTML;
async function showDashboard(){
  if(!currentUser){openAuth("login");toast("Log in to see your learning dashboard.");return;}
  $("#app").innerHTML=`<section class="page-panel"><div class="eyebrow">YOUR PERSONAL SPACE</div><h1>Your learning <span>dashboard.</span></h1><p style="color:var(--muted);font-size:13px">Every lesson is progress. Keep going.</p><div id="dashContent" class="loading">Loading your progress…</div></section>`;
  try{
    const d=await api("/api/dashboard");
    $("#dashContent").innerHTML=`<div class="dashboard-grid"><div class="stat-card"><small>Learning paths</small><strong>${d.stats.enrolled}</strong></div><div class="stat-card"><small>Completed paths</small><strong>${d.stats.completed}</strong></div><div class="stat-card"><small>Average quiz score</small><strong>${d.stats.quizAverage}%</strong></div></div><div class="section-mini">CONTINUE LEARNING</div>${d.progress.length?d.progress.map(p=>{let pct=Math.round(p.completedLessons/p.course.lessons*100);return `<div class="learning-row"><div style="flex:1"><h3>${escapeHtml(p.course.title)}</h3><p>${p.completedLessons}/${p.course.lessons} lessons completed · ${pct}%</p><div class="progress-track"><span style="width:${pct}%"></span></div></div><button class="btn btn-dark" data-lesson="${p.courseId}" data-done="${p.completedLessons}" data-total="${p.course.lessons}">${p.completed?"Completed ✓":"Complete next lesson"}</button></div>`}).join(""):`<div class="empty-state" style="background:white;border-radius:12px;margin-top:12px">You haven't enrolled in a path yet. Explore courses to get started.</div>`}<div class="section-mini">RECENT QUIZ RESULTS</div>${d.recentQuizzes.length?d.recentQuizzes.map(q=>`<div class="learning-row"><div><h3>Skill check quiz</h3><p>${new Date(q.date).toLocaleDateString()}</p></div><strong>${q.score}%</strong></div>`).join(""):`<p style="color:var(--muted);font-size:12px">Take the skill quiz to see your results here.</p>`}`;
  }catch(e){$("#dashContent").textContent=e.message;}
}
async function showQuiz(){
  if(!currentUser){openAuth("login");toast("Log in to take the skill quiz.");return;}
  $("#app").innerHTML=`<section class="page-panel"><div class="eyebrow">TEST YOUR KNOWLEDGE</div><h1>Quick skill <span>check.</span></h1><p style="color:var(--muted);font-size:13px">Five questions to warm up your technical thinking. Choose one answer for each.</p><div class="quiz-box" id="quizBox">Loading quiz…</div></section>`;
  try{const qs=await api("/api/quiz");$("#quizBox").innerHTML=`<form id="quizForm">${qs.map((q,i)=>`<div class="quiz-question"><h3>${i+1}. ${escapeHtml(q.q)}</h3>${q.options.map((o,j)=>`<label class="quiz-option"><input type="radio" name="q${i}" value="${j}" required> <span>${escapeHtml(o)}</span></label>`).join("")}</div>`).join("")}<button class="btn btn-dark btn-large" style="margin-top:22px" type="submit">Submit answers ↗</button></form><div id="quizResult"></div>`;}
  catch(e){$("#quizBox").textContent=e.message;}
}
async function doEnroll(id){
  if(!currentUser){openAuth("register");toast("Create an account to save your learning.");return;}
  try{await api(`/api/enroll/${id}`,{method:"POST",body:"{}"});toast("Added to your learning plan!");await showDashboard();}
  catch(e){toast(e.message);}
}
document.addEventListener("click",async e=>{
  const view=e.target.closest("[data-view]")?.dataset.view;
  if(view){$$(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.view===view));if(view==="home"){renderHome();await loadCourses();window.scrollTo(0,0);}if(view==="dashboard")await showDashboard();if(view==="quiz")await showQuiz();return;}
  if(e.target.closest("[data-scroll]")){$("#courses").scrollIntoView({behavior:"smooth"});return;}
  if(e.target.closest("#loginOpen"))return openAuth("login");
  if(e.target.closest("#registerOpen")||e.target.closest("#ctaRegister"))return openAuth("register");
  if(e.target.closest("#modalClose"))return closeAuth();
  if(e.target.closest("#switchAuth"))return openAuth(authMode==="login"?"register":"login");
  if(e.target.closest("#logoutBtn")){setUser(null,"");toast("You have logged out.");renderHome();await loadCourses();return;}
  const enroll=e.target.closest("[data-enroll]");if(enroll)return doEnroll(Number(enroll.dataset.enroll));
  const lesson=e.target.closest("[data-lesson]");if(lesson){const total=Number(lesson.dataset.total),done=Number(lesson.dataset.done);try{await api(`/api/progress/${lesson.dataset.lesson}`,{method:"POST",body:JSON.stringify({completedLessons:Math.min(total,done+1)})});toast(done+1>=total?"Learning path completed! 🎉":"Lesson progress updated.");await showDashboard();}catch(err){toast(err.message);}return;}
});
$("#authForm").addEventListener("submit",async e=>{
  e.preventDefault();$("#authError").textContent="";
  const signup=authMode==="register";
  const body={email:$("#emailInput").value,password:$("#passwordInput").value};
  if(signup)body.name=$("#nameInput").value;
  $("#authSubmit").disabled=true;$("#authSubmit").textContent="Please wait…";
  try{const data=await api(`/api/${signup?"register":"login"}`,{method:"POST",body:JSON.stringify(body)});setUser(data.user,data.token);closeAuth();toast(signup?"Account created. Welcome to SkillBridge!":"Welcome back!");renderHome();await loadCourses();}
  catch(err){$("#authError").textContent=err.message;}
  finally{$("#authSubmit").disabled=false;$("#authSubmit").innerHTML=signup?'Create account <span>↗</span>':'Log in <span>↗</span>';}
});
$("#searchInput").addEventListener("input",()=>loadCourses());
$("#categoryFilter").addEventListener("change",()=>loadCourses());
$("#authModal").addEventListener("click",e=>{if(e.target.id==="authModal")closeAuth();});
document.addEventListener("submit",async e=>{
  if(e.target.id!=="quizForm")return;e.preventDefault();
  const answers=[0,1,2,3,4].map(i=>{const selected=$(`input[name="q${i}"]:checked`);return selected?Number(selected.value):-1;});
  try{const result=await api("/api/quiz/submit",{method:"POST",body:JSON.stringify({answers})});$("#quizResult").innerHTML=`<div class="quiz-result"><div class="eyebrow">QUIZ COMPLETE</div><strong>${result.score}%</strong><p>You answered ${result.correct} out of ${result.total} correctly. ${result.score>=80?"Great work — keep challenging yourself!":"Keep learning and give it another try."}</p><button type="button" class="btn btn-dark" data-view="dashboard">View dashboard ↗</button></div>`;$("#quizForm").querySelectorAll("input,button").forEach(el=>el.disabled=true);}
  catch(err){toast(err.message);}
});
(async()=>{renderUserActions();if(token){try{const d=await api("/api/me");currentUser=d.user;localStorage.setItem("sb_user",JSON.stringify(currentUser));}catch{setUser(null,"");}}await loadCourses();})();
