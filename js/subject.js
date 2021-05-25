let subjectId = localStorage.getItem('subjectToOpen')

let setSubjectData=async (subjectId)=>{
    $('#subjectId').html(subjectId)

    let subjectIndex = ()=>{
        let i;
        for(i=0;i<subjectsList.length;i++){
            if(subjectsList[i].code == subjectId) {
                return i
            }
        }
    }

    let selectedSubject = subjectsList[subjectIndex()]
    console.log(selectedSubject)

    $("#subjectData").addClass(`border-left-${selectedSubject.statusColor}`)
    
    $("#subjectData").append(`
        <h2>${selectedSubject.level} ${selectedSubject.branch} - ${selectedSubject.code}</h2>
        <h4 class="text-muted">${selectedSubject.dayStartSplitter().toUpperCase()} - ${selectedSubject.dayEndSplitter().toUpperCase()}</h4>
        <h4 class="text-muted">${selectedSubject.description}</h4>`
    );

    let start = selectedSubject.getDate(selectedSubject.schedule.dayStart)
    let end = selectedSubject.getDate(selectedSubject.schedule.dayEnd)
    
    for(let i = 1; start<=end;start.setDate(start.getDate()+7)){    
        $('#subjectSchedule').append(`    
            <li class="container-fluid">
                <div class="d-flex">
                    <div class="text-center">
                        <h3 class="text-center mx-auto bg-primary text-white fw-bold">${i}</h3>
                    </div>
                    <div class="flex-grow-1">
                        <h4 class="bg-light">
                        Lorem ipsum, dolor sit amet consectetur adipisicing elit. <small class="d-block text-muted text-end">${start.toLocaleDateString()}</small>
                        </h4>
                    </div>
                </div>
            </li>`
        )
        i+=1;
    }

    
    $('#loader').remove()

}
