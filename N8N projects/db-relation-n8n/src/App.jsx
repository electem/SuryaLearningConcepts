import { useState, useEffect } from "react";

const N8N = "http://localhost:5678/webhook";

async function apiFetch(url) {
  const res = await fetch(url);
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

async function apiPost(path, body) {
  const res = await fetch(`${N8N}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const text = await res.text();
  try { return { ok: res.ok, data: JSON.parse(text) }; }
  catch { return { ok: res.ok, data: { raw: text } }; }
}

function App() {
  const [tab, setTab] = useState("student");

  const tabs = [
    { key: "student",     label: "Register Student" },
    { key: "teacher",     label: "Add Teacher" },
    { key: "enroll",      label: "Enroll Student" },
    { key: "allStudents", label: "All Students" },
    { key: "viewStudent", label: "View Student" },
    { key: "viewTeacher", label: "View Teacher" },
    { key: "viewEnroll",  label: "View Enrollments" },
  ];

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 900, margin: "40px auto", padding: "0 20px" }}>
      <h1>School Management</h1>
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ padding: "8px 14px", background: tab === t.key ? "#4f46e5" : "#e5e7eb",
              color: tab === t.key ? "white" : "black", border: "none", borderRadius: 6, cursor: "pointer" }}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "student"     && <StudentForm />}
      {tab === "teacher"     && <TeacherForm />}
      {tab === "enroll"      && <EnrollForm />}
      {tab === "allStudents" && <AllStudents />}
      {tab === "viewStudent" && <ViewStudent />}
      {tab === "viewTeacher" && <ViewTeacher />}
      {tab === "viewEnroll"  && <ViewEnrollments />}
    </div>
  );
}

/* ───────── helper ───────── */

/* ───────── REGISTER STUDENT ───────── */
function StudentForm() {
  const [form, setForm] = useState({ name:"", email:"", phone:"", address:"", dob:"" });
  const [msg, setMsg] = useState("");
  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async () => {
    const res = await fetch(`${N8N}/register-student`, {
      method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(form)
    });
    const text = await res.text();
    let data = {};
    try { data = JSON.parse(text); } catch(e) { data = { raw: text }; }
    setMsg(res.ok ? "✅ Student registered!" : "❌ Error: " + JSON.stringify(data));
  };
  return (
    <div>
      <h2>Register Student</h2>
      {["name","email","phone","address","dob"].map(f => (
        <div key={f} style={{ marginBottom: 10 }}>
          <label style={{ display:"block", marginBottom:4, textTransform:"capitalize" }}>{f}</label>
          <input name={f} value={form[f]} onChange={handle} type={f==="dob"?"date":"text"}
            style={{ width:"100%", padding:8, borderRadius:6, border:"1px solid #ccc", boxSizing:"border-box" }} />
        </div>
      ))}
      <button onClick={submit} style={btnStyle}>Submit</button>
      {msg && <p>{msg}</p>}
    </div>
  );
}

/* ───────── ADD TEACHER ───────── */
function TeacherForm() {
  const [name, setName] = useState("");
  const [dept, setDept] = useState("");
  const [courses, setCourses] = useState([{ course_name:"", credits:3 }]);
  const [msg, setMsg] = useState("");
  const addCourse = () => setCourses([...courses, { course_name:"", credits:3 }]);
  const updateCourse = (i, field, val) => {
    const c = [...courses]; c[i][field] = field==="credits" ? Number(val) : val; setCourses(c);
  };
  const submit = async () => {
    const res = await fetch(`${N8N}/add-teacher`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ name, department: dept, courses })
    });
    const text = await res.text();
    let data = {};
    try { data = JSON.parse(text); } catch(e) { data = { raw: text }; }
    setMsg(res.ok ? "✅ Teacher + courses added!" : "❌ Error: " + JSON.stringify(data));
  };
  return (
    <div>
      <h2>Add Teacher</h2>
      <input placeholder="Teacher name" value={name} onChange={e=>setName(e.target.value)} style={inputStyle} />
      <input placeholder="Department" value={dept} onChange={e=>setDept(e.target.value)} style={inputStyle} />
      <h3>Courses</h3>
      {courses.map((c,i) => (
        <div key={i} style={{ display:"flex", gap:8, marginBottom:8 }}>
          <input placeholder="Course name" value={c.course_name}
            onChange={e=>updateCourse(i,"course_name",e.target.value)}
            style={{ flex:2, padding:8, borderRadius:6, border:"1px solid #ccc" }} />
          <input type="number" placeholder="Credits" value={c.credits}
            onChange={e=>updateCourse(i,"credits",e.target.value)}
            style={{ flex:1, padding:8, borderRadius:6, border:"1px solid #ccc" }} />
        </div>
      ))}
      <button onClick={addCourse} style={{ marginBottom:16, padding:"6px 14px", borderRadius:6, border:"1px solid #ccc", cursor:"pointer" }}>+ Add Course</button>
      <br/>
      <button onClick={submit} style={btnStyle}>Submit</button>
      {msg && <p>{msg}</p>}
    </div>
  );
}

/* ───────── ENROLL STUDENT ───────── */
function EnrollForm() {
  const [studentId, setStudentId] = useState("");
  const [courseIds, setCourseIds] = useState("");
  const [msg, setMsg] = useState("");
  const submit = async () => {
    const res = await fetch(`${N8N}/enroll-student`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ student_id: Number(studentId), course_ids: courseIds.split(",").map(Number) })
    });
    const text = await res.text();
    let data = {};
    try { data = JSON.parse(text); } catch(e) { data = { raw: text }; }
    setMsg(res.ok ? "✅ Enrolled!" : "❌ Error: " + JSON.stringify(data));
  };
  return (
    <div>
      <h2>Enroll Student</h2>
      <label style={{ display:"block", marginBottom:4 }}>Student ID</label>
      <input value={studentId} onChange={e=>setStudentId(e.target.value)}
        placeholder="e.g. 1" style={inputStyle} />
      <label style={{ display:"block", marginBottom:4 }}>Course IDs (comma separated)</label>
      <input value={courseIds} onChange={e=>setCourseIds(e.target.value)}
        placeholder="e.g. 1,2,3" style={inputStyle} />
      <button onClick={submit} style={btnStyle}>Submit</button>
      {msg && <p>{msg}</p>}
    </div>
  );
}

/* ───────── ALL STUDENTS (with Edit & Delete) ───────── */
function AllStudents() {
  const [students, setStudents]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [msg, setMsg]                 = useState("");
  const [editStudent, setEditStudent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [search, setSearch]           = useState("");

  const load = async () => {
    setLoading(true);
    const res = await apiFetch(`${N8N}/get-all-students`);
    if (res.success && res.data) {
      setStudents(Array.isArray(res.data) ? res.data : [res.data]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    const res = await apiPost("delete-student", { id });
    if (res.ok) {
      setMsg("✅ Student deleted successfully");
      setDeleteConfirm(null);
      load();
      setTimeout(() => setMsg(""), 3000);
    } else {
      setMsg("❌ Error deleting student");
    }
  };

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  /* ── EDIT FORM (shown inline) ── */
  if (editStudent) {
    return <EditStudentForm
      student={editStudent}
      onDone={() => { setEditStudent(null); load(); }}
      onCancel={() => setEditStudent(null)}
    />;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:10 }}>
        <h2 style={{ margin:0 }}>👥 All Students {!loading && `(${students.length})`}</h2>
        <div style={{ display:"flex", gap:8 }}>
          <input
            placeholder="🔍 Search name or email..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ padding:"8px 12px", borderRadius:6, border:"1px solid #ccc", width:220, fontSize:13 }}
          />
          <button onClick={load} style={{ ...btnStyle, padding:"8px 16px", fontSize:13 }}>🔄 Refresh</button>
        </div>
      </div>

      {/* Success / error message */}
      {msg && (
        <div style={{ padding:"10px 16px", borderRadius:8, marginBottom:14,
          background: msg.includes("✅") ? "#f0fdf4" : "#fef2f2",
          color: msg.includes("✅") ? "#16a34a" : "#dc2626",
          border: `1px solid ${msg.includes("✅") ? "#bbf7d0" : "#fecaca"}` }}>
          {msg}
        </div>
      )}

      {/* Delete confirmation box */}
      {deleteConfirm && (
        <div style={{ padding:16, borderRadius:8, marginBottom:16,
          background:"#fff7ed", border:"1px solid #fed7aa" }}>
          <p style={{ margin:"0 0 12px", color:"#92400e", fontWeight:600 }}>
            ⚠️ Delete <strong>{deleteConfirm.name}</strong>? This cannot be undone.
          </p>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={() => handleDelete(deleteConfirm.id)} style={btnDanger}>Yes, Delete</button>
            <button onClick={() => setDeleteConfirm(null)} style={btnCancel}>Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div style={{ textAlign:"center", padding:48, color:"#999", fontSize:15 }}>⏳ Loading students...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:"center", padding:48, color:"#999", fontSize:15 }}>No students found.</div>
      ) : (
        <div style={{ overflowX:"auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr style={{ background:"#4f46e5", color:"white" }}>
                {["ID","Name","Email","Phone","Address","DOB","Actions"].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id} style={{ background: i%2===0 ? "#fff" : "#f9f9ff" }}>
                  <td style={tdStyle}>
                    <span style={{ background:"#ede9fe", color:"#4f46e5",
                      padding:"2px 8px", borderRadius:12, fontSize:12, fontWeight:700 }}>
                      #{s.id}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, fontWeight:600 }}>{s.name}</td>
                  <td style={{ ...tdStyle, color:"#555" }}>{s.email}</td>
                  <td style={tdStyle}>{s.phone || "—"}</td>
                  <td style={{ ...tdStyle, maxWidth:160, overflow:"hidden",
                    textOverflow:"ellipsis", whiteSpace:"nowrap" }}
                    title={s.address}>{s.address || "—"}</td>
                  <td style={tdStyle}>{s.dob ? s.dob.split("T")[0] : "—"}</td>
                  <td style={tdStyle}>
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={() => setEditStudent({
                        id: s.id, name: s.name, email: s.email,
                        phone: s.phone || "", address: s.address || "",
                        dob: s.dob ? s.dob.split("T")[0] : ""
                      })} style={btnEdit}>✏️ Edit</button>
                      <button onClick={() => setDeleteConfirm({ id: s.id, name: s.name })}
                        style={btnDanger}>🗑️ Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ───────── EDIT STUDENT FORM ───────── */
function EditStudentForm({ student, onDone, onCancel }) {
  const [form, setForm] = useState({ ...student });
  const [msg, setMsg]   = useState("");
  const [loading, setLoading] = useState(false);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setLoading(true);
    const res = await apiPost("update-student", form);
    if (res.ok) {
      setMsg("Student updated successfully!");
      setTimeout(() => onDone(), 900);
    } else {
      setMsg("Error updating student");
    }
    setLoading(false);
  };

  const fields = [
    { key:"name",    label:"Full Name",     type:"text" },
    { key:"email",   label:"Email",         type:"text" },
    { key:"phone",   label:"Phone",         type:"text" },
    { key:"address", label:"Address",       type:"text" },
    { key:"dob",     label:"Date of Birth", type:"date" },
  ];

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
        <button onClick={onCancel} style={{ ...btnCancel, padding:"6px 12px" }}>← Back</button>
        <h2 style={{ margin:0 }}>✏️ Edit Student — {student.name}</h2>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        {fields.map(f => (
          <div key={f.key} style={{ gridColumn: f.key === "address" ? "span 2" : "span 1" }}>
            <label style={{ display:"block", marginBottom:5, fontSize:13, fontWeight:600, color:"#555" }}>
              {f.label}
            </label>
            <input
              name={f.key} value={form[f.key] || ""} onChange={handle} type={f.type}
              style={{ width:"100%", padding:"9px 12px", borderRadius:7,
                border:"1.5px solid #e5e7eb", boxSizing:"border-box", fontSize:14 }}
            />
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:10, marginTop:20 }}>
        <button onClick={submit} disabled={loading} style={btnStyle}>
          {loading ? "Saving..." : "💾 Save Changes"}
        </button>
        <button onClick={onCancel} style={btnCancel}>Cancel</button>
      </div>

      {msg && (
        <p style={{ marginTop:12, color: msg.includes("✅") ? "green" : "red" }}>{msg}</p>
      )}
    </div>
  );
}

/* ───────── VIEW STUDENT (One-to-One) ───────── */
function ViewStudent() {
  const [studentId, setStudentId] = useState("");
  const [data, setData] = useState(null);
  const [msg, setMsg] = useState("");
  const fetch_ = async () => {
    setMsg("Loading..."); setData(null);
    const res = await apiFetch(`${N8N}/get-student?student_id=${studentId}`);
    if (res.success && res.data) { setData(res.data); setMsg(""); }
    else setMsg("❌ Not found or error");
  };
  return (
    <div>
      <h2>View Student (One-to-One)</h2>
      <p style={{ color:"#666" }}>Fetches student + their profile joined together</p>
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        <input value={studentId} onChange={e=>setStudentId(e.target.value)}
          placeholder="Enter Student ID e.g. 1"
          style={{ flex:1, padding:8, borderRadius:6, border:"1px solid #ccc" }} />
        <button onClick={fetch_} style={btnStyle}>Fetch</button>
      </div>
      {msg && <p>{msg}</p>}
      {data && (
        <table style={tableStyle}>
          <thead>
            <tr style={{ background:"#4f46e5", color:"white" }}>
              {["ID","Name","Email","Phone","Address","DOB"].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyle}>{data.id}</td>
              <td style={tdStyle}>{data.name}</td>
              <td style={tdStyle}>{data.email}</td>
              <td style={tdStyle}>{data.phone}</td>
              <td style={tdStyle}>{data.address}</td>
              <td style={tdStyle}>{data.dob?.split("T")[0]}</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ───────── VIEW TEACHER ───────── */
function ViewTeacher() {
  const [teacherId, setTeacherId] = useState("");
  const [rows, setRows] = useState([]);
  const [teacher, setTeacher] = useState(null);
  const [msg, setMsg] = useState("");
  const fetch_ = async () => {
    setMsg("Loading..."); setRows([]); setTeacher(null);
    const res = await apiFetch(`${N8N}/get-teacher?teacher_id=${teacherId}`);
    if (res.success && res.data) {
      const list = Array.isArray(res.data) ? res.data : [res.data];
      if (!list.length) { setMsg("❌ No records found"); return; }
      setTeacher({ id: list[0].id, name: list[0].name, department: list[0].department });
      setRows(list.filter(r => r.course_id !== null && r.course_id !== undefined));
      setMsg("");
    } else setMsg("❌ Not found or error — check console");
  };
  return (
    <div>
      <h2>View Teacher (One-to-Many)</h2>
      <p style={{ color:"#666" }}>Fetches teacher + all their courses</p>
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        <input value={teacherId} onChange={e=>setTeacherId(e.target.value)}
          placeholder="Enter Teacher ID e.g. 1"
          style={{ flex:1, padding:8, borderRadius:6, border:"1px solid #ccc" }} />
        <button onClick={fetch_} style={btnStyle}>Fetch</button>
      </div>
      {msg && <p>{msg}</p>}
      {teacher && (
        <>
          <div style={{ background:"#f0f0ff", padding:12, borderRadius:8, marginBottom:12 }}>
            <strong>Teacher ID:</strong> {teacher.id} &nbsp;|&nbsp;
            <strong>Name:</strong> {teacher.name} &nbsp;|&nbsp;
            <strong>Department:</strong> {teacher.department}
          </div>
          <h4 style={{ marginBottom:8 }}>Courses ({rows.length})</h4>
          <table style={tableStyle}>
            <thead>
              <tr style={{ background:"#4f46e5", color:"white" }}>
                {["Course ID","Course Name","Credits"].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 ? rows.map((r,i) => (
                <tr key={i} style={{ background: i%2===0 ? "#fff" : "#f9f9f9" }}>
                  <td style={tdStyle}>{r.course_id}</td>
                  <td style={tdStyle}>{r.course_name}</td>
                  <td style={tdStyle}>{r.credits}</td>
                </tr>
              )) : (
                <tr><td colSpan={3} style={{...tdStyle, color:"#999"}}>No courses found</td></tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

/* ───────── VIEW ENROLLMENTS ───────── */
function ViewEnrollments() {
  const [studentId, setStudentId] = useState("");
  const [rows, setRows] = useState([]);
  const [student, setStudent] = useState(null);
  const [msg, setMsg] = useState("");
  const fetch_ = async () => {
    setMsg("Loading..."); setRows([]); setStudent(null);
    const res = await apiFetch(`${N8N}/get-enrollments?student_id=${studentId}`);
    if (res.success && res.data) {
      const list = Array.isArray(res.data) ? res.data : [res.data];
      if (!list.length) { setMsg("❌ No enrollments found"); return; }
      setStudent({ id: list[0].student_id, name: list[0].student_name });
      setRows(list);
      setMsg("");
    } else setMsg("❌ Not found or error — check console");
  };
  return (
    <div>
      <h2>View Enrollments (Many-to-Many)</h2>
      <p style={{ color:"#666" }}>Fetches all courses a student is enrolled in</p>
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        <input value={studentId} onChange={e=>setStudentId(e.target.value)}
          placeholder="Enter Student ID e.g. 1"
          style={{ flex:1, padding:8, borderRadius:6, border:"1px solid #ccc" }} />
        <button onClick={fetch_} style={btnStyle}>Fetch</button>
      </div>
      {msg && <p>{msg}</p>}
      {student && (
        <>
          <div style={{ background:"#f0f0ff", padding:12, borderRadius:8, marginBottom:12 }}>
            <strong>Student:</strong> {student.name} &nbsp;|&nbsp;
            <strong>ID:</strong> {student.id} &nbsp;|&nbsp;
            <strong>Total Enrollments:</strong> {rows.length}
          </div>
          <table style={tableStyle}>
            <thead>
              <tr style={{ background:"#4f46e5", color:"white" }}>
                {["Course ID","Course Name","Credits","Teacher","Enrolled At"].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 ? rows.map((r,i) => (
                <tr key={i} style={{ background: i%2===0 ? "#fff" : "#f9f9f9" }}>
                  <td style={tdStyle}>{r.course_id}</td>
                  <td style={tdStyle}>{r.course_name}</td>
                  <td style={tdStyle}>{r.credits}</td>
                  <td style={tdStyle}>{r.teacher_name}</td>
                  <td style={tdStyle}>{r.enrolled_at?.split("T")[0]}</td>
                </tr>
              )) : (
                <tr><td colSpan={5} style={{...tdStyle, color:"#999"}}>No enrollments found</td></tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

/* ───────── SHARED STYLES ───────── */
const btnStyle = {
  padding:"10px 24px", background:"#4f46e5", color:"white",
  border:"none", borderRadius:6, cursor:"pointer"
};
const btnEdit = {
  padding:"6px 12px", background:"#eff6ff", color:"#2563eb",
  border:"1px solid #bfdbfe", borderRadius:6, cursor:"pointer", fontSize:13, fontWeight:600
};
const btnDanger = {
  padding:"6px 12px", background:"#fef2f2", color:"#dc2626",
  border:"1px solid #fecaca", borderRadius:6, cursor:"pointer", fontSize:13, fontWeight:600
};
const btnCancel = {
  padding:"10px 20px", background:"white", color:"#555",
  border:"2px solid #e5e7eb", borderRadius:6, cursor:"pointer", fontWeight:600
};
const inputStyle = {
  width:"100%", padding:8, borderRadius:6,
  border:"1px solid #ccc", marginBottom:10, boxSizing:"border-box"
};
const tableStyle = { width:"100%", borderCollapse:"collapse", marginTop:8, fontSize:14 };
const thStyle = { padding:"10px 12px", textAlign:"left" };
const tdStyle = { padding:"10px 12px", borderBottom:"1px solid #eee" };

export default App;