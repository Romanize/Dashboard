class User {
    constructor(object){
        this.firstName = object.firstName,
        this.lastName = object.lastName,
        this.displayName = object.displayName,
        this.email = object.email,
        this.phoneNumber = object.phoneNumber,
        this.photoURL = object.photoURL,
        this.occupation = object.occupation,
        this.bio = object.bio,
        this.address = {
            street: object.address.street,
            number: object.address.number,
            zipCode: object.address.zipCode,
            city: object.address.city,
            country: object.address.country,
            state: object.address.state
        }
    }

    get getGoogleMapsLink() {
        return `https://www.google.com/maps?q=${this.address.street} ${this.address.number}, ${this.address.city} ${this.address.country}&output=embed`
    }

    get getFullAddress() {
        return `${this.address.street} ${this.address.number}, ${this.address.city} ${this.address.zipCode || ''}. ${this.address.country}`
    }
}

let formData = document.getElementById('formData');
let userData = JSON.parse(sessionStorage.getItem('userData')) || null

/**
 * Looks for User data and set their values on DOM fields
 * @param {User ID from firebase Auth} uid 
 */
const userDataRender = async (uid) => {
    
    if(!userData){
        let doc = await db.collection('users').doc(uid).get();
        sessionStorage.setItem('userData', JSON.stringify(doc.data()))

        userData = new User(doc.data())
    } else {
        userData = new User(userData)
    }

    //Form, editable values
    for(let field of formData) {
        field.value = userData[field.name] || userData.address[field.name] || '';
    }

    //Fixed values
    $('#userPhoto').attr('src',userData.photoURL)
    $('#userDisplayName').text(userData.displayName)
    $('#userOccupation').text(userData.occupation)
    $('#userEmail').text(userData.email)
    $('#userPhoneNumber').text(userData.phoneNumber)
    $('#userAddress').text(userData.getFullAddress)

    $('#userMapView').attr('src', userData.getGoogleMapsLink)

    $('#loader').remove()
}

$('#updateButton').on('click',async ()=>{

    let newUserObject = {
        firstName : formData['firstName'].value,
        lastName : formData['lastName'].value,
        displayName : `${formData['firstName'].value} ${formData['lastName'].value}`,
        phoneNumber : formData['phoneNumber'].value,
        occupation : formData['occupation'].value,
        bio : formData['bio'].value,
        address : {
            country : formData['country'].value,
            state : formData['state'].value,
            city : formData['city'].value,
            street : formData['street'].value,
            number : formData['number'].value,
            zipCode : formData['zipCode'].value
        }
    }
    let user = auth.currentUser;

    await db.collection('users').doc(user.uid).update(newUserObject).then(()=>{
        alert('Updated')
    })

    sessionStorage.removeItem('userData')
    
    auth.currentUser.updateProfile({
        displayName: newUserObject.displayName,
    }).then(()=>location.reload())
})

//TODO -- Address update fields, password change. (email via support??)