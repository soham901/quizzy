(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))s(o);new MutationObserver(o=>{for(const a of o)if(a.type==="childList")for(const v of a.addedNodes)v.tagName==="LINK"&&v.rel==="modulepreload"&&s(v)}).observe(document,{childList:!0,subtree:!0});function n(o){const a={};return o.integrity&&(a.integrity=o.integrity),o.referrerPolicy&&(a.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?a.credentials="include":o.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(o){if(o.ep)return;o.ep=!0;const a=n(o);fetch(o.href,a)}})();const m=document.getElementById("app");let i=JSON.parse(localStorage.getItem("mcqQuestions"))||[],l=0,f=[],r="view",d="",p="",u=[];function w(){S(),E(),c()}function S(){const e=localStorage.getItem("mcqQuestions");e&&(i=JSON.parse(e))}function E(){i.length===0&&Promise.all([fetch("/data/cn/unit-2.json").then(e=>e.json()),fetch("/data/cn/unit-3.json").then(e=>e.json())]).then(([e,t])=>{i=i.concat(e,t),b(),c()}).catch(e=>{console.log("Error loading sample data:",e)})}function b(){localStorage.setItem("mcqQuestions",JSON.stringify(i))}function $(){confirm("Are you sure you want to clear all questions? This action cannot be undone.")&&(i=[],localStorage.removeItem("mcqQuestions"),c())}function c(){switch(r){case"test":q();break;case"edit":Q();break;case"subjectSelect":A();break;case"topicSelect":L();break;default:j()}}function k(){return[...new Set(i.map(t=>t.subject))].filter(t=>t)}function T(e){return[...new Set(i.filter(n=>n.subject===e).map(n=>n.category))].filter(n=>n)}function j(){m.innerHTML=`
    <div class="actions">
      <button id="startTest">Start Full Test</button>
      <button id="startSubjectTest">Start Subject-wise Test</button>
      <button id="startTopicTest">Start Topic-wise Test</button>
      <button id="editQuestions">Edit Questions</button>
      <button id="addQuestion">Add Question</button>
      <button id="exportQuestions">Export Questions</button>
      <input type="file" id="importQuestions" accept=".json" style="display: none;">
      <button id="importButton">Import Questions</button>
      <button id="clearDatabase">Clear Database</button>
    </div>
    <div class="stats">
      <p>Total Questions: ${i.length}</p>
    </div>
    <div class="questions-list">
      ${i.map((e,t)=>`
        <div class="question-card">
          <h3>Question ${t+1}: ${e.question}</h3>
          <div class="options">
            ${e.options.map((n,s)=>`
              <div class="option ${s===e.correctAnswer?"correct":""}">
                <strong>${String.fromCharCode(65+s)}.</strong> ${n}
              </div>
            `).join("")}
          </div>
          <div class="question-meta">
            <span>Category: ${e.category}</span>
            <span>Difficulty: ${e.difficulty}</span>
            <span>Subject: ${e.subject}</span>
          </div>
          <div class="question-actions">
            <button class="edit-btn" data-index="${t}">Edit</button>
            <button class="delete-btn" data-index="${t}">Delete</button>
          </div>
        </div>
      `).join("")}
    </div>
  `,document.getElementById("startTest")?.addEventListener("click",y),document.getElementById("startSubjectTest")?.addEventListener("click",()=>{r="subjectSelect",c()}),document.getElementById("startTopicTest")?.addEventListener("click",()=>{r="subjectSelect",d="",c()}),document.getElementById("editQuestions")?.addEventListener("click",()=>{r="edit",c()}),document.getElementById("addQuestion")?.addEventListener("click",I),document.getElementById("exportQuestions")?.addEventListener("click",O),document.getElementById("importButton")?.addEventListener("click",()=>{document.getElementById("importQuestions").click()}),document.getElementById("importQuestions")?.addEventListener("change",N),document.getElementById("clearDatabase")?.addEventListener("click",$),document.querySelectorAll(".edit-btn").forEach(e=>{e.addEventListener("click",t=>{parseInt(t.target.dataset.index),B()})}),document.querySelectorAll(".delete-btn").forEach(e=>{e.addEventListener("click",t=>{const n=parseInt(t.target.dataset.index);x(n)})})}function A(){const e=k(),t=r==="topicSelect"||r==="subjectSelect"&&d!=="";m.innerHTML=`
    <div class="subject-select">
      <h2>${t?"Select Subject for Topic-wise Test":"Select Subject"}</h2>
      <div class="subjects-list">
        ${e.map(n=>`
          <div class="subject-card">
            <h3>${n}</h3>
            <p>${i.filter(s=>s.subject===n).length} questions</p>
            <button class="select-subject" data-subject="${n}">Select</button>
          </div>
        `).join("")}
      </div>
      <button id="backToView">Back to Main</button>
    </div>
  `,document.querySelectorAll(".select-subject").forEach(n=>{n.addEventListener("click",s=>{d=s.target.dataset.subject,document.getElementById("startTopicTest")?(u=i.filter(o=>o.subject===d),g()):(r="topicSelect",c())})}),document.getElementById("backToView")?.addEventListener("click",()=>{r="view",d="",c()})}function L(){const e=T(d);m.innerHTML=`
    <div class="topic-select">
      <h2>Select Topic for ${d}</h2>
      <div class="topics-list">
        ${e.map(t=>`
          <div class="topic-card">
            <h3>${t}</h3>
            <p>${i.filter(n=>n.subject===d&&n.category===t).length} questions</p>
            <button class="select-topic" data-category="${t}">Select</button>
          </div>
        `).join("")}
      </div>
      <button id="backToSubjectSelect">Back to Subjects</button>
      <button id="backToView">Back to Main</button>
    </div>
  `,document.querySelectorAll(".select-topic").forEach(t=>{t.addEventListener("click",n=>{p=n.target.dataset.category,u=i.filter(s=>s.subject===d&&s.category===p),g()})}),document.getElementById("backToSubjectSelect")?.addEventListener("click",()=>{r="subjectSelect",p="",c()}),document.getElementById("backToView")?.addEventListener("click",()=>{r="view",d="",p="",c()})}function g(){if(u.length===0){m.innerHTML=`
      <div class="no-questions">
        <h2>No Questions Available</h2>
        <p>No questions found for the selected subject/topic.</p>
        <button id="backToView">Back to View</button>
      </div>
    `,document.getElementById("backToView")?.addEventListener("click",()=>{r="view",d="",p="",c()});return}l=0,f=new Array(u.length).fill(void 0),r="test",c()}function q(){const e=u.length>0?u:i;if(e.length===0){m.innerHTML=`
      <div class="no-questions">
        <h2>No Questions Available</h2>
        <p>Please add some questions first.</p>
        <button id="backToView">Back to View</button>
      </div>
    `,document.getElementById("backToView")?.addEventListener("click",()=>{r="view",u=[],d="",p="",c()});return}if(l>=e.length){h();return}const t=e[l];m.innerHTML=`
    <div class="test-header">
      <h2>Question ${l+1} of ${e.length}</h2>
      ${u.length>0?`<p>${d}${p?` - ${p}`:""}</p>`:"<p>Full Test</p>"}
      <progress value="${l}" max="${e.length}"></progress>
    </div>
    <div class="question-container">
      <h3>${t.question}</h3>
      <div class="options">
        ${t.options.map((n,s)=>`
          <div class="option">
            <input type="radio" id="option${s}" name="answer" value="${s}"
              ${f[l]===s?"checked":""}>
            <label for="option${s}">${String.fromCharCode(65+s)}. ${n}</label>
          </div>
        `).join("")}
      </div>
      <div class="test-actions">
        ${l>0?'<button id="prevQuestion">Previous</button>':""}
        <button id="checkAnswer">Check Answer</button>
        <button id="nextQuestion">${l===e.length-1?"Finish":"Next"}</button>
      </div>
    </div>
  `,document.querySelectorAll('input[name="answer"]').forEach(n=>{n.addEventListener("change",s=>{f[l]=parseInt(s.target.value),document.querySelectorAll(".option").forEach(o=>{o.classList.remove("selected")}),s.target.closest(".option").classList.add("selected")})}),document.getElementById("prevQuestion")?.addEventListener("click",()=>{l>0&&(l--,c())}),document.getElementById("checkAnswer")?.addEventListener("click",()=>{const n=document.querySelector('input[name="answer"]:checked');if(!n){alert("Please select an answer first!");return}const s=parseInt(n.value),o=t.correctAnswer;document.querySelectorAll(".option").forEach(v=>{v.classList.remove("selected","correct-feedback","incorrect-feedback","correct-answer-highlight")});const a=n.closest(".option");s===o?a.classList.add("correct-feedback"):(a.classList.add("incorrect-feedback"),document.querySelector(`#option${o}`).closest(".option").classList.add("correct-answer-highlight")),document.querySelectorAll('input[name="answer"]').forEach(v=>{v.disabled=!0}),document.getElementById("checkAnswer").textContent="Answer Checked",document.getElementById("checkAnswer").disabled=!0}),document.getElementById("nextQuestion")?.addEventListener("click",()=>{const n=document.querySelector('input[name="answer"]:checked');n&&(f[l]=parseInt(n.value)),l<e.length-1?(l++,c()):h()})}function h(){const e=u.length>0?u:i,t=f.reduce((s,o,a)=>o===e[a].correctAnswer?s+1:s,0),n=Math.round(t/e.length*100);m.innerHTML=`
    <div class="results">
      <h2>Test Results</h2>
      <div class="score">
        <h3>You scored ${t} out of ${e.length}</h3>
        <p>Percentage: ${n}%</p>
        ${u.length>0?`<p>Test Type: ${d}${p?` - ${p}`:""}</p>`:"<p>Test Type: Full Test</p>"}
      </div>
      <div class="answers-review">
        <h3>Review Answers</h3>
        ${e.map((s,o)=>`
          <div class="review-item ${f[o]===s.correctAnswer?"correct":"incorrect"}">
            <h4>${o+1}. ${s.question}</h4>
            <p>Your answer: ${f[o]!==void 0?String.fromCharCode(65+f[o])+". "+s.options[f[o]]:"Not answered"}</p>
            <p>Correct answer: ${String.fromCharCode(65+s.correctAnswer)}. ${s.options[s.correctAnswer]}</p>
          </div>
        `).join("")}
      </div>
      <button id="restartTest">Restart Test</button>
      <button id="backToView">Back to View</button>
    </div>
  `,document.getElementById("restartTest")?.addEventListener("click",()=>{u.length>0?g():y()}),document.getElementById("backToView")?.addEventListener("click",()=>{r="view",l=0,f=[],u=[],d="",p="",c()})}function Q(){m.innerHTML=`
    <div class="edit-header">
      <h2>Edit Questions</h2>
      <button id="backToView">Back to View</button>
    </div>
    <div class="questions-edit">
      ${i.map((e,t)=>`
        <div class="question-edit-card" data-index="${t}">
          <div class="form-group">
            <label>Question:</label>
            <textarea class="question-text" data-field="question">${e.question}</textarea>
          </div>
          <div class="form-group">
            <label>Options:</label>
            ${e.options.map((n,s)=>`
              <div class="option-input">
                <input type="text" class="option-text" data-option-index="${s}" value="${n}">
              </div>
            `).join("")}
          </div>
          <div class="form-group">
            <label>Correct Answer:</label>
            <select class="correct-answer" data-field="correctAnswer">
              ${e.options.map((n,s)=>`
                <option value="${s}" ${s===e.correctAnswer?"selected":""}>
                  ${String.fromCharCode(65+s)}
                </option>
              `).join("")}
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Category:</label>
              <input type="text" class="category" data-field="category" value="${e.category}">
            </div>
            <div class="form-group">
              <label>Difficulty:</label>
              <input type="text" class="difficulty" data-field="difficulty" value="${e.difficulty}">
            </div>
            <div class="form-group">
              <label>Subject:</label>
              <input type="text" class="subject" data-field="subject" value="${e.subject}">
            </div>
          </div>
          <div class="edit-actions">
            <button class="save-question" data-index="${t}">Save</button>
            <button class="cancel-edit" data-index="${t}">Cancel</button>
          </div>
        </div>
      `).join("")}
    </div>
  `,document.getElementById("backToView")?.addEventListener("click",()=>{r="view",c()}),document.querySelectorAll(".save-question").forEach(e=>{e.addEventListener("click",t=>{const n=parseInt(t.target.dataset.index);C(n)})}),document.querySelectorAll(".cancel-edit").forEach(e=>{e.addEventListener("click",()=>{r="view",c()})})}function y(){l=0,f=new Array(i.length).fill(void 0),r="test",u=[],d="",p="",c()}function I(){const e={question:"New Question",options:["Option A","Option B","Option C","Option D"],correctAnswer:0,category:"general",difficulty:"medium",subject:"general"};i.push(e),b(),r="edit",c()}function B(e){r="edit",c()}function C(e){const t=document.querySelector(`.question-edit-card[data-index="${e}"]`);if(t){const n=t.querySelector(".question-text").value;i[e].question=n;const s=t.querySelectorAll(".option-text");i[e].options=Array.from(s).map(a=>a.value);const o=parseInt(t.querySelector(".correct-answer").value);i[e].correctAnswer=o,i[e].category=t.querySelector(".category").value,i[e].difficulty=t.querySelector(".difficulty").value,i[e].subject=t.querySelector(".subject").value,b()}r="view",c()}function x(e){confirm("Are you sure you want to delete this question?")&&(i.splice(e,1),b(),c())}function O(){const e=JSON.stringify(i,null,2),t="data:application/json;charset=utf-8,"+encodeURIComponent(e),n="mcq-questions.json",s=document.createElement("a");s.setAttribute("href",t),s.setAttribute("download",n),s.click()}function N(e){const t=e.target.files[0];if(!t)return;const n=new FileReader;n.onload=function(s){try{const o=JSON.parse(s.target.result);Array.isArray(o)?(confirm(`Found ${o.length} questions. Click OK to append to existing questions, or Cancel to replace all existing questions.`)?i=i.concat(o):i=o,b(),c(),alert("Questions imported successfully!")):alert("Invalid file format. Please import a valid JSON array of questions.")}catch(o){alert("Error parsing JSON file: "+o.message)}},n.readAsText(t)}w();"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("/sw.js").then(e=>{console.log("SW registered: ",e)}).catch(e=>{console.log("SW registration failed: ",e)})});
