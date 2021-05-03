// Sign Up
const isRegisterHTML = window.location.href.includes('register.html');
const isLoginHTML = window.location.href.includes('login.html');
console.log('Register',isRegisterHTML)
console.log('Login',isLoginHTML)

if(isRegisterHTML){
    const registerForm = document.getElementById('registerForm') 
    
    registerForm.addEventListener('submit', (event) => {
        event.preventDefault();

        //Get User Info
        //  const firstName = registerForm['first_name'].value;
        //  const lastName = registerForm['last_name'].value;
        const email = registerForm['email'].value;
        const password = registerForm['password'].value;
        const password2 = registerForm['password2'].value;

        if(password === password2){
            auth.createUserWithEmailAndPassword(email,password)
                .then((credentialUser) =>{
                    console.log(credentialUser)
                    window.location.href = 'index.html'
                })
                .catch(error=>{
                    console.log(error.code, error.message);
                })
        }else{
            registerForm.reset();
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
                window.location.href = 'index.html'
            })
            .catch(error=>{
                console.log(error.code,error.message);
                document.getElementById('password').value = '';
            })
    })
}


