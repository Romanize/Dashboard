/**
 * COURSES CONSTRUCTOR FUNCTION ES6
 */
 class Courses {
    constructor (level, code, branch, status, weekDayx, timeStartx, timeEndx, dayStartx, dayEndx) {
        this.code = code.toUpperCase();
        this.level = level.toUpperCase();
        this.branch = branch.toUpperCase();
        this.status = status.toUpperCase();
        this.schedule = {
            weekDay : weekDayx.toUpperCase(),
            timeStart : timeStartx,
            timeEnd : timeEndx,
            dayStart : dayStartx,
            dayEnd : dayEndx,
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
    add(pass) {
        if (pass == '1234'){
            db.collection('courses').add({
                code : this.code,
                level : this.level,
                brach: this.branch,
                schedule: this.schedule,
                status: this.status              
            })
        }else{
            alert('Error, ingrese contraseña como parametro')
        }
    }
}

var courses = [];

db.collection('courses').get().then((snapshot)=>{
    snapshot.docs.forEach(doc => {
        courses.push(doc.data())
    })
    console.log(courses);
    alert('Ahora puedes interactuar con los botones')
})

let contentLoader = '';

let possibleStatus = {
    CURSANDO : "success",
    CULMINADO : "danger",
    PROXIMAMENTE : "warning"
}

let lengthRequest = Number(prompt("Cuantos cursos quieres ver? Max. 5"));
alert('Espera que se carguen los valores de la DB para interactuar con el botón, se muestran por consola');

/**
 * Da un alert con la cantidad de cursos a mostrar, y llama a la función para crear las cards.
 * @param {Cantidad de cursos a mostrar} requestedCourses 
 */
 function showCourses (requestedCourses) {
    alert(`Se mostrarán un total de ${requestedCourses} cursos`);
    createCoursesCards(requestedCourses);
}


/**
 * Esta función muestra las cards del curso solicitadas
 * @param {Valor requerido a mostrar} requestedCourses 
 */
function createCoursesCards (requestedCourses){

    for(i=0;i<requestedCourses;i++){

        contentLoader = contentLoader + `<div class="col">
        <div class="card course-card border-left-warning h-100">
            <div class="small course-card-status bg-${possibleStatus[courses[i].status]} px-3 py-1">${courses[i].status}</div>
            <div class="card-header">
            ${courses[i].level +" "+ courses[i].code}
            </div>
            <div class="card-body d-flex flex-column">
                <h5 class="card-title fw-bold">${courses[i].level +" "+ courses[i].branch}</h5>
                <p class="card-text">${courses[i].description}</p>
                <p class="small text-end blockquote-footer flex-grow-1">${courses[i].schedule.weekDay + " " + courses[i].schedule.timeStart
            + " a " + courses[i].schedule.timeEnd}</p>
                <a href="#" class="card-button btn btn-primary px-3">Ver curso</a>
            </div>
            <div class="card-footer text-muted text-uppercase">
            ${dateMonthSplitter(courses[i].schedule.dayStart) + " - " + dateMonthSplitter(courses[i].schedule.dayEnd)}
            </div>
        </div>
    </div>`
    };

    document.querySelector("#course-content").innerHTML = contentLoader;
}

/**
 * Función para borrar, luego de agregar metodos a los objetos que vienen de la db
 */
function dateMonthSplitter(d){
    let dateParts = d.split("/");
    let returnDate = new Date(+dateParts[2],dateParts[1]-1,+dateParts[0]);
    const options = {month:'long',year:'numeric'};

    let returnMonth = returnDate.toLocaleDateString('es-AR', options);
        
    return returnMonth;
}

let newSubject = new Courses('MASTER','A8','PNL','PROXIMAMENTE','LUNES','09:30','12:30','25/04/2021','13/04/2022');
console.log(newSubject);

//Usando metodos para el desafio
function createNewCourse(){
    alert('Se agrega info al html usando funciones y metodos del objeto creado');

    contentLoader = contentLoader + `
    <div class="col">
        <div class="card course-card border-left-warning h-100">
            <div class="small course-card-status bg-${possibleStatus[newSubject.status]} px-3 py-1">${newSubject.status}</div>
            <div class="card-header">
            ${newSubject.level +" "+ newSubject.code}
            </div>
            <div class="card-body d-flex flex-column">
                <h5 class="card-title fw-bold">${newSubject.level +" "+ newSubject.branch}</h5>
                <p class="card-text">${newSubject.description()}</p>
                <p class="small text-end blockquote-footer flex-grow-1">${newSubject.schedule.weekDay + " " + newSubject.schedule.timeStart
            + " a " + newSubject.schedule.timeEnd}</p>
                <a href="#" class="card-button btn btn-primary px-3">Ver curso</a>
            </div>
            <div class="card-footer text-muted text-uppercase">
            ${newSubject.dayStartSplitter() + " - " + newSubject.dayEndSplitter()}
            </div>
        </div>
    </div>`

    document.querySelector("#course-content").innerHTML = contentLoader;
}