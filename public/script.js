function switchDark() {
    var element = document.body;
    element.dataset.bsTheme =
        element.dataset.bsTheme == "light" ? "dark" : "light";
}


function formatTime(secs) {
    var timestamp = secs;
    var hours = Math.floor(timestamp / 60 / 60);
    var minutes = Math.floor(timestamp / 60) - (hours * 60);
    var seconds = timestamp % 60;
    var formatted = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
    if (formatted.startsWith('00:')) {
        formatted = formatted.replace('00:', '')
    }
    console.log(formatted);
    return formatted
}



function formatSize(bytes) {
    const units = ['<br>Bytes', '<br>KB', '<br>MB', '<br>GB', '<br>TB', '<br>PB', '<br>EB', '<br>ZB', '<br>YB'];
    let l = 0, n = parseInt(bytes, 10) || 0;

    while (n >= 1024 && ++l) {
        n = n / 1024;
    }

    return (n.toFixed(n < 10 && l > 0 ? 1 : 0) + units[l]);
}










async function downloadCaption(sublink, fname) {
    const externalUrl = sublink;
    console.log("here")
    try {
        const response = await fetch(externalUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fname; // Specify the desired filename
        link.click();
    } catch (error) {
        console.error("Error fetching the file:", error);
    }
}









function prepareAudioVideoTable(apiResp) {
    //Create head of the table
    thead = document.createElement('thead')
    tr = document.createElement('tr')

    headings = ['Quality', 'Format', 'Size', 'Link']

    for (let each of headings) {
        th = document.createElement('th')
        th.setAttribute('scope', 'col')
        th.innerHTML = each
        if (each == 'Link') {
            th.setAttribute('class', 'text-center')
        }
        tr.appendChild(th)
    }

    thead.appendChild(tr)

    //Create body of the table
    tbody = document.createElement('tbody')

    for (let eachStream of apiResp.downloadDetails.audioVideos) {
        tr = document.createElement('tr')
        colNum = 1
        for (key in eachStream) {
            td = document.createElement('td')
            if (colNum == 1) {
                try { td.innerHTML = eachStream.quality }
                catch { td.innerHTML = 'Unknown' }
            }
            else if (colNum == 2) {
                try { td.innerHTML = eachStream.format }
                catch { td.innerHTML = 'Unknown' }
            }
            else if (colNum == 3) {
                try { td.innerHTML = formatSize(eachStream.size) }
                catch { td.innerHTML = 'Unknown' }
            }
            else if (colNum == 4) {
                try {
                    td.setAttribute('align', 'center')

                    a = document.createElement('a')
                    a.setAttribute('role', 'button')
                    a.setAttribute('class', 'btn btn-primary')
                    a.setAttribute('href', eachStream.link)
                    a.innerHTML = "Download"
                    td.appendChild(a)
                }
                catch {
                    tr.remove()
                    tr = null
                }
            }
            if (tr) {
                tr.appendChild(td)
            }
            colNum += 1
        }
        tbody.appendChild(tr)
    }





    /*  
      for (let eachStream of apiResp.downloadDetails.audioVideos) {
          for (let key in eachStream) {
              th = document.createElement('th')
              th.setAttribute('scope', 'col')
              console.log(key)
              if(key=='quality'){
                  th.innerHTML = 'Quality'
              }
              else if(key=='format'){
                  th.innerHTML = 'Format'
              }
              else if(key=='link'){
                  th.innerHTML = 'Link'
              }
              else if(key=='size'){
                  th.innerHTML = 'Size'
              }
              
              tr.appendChild(th)
          }
  
      }
      */

    //console.log(thead)
    console.log(thead.innerHTML)
    return thead.innerHTML + tbody.innerHTML
}






function prepareVideoTable(apiResp) {
    //Create head of the table
    thead = document.createElement('thead')
    tr = document.createElement('tr')

    headings = ['Quality', 'Format', 'Size', 'Link']

    for (let each of headings) {
        th = document.createElement('th')
        th.setAttribute('scope', 'col')
        th.innerHTML = each
        if (each == 'Link') {
            th.setAttribute('class', 'text-center')
        }
        tr.appendChild(th)
    }

    thead.appendChild(tr)

    //Create body of the table
    tbody = document.createElement('tbody')

    for (let eachStream of apiResp.downloadDetails.videos) {
        tr = document.createElement('tr')
        colNum = 1
        for (key in eachStream) {
            td = document.createElement('td')
            if (colNum == 1) {
                try { td.innerHTML = eachStream.quality }
                catch { td.innerHTML = 'Unknown' }
            }
            else if (colNum == 2) {
                try { td.innerHTML = eachStream.format }
                catch { td.innerHTML = 'Unknown' }
            }
            else if (colNum == 3) {
                try { td.innerHTML = formatSize(eachStream.size) }
                catch { td.innerHTML = 'Unknown' }
            }
            else if (colNum == 4) {
                try {
                    td.setAttribute('align', 'center')

                    a = document.createElement('a')
                    a.setAttribute('role', 'button')
                    a.setAttribute('class', 'btn btn-primary')
                    a.setAttribute('href', eachStream.link)
                    a.innerHTML = "Download"
                    td.appendChild(a)
                }
                catch {
                    tr.remove()
                    tr = null
                }
            }
            if (tr) {
                tr.appendChild(td)
            }
            colNum += 1
        }
        tbody.appendChild(tr)
    }


    console.log(thead.innerHTML)
    return thead.innerHTML + tbody.innerHTML
}










function prepareAudioTable(apiResp) {
    //Create head of the table
    thead = document.createElement('thead')
    tr = document.createElement('tr')

    if ('lang' in apiResp.downloadDetails.audios[0]) {
        headings = ['Language', 'Quality', 'Format', 'Size', 'Link']
    }
    else {
        headings = ['Quality', 'Format', 'Size', 'Link']
    }


    for (let each of headings) {
        th = document.createElement('th')
        th.setAttribute('scope', 'col')
        th.innerHTML = each
        if (each == 'Link') {
            th.setAttribute('class', 'text-center')
        }
        tr.appendChild(th)
    }

    thead.appendChild(tr)

    //Create body of the table
    tbody = document.createElement('tbody')

    for (let eachStream of apiResp.downloadDetails.audios) {
        tr = document.createElement('tr')
        if ('lang' in apiResp.downloadDetails.audios[0]) {
            colNum = 0
        }
        else {
            colNum = 1
        }

        for (key in eachStream) {
            td = document.createElement('td')
            if (colNum == 0) {
                try { td.innerHTML = eachStream.lang }
                catch { td.innerHTML = 'Unknown' }
            }
            else if (colNum == 1) {
                try { td.innerHTML = eachStream.quality + '<br>Kbps' }
                catch { td.innerHTML = 'Unknown' }
            }
            else if (colNum == 2) {
                try { td.innerHTML = eachStream.format }
                catch { td.innerHTML = 'Unknown' }
            }
            else if (colNum == 3) {
                try { td.innerHTML = formatSize(eachStream.size) }
                catch { td.innerHTML = 'Unknown' }
            }
            else if (colNum == 4) {
                try {
                    td.setAttribute('align', 'center')

                    a = document.createElement('a')
                    a.setAttribute('role', 'button')
                    a.setAttribute('class', 'btn btn-primary')
                    a.setAttribute('href', eachStream.link)
                    a.innerHTML = "Download"
                    td.appendChild(a)
                }
                catch {
                    tr.remove()
                    tr = null
                }
            }
            if (tr) {
                tr.appendChild(td)
            }
            colNum += 1
        }
        tbody.appendChild(tr)
    }


    console.log(thead.innerHTML)
    return thead.innerHTML + tbody.innerHTML
}










function prepareCaptionTable(apiResp) {
    //Create head of the table
    thead = document.createElement('thead')
    tr = document.createElement('tr')

    headings = ['Language', 'Link']

    for (let each of headings) {
        th = document.createElement('th')
        th.setAttribute('scope', 'col')
        th.innerHTML = each
        if (each == 'Link') {
            th.setAttribute('class', 'text-center')
        }
        tr.appendChild(th)
    }

    thead.appendChild(tr)

    //Create body of the table
    tbody = document.createElement('tbody')

    if (apiResp.downloadDetails.captions) {
        for (let eachStream of apiResp.downloadDetails.captions) {
            tr = document.createElement('tr')
            colNum = 1
            for (key in eachStream) {
                td = document.createElement('td')
                if (colNum == 1) {
                    try { td.innerHTML = eachStream.lang }
                    catch { td.innerHTML = 'Unknown' }
                }
                else if (colNum == 2) {
                    try {
                        console.log(eachStream.url)
                        let fname = `${apiResp.videoDetails.title} [${eachStream.lang}].vtt`
                        td.setAttribute('align', 'center')

                        a = document.createElement('a')
                        a.setAttribute('role', 'button')
                        a.setAttribute('class', 'btn btn-primary')
                        //a.setAttribute('href', eachStream.url)
                        a.innerHTML = "Download"
                        a.setAttribute('onClick', `downloadCaption('${eachStream.url + '&fmt=vtt'}','${fname}')`)
                        td.appendChild(a)
                    }
                    catch {
                        tr.remove()
                        tr = null
                    }
                }
                if (tr) {
                    tr.appendChild(td)
                }
                colNum += 1
            }
            tbody.appendChild(tr)
        }
    }


    console.log(thead.innerHTML)
    return thead.innerHTML + tbody.innerHTML
}





























function handleGetDetails() {
    ytlink = document.getElementById('link-box').value

    loadingElem = document.getElementsByClassName('loading')[0]
    if (loadingElem.innerHTML == null) {
        loadingElem.innerHTML = `<img src="/public/waiting-cat.gif" class="img-fluid">`
    }


    detArea = document.getElementsByClassName('video-details-area')[0]
    if (detArea) {
        detArea.remove()
    }
    downArea = document.getElementsByClassName('video-download-area')[0]
    if (downArea) {
        downArea.remove()
    }


    loadingElem = document.getElementsByClassName('loading')[0]
    loadingElem.innerHTML = `<img src="/public/waiting-cat.gif" class="img-fluid">`
    console.log("Loading div recreated.")


    finalLink = '/get-details/' + encodeURIComponent(ytlink)
    console.log(finalLink)
    fetch(finalLink).then(resp => {
        if (resp.status == 404) {
            document.getElementsByClassName('alert-area')[0].innerHTML = ''
            document.getElementsByClassName('loading')[0].innerHTML = ''
            alertDiv = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>Error!</strong> Please enter valid URL.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>`


            document.getElementsByClassName('alert-area')[0].innerHTML = alertDiv
        }

        if (resp.status == 400) {
            document.getElementsByClassName('alert-area')[0].innerHTML = ''
            document.getElementsByClassName('loading')[0].innerHTML = ''
            alertDiv = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>Error!</strong> Please enter valid URL.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>`


            document.getElementsByClassName('alert-area')[0].innerHTML = alertDiv

        }

        return resp.json()
    }).then(data => {
        console.log(data)
        loadingElem.innerHTML = ''

        thumbnailUrl = data.videoDetails.thumbnailUrl
        lengthSeconds = formatTime(data.videoDetails.lengthSeconds)
        title = data.videoDetails.title

        videoDetailsHTML = `<div class="border border-primary video-details-area ">
        <img src="${thumbnailUrl}"
            class="rounded mx-auto d-block img-fluid">
        <p class="text-start"><b>Title:</b> ${title}<br><b>Duration:</b> ${lengthSeconds}</p>
    </div>`


        audioVideoTable = prepareAudioVideoTable(data)
        videoTable = prepareVideoTable(data)
        captionTable = prepareCaptionTable(data)
        audioTable = prepareAudioTable(data)


        downloadDetailsHTML = `<div class="container  video-download-area custom-border-bottom">
    <div class="accordion" id="accordionExample">
        <h2 class="label label-default text-center custom-border">Available Links: </h2>
        <div class="accordion-item" id="audioVideoAcc">
            <h2 class="accordion-header" id="headingOne">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                    data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
                    Video With Audio
                </button>
            </h2>
            <div id="collapseOne" class="accordion-collapse collapse" aria-labelledby="headingOne"
                data-bs-parent="#accordionExample">
                <div class="accordion-body table-responsive">
                    <table class="table table-hover ">
                        ${audioVideoTable}
                    </table>
                </div>
            </div>
        </div>
        <div class="accordion-item" id="videoAcc">
            <h2 class="accordion-header" id="headingTwo">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                    data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                    Video Without Audio
                </button>
            </h2>
            <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo"
                data-bs-parent="#accordionExample">
                <div class="accordion-body table-responsive">
                    <table class="table table-hover ">
                    ${videoTable}
                    </table>
                </div>
            </div>
        </div>
        <div class="accordion-item" id="audioAcc">
            <h2 class="accordion-header" id="headingThree">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                    data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                    Audio Only
                </button>
            </h2>
            <div id="collapseThree" class="accordion-collapse collapse" aria-labelledby="headingThree"
                data-bs-parent="#accordionExample">
                <div class="accordion-body table-responsive">
                    <table class="table table-hover ">
                    ${audioTable}
                    </table>
                </div>
            </div>
        </div>
        <div class="accordion-item" id="captionsAcc">
            <h2 class="accordion-header" id="headingFour">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                    data-bs-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour">
                    Subtitles
                </button>
            </h2>
            <div id="collapseFour" class="accordion-collapse collapse" aria-labelledby="headingFour"
                data-bs-parent="#accordionExample">
                <div class="accordion-body table-responsive">
                    <table class="table table-hover ">
                    ${captionTable}
                    </table>
                </div>
            </div>
        </div>
    </div>

</div>`
        document.getElementsByClassName('main-div')[0].insertAdjacentHTML('beforeend', videoDetailsHTML + downloadDetailsHTML)
        


    }).catch(err => {
        console.log(err)
    })

}


document.getElementById('get-details-button').addEventListener('click', handleGetDetails)