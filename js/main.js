//Read LocalStorage and initial values
const localSubjectList = JSON.parse(localStorage.getItem("subjectsListStorage"));
let myUserID;
let chats;
let network = []

//Define loading page
const isIndexHTML = (
    location.pathname === "/" || 
    location.pathname.includes('index.html') || 
    location.pathname === "/Dashboard/")
const isSubjectHTML = (location.pathname.includes('/subject.html'))
const isProfileHTML = (location.pathname.includes('/profile.html'))

//Calendar app variable
let appSchedule;

//Listen for auth changes
function initApp (){
    auth.onAuthStateChanged(async user =>{
        if(user){
            myUserID = auth.currentUser.uid;
            messagesNotifications()
            await getSubjectsFromFirebase();
            setUserUI(user);
            await getNetwork();
            getMessagesFromFirebase();
            if(isProfileHTML) userDataRender(myUserID)
            if(isSubjectHTML) setSubjectData(subjectId)
            if(isDarkModeOn) darkModeToggle()
        } else{
            localStorage.clear()
            sessionStorage.clear()
            window.location.href = 'auth-login.html'
        }
    })
}

initApp()

/** Get users Database -- TODO Not secure without backend */
async function getNetwork(){
    db.collection('users').onSnapshot((snapshot) =>{
        snapshot.docs.forEach(doc => {
            network.push(doc)
        })
    })
}

/**
 * Get some info from user to show in DOM
 * @param {object} user object containing info of logged user
 */
const setUserUI = (user) =>{

    //Set User Info on top right
    $('#user-dropdown').append(`
        <img src="${user.photoURL}" alt="User Picture" width="35px" height="35px">
        <span class="d-none d-md-inline fw-bold">${user.displayName}</span>
    `)

    //LOGOUT
    $('#logout').on('click',event=>{
        event.preventDefault();
        auth.signOut()
        .then(()=>{
            window.location.href = 'auth-login.html'
        })
        .catch(error=>alert(error.message))
    })

    //Search Events
    $('.userSearch').on('blur', e=>{
        setTimeout(()=>{
            $('.userSearch').val('')
            $('.userSearchResult').removeClass('d-block')
        },100)
    })

    $('.userSearch').on('keyup',e=>{
        let searchString = e.target.value;
        
        let search = network.filter(doc => {
            return doc.data().displayName.toLowerCase()
                .includes(searchString.toLowerCase())
        })

        let searchResult = '';
        search.forEach(user => {
            if(user.id !== myUserID){
                searchResult += `
                <a class="d-flex align-items-center searchLink" data-id="${user.id}">
                    <img src="${user.data().photoURL}" class="ms-3 me-2" alt="User Picture" width="35px" height="35px">
                    <span class="fw-bold me-3">${user.data().displayName}</span>
                </a>
                `
            }
        })

        let target = $(e.target)[0]
        let navSearch = $('#userSearchNav')[0]
        let minNavSearch = $('#userSearchMin')[0]
        let messageAppSearch = $('#userSearchApp')[0]
        switch(target){
            case navSearch:
                $('#userSearchNavResult').addClass('d-block')
                break;
            case minNavSearch:
                $('#userSearchMinResult').addClass('d-block')
                break;
            case messageAppSearch:
                $('#userSearchAppResult').addClass('d-block')
                break;
        }

        $('.userSearchResult').html(searchResult)

        $('.searchLink').on('click', function (e){
            $('#messagesModal').modal('show')
            $('.userSearchResult').removeClass('d-block')

            let userID = e.currentTarget.dataset.id;
            let chat = chats.filter(chat => chat.data().members.includes(userID))[0]
            
            if(chat){
                chatBoxRender(chat)
            } else{
                db.collection("chats").add({
                    members: [myUserID,userID],
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    messages: [{
                        user: myUserID,
                        message: 'NEW CHAT',
                        timestamp: firebase.firestore.Timestamp.now()
                    }]
                })
                .then(() => {

                    $('#chatBox').html(`
                    <div id="loader" class="bg-light d-flex justify-content-center align-items-center">
                        <div class="spinner-grow text-primary" role="status">
                        </div>
                        <div class="spinner-grow text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <div class="spinner-grow text-primary" role="status">
                        </div>
                    </div>`)

                    setTimeout(()=>{
                        let chat = chats.filter(chat => chat.data().members.includes(userID))[0]
                        chatBoxRender(chat)
                    },500)
                })
                .catch((error) => {
                    alert(error.message);
                });
            }
        })
    })

    //Calendar Modal Fix
    $("#scheduleModal").on('shown.bs.modal', ()=>appSchedule.updateSize())

    //Apps
    $('#sidebarApps a').on('click',event=>{
        event.preventDefault()
    })

    appScheduleRender();

}


/**
 * COURSES CONSTRUCTOR FUNCTION ES6
 */
 class Subject {
    constructor (level, code, branch, status, weekDay, timeStart, timeEnd, dayStart, dayEnd, members) {
        this.code = code;
        this.level = level;
        this.branch = branch;
        this.status = status;
        this.schedule = {
            weekDay : weekDay,
            timeStart : timeStart,
            timeEnd : timeEnd,
            dayStart : dayStart,
            dayEnd : dayEnd,
        },
        this.members = members
    }
    /**
     * split dates with dd/mm/yyyy format.
     * @returns long month string and year in spanish
     */
    dayStartSplitter () {
        const dateParts = this.schedule.dayStart.split("/");
        let returnDate = new Date(+dateParts[2],dateParts[1]-1,+dateParts[0]);
        const options = {month:'long',year:'numeric'};
    
        let returnMonth = returnDate.toLocaleDateString('es-AR', options);
            
        return returnMonth;
    };

    dayEndSplitter () {
        const dateParts = this.schedule.dayEnd.split("/");
        let returnDate = new Date(+dateParts[2],dateParts[1]-1,+dateParts[0]);
        const options = {month:'long',year:'numeric'};
    
        let returnMonth = returnDate.toLocaleDateString('es-AR', options);
            
        return returnMonth;
    };

    /**
     * description builder
     * @returns right description per course
     */
    get description() {
        if(this.branch == 'PNL'){
            switch(this.level){
                case 'PRACTITIONER':
                    return "1er nivel de la carrera de PNL, donde conocerás que es el PNL y sus aplicaciones. Garantizamos un espacio de transformación personal donde aprenderás a registrar tus cinco sentidos y te conocerás como nunca antes.";
                case 'MASTER' :
                    return "2do nivel de la carrera de PNL, donde aprenderas a modelar comportamientos por excelencia de otros usuarios, mediante la evaluación de sus comportamientos y modalidades."
                case 'TRAINER' :
                    return "3er nivel de la carrera de PNL, donde te formarás como instructor especialista en técnicas de programación Neurolinguistica, con técnicas para acompasar y lideras nunca vistas en otros niveles."
                default:
                    return "ERROR EN LOS DATOS"
            }
        } else {
            return "Falta agregar rama Coaching"
        }
    }

    get statusColor() {
        switch(this.status){
            case "CURSANDO":
                return 'success'
            case "TERMINADO":
                return 'dark'
            case 'PROXIMAMENTE':
                return 'warning'
            default:
                return 'primary'
        }
    }

    getDate(date){
        const splitDate = date.split("/");
        let formattedDate = new Date(+splitDate[2],splitDate[1]-1,+splitDate[0]);
        return formattedDate
    }

    get getEventWeekDay(){
        const dayNumber = {
            Domingo: 0,
            Lunes: 1,
            Martes: 2,
            Miercoles: 3,
            Jueves: 4,
            Viernes: 5,
            Sabado: 6
        }

        return dayNumber[this.schedule.weekDay]
    }
}

// Firestore data converter
const subjectConverter = {
    toFirestore: function(subject) {
        return {
            code: subject.code,
            level: subject.level,
            branch: subject.branch,
            status: subject.status,
            schedule: {
                weekDay: subject.schedule.weekDay,
                timeStart: subject.schedule.timeStart,
                timeEnd: subject.schedule.timeEnd,
                dayStart: subject.schedule.dayStart,
                dayEnd: subject.schedule.dayEnd
            }
        }
    },
    fromFirestore: function(snapshot, options){
        const data = snapshot.data(options);
        return new Subject(data.level, data.code, data.branch, data.status, data.schedule.weekDay, data.schedule.timeStart, data.schedule.timeEnd, data.schedule.dayStart, data.schedule.dayEnd, data.members);
    }
}

let subjectsList = [];

const getSubjectsFromFirebase = async () => {
    if (!localSubjectList){
        await db.collection("subjects")
        .withConverter(subjectConverter)
        .where('members','array-contains',myUserID)
        .get().then(snapshot => {
            snapshot.docs.forEach((doc) => {
            if (doc.exists) {
                subjectsList.push(doc.data());
            } else {
                alert("The document doesn't exist");
            }
            });
            subjectsList.sort((a,b)=>{ //ordenar por status
                if(a.status < b.status){
                    return -1
                } else if(a.status > b.status){
                    return 1
                }else{
                    return 0
                }
            });
            if(isIndexHTML){subjectsCardsRender()}
            asideCardsRender()
            localStorage.setItem("subjectsListStorage",JSON.stringify(subjectsList));
        })
    } else {
        localSubjectList.forEach((subject) => {
            let classedSubject = Object.assign(new Subject(),subject);
            subjectsList.push(classedSubject);
        });
        if(isIndexHTML){subjectsCardsRender()}
        asideCardsRender()
    }
}


/**
 * Shows aside Subjects on any page
 */
const asideCardsRender = () => {

    let asideRender = '';

    subjectsList.forEach(subject =>{
        asideRender = asideRender + `
        <li class="accordion-item sidebar-item">
            <div class="accordion-header">
                <button id="flush-button-${subject.code}" class="accordion-button collapsed" type="button" data-id="${subject.code}">
                    <span>${subject.level +" "+subject.code}</span>
                </button>
            </div>
            <div id="flush-collapse-${subject.code}" data-id="${subject.code}" class="accordion-collapse collapse">
                <a href="subject.html">
                    <i class="fas fa-clipboard-list"></i>
                    <span>TEMARIO</span>
                </a>
            </div>
        </li>
        `;
    })

    // TODO - Possible fields to load on sidebar
        // <a href="subject.html">
        //     <i class="fas fa-user-friends"></i>
        //     <span>ALUMNOS</span>
        // </a>
        // <a href="subject.html">
        //     <i class="fas fa-clipboard-list"></i>
        //     <span>TEMARIO</span>
        // </a>
        // <a href="subject.html">
        //     <i class="fas fa-book-open"></i>
        //     <span>MATERIALES</span>
        // </a>

    $("#subject-aside").html(asideRender);

    $('#subject-aside a').on('click',event => {
        event.preventDefault();
        let subjectId = event.currentTarget.parentElement.dataset.id;
        localStorage.setItem('subjectToOpen',subjectId)

        window.location.href = 'subject.html'
    })

    $('#subject-aside button').each(function (){
        $(this).on('click',function(){
            let notCollapsedButton = $('#subject-aside button').not('.collapsed')
            if(this!==notCollapsedButton[0]){
                notCollapsedButton.addClass('collapsed')
                .parent().next().slideToggle(200)
            }
            $(this).parent().next().slideToggle(200)
            $(this).toggleClass('collapsed')
        })
    })
}

//Get current date and time
const currentDate = new Date(Date.now());
let language = navigator.language;

const formattedTime = 
(currentDate.getHours() > 9 ? currentDate.getHours() : '0'+currentDate.getHours())+":"
+(currentDate.getMinutes() > 9 ? currentDate.getMinutes() : '0'+currentDate.getMinutes())+":"
+(currentDate.getSeconds() > 9 ? currentDate.getSeconds() : '0'+currentDate.getSeconds());

/**
 * Show Calendar on modal
 */
const appScheduleRender = () => {
    let scheduleEl = document.getElementById('scheduleModalRender')
    appSchedule = new FullCalendar.Calendar(scheduleEl, {
        initialView: 'dayGridMonth',
        themeSystem: 'bootstrap',
        navLinks: true,
        locale: language,
        allDaySlot: false,
        contentHeight: "100%",
        headerToolbar: {
            left: 'prev',
            center: 'title',
            right: 'next',
        },
        footerToolbar: {
            left: 'dayGridMonth,timeGridWeek',
            right: 'listWeek'
        },
        scrollTime: formattedTime,
        selectable:true,
        nowIndicator:true,
        events: getCalendarEvents()
    });
    appSchedule.render();
    if(isIndexHTML) indexCalendarRender()
}

/**
 * Get Messages collection from database
 */
 const getMessagesFromFirebase = async () => {

    //Set Messages Snapshot Listener
    await db.collection('chats')
        .where('members','array-contains',myUserID)
        .onSnapshot(querySnapshot =>{
        
        if(!querySnapshot.metadata.hasPendingWrites){
            chats = []
            querySnapshot.forEach(doc =>{
                chats.push(doc)
            })
            
            chats = chats
                .sort((a,b)=>a.data().updatedAt.seconds-b.data().updatedAt.seconds)
                .reverse()
            
            messagesPreviewRender()

            if(chats.length>0){
                let docChangedID= querySnapshot.docChanges()[0].doc.id           
                chatMessagesRender(docChangedID)
                querySnapshot.docChanges().forEach(change => {

                    if (change.type === "modified"){
                        let lastMessageIndex = change.doc.data().messages.length-1
                        let recentMessage = change.doc.data().messages[lastMessageIndex]
                        if(recentMessage.user !== myUserID){
                            let userTexting = findUserData(recentMessage.user).data().displayName;
                            let notification = new Notification(userTexting,{
                                body: recentMessage.message,
                                icon: findUserData(recentMessage.user).data().photoURL
                            })
                            setTimeout(()=>{
                                notification.close()
                            },3000)
                        }
                    }
                })
            }
        }
    })
}

/**
 * Render chats on navbar and inside app.
 * @param {Array} chats 
 */
 const messagesPreviewRender = () =>{

    let recentChats = ''
    let navChats = `
        <h6 class="dropdown-header nav-dropdown-header">
            Messages Center
        </h6>`

    chats.forEach(chat =>{
        const lastMessageIndex = chat.data().messages.length-1

        const mostRecent = chat.data().messages[lastMessageIndex]

        //Find the other user id, in chat members
        var otherUserID = chat.data().members[0] == myUserID ? 
                            chat.data().members[1] 
                                : 
                            chat.data().members[0]

        recentChats += `
        <a class="d-flex align-items-center messageLink" href="#" data-id="${chat.id}">
            <img class="rounded-circle me-2"
                src="${findUserData(otherUserID).data().photoURL}" alt="User Picture"
                width="35px" height="35px">
            <div class="messagePreview flex-grow-1">
                <span class="fw-bold" >${findUserData(otherUserID).data().displayName}</span>
                <div class="text-truncate">${mostRecent.message}</div>
            </div>
        </a>`
    })
        
    for(i=0;i<chats.length && i<3;i++){

        const chat = chats[i]
        const lastMessageIndex = chat.data().messages.length-1

        //Find the other user id, in chat members
        const otherUserID = chat.data().members[0] == myUserID ? 
                                chat.data().members[1] 
                                    : 
                                chat.data().members[0]

        let mostRecent = chat.data().messages[lastMessageIndex]

        //Get hours since last Message
        let timeSinceLastMessage = (new Date()-mostRecent.timestamp.toDate())/(1000*60)
        
        timeSinceLastMessage = Math.floor(timeSinceLastMessage)+'m'
        
        if (timeSinceLastMessage >= 60){
            timeSinceLastMessage = Math.floor(timeSinceLastMessage / 60)+'h'
        } 
        if (timeSinceLastMessage >= 24){
            timeSinceLastMessage = Math.floor(timeSinceLastMessage / 24)+"d"
        }

        navChats += `                                            
        <a class="dropdown-item d-flex align-items-center nav-dropdown-item messageLink" a href="#messagesModal" data-bs-toggle="modal" data-id="${chat.id}">
            <div class=" nav-dropdown-user">
                <img class="rounded-circle"
                    src="${findUserData(otherUserID).data().photoURL}" alt="User Picture"
                    width="35px" height="35px">
                <span class="nav-dropdown-status"></span>
            </div>
            <div class="nav-dropdown-message">
                <div class="text-truncate fw-bold">${mostRecent.message}</div>
                <div class="small">${findUserData(otherUserID).data().displayName} - ${timeSinceLastMessage}</div>
            </div>
        </a>`
    }

    navChats += `<a class="dropdown-item text-center small" href="#">Read more Messages</a>`
    
    $('#recentMessages').html(recentChats)
    $('#navMessages').html(navChats)

    $('.messageLink').on('click', function (e){
        e.preventDefault()

        let chatID = e.currentTarget.dataset.id;
        let index = chats.map(chat => chat.id).indexOf(chatID)

        chatBoxRender(chats[index])

        if($('#chatContent')[0] != undefined){
            $('#chatContent').scrollTop($('#chatContent')[0].scrollHeight)
        }
    })
}

const chatBoxRender = (chat) => {

    let selectedChat = chat.data();

    let otherUserID = selectedChat.members[0]==myUserID ? 
                        selectedChat.members[1] 
                            : 
                        selectedChat.members[0]

    let renderFullChat = 
    `<div class="d-flex chatBoxHeader align-items-center p-1">
    <img class="rounded-circle me-2" 
        src="${findUserData(otherUserID).data().photoURL}" alt="User Picture"
        width="35px" height="35px">
    <div>
        <div class="fw-bold">${findUserData(otherUserID).data().displayName}</div>
        <small>Last time, online, etc</small>
    </div>
    </div>
    <div class="flex-grow-1 d-flex flex-column p-2" id="chatContent">
        
    </div>
    <div class="chatBoxFooter">
    <form id="sendMessage" class="input-group" data-id="${chat.id}">
        <input class="form-control" type="text" name="textMessage">
        <button class="btn btn-primary" type="submit">
            <i class="fas fa-paper-plane"></i>
        </button>
    </form>
    </div>`

    $('#chatBox').html(renderFullChat)

    chatMessagesRender(chat.id)

    $('#sendMessage').on('submit',event =>{
        event.preventDefault();
        let message = sendMessage['textMessage'].value;
        
        if(message.length > 0) {
            let docID = sendMessage.dataset.id;

            let newMessage = {
                user: myUserID,
                message: message,
                timestamp: firebase.firestore.Timestamp.now()
            }

            let chatDoc = db.collection('chats').doc(docID)

            chatDoc.update({
                messages: firebase.firestore.FieldValue.arrayUnion(newMessage),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            })
            .then(sendMessage['textMessage'].value = '')
            .catch(error => alert('Su mensaje no puedo ser enviado:',error.message))

        }

    })
}

/**
 * Check the chat we want to render, and render all messages.
 * @param {Array} chats Array of this user current chats (Array of objects)
 * @param {String} chatID Chat ID we want to render
 */
const chatMessagesRender = (chatID) =>{
    let renderMessages = '';
    let index = chats.map(chat => chat.id).indexOf(chatID)

    let selectedChat = chats[index].data();

    selectedChat.messages.forEach(message=>{
        renderMessages += `<span class="${myUserID == message.user ? "send" : "receive"}"
        data-bs-toggle="tooltip" title="${message.timestamp.toDate().toLocaleString()}"
        >${message.message}</span>`
    })

    $('#chatContent').html(renderMessages)

    setTimeout(()=>{
        if($('#chatContent')[0] != undefined){
            $('#chatContent').scrollTop($('#chatContent')[0].scrollHeight)
        }
    },50)
}

let darkModeToggle = () =>{
    $('body').toggleClass('dark')
    $('.bg-light').toggleClass('bg-dark')
    $('.navbar-light').toggleClass('navbar-dark')
    $('.subject-card').toggleClass('bg-dark')
    $('.modal-body').toggleClass('darkey')
    $('.dropdown-menu').toggleClass('darkey')
    $('.profile-card').toggleClass('bg-dark')
    $('.fa-envelope-open-text').toggleClass('text-muted')
}

$('#darkMode').on('click', function(){

    //Set user preference on storage
    if(!isDarkModeOn){
        isDarkModeOn = true;
        localStorage.setItem('isDarkModeON',true)
    } else {
        isDarkModeOn = false;
        localStorage.setItem('isDarkModeON',false)
    }

    darkModeToggle()
})

function getCalendarEvents(){
    let events = []

    subjectsList.forEach(subject =>{

        let subjectEvent = {        
            title:  `${subject.level} ${subject.code}`,
            startTime:  `${subject.schedule.timeStart}`,
            endTime: `${subject.schedule.timeEnd}`,
            allDay: false,
            url: 'http://zoom.us',
            daysOfWeek: [ `${subject.getEventWeekDay}` ],
            startRecur: subject.getDate(subject.schedule.dayStart),
            endRecur: subject.getDate(subject.schedule.dayEnd),
        }

        events.push(subjectEvent)
    })

    return events
}

function findUserData (uid){
    return network.find(user => user.id == uid)
}


function messagesNotifications(){
    let notification;
    let localNotification = localStorage.getItem("notification")
    if (!("Notification" in window)){

        if(localNotification !== "unavailable"){
            alert("This browser does not support desktop notification");
            localStorage.setItem("notification","unavailable")
        }
        
    } else if (Notification.permission === "default") {

        Notification.requestPermission(function (permission) {

            if (permission === "granted") {
                notification = new Notification(`Hi there ${auth.currentUser.displayName}! Thank you for activating notifications!`);
            }

        })
    }
}