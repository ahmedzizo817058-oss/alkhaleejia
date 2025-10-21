// بسيط: يتحقق من البيانات ويخزن المستخدمين في localStorage بعد تجزئة كلمة المرور (SHA-256)
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const msg = document.getElementById('message');
const loginMsg = document.getElementById('loginMessage');

// تبويب
const tabRegister = document.getElementById('tab-register');
const tabLogin = document.getElementById('tab-login');
function showTab(tab){
    if(tab === 'login'){
        registerForm.style.display = 'none';
        loginForm.style.display = '';
        tabRegister.classList.remove('active');
        tabLogin.classList.add('active');
        msg && (msg.innerHTML = '');
    } else {
        registerForm.style.display = '';
        loginForm.style.display = 'none';
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        loginMsg && (loginMsg.innerHTML = '');
    }
}
tabRegister.addEventListener('click', ()=> showTab('register'));
tabLogin.addEventListener('click', ()=> showTab('login'));
document.getElementById('toRegister').addEventListener('click', ()=> showTab('register'));

function showMessage(container, text, type='success'){
    if(!container) return;
    container.innerHTML = '';
    const div = document.createElement('div');
    div.className = 'msg ' + (type === 'success' ? 'success' : 'error');
    div.textContent = text;
    container.appendChild(div);
}

function validateEmail(email){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function sha256Hex(str){
    const enc = new TextEncoder();
    const buf = await crypto.subtle.digest('SHA-256', enc.encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

function getUsers(){
    try{ return JSON.parse(localStorage.getItem('khaleejia_users')||'[]'); }
    catch(e){ return []; }
}

function saveUser(user){
    const users = getUsers();
    users.push(user);
    localStorage.setItem('khaleejia_users', JSON.stringify(users));
}

// تسجيل
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.innerHTML = '';

    const name = registerForm.name.value.trim();
    const email = registerForm.email.value.trim().toLowerCase();
    const password = registerForm.password.value;
    const confirm = registerForm.confirm.value;

    if(!name) return showMessage(msg, 'ادخل الاسم الكامل.', 'error');
    if(!validateEmail(email)) return showMessage(msg, 'البريد الإلكتروني غير صالح.', 'error');
    if(password.length < 6) return showMessage(msg, 'كلمة المرور قصيرة. استخدم 6 أحرف على الأقل.', 'error');
    if(password !== confirm) return showMessage(msg, 'كلمة المرور وتأكيدها غير متطابقين.', 'error');

    const users = getUsers();
    if(users.some(u => u.email === email)) return showMessage(msg, 'هذا البريد مسجل مسبقاً.', 'error');

    const hashed = await sha256Hex(password);
    saveUser({ name, email, passwordHash: hashed, createdAt: new Date().toISOString() });

    registerForm.reset();
    showMessage(msg, 'تم التسجيل بنجاح ✔️', 'success');
    setTimeout(()=> showTab('login'), 900);
});

// دخول
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginMsg.innerHTML = '';

    const email = loginForm.loginEmail.value.trim().toLowerCase();
    const password = loginForm.loginPassword.value;

    if(!validateEmail(email)) return showMessage(loginMsg, 'ادخل بريد إلكتروني صالح.', 'error');
    if(!password) return showMessage(loginMsg, 'ادخل كلمة المرور.', 'error');

    const users = getUsers();
    const user = users.find(u => u.email === email);
    if(!user) return showMessage(loginMsg, 'لا يوجد حساب مرتبط بهذا البريد.', 'error');

    const hashed = await sha256Hex(password);
    if(hashed !== user.passwordHash) return showMessage(loginMsg, 'كلمة المرور غير صحيحة.', 'error');

    loginForm.reset();
    showMessage(loginMsg, 'تم الدخول بنجاح، مرحباً ' + (user.name || '') , 'success');
});

// عرض المستخدمين (اختباري)
document.getElementById('showUsers').addEventListener('click', () => {
    const users = getUsers();
    if(!users.length) return showMessage(msg, 'لا يوجد مستخدمون مسجلون.', 'error');
    showMessage(msg, 'المستخدمون المسجلون (تجريبي):\n' + users.map(u => `${u.name} — ${u.email}`).join('\n'), 'success');
});

// زر نسيت كلمة المرور (تجريبي)
document.getElementById('forgotBtn').addEventListener('click', () => {
    alert('في نسخة الإنتاج: أرسل رابط إعادة تعيين إلى البريد الإلكتروني. هذا مثال تجريبي محلي.');
});

// أزرار جانبية (تجريبي)
document.getElementById('contactBtn').addEventListener('click', ()=> alert('اتصل بنا: info@khaleejia.example (تجريبي)'));
document.getElementById('catalogBtn').addEventListener('click', ()=> alert('فتح الكتالوج (تجريبي)'));

// بدءاً افتراضياً على تسجيل
showTab('register');
