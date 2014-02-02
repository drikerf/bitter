$(function () {
    // Colors string to rgb
    var colors = {red: '#ff0000', green: '00ff00', 
        blue: '#0000ff', white: '#ffffff'};

    // Picture object
    var picture = {}; 
    
    // Current color
    var currentColor = colors.red;
    
    // Get optional id from url
    var picId = window.location.pathname.replace('/','');

    // If picId in url, fill grid
    if (picId != '') {
        getPicture(picId);
    }

    // Gets picture with id from db
    function getPicture(picId) {
        var data = {id: picId};
        // Get picture
        $.ajax({
            url: '/getpicture',
            type: 'GET',
            data: data,
            success: drawPicture,
            contentType: 'json'
        });
    }

    // Draw picture
    function drawPicture(data) {
        // Draw picture
        // Iterate over key, values
        for (var key in data.picture) {
            console.log(key, data.picture[key]);
        
            // Fill pixel
            $('#'+key).css('background', data.picture[key]);
            
            // Add to picture
            picture[key] = data.picture[key];
        }
    }

    // On pix click, fill pix with currentColor
    // and add to picture
    $('.pix').on('click', function () { 
        // If background is same as current or current colors is white,
        // make it white and delete from picture
        if (rgbToHex($(this).css('backgroundColor')) == currentColor ||
            currentColor == colors.white) {
            $(this).css('background', colors.white);
            delete picture[this.id]
        } else {
            // Set background
            $(this).css('background', currentColor);
            // Add to picture
            picture[this.id] = currentColor;
        }
    });

    // On color click, change currentColor
    $('.color').on('click', function () {
        // Get clicked color
        var color = $(this).css('backgroundColor');
        // If color is rgb, convert to hex and store, 
        // else store in currentColor.
        if (color.search('rgb') != -1) {
            currentColor = rgbToHex(color);
        } else {
            currentColor = color;
        }
        // Set .currentColor div bg
        $('.currentColor').css('background', currentColor);
    });

    // Convert rgb to hex
    function rgbToHex(rgb) {
        rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        function hex(x) {
            return ("0" + parseInt(x).toString(16)).slice(-2);
        }
        return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    }
    
    // On share click, save to db and return unique url
    // and fb and twitter share btns.
    $('.shareBtn').on('click', function () {
        // If empty, notify error in #alert
        if (isEmpty(picture)) {
            var alertBoxHTML = '<div class="alert alert-danger alert-dismissable">' + 
                '<button type="button" data-dismiss="alert" ' + 
                'aria-hidden="true" class="close">&times;</button>' +
                '<strong>Draw something first!</strong>'
            $('#content').prepend(alertBoxHTML);
            return;
        }
        
        // Get token
        var token = getToken();
        // Make ajax post.
        $.ajax({
            url: '/add',
            type: 'POST',
            headers: {
                'X-CSRF-Token': token
            },
            data: picture,
            success: notifyUrl,
            'Content-Type': 'application/json'
        });
    });

    function getToken() {
        var token = $('#csrf').val();
        return token;
    }

    // Notify user url when picture is saved
    function notifyUrl(picture) {
        // If null response do nothing.
        if (picture == null ){
            return;
        }
        // Create unique url
        var uniqueUrl = 'http://' + window.location.hostname + '/' + picture.id;
        // Update DOM.
        $('#content').html('<p>Great! So you have unique url for your masterpiece: ' +
                '<a href="' + uniqueUrl + '">' + uniqueUrl + '</a></p>' +
                '<p><a href="https://twitter.com/share" class="twitter-share-button"' +
                'data-url="' + uniqueUrl + '"data-count="none" data-via="drikerf"' +
                'data-text="I just made an awesome really low-res picture: " ' + 
                'data-lang="en">Tweet</a></p><script type="text/javascript"' +
                'src="//platform.twitter.com/widgets.js"></script><a href="/">Again Again Again!</a>'); 
    };

    // Check if Object is empty
    function isEmpty(obj) {
        return Object.keys(obj).length === 0;
    }
});
