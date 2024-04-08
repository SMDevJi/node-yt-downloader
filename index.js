//https://www.youtube.com/watch?v=60ItHLz5WEA


//const readline = require('readline');
const path = require('path');
const fs = require('fs');
const ytdl = require('ytdl-core');
const express = require('express')
const app = express()
const port = 3000


async function getExtraLinks(vId) {
    return fetch(`https://www.youtube.com/youtubei/v1/player?videoId=${vId}&key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8&contentCheckOk=True&racyCheckOk=True`, {
        method: 'POST',
        headers: {
            'Host': 'www.youtube.com',
            'Accept-Encoding': 'gzip, deflate, br',
            'User-Agent': 'com.google.android.apps.youtube.music/',
            'Accept-Language': 'en-US,en',
            'Content-Type': 'application/json',
            'Connection': 'close'
        },
        body: '{ "context": { "client": { "clientName": "ANDROID_MUSIC", "clientVersion": "5.16.51", "androidSdkVersion": 30 } } }',

    })

}




async function getContentLength(url) {
    return await fetch(url, { method: 'HEAD' }).then(result => {
        return result.headers.get("content-length");
    })
}


function removeDuplicateQualities(list) {
    const uniqueValues = new Set();
    return list.filter((obj) => {
        if (!uniqueValues.has(obj.quality)) {
            uniqueValues.add(obj.quality);
            return true;
        }
        return false;
    });
}

function removeDuplicateLangs(list) {
    const uniqueValues = new Set();
    return list.filter((obj) => {
        if (!uniqueValues.has(obj.lang)) {
            uniqueValues.add(obj.lang);
            return true;
        }
        return false;
    });
}





app.get('/', (req, res) => {
    console.log(`[INFO] Received request from ${req.ip} at '/'`)
    res.sendFile(path.join(__dirname, '/public/index.html'))
})

app.get('/public/:fileName', (req, res) => {
    console.log(`[INFO] Received request from ${req.ip} at '/public/'`)
    res.sendFile(path.join(__dirname, path.join('/public/', req.params.fileName)))
})



app.get('/get-details/:ytLink', async (req, res) => {
    console.log(`[INFO] Received request from ${req.ip} at '/get-details/'`)
    //console.log(getVideoDetails(req.params.ytLink))
    await getVideoDetails(res, req.params.ytLink);

})

app.get('/download/:id', async (req, res) => {
    console.log(req.params.id)
    console.log(`[INFO] Received request from ${req.ip} at '/download/'`)
    res.redirect(await getDownloadLink(req.params.ytLink))
})

app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})





async function getVideoDetails(res, videoLink) {
    let url = videoLink;
    if (url == null) {
        res.status(400).json({
            statusCode: 400,
            message: "Invalid YouTube URL provided.",
        });
        return
    }
    console.log(url);
    try {

        videoID = ytdl.getURLVideoID(url);
    }
    catch {
        res.status(400).json({
            statusCode: 400,
            message: "Invalid YouTube URL provided.",
        });
        return
    }


    //console.log(info.player_response.videoDetails.thumbnail.thumbnails)

    //console.log(thumbUrl)





    info = await ytdl.getInfo(videoID);




    // console.log('title:', info.videoDetails.title);
    // console.log('rating:', info.player_response.videoDetails.averageRating);
    //console.log('uploaded by:', info.videoDetails.author.name);
    //console.log(retUrl)

    let finalData = {};

    let videoDetails = {}
    videoDetails['lengthSeconds'] = info.player_response.videoDetails.lengthSeconds;
    videoDetails['thumbnailUrl'] = info.player_response.videoDetails.thumbnail.thumbnails.slice(-1)[0].url;
    videoDetails['title'] = info.player_response.videoDetails.title;

    finalData['videoDetails'] = videoDetails;



    let downloadDetails = {};

    //prepare captions data if available
    if ('captions' in info.player_response) {
        let captions = [];
        let all_captions_data = info.player_response.captions.playerCaptionsTracklistRenderer.captionTracks;
        Object.keys(all_captions_data).forEach(key => {
            caption_elem = {};
            caption_elem['lang'] = all_captions_data[key].name.simpleText;
            caption_elem['url'] = all_captions_data[key].baseUrl;
            captions.push(caption_elem);
        });
        downloadDetails['captions'] = captions;
    }






    //prepare video with audio data if available
    audioVideosYtdl = ytdl.filterFormats(info.formats, 'videoandaudio');
    //console.log(info.player_response.streamingData.formats)
    audioVideosCustom = await getExtraLinks(videoID).then((response) => response.json())
        .then((responseJSON) => {
            return responseJSON;
        })
    if ('streamingData' in audioVideosCustom) {
        if ('formats' in audioVideosCustom.streamingData) {
            audioVideosCustom = audioVideosCustom.streamingData.formats;
        }
        else {
            audioVideosCustom = []
        }
    }
    else {
        audioVideosCustom = []
    }


    if (audioVideosYtdl.length != 0 || audioVideosCustom.length != 0) {
        audioVideoElems = []

        for (let each of audioVideosYtdl) {
            //console.log(each);
            let elem = {};
            elem['quality'] = each.qualityLabel;
            elem['format'] = each.mimeType.split(";")[0];
            elem['link'] = each.url;
            if ('contentLength' in each) {
                elem['size'] = each.contentLength;
            } else {
                let size = await getContentLength(each.url);
                //console.log(size);
                elem['size'] = size;
            }
            audioVideoElems.push(elem);
        }

        extraElems = []
        for (let each of audioVideosCustom) {
            for (let elem of audioVideoElems) {
                if (elem.quality != each.qualityLabel) {
                    extraElem = {}

                    extraElem['quality'] = each.qualityLabel;
                    extraElem['format'] = each.mimeType.split(";")[0];
                    extraElem['link'] = each.url;
                    if ('contentLength' in each) {
                        extraElem['size'] = each.contentLength;
                    } else {
                        let size = await getContentLength(each.url);
                        //console.log(size);
                        extraElem['size'] = size;
                    }
                    extraElems.push(extraElem);
                }
            }
        }
        //console.log(extraElems)
        for (let everyExtraElem of extraElems) {
            audioVideoElems.push(everyExtraElem)
        }


        downloadDetails['audioVideos'] = removeDuplicateQualities(audioVideoElems)
    }








    //prepare video without audio data if available
    videosYtdl = ytdl.filterFormats(info.formats, 'videoonly');
    //console.log(info.player_response.streamingData.formats)
    videosCustom = await getExtraLinks(videoID).then((response) => response.json())
        .then((responseJSON) => {
            return responseJSON;
        })

    if ('streamingData' in videosCustom) {
        if ('adaptiveFormats' in videosCustom.streamingData) {
            videosCustom = videosCustom.streamingData.adaptiveFormats;
        }
        else {
            videosCustom = []
        }
    }
    else {
        videosCustom = []
    }


    if (videosYtdl.length != 0 || videosCustom.length != 0) {
        videoElems = []

        for (let each of videosYtdl) {
            //console.log(each);
            let elem = {};
            elem['quality'] = each.qualityLabel;
            elem['format'] = each.mimeType.split(";")[0];
            elem['link'] = each.url;
            if ('contentLength' in each) {
                elem['size'] = each.contentLength;
            } else {
                let size = await getContentLength(each.url);
                //console.log(size);
                elem['size'] = size;
            }
            videoElems.push(elem);
        }

        extraElems = []
        for (let each of videosCustom) {
            if (!each.mimeType.includes('audio')) {
                for (let elem of videoElems) {
                    if (elem.quality != each.qualityLabel) {
                        extraElem = {}

                        extraElem['quality'] = each.qualityLabel;
                        extraElem['format'] = each.mimeType.split(";")[0];
                        extraElem['link'] = each.url;
                        if ('contentLength' in each) {
                            extraElem['size'] = each.contentLength;
                        } else {
                            let size = await getContentLength(each.url);
                            //console.log(size);
                            extraElem['size'] = size;
                        }
                        extraElems.push(extraElem);
                    }
                }
            }

        }
        //console.log(extraElems)
        for (let everyExtraElem of extraElems) {
            videoElems.push(everyExtraElem)
        }


        downloadDetails['videos'] = removeDuplicateQualities(videoElems)
    }












    //prepare audio data if available
    audiosYtdl = ytdl.filterFormats(info.formats, 'audioonly');
    //console.log(info.player_response.streamingData.formats)
    /*
    audiosCustom = await getExtraLinks(videoID).then((response) => response.json())
        .then((responseJSON) => {
            return responseJSON;
        })
    */
    /*
    if ('streamingData' in audiosCustom) {
        if ('adaptiveFormats' in audiosCustom.streamingData) {
            audiosCustom = audiosCustom.streamingData.adaptiveFormats;
        }
        else {
            audiosCustom = []
        }
    }
    else {
        audiosCustom = []
    }
    */

    var isMultiAudio = false
    if (audiosYtdl.length != 0) {
        audioElems = []

        for (let each of audiosYtdl) {
            //console.log(each);
            let elem = {};
            elem['quality'] = each.audioBitrate;
            elem['format'] = each.mimeType.split(";")[0];
            elem['link'] = each.url;
            if ('contentLength' in each) {
                elem['size'] = each.contentLength;
            } else {
                let size = await getContentLength(each.url);
                //console.log(size);
                elem['size'] = size;
            }
            try {
                elem['lang'] = each.audioTrack.displayName
                isMultiAudio = true
            }
            catch {
                isMultiAudio = false
            }

            audioElems.push(elem);
        }
        /*
            extraElems = []
            for (let each of audiosCustom) {
                if (!each.mimeType.includes('video')) {
                    for (let elem of audioElems) {
                        if (elem.quality != each.qualityLabel) {
                            extraElem = {}
        
                            extraElem['quality'] = each.qualityLabel;
                            extraElem['format'] = each.mimeType.split(";")[0];
                            extraElem['link'] = each.url;
                            if ('contentLength' in each) {
                                extraElem['size'] = each.contentLength;
                            } else {
                                let size = await getContentLength(each.url);
                                //console.log(size);
                                extraElem['size'] = size;
                            }
                            extraElems.push(extraElem);
                        }
                    }
                }
        
            }
            //console.log(extraElems)
            for (let everyExtraElem of extraElems) {
                audioElems.push(everyExtraElem)
            }
        */
        if (isMultiAudio) {
            downloadDetails['audios'] = removeDuplicateLangs(audioElems)
        }
        else {
            downloadDetails['audios'] = removeDuplicateQualities(audioElems)
        }

    }










    //console.log(downloadDetails);

    finalData['downloadDetails'] = downloadDetails;
    //console.log(finalData);
    res.send(finalData);
}














/*
async function getDownloadLink(videoLink) {
    let url = videoLink;
    console.log(url);
    videoID = ytdl.getURLVideoID(url);

    console.log(info.player_response.videoDetails.thumbnail.thumbnails)

    console.log(thumbUrl)

    let retUrl;

    //const video = ytdl(url);

    info = await ytdl.getInfo(videoID);



    retUrl = ytdl.chooseFormat(info.formats, { quality: 'lowest' }).url
    console.log('title:', info.videoDetails.title);
    console.log('rating:', info.player_response.videoDetails.averageRating);
    console.log('uploaded by:', info.videoDetails.author.name);
    console.log(retUrl)

    return retUrl;
}

*/