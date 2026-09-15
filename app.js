import { db } from "./firebase-config.js";
import {
  collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, limit, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const $ = (id) => document.getElementById(id);
const views = ["welcomeView", "teacherView", "adminView"];

const firstNames = [
  "Ahmet","Mehmet","Mustafa","Ali","Mert","Eren","Kerem","Emir","Arda","Can",
  "Burak","Berk","Kaan","Yiğit","Emirhan","Doruk","Baran","Furkan","Oğuz","Onur",
  "Efe","Umut","Bora","Deniz","Alper","Hakan","Cem","Batuhan","Tuna","Aras",
  "Zeynep","Elif","Ece","Ada","Duru","Defne","İrem","Buse","Melis","Ceren",
  "Yağmur","Nehir","Asya","Selin","Sude","Nazlı","İlayda","Mina","Lina","Azra",
  "Berkay","Tolga","Emre","Sinan","Samet","Serkan","Ozan","Kıvanç","Rüzgar","Atlas",
  "Mete","Çınar","Alaz","Kuzey","Toprak","Ulaş","Koral","Dorukhan","Çağan","Eymen",
  "Nisa","Nehiray","Lara","Leyla","İpek","Defne Su","Elvan","Beren","Miray","Nehir Naz"
];

const lastNames = [
  "Kaya","Yılmaz","Demir","Şahin","Çelik","Aydın","Arslan","Koç","Özkan","Kılıç",
  "Kurt","Aksoy","Polat","Doğan","Güneş","Kaplan","Avcı","Tekin","Öztürk","Karaca",
  "Erdoğan","Taş","Bulut","Ekinci","Korkmaz","Aslan","Sarı","Duman","Bozkurt","Keskin",
  "Yalçın","Kara","Bayram","Ergin","Uçar","Işık","Güler","Tunç","Özdemir","Başar",
  "Şimşek","Eren","Çetin","Özer","Acar","Köse","Durmuş","Sezer","Köseoğlu","Altun",
  "Özsoy","Karataş","Kandemir","Aksu","Türkmen","Turan","Yıldız","Özbek","Sağlam","Erdem",
  "Bilgin","Sönmez","Kayaalp","Keleş","Dinç","Yavuz","Uslu","Balcı","Özkanlı","Çakır"
];

function studentListFor(classValue, section) {
  const sectionIndex = "ABCDEFGHIJKLM".indexOf(section);
  const classIndex = Number(classValue) - 5;
  const classSectionIndex = classIndex * 13 + sectionIndex;
  const startIndex = classSectionIndex * 12;
  const list = [];

  for (let i = 0; i < 12; i++) {
    const uniqueIndex = startIndex + i;
    const f = firstNames[uniqueIndex % firstNames.length];
    const l = lastNames[Math.floor(uniqueIndex / firstNames.length) % lastNames.length];
    const number = String(1001 + uniqueIndex).padStart(4, "0");
    list.push({ name: `${f} ${l}`, number });
  }
  return list;
}

function showView(id){
  views.forEach(v => $(v).classList.toggle("active", v === id));
}

function toast(message){
  const el = $("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(window.__toast);
  window.__toast = setTimeout(() => el.classList.remove("show"), 2600);
}

function fillOptions(){
  $("sectionSelect").innerHTML = `<option value="">Şube seç</option>` +
    "ABCDEFGHIJKLM".split("").map(x => `<option value="${x}">${x} Şubesi</option>`).join("");

  $("lessonSelect").innerHTML = `<option value="">Ders seç</option>` +
    Array.from({length:7}, (_,i) => `<option value="${i+1}">${i+1}. Ders</option>`).join("");
}

async function loadTeachers(){
  const snap = await getDocs(collection(db, "teachers"));
  const rows = snap.docs.map(d => ({id:d.id, ...d.data()})).sort((a,b)=>(a.name||"").localeCompare(b.name||"","tr"));

  $("teacherCount").textContent = `${rows.length} kayıt`;
  $("teacherList").innerHTML = rows.length ? rows.map(t => `
    <div class="simple-row">
      <div><strong>${escapeHtml(t.name || "")}</strong><small>Öğretmen</small></div>
      <button class="danger-small" data-delete-teacher="${t.id}" data-teacher-name="${escapeHtml(t.name || "")}">Sil</button>
    </div>
  `).join("") : `<div class="empty-state">Henüz öğretmen yok.</div>`;

  $("teacherSelect").innerHTML = `<option value="">Öğretmen seç</option>` +
    rows.map(t => `<option value="${t.id}">${escapeHtml(t.name || "")}</option>`).join("");

  document.querySelectorAll("[data-delete-teacher]").forEach(button => {
    button.addEventListener("click", () => deleteTeacher(button.dataset.deleteTeacher, button.dataset.teacherName));
  });

  return rows;
}

async function deleteTeacher(id, teacherName){
  const confirmed = window.confirm(`${teacherName} adlı öğretmen sistemden silinsin mi?`);
  if(!confirmed) return;

  try{
    await deleteDoc(doc(db, "teachers", id));
    await loadTeachers();
    toast("Öğretmen silindi.");
  }catch(error){
    console.error(error);
    toast("Öğretmen silinemedi. Firestore Rules'u kontrol et.");
  }
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

function renderStudents(){
  const classValue = $("classSelect").value;
  const section = $("sectionSelect").value;
  const students = studentListFor(classValue, section);

  $("studentList").innerHTML = students.map((s, i) => `
    <div class="student-row">
      <div class="student-info">
        <strong>${escapeHtml(s.name)}</strong>
        <small>Öğrenci No: ${escapeHtml(s.number)}</small>
      </div>
      <select class="attendance-select" data-index="${i}">
        <option value="present">🟢 Var</option>
        <option value="absent">🔴 Yok</option>
      </select>
    </div>
  `).join("");

  document.querySelectorAll(".attendance-select").forEach(sel => {
    sel.addEventListener("change", () => {
      sel.classList.toggle("absent", sel.value === "absent");
      updateSummary();
    });
  });

  updateSummary();
  $("saveAttendance").disabled = false;
}

function currentStudents(){
  return studentListFor($("classSelect").value, $("sectionSelect").value);
}

function updateSummary(){
  const total = document.querySelectorAll(".attendance-select").length;
  const absent = [...document.querySelectorAll(".attendance-select")].filter(x => x.value === "absent").length;
  $("attendanceSummary").textContent = `${total} öğrenci • ${absent} yok`;
}

async function saveAttendance(){
  const teacherId = $("teacherSelect").value;
  const teacherName = $("teacherSelect").selectedOptions[0]?.textContent?.trim();
  const classValue = $("classSelect").value;
  const section = $("sectionSelect").value;
  const lesson = $("lessonSelect").value;

  if(!teacherId || !classValue || !section || !lesson){
    toast("Lütfen öğretmen, sınıf, şube ve ders seç.");
    return;
  }

  const selectedStudents = currentStudents();
  const records = [...document.querySelectorAll(".attendance-select")].map((el, i) => ({
    studentName: selectedStudents[i].name,
    studentNumber: selectedStudents[i].number,
    status: el.value,
    teacherId,
    teacherName,
    class: classValue,
    section,
    lesson: Number(lesson),
    createdAt: serverTimestamp()
  }));

  $("saveAttendance").disabled = true;
  try{
    await Promise.all(records.map(record => addDoc(collection(db, "attendance"), record)));
    toast("Yoklama kaydedildi.");
    updateSummary();
    await loadAbsences();
  }catch(error){
    console.error(error);
    toast("Kayıt sırasında hata oluştu. Firestore Rules'u kontrol et.");
  }finally{
    $("saveAttendance").disabled = false;
  }
}

async function loadAbsences(){
  const q = query(collection(db, "attendance"), orderBy("createdAt","desc"), limit(50));
  const snap = await getDocs(q);
  const absences = snap.docs.map(d => d.data()).filter(x => x.status === "absent");
  $("absenceList").innerHTML = absences.length ? absences.map(x => `
    <div class="simple-row">
      <div>
        <strong>${escapeHtml(x.studentName || "")}</strong>
        <small>${escapeHtml(x.teacherName || "")} • ${x.class || ""}. Sınıf ${escapeHtml(x.section || "")} • ${x.lesson || ""}. Ders</small>
      </div>
      <span class="status-pill danger-pill">🔴 Yok</span>
    </div>
  `).join("") : `<div class="empty-state">Henüz devamsızlık kaydı yok.</div>`;
}

$("teacherEntry").addEventListener("click", async () => {
  showView("teacherView");
  await loadTeachers();
});

$("adminEntry").addEventListener("click", async () => {
  showView("adminView");
  await loadTeachers();
  await loadAbsences();
});

document.querySelectorAll("[data-back]").forEach(btn => {
  btn.addEventListener("click", () => showView("welcomeView"));
});

$("loadStudents").addEventListener("click", () => {
  if(!$("teacherSelect").value || !$("classSelect").value || !$("sectionSelect").value || !$("lessonSelect").value){
    toast("Önce tüm seçimleri yap.");
    return;
  }
  $("teacherPanelTitle").textContent = $("teacherSelect").selectedOptions[0].textContent.trim();
  renderStudents();
});

$("saveAttendance").addEventListener("click", saveAttendance);

$("teacherForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const first = $("teacherFirstName").value.trim();
  const last = $("teacherLastName").value.trim();
  if(!first || !last) return;

  try{
    await addDoc(collection(db, "teachers"), {
      name: `${first} ${last}`,
      firstName: first,
      lastName: last,
      createdAt: serverTimestamp()
    });
    $("teacherForm").reset();
    $("adminMessage").textContent = "Öğretmen başarıyla eklendi.";
    await loadTeachers();
    toast("Öğretmen eklendi.");
  }catch(error){
    console.error(error);
    $("adminMessage").textContent = "Öğretmen eklenemedi. Firestore Rules'u kontrol et.";
  }
});

fillOptions();

if("serviceWorker" in navigator){
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(console.error));
}
