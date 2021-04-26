/**
 * COURSES CONSTRUCTOR FUNCTION ES6
 */
 class Subjects {
    constructor (level, code, branch, status, weekDay, timeStart, timeEnd, dayStart, dayEnd) {
        this.code = code.toUpperCase();
        this.level = level.toUpperCase();
        this.branch = branch.toUpperCase();
        this.status = status.toUpperCase();
        this.schedule = {
            weekDay : weekDay.toUpperCase(),
            timeStart : timeStart,
            timeEnd : timeEnd,
            dayStart : dayStart,
            dayEnd : dayEnd,
        }
    }
    /**
     * split dates with dd/mm/yyyy format.
     * @returns long month string and year in spanish
     */
    dayStartSplitter () {
        let dateParts = this.schedule.dayStart.split("/");
        let returnDate = new Date(+dateParts[2],dateParts[1]-1,+dateParts[0]);
        const options = {month:'long',year:'numeric'};
    
        let returnMonth = returnDate.toLocaleDateString('es-AR', options);
            
        return returnMonth;
    };
    dayEndSplitter () {
        let dateParts = this.schedule.dayEnd.split("/");
        let returnDate = new Date(+dateParts[2],dateParts[1]-1,+dateParts[0]);
        const options = {month:'long',year:'numeric'};
    
        let returnMonth = returnDate.toLocaleDateString('es-AR', options);
            
        return returnMonth;
    };

    /**
     * description builder
     * @returns right description per course
     */
    description() {
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
}

// Firestore data converter
var subjectConverter = {
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
        return new Subjects(data.level, data.code, data.branch, data.status, data.schedule.weekDay, data.schedule.timeStart, data.schedule.timeEnd, data.schedule.dayStart, data.schedule.dayEnd);
    }
}

let subjectsList = [];

db.collection("courses") //TODO Cambiar coleccion y condicion
  .withConverter(subjectConverter)
  .get()
  .then((snapshot) => {
    snapshot.docs.forEach((doc) => {
      if (doc.exists) {
        // Agregar al Array
        subjectsList.push(doc.data());
      } else {
        console.log("No existe el documento");
      }
    });
    console.log(subjectsList);
    subjectsList.sort((a,b)=>{ //ordenar por status
        if(a.status < b.status){
            return -1
        } else if(a.status > b.status){
            return 1
        }else{
            return 0
        }
    });
    renderSubjects();
  })
  .catch((error) => {
    console.log("Error al conseguir el documento:", error);
  })

let possibleStatus = {
    CURSANDO : "success",
    TERMINADO : "dark",
    PROXIMAMENTE : "warning"
}

/**
 * Esta función muestra las cards del curso solicitadas
 * @param {Valor requerido a mostrar} requestedCourses 
 */
function renderSubjects (){ //TODO MODIFICAR LOS HREF

    let cardsRender = '';
    let asideRender = '';

    for(i=0;i<subjectsList.length;i++){

        cardsRender = cardsRender + 
        `<div class="col">
            <a href="#" class="card subject-card border-left-warning h-100">
                <div class="card-body d-flex flex-column">
                    <div class="small subject-card-status bg-${possibleStatus[subjectsList[i].status]} px-3 py-1">${subjectsList[i].status}</div>
                    <h5 class="card-title fw-bold">${subjectsList[i].level +" "+subjectsList[i].code+" - "+ subjectsList[i].branch}</h5>
                    <p class="small text-end blockquote-footer flex-grow-1">${subjectsList[i].schedule.weekDay + " " + subjectsList[i].schedule.timeStart
                + " a " + subjectsList[i].schedule.timeEnd}</p>
                </div>
            </a>
        </div>`;

        asideRender = asideRender +
        `<li class="accordion-item sidebar-item">
            <div class="accordion-header" id="flush-heading${subjectsList[i].code}">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapse${subjectsList[i].code}" aria-expanded="false" aria-controls="flush-collapse${subjectsList[i].code}">
                ${subjectsList[i].level +" "+subjectsList[i].code}
                </button>
            </div>
            <div id="flush-collapse${subjectsList[i].code}" class="accordion-collapse collapse" aria-labelledby="flush-heading${subjectsList[i].code}" data-bs-parent="#subject-aside" >
                <a href="">
                    <i class="fas fa-user-friends"></i>
                    <span>ALUMNOS</span>
                </a>
                <a href="">
                    <i class="fas fa-clipboard-list"></i>
                    <span>TEMARIO</span>
                </a>
                <a href="">
                    <i class="fas fa-book-open"></i>
                    <span>MATERIALES</span>
                </a>
            </div>
        </li>`
    };

    document.querySelector("#subject-cards").innerHTML = cardsRender; //Div para las cards
    document.querySelector("#subject-aside").innerHTML = asideRender; //Div para el aside
}

//FullCalendar Initializer
document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,list'
      },
      footerToolbar: {        
          left: 'prev,next',
          right: 'today'
      },
      navLinks: true,
      selectable:true,
    });
    calendar.render();
  });

//TODO DROPDOWN PROFILE, LISTA DE TAREAS APP.