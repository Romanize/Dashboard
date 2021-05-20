let subjectId = localStorage.getItem('subjectToOpen')

let setSubjectData=async (subjectId)=>{
    $('#subjectId').html(subjectId)

    // console.log(subjectsList)
    // console.log(subjectId)
    // await db.collection('subjects').where("code","==",subjectId)
    // .withConverter(subjectConverter)
    // .get()
    // .then(doc=>doc.forEach(doc=>{
    //     console.log(doc.data())
    // }))
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
    
    $("#subjectData").append(`
        <h2>${selectedSubject.level} ${selectedSubject.branch} - ${selectedSubject.code}</h2>
        <h4 class="text-muted">${selectedSubject.dayStartSplitter().toUpperCase()} - ${selectedSubject.dayEndSplitter().toUpperCase()}</h4>
        <h4>${selectedSubject.description}</h4>`
    );

    $('#loader').remove()
}
