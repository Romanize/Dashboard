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
        return `${this.address.street} ${this.address.number}, ${this.address.city} ${this.address.zipCode || ''}. ${this.address.state}, ${this.address.country}`
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

$('#updatePassword').on('click',async ()=>{
    
    let oldPassword = changePassword['oldPassword'].value;
    let newPassword = changePassword['newPassword'].value;
    let confirmPassword = changePassword['confirmPassword'].value;

    if(newPassword !== confirmPassword ){
        changePassword['newPassword'].value = '';
        changePassword['confirmPassword'].value = ''

        return console.error('Your passwords are not the same')
    }
    if( newPassword.length < 6){
        changePassword['newPassword'].value = '';
        changePassword['confirmPassword'].value = ''

        return console.error('Your passwords must be 6 characters or more')
    }

    let credentials = firebase.auth.EmailAuthProvider.credential(
        auth.currentUser.email,
        oldPassword
    )

    auth.currentUser.reauthenticateWithCredential(credentials)
    .then(auth.currentUser.updatePassword(newPassword))
    .then(console.log)
    .catch(console.error)

})

$('#mercadoPago').on('click',async ()=>{
    const response = await fetch(
        'https://api.mercadopago.com/checkout/preferences',
        {
            method: 'POST',
            headers: {
                Authorization: 'Bearer TEST-5843360768586125-051800-5db87f1c05f4099988de1ab1421ae403-313511774',
            },
            body: JSON.stringify({
                items: [{
                    "id": "Didactic Zone",
                    "title": "Mensualidad",
                    "description": `${userData.displayName+" "+auth.currentUser.uid}, Mensualidad`,
                    "category_id": "Education",
                    "quantity": 1,
                    "currency_id" : "ARS",
                    "unit_price": 6000
                }]
            })
        }
    );
    // console.log(response)
    const dataJson = await response.json();
    window.open(dataJson.init_point,"blank")
    console.log(dataJson)
})

// curl -X POST \
//     'https://api.mercadopago.com/v1/payments' \
//     -H  \ 
//     -d '{
//   "additional_info": {

//     "payer": {
//       "first_name": "Test",
//       "last_name": "Test",
//       "phone": {
//         "area_code": 11,
//         "number": "987654321"
//       },
//       "address": {}
//     },
//     "shipments": {
//       "receiver_address": {
//         "zip_code": "12312-123",
//         "state_name": "Rio de Janeiro",
//         "city_name": "Buzios",
//         "street_name": "Av das Nacoes Unidas",
//         "street_number": 3003
//       }
//     },
//     "barcode": {}
//   },
//   "description": "Payment for product",
//   "external_reference": "MP0001",
//   "installments": 1,
//   "metadata": {},
//   "order": {
//     "type": "mercadolibre"
//   },
//   "payer": {
//     "entity_type": "individual",
//     "type": "customer",
//     "identification": {},
//     "phone": {}
//   },
//   "payment_method_id": "visa",
//   "transaction_amount": 58.8
// }'


//Social media??