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

    $('#subjectCards a').on('click',event => {
        event.preventDefault();
        let subjectId = event.currentTarget.dataset.id;
        localStorage.setItem('subjectToOpen',subjectId)
        
        window.location.href = 'subject.html'
    })

    $('#loader').remove()
}

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

indexCalendarRender();