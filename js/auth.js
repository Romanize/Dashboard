const isRegisterHTML = location.pathname.includes('register.html');
const isLoginHTML = location.pathname.includes('login.html');
const isForgotHTML = location.pathname.includes('forgot-password.html');

const capitalize = (string) => {
    if (typeof string !== 'string') return ''
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

//Listen for auth changes
auth.onAuthStateChanged(user =>{
    if(user){
        if(isLoginHTML || isForgotHTML){location.href = 'index.html'}
    } else{
        localStorage.removeItem("subjectsListStorage")
        localStorage.removeItem("subjectToOpen")
    }
})


// Sign Up

if(isRegisterHTML){
    $('#registerForm').on('submit',event => {
        event.preventDefault()
  
        registerForm.classList.add('was-validated')

        //Get User Info
        const firstName = capitalize(registerForm['first_name'].value);
        const lastName = capitalize(registerForm['last_name'].value);
        const email = registerForm['email'].value;
        const password = registerForm['password'].value;
        const password2 = registerForm['password2'].value;
        const isAgreeChecked = registerForm['agree'].checked;

        if(!isAgreeChecked){
            let termsError = new Error('No aceptó terminos y condiciones')
            return console.error(termsError)
        }

        if(password === password2){
            auth.createUserWithEmailAndPassword(email,password)
                .then((credentialUser) =>{
                    return db.collection('users').doc(credentialUser.user.uid).set({ //Fill data in register-form
                        firstName: firstName,
                        lastName: lastName,
                        email: registerForm['email'].value,
                        phoneNumber: registerForm['phone'].value,
                        address: {
                            country: registerForm['country'].value,
                            state: registerForm['state'].value,
                            city: capitalize(registerForm['city'].value), //check if capitalize is needed after API
                            street: capitalize(registerForm['street'].value),
                            number: registerForm['number'].value,
                            zipCode: registerForm['zipCode'].value
                        },
                        displayName: `${firstName} ${lastName}`,
                        photoURL: 'https://eshendetesia.com/images/user-profile.png'
                    })
                }).then(()=>{
                    auth.currentUser.updateProfile({
                        displayName: `${firstName} ${lastName}`,
                        photoURL: 'https://eshendetesia.com/images/user-profile.png'
                    }).then(()=>{location.href = 'index.html'})
                }).catch(error=>alert(error.message))
        }else{
            $('#password').val('');
            $('#password2').val('');
        }
    })
}


//Login
if(isLoginHTML){
    $('#loginForm').on('submit',event=>{
        event.preventDefault()

        loginForm.classList.add('was-validated')

        //Get User Info
        const email = loginForm['email'].value;
        const password = loginForm['password'].value;
        const remember = loginForm['remember'].checked;

        firebase.auth().setPersistence(
            remember ? 
                firebase.auth.Auth.Persistence.LOCAL 
            : 
                firebase.auth.Auth.Persistence.SESSION
            )
        .then(() => {
                firebase.auth().signInWithEmailAndPassword(email, password)
                .then(()=>{
                    location.href = 'index.html'
                }).catch(error=>{
                    alert(error.message);
                    $('#password').val('');
                })
            })
        .catch(error=>{
            alert(error.message);
            $('#password').val('');
        })
    })
}

if(isForgotHTML){
    $('#forgotForm').on('submit',event=>{
        event.preventDefault()

        forgotForm.classList.add('was-validated')

        //Get User Info
        const email = forgotForm['email'].value;

        auth.sendPasswordResetEmail(email).then(() =>{
            alert(`Se ha enviado un email a ${email}`)
            $('#email').val('')
          }).catch(error =>{
            alert(error.message)
          });
    })
}

//TODO Terms and Coditions Modal