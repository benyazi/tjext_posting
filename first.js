$( document ).ready(function() {
    var searchUrl = 'https://api.giphy.com/v1/gifs/search?api_key=qQ6Pykx6JPOGo8lb6aXceGwG7XmdNmpv&limit=50&offset={OFFSET}&rating=G&lang=en&q=';
    var btnVideo = $('.comments_form__video');
    var searchOffset = 0;
    var btns = $('' +
        '<div class="b_tjext__btns">' +
        '<div class="b_tjext__btn b_tjext__btn--gif"><span>G</span></div>' +
        '<div class="b_tjext__btn b_tjext__btn--sticker"><span>S</span></div>' +
        '<div class="b_tjext__popup b_tjext__popup-hide">' +
        '<div class="b_tjext__popup_list"></div>' +
        '<div class="b_tjext__popup_footer"><input type="text" class="b_tjext__popup_footer_input"></div>' +
        '</div>' +
        '</div>'
    );
    btnVideo.after(btns);
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
            if (request.event == "tj_add_image") {
                sendResponse({status: "success"});
                $('textarea.comments_form__textarea').val(request.imageData).trigger('change');
            }
        });
    $(document).on('click', '.b_tjext__btn', function () {
        var btn = $(this);
        if(btn.hasClass('b_tjext__btn--sticker')) {
            console.log('sticker btn');
            var imgUrl = 'https://leonardo.osnova.io/885a1eda-4cf3-eecb-a787-fe836f93f764/-/scale_crop/238x169/center/-/format/jpeg/';
            chrome.runtime.sendMessage({event: "tj_get_image_data", url: imgUrl}, function(response) {
                console.log('Got image data, ' + response.status);
                //$('textarea.comments_form__textarea').val(response.imageData).trigger('change');
            });
        } else {
            var popup = $('.b_tjext__popup');
            if(popup.hasClass('b_tjext__popup-hide')) {
                popup.removeClass('b_tjext__popup-hide');
            } else {
                popup.addClass('b_tjext__popup-hide');
            }
        }
    });
    $(document).on('click', '.b_tjext__popup_item', function () {
        var url = $(this).data('url');
        btnVideo.click();
        setTimeout(function () {
            var input = $('.popup__content--popup_attach_service input');
            input.val(url);
            var e = jQuery.Event("keydown");
            e.which = 50;
            e.ctrlKey = true;
            $('.popup__content--popup_attach_service input').trigger(e);
        },500);
    });
    $(document).on('keyup', '.b_tjext__popup_footer_input', function (e) {
        var gifList = $('.b_tjext__popup_list');
        var q = $(this).val();
        gifList.html('');
        if(q.length > 3) {
            searchUrl = searchUrl.replace('{OFFSET}',searchOffset);
            var url = searchUrl + q;
            $.get(url, function (resp) {
                searchOffset = 50;
                $.each(resp.data, function (i,d) {
                    // console.log(i,d);
                    var item = $('<div class="b_tjext__popup_item"></div>');
                    item.css('background-image','url('+d.images.fixed_width_small.url+')');
                    item.data('url', d.url);
                    gifList.append(item);
                });
            })
        }
    });
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