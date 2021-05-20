//Read LocalStorage
const localSubjectList = JSON.parse(localStorage.getItem("subjectsListStorage"));

//Define loading page
const isIndexHTML = (
    location.pathname === "/" || 
    location.pathname.includes('index.html') || 
    location.pathname === "/Dashboard/")
const isSubjectHTML = (location.pathname.includes('/subject.html'))
const isProfileHTML = (location.pathname.includes('/profile.html'))

//Calendar app variable
let appSchedule;
let currentUser;

//Listen for auth changes
function initApp (){
    auth.onAuthStateChanged(async user =>{
        if(user){
            await getSubjectsFromFirebase();
            setUserUI(user);
            if(isProfileHTML){userDataRender(user.uid)}
            if(isSubjectHTML){setSubjectData(subjectId)}
        } else{
            localStorage.clear()
            sessionStorage.clear()
            window.location.href = 'auth-login.html'
        }
    })
}

initApp()

/**
 * Get some info from user to show in DOM
 * @param {object} user object containing info of logged user
 */
const setUserUI = (user) =>{
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
        .catch(error=>console.log(error.code,error.message))
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
    constructor (level, code, branch, status, weekDay, timeStart, timeEnd, dayStart, dayEnd) {
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
        }//,
        // this.teachers = teachers,
        // this.students = students,
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
        return new Subject(data.level, data.code, data.branch, data.status, data.schedule.weekDay, data.schedule.timeStart, data.schedule.timeEnd, data.schedule.dayStart, data.schedule.dayEnd);
    }
}

let subjectsList = [];

const getSubjectsFromFirebase = async () => {
    if (!localSubjectList){
        await db.collection("subjects") //TODO Cambiar coleccion y condicion, querys y lecturas
        .withConverter(subjectConverter)
        .get().then((snapshot) => {
            snapshot.docs.forEach((doc) => {
            if (doc.exists) {
                subjectsList.push(doc.data());
            } else {
                console.log("No existe el documento");
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
        .catch((error) => {
            console.log("Error al conseguir el documento:", error.message);
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
                <button id="flush-button-${subject.code}" class="accordion-button collapsed" type="button" >
                ${subject.level +" "+subject.code}
                </button>
            </div>
            <div id="flush-collapse-${subject.code}" data-id="${subject.code}" class="accordion-collapse collapse">
                <a href="subject.html">
                    <i class="fas fa-user-friends"></i>
                    <span>ALUMNOS</span>
                </a>
                <a href="subject.html">
                    <i class="fas fa-clipboard-list"></i>
                    <span>TEMARIO</span>
                </a>
                <a href="subject.html">
                    <i class="fas fa-book-open"></i>
                    <span>MATERIALES</span>
                </a>
            </div>
        </li>
        `;
    })

    $("#subject-aside").html(asideRender);

    $('#subject-aside a').on('click',event => {
        event.preventDefault();
        let subjectId = event.currentTarget.parentElement.dataset.id;
        localStorage.setItem('subjectToOpen',subjectId)

        window.location.href = 'subject.html'
    })

    $('#subject-aside button').each(function (){
        $(this).on('click',function(){
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
        events: [
            {
                title:  'My Event',
                startTime:  '14:30:00',
                endTime: '18:30:00',
                allDay: false,
                url: 'http://zoom.us',
                daysOfWeek: [ '3' ],
                startRecur: '2021-05-01',
                endRecur: '2021-05-21',
            }
        ]
    });
    appSchedule.render();
}

//TODO, LISTA DE TAREAS APP, SIDEBAR DESPLEGABLE, SUBJECT.JS