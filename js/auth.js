const isRegisterHTML = location.pathname.includes('register.html');
const isLoginHTML = location.pathname.includes('login.html');

//Listen for auth changes
auth.onAuthStateChanged(user =>{
    if(user){
        if(isLoginHTML){location.href = 'index.html'}
    } else{
        localStorage.removeItem("subjectToOpen")
    }
})



// Sign Up

if(isRegisterHTML){
    const registerForm = document.getElementById('registerForm') 
    
    registerForm.addEventListener('submit', (event) => {
        event.preventDefault();

        //Get User Info
        const firstName = registerForm['first_name'].value;
        const lastName = registerForm['last_name'].value;
        const email = registerForm['email'].value;
        const password = registerForm['password'].value;
        const password2 = registerForm['password2'].value;

        if(password === password2){
            auth.createUserWithEmailAndPassword(email,password)
                .then((credentialUser) =>{
                    return db.collection('users').doc(credentialUser.user.uid).set({
                        phoneNumber: registerForm['phone'].value,
                        role: 'student',
                        address: {
                            country: 'Argentina',
                            city: 'Buenos Aires'
                        }
                    })
                }).then(()=>{
                    auth.currentUser.updateProfile({
                        displayName: `${firstName} ${lastName}`,
                        photoURL: 'https://eshendetesia.com/images/user-profile.png'
                    }).then(()=>{location.href = 'index.html'})
                }).catch(error=>console.log(error.message))
        }else{
            document.getElementById('password').value = '';
            document.getElementById('password2').value = '';
        }
    })
}


//Login
if(isLoginHTML){
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit',(event)=>{
        event.preventDefault()

        //Get User Info
        const email = loginForm['email'].value;
        const password = loginForm['password'].value;

        auth.signInWithEmailAndPassword(email,password)
            .then((credentialUser)=>{
                location.href = 'index.html'
            })
            .catch(error=>{
                console.log(error.code,error.message);
                document.getElementById('password').value = '';
            })
    })
}


