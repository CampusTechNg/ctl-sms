function resizeFrame() {
    var main_frame = $('.main_frame');
    var window_height = $(window).height();
    var window_width = $(window).width();
    var page_header = $('.page-header').height();
    var min_height;

    if( window_width < 481 ) {
        min_height = window_height - 100;
        main_frame.attr('style', 'min-height:' + min_height + 'px');
        main_frame.attr({width:'100%'});
    }
    else {
        min_height = window_height - page_header;
        main_frame.attr('style', 'min-height:' + min_height + 'px');
        main_frame.attr({width:'100%'});
    }
}

resizeFrame();

$( window ).resize(function() {
    resizeFrame();
});