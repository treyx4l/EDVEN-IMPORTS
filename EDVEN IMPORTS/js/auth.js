const auth = firebase.auth()


function login() {
auth.signInWithEmailAndPassword(email.value, password.value)
.then(() => window.location.href = 'dashboard.html')
.catch(err => alert(err.message))
}


function logout() {
auth.signOut().then(() => window.location.href = 'admin-login.html')
}


auth.onAuthStateChanged(user => {
if (!user && location.pathname.includes('dashboard')) {
window.location.href = 'admin-login.html'
}
})