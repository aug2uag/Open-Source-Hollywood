const css = ['core.css', 'images.css', 'forms.css', 'calendar.css', 'sticker.css', 'aging.import.css', 'print.css', 'temp.css', 'datepicker.import.css', 'icons.css', 'body.css', 'header.css', 'attachment.css', 'list.css', 'labels.css', 'member.css', 'fullcalendar.css'];

function clearcss() {
    return css.forEach(function(f) {
        var href = '/css/' + f;
        var _id = 'link[rel=stylesheet][href~="' + href + '"]';
        $(_id).remove();
    });
}

function hasCore() {
    return $("link[href='css/core.css']").length;
}

function hasMain() {
    return $("link[href='css/main.css']").length;   
}



function loadcss(f){
    var href = '/css/' + f;
    var ref=document.createElement("link")
    ref.setAttribute("rel", "stylesheet")
    ref.setAttribute("type", "text/css")
    ref.setAttribute("href", href)
    document.getElementsByTagName("head")[0].appendChild(ref)
};


// Template.editor.rendered = function() {
    // this.$('textarea').textcomplete([
    //     { // emojies
    //         match: /\B:([\-+\w]*)$/,
    //         search: function (term, callback) {
    //             callback($.map(Emoji.values, function (emoji) {
    //                 return emoji.indexOf(term) === 0 ? emoji : null;
    //             }));
    //         },
    //         template: function (value) {
    //             return '<img src="' + Emoji.baseImagePath + value + '.png"></img>' + value;
    //         },
    //         replace: function (value) {
    //             return ':' + value + ':';
    //         },
    //         index: 1
    //     },
    //     { // user mentions
    //         match: /\B@(\w*)$/,
    //         search: function (term, callback) {
    //             var currentBoard = Boards.findOne(Router.current().params.boardId);
    //             callback($.map(currentBoard.members, function (member) {
    //                 var username = Users.findOne(member.userId).username;
    //                 return username.indexOf(term) === 0 ? username : null;
    //             }));
    //         },
    //         template: function (value) {
    //             return value;
    //         },
    //         replace: function (username) {
    //             return '@' + username + ' ';
    //         },
    //         index: 1
    //     }
    // ]);
// };


Template.BoardsLayout.rendered = function() {
    // if (hasCore()) return;
    $('html').css('visibility', 'hidden');
    setTimeout(function() {
        $('html').css('visibility', 'visible');
    }, 610);
    clearcss();
    this.autorun(function() {
        css.forEach(function(f) {
            loadcss(f);
        });
    });
    /** if (!hasMain()) loadcss('main.css'); */
        
    /** document.styleSheets[0].disabled = true; */
}

Template.StaticLayout.rendered = function() {
    /** if (hasCore()) clearcss(); */
    /** if (!hasMain()) loadcss('main.css'); */
    $('html').css('visibility', 'hidden');
    setTimeout(function() {
        $('html').css('visibility', 'visible');
    }, 610);
    clearcss();
    loadcss('main.css');

}


Template.SplashLayout.rendered = function() {
    /** if (hasCore()) clearcss(); */
    /** if (!hasMain()) loadcss('main.css'); */
    /** $('html').css('visibility', 'hidden'); */
    /** setTimeout(function() { */
    /**     $('html').css('visibility', 'visible'); */
    /** }, 55); */
}