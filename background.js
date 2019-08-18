// chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//     chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello2"}, function(response) {
//         if(response) {
//             console.log(response.farewell);
//         }
//     });
// });

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if(request.event == 'tj_get_image_data') {
            sendResponse({status:'success'});
            getImageFormUrl(request.url, function(imageData) {
                console.log('imageData got');
                chrome.tabs.sendMessage(sender.tab.id, {event: "tj_add_image", imageData: imageData}, function(response) {
                    console.log('imageData sent');
                    if(response.status) {
                        console.log('Image sent success');
                    }
                });
            });
        }
    });


function getImageFormUrl(url, callback) {
    var img = new Image();
    img.setAttribute('crossOrigin', 'anonymous');
    img.onload = function (a) {
        var canvas = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(this, 0, 0);
        var dataURI = canvas.toDataURL("image/jpg");
        // convert base64/URLEncoded data component to raw binary data held in a string
        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0)
            byteString = atob(dataURI.split(',')[1]);
        else
            byteString = unescape(dataURI.split(',')[1]);

        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        // write the bytes of the string to a typed array
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return callback(new Blob([ia], { type: mimeString }));
    };
    img.src = url;
}