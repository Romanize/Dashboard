var courses = [
    {
        code: "D5",
        branch: "PNL",
        level: "MASTER",
        schedule: {
            weekDay: "Jueves",
            timeStart: "18.30",
            timeEnd: "21.30",
            dayStart: "02/03/2021",
            dayEnd: "18/04/2022"
        },
        status: "CURSANDO",
        description: "2do nivel de la carrera de PNL, donde aprenderas a modelar comportamientos por excelencia de otros usuarios, mediante la evaluación de sus comportamientos y modalidades.",
        alumnos: [
            "1912",
            "2023",
            "5014",
            "2021",
            "1994"
        ],
        instructores: [
            "0105",
            "0108",
            "0315"
        ],
        mentores:[
            {
                mentor:"0108",
                comentor:"0204"
            },
            {
                mentor:"0109",
                comentor:"0203"
            },
            {
                mentor:"0134",
                comentor:"0292"
            }
        ]
    },
    {
        code: "B1",
        branch: "PNL",
        level: "PRACTITIONER",
        schedule: {
            weekDay: "Martes",
            timeStart: "18.30",
            timeEnd: "21.30",
            dayStart: "01/03/2021",
            dayEnd: "13/04/2022"
        },
        status: "CURSANDO",
        description: "1er nivel de la carrera de PNL, donde conocerás que es el PNL y sus aplicaciones. Garantizamos un espacio de transformación personal donde aprenderás a registrar tus cinco sentidos y te conocerás como nunca antes.",
        alumnos: [
            "1912",
            "2023",
            "5014",
            "2021",
            "1994"
        ],
        instructores: [
            "0105",
            "0108",
            "0315"
        ],
        mentores:[
            {
                mentor:"0108",
                comentor:"0204"
            },
            {
                mentor:"0109",
                comentor:"0203"
            },
            {
                mentor:"0134",
                comentor:"0292"
            }
        ]
    },
    {
        code: "C3",
        branch: "PNL",
        level: "MASTER",
        schedule: {
            weekDay: "Miercoles",
            timeStart: "9.00",
            timeEnd: "13.00",
            dayStart: "19/01/2021",
            dayEnd: "18/02/2022"
        },
        status: "CURSANDO",
        description: "2do nivel de la carrera de PNL, donde aprenderas a modelar comportamientos por excelencia de otros usuarios, mediante la evaluación de sus comportamientos y modalidades.",
        alumnos: [
            "1912",
            "2023",
            "5014",
            "2021",
            "1994"
        ],
        instructores: [
            "0105",
            "0108",
            "0315"
        ],
        mentores:[
            {
                mentor:"0108",
                comentor:"0204"
            },
            {
                mentor:"0109",
                comentor:"0203"
            },
            {
                mentor:"0134",
                comentor:"0292"
            }
        ]
    },
    {
        code: "D5",
        branch: "PNL",
        level: "MASTER",
        schedule: {
            weekDay: "Jueves",
            timeStart: "9.30",
            timeEnd: "12.30",
            dayStart: "10/05/2020",
            dayEnd: "18/02/2021"
        },
        status: "CULMINADO",
        description: "2do nivel de la carrera de PNL, donde aprenderas a modelar comportamientos por excelencia de otros usuarios, mediante la evaluación de sus comportamientos y modalidades.",
        alumnos: [
            "1912",
            "2023",
            "5014",
            "2021",
            "1994"
        ],
        instructores: [
            "0105",
            "0108",
            "0315"
        ],
        mentores:[
            {
                mentor:"0108",
                comentor:"0204"
            },
            {
                mentor:"0109",
                comentor:"0203"
            },
            {
                mentor:"0134",
                comentor:"0292"
            }
        ]
    },
    {
        code: "E4",
        branch: "PNL",
        level: "TRAINER",
        schedule: {
            weekDay: "Viernes",
            timeStart: "18.30",
            timeEnd: "21.30",
            dayStart: "14/05/2021",
            dayEnd: "06/03/2022"
        },
        status: "PROXIMAMENTE",
        description: "3er nivel de la carrera de PNL, donde te formarás como instructor especialista en técnicas de programación Neurolinguistica, con técnicas para acompasar y lideras nunca vistas en otros niveles.",
        alumnos: [
            "1912",
            "2023",
            "5014",
            "2021",
            "1994"
        ],
        instructores: [
            "0105",
            "0108",
            "0315"
        ],
        mentores:[
            {
                mentor:"0108",
                comentor:"0204"
            },
            {
                mentor:"0109",
                comentor:"0203"
            },
            {
                mentor:"0134",
                comentor:"0292"
            }
        ]
    }
]

var possibleStatus = {
    CURSANDO : "success",
    CULMINADO : "danger",
    PROXIMAMENTE : "warning"
}


var contentLoader = '';

let lengthRequest = Number(prompt("Cuantos cursos quieres ver? Max. 5"));

for(i=0;i<lengthRequest;i++){

    contentLoader = contentLoader + `<div class="col">
    <div class="card course-card border-left-warning h-100">
        <div class="small course-card-status bg-${possibleStatus[courses[i].status]} px-3 py-1" >${courses[i].status}</div>
        <div class="card-header">
        ${courses[i].level +" "+ courses[i].code}
        </div>
        <div class="card-body d-flex flex-column">
            <h5 class="card-title">${courses[i].level +" "+ courses[i].branch}</h5>
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

function dateMonthSplitter (d){
    let dateParts = d.split("/");
    let returnDate = new Date(+dateParts[2],dateParts[1]-1,+dateParts[0]);
    const options = {month:'long',year:'numeric'};

    returnMonth = returnDate.toLocaleDateString('es-AR', options);
    console.log(returnMonth);
        
    return returnMonth
}