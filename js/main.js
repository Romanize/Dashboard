const localSubjectList = JSON.parse(localStorage.getItem("subjectsListStorage"));
const isIndexHTML = (
    location.pathname === "/" || 
    location.pathname.includes('index.html') || 
    location.pathname === "/Dashboard/")
const isSubjectHTML = (location.pathname.includes('/subject.html'))

//Listen for auth changes
auth.onAuthStateChanged(user =>{
    if(user){
        setUserUI(user);
        setSubjectsToRender();
    } else{
        localStorage.removeItem("subjectsListStorage")
        localStorage.removeItem("subjectToOpen")
        window.location.href = 'auth-login.html'
    }
})

/**
 * Get some info from user to show in DOM
 * @param {object containing info of logged user} user 
 */
const setUserUI = (user) =>{
    $('#user-dropdown').append(`
    <img src="${user.photoURL}" alt="User Picture" width="35px" height="35px">
    <span class="d-none d-md-inline fw-bold">${user.displayName}</span>
    `)
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

const setSubjectsToRender = () => {
    if (!localSubjectList){
        db.collection("courses") //TODO Cambiar coleccion y condicion, querys y lecturas
        .withConverter(subjectConverter)
        .get()
        .then((snapshot) => {
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
            localStorage.setItem("subjectsListStorage",JSON.stringify(subjectsList));
            if(isIndexHTML){subjectsCardsRender()};
            asideCardsRender();
        })
        .catch((error) => {
            console.log("Error al conseguir el documento:", error.message);
        })
    } else {
        localSubjectList.forEach((subject) => {
            let classedSubject = Object.assign(new Subject(),subject);
            subjectsList.push(classedSubject);
        });
        if(isIndexHTML){subjectsCardsRender()};
        asideCardsRender();
    }
}


/**
 * Para renderizar la información en el subject.html
 */
if(isSubjectHTML){
    let subjectId = localStorage.getItem('subjectToOpen')
    $('#pruebacontenido').html(subjectId);
}

/**
 * Esta función muestra las cards de las materias si se encuentra 
 * en la pagina principal del Dashboard
 */
const subjectsCardsRender = () => { 

    let cardsRender = '';

    subjectsList.forEach(subject =>{

        cardsRender = cardsRender + `
        <div class="col">
            <a href="subject.html" class="card subject-card border-left-${subject.statusColor} h-100" data-id="${subject.code}">
                <div class="card-body d-flex flex-column">
                    <div class="small subject-card-status bg-${subject.statusColor} px-2 py-1">${subject.status}</div>
                    <h5 class="card-title fw-bold">${subject.level +" "+subject.code+" - "+ subject.branch}</h5>
                    <p class="small text-end blockquote-footer flex-grow-1">${subject.schedule.weekDay + " " + subject.schedule.timeStart
                + " a " + subject.schedule.timeEnd}</p>
                </div>
            </a>
        </div>
        `;
    })

    $("#subjectCards").append(cardsRender); //Div para las cards

    $('#subjectCards a').click(event => {
        event.preventDefault();
        let subjectId = event.currentTarget.dataset.id;
        localStorage.setItem('subjectToOpen',subjectId)
        
        window.location.href = 'subject.html'
    })
}


/**
 * Shows aside Subjects on any page
 */
const asideCardsRender = () => {

    let asideRender = '';

    subjectsList.forEach(subject =>{
        asideRender = asideRender + `
        <li class="accordion-item sidebar-item">
            <div class="accordion-header" id="flush-heading${subject.code}">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapse${subject.code}" aria-expanded="false" aria-controls="flush-collapse${subject.code}">
                ${subject.level +" "+subject.code}
                </button>
            </div>
            <div id="flush-collapse${subject.code}" data-id="${subject.code}" class="accordion-collapse collapse" aria-labelledby="flush-heading${subject.code}" data-bs-parent="#subject-aside" >
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
        `
    })

    $("#subject-aside").html(asideRender);

    $('#subject-aside a').click(event => {
        event.preventDefault();
        let subjectId = event.currentTarget.parentElement.dataset.id;
        localStorage.setItem('subjectToOpen',subjectId)
        
        // $('#mainScreen').load('test.html')
        // window.history.pushState({id: subjectId},'','subject.html')

        window.location.href = 'subject.html'
    })

    $('#loader').remove()
}

// window.onpopstate(event =>{
//     event.state
// })

//Get current date and time
const currentDate = new Date(Date.now());
let language = navigator.language;

const formattedTime = 
(currentDate.getHours() > 9 ? currentDate.getHours() : '0'+currentDate.getHours())+":"
+(currentDate.getMinutes() > 9 ? currentDate.getMinutes() : '0'+currentDate.getMinutes())+":"
+(currentDate.getSeconds() > 9 ? currentDate.getSeconds() : '0'+currentDate.getSeconds());

let appSchedule;
$("#scheduleModal").on('shown.bs.modal', ()=>appSchedule.updateSize())


/**
 * Show a weekly Calendar on a div with Id calendar
 */
document.addEventListener('DOMContentLoaded', function() {
    
    appScheduleRender();

    $('#sidebarApps a').click(event=>{
        event.preventDefault()
    })

    if(isIndexHTML){
        indexCalendarRender();
    }

});

//LOGOUT

$('#logout').click(event=>{
    event.preventDefault();
    auth.signOut()
    .then(()=>{
        window.location.href = 'auth-login.html'
    })
    .catch(error=>console.log(error.code,error.message))
})

const indexCalendarRender = () => {
    let calendarEl = document.getElementById('calendar')
    let calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        themeSystem: 'bootstrap',
        locale: language,
        allDaySlot: false,
        headerToolbar: {
            left: 'prev',
            center: 'title',
            right: 'next',
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
    calendar.render();
}

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


//TODO, LISTA DE TAREAS APP, SIDEBAR DESPLEGABLE,QUERY DE FIREBASE SEGUN FECHA DE CAMBIOS0