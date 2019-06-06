$(document).ready(function () {
    $('.submenu > a').click(function (e) {
        e.preventDefault(); var submenu = $(this).siblings('ul'); var li = $(this).parents('li'); var submenus = $('#sidebar li.submenu ul'); var submenus_parents = $('#sidebar li.submenu'); if (li.hasClass('open')) {
            if (($(window).width() > 768) || ($(window).width() < 479)) { submenu.slideUp(); } else { submenu.fadeOut(250); }
            li.removeClass('open');
        } else {
            if (($(window).width() > 768) || ($(window).width() < 479)) { submenus.slideUp(); submenu.slideDown(); } else { submenus.fadeOut(250); submenu.fadeIn(250); }
            submenus_parents.removeClass('open'); li.addClass('open');
        }
    }); var ul = $('#sidebar > ul'); $('#sidebar > a').click(function (e) {
        e.preventDefault(); var sidebar = $('#sidebar'); if (sidebar.hasClass('open')) { sidebar.removeClass('open'); ul.slideUp(250); } else { sidebar.addClass('open'); ul.slideDown(250); }
    });
    $('.tip').tooltip(); $('.tip-left').tooltip({ placement: 'left' }); $('.tip-right').tooltip({ placement: 'right' }); $('.tip-top').tooltip({ placement: 'top' }); $('.tip-bottom').tooltip({ placement: 'bottom' }); function fix_position() { var uwidth = $('#user-nav > ul').width(); $('#user-nav > ul').css({ width: uwidth, 'margin-left': '-' + uwidth / 2 + 'px' }); var cwidth = $('#content-header .btn-group').width(); $('#content-header .btn-group').css({ width: cwidth, 'margin-left': '-' + uwidth / 2 + 'px' }); }
    $('#style-switcher i').click(function () {
        if ($(this).hasClass('open')) { $(this).parent().animate({ marginRight: '-=190' }); $(this).removeClass('open'); } else { $(this).parent().animate({ marginRight: '+=190' }); $(this).addClass('open'); }
        $(this).toggleClass('icon-arrow-left'); $(this).toggleClass('icon-arrow-right');
    }); $('#style-switcher a').click(function () { var style = $(this).attr('href').replace('#', ''); $('.skin-color').attr('href', 'css/maruti.' + style + '.css'); $(this).siblings('a').css({ 'border-color': 'transparent' }); $(this).css({ 'border-color': '#aaaaaa' }); }); $('.lightbox_trigger').click(function (e) {
        e.preventDefault(); var image_href = $(this).attr("href"); if ($('#lightbox').length > 0) { $('#imgbox').html('<img src="' + image_href + '" /><p><i class="icon-remove icon-white"></i></p>'); $('#lightbox').slideDown(500); }
        else {
            var lightbox = '<div id="lightbox" style="display:none;">' +
                '<div id="imgbox"><img src="' + image_href + '" />' +
                '<p><i class="icon-remove icon-white"></i></p>' +
                '</div>' +
                '</div>'; $('body').append(lightbox); $('#lightbox').slideDown(500);
        }
    });
});