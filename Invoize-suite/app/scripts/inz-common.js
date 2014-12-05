/**
 * Created by shridhar.punalkar on 12/6/13.
 */
$(document).ready(function() {
    var wh, tt, ww;

    function in_fix_scroller() {
        if ($('.in-fix-scroll').length > 0)
            $('head').append('<style>.in-fix-scroll{width:' + $('#main-content').width() + 'px}</style>');
    }

    $(window).resize(function() {
        wh = $(this).height();
        ww = $(this).width();

        if ($('.inz-ho').length > 0) {
            tt = $('.inz-ho').offset().top;
            $('.inz-ho').css('max-height', (wh - tt - 60)).css('height', (wh - tt - 60));
        }

        if ($('.menu-toggle').is(':hidden') && ww > 768)
            $('.menu-toggle').slideDown(200);

        in_fix_scroller();
    }).load(function() {
        setTimeout(function() {
            in_fix_scroller();
            $('.loader-backdrop').fadeOut(500);
        }, 1000);
    });


    $('body').on('click', '#sidebar-collapse', function() {
        in_fix_scroller();
    }).on('click', '.nav-menu-toggeler', function() {
        if ($('.menu-toggle').is(':visible') && ww < 769)
            $('.menu-toggle').slideUp(200);
        else
            $('.menu-toggle').slideDown(400);
    }).on('click', '.go-back', function() {
        $('.btn-config .dropdown-toggle').html('Configuration    <i class="fa fa-angle-down"></i>');
    });


    $(document).on('click', function(e) {
        $('.btn-pop').each(function() {
            //the 'is' for buttons that trigger popups
            //the 'has' for icons within a button that triggers a popup
            if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                $(this).popover('hide');
            }
        });
    });

    $('.panel-title a').click(function(e) {
        e.preventDefault();
    });

    $("div.loader-backdrop").fadeOut(500);
});