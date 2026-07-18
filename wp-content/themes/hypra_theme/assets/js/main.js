$(document).ready(function () {
    // Our team bios (desktop cards) — hover + click, default to first person
    function showTeamBio(person) {
        if (!person) return;
        $("#our-team .team_description .person_desc").removeClass("active_item");
        $("#our-team .team_description ." + person).addClass("active_item");
        $("#our-team .hide_mob .team_item").removeClass("is-active");
        $('#our-team .hide_mob .team_item[data-person="' + person + '"]').addClass("is-active");
    }

    $("#our-team .hide_mob .team_item").on({
        mouseenter: function () {
            showTeamBio($(this).data("person"));
        },
        mouseleave: function () {
            $("#our-team .team_description .person_desc").removeClass("active_item");
            $("#our-team .hide_mob .team_item").removeClass("is-active");
        }
    });
    // END Our team bios


    // footer copyright year
    var newYear = $('.year-hypra-new').data("year");
    var oldYear = $('.year-hypra').data("year");

    if (newYear > oldYear) {
        $('.year-hypra').show();
    } else {
        $('.year-hypra').hide();
    }
    // END footer copyright year


    // Scroll to top
    $('.to-the-top').click(function () {
        $('html, body').animate({scrollTop: '0px'}, 500);
    })
    // END Scroll to top


    // header change color
    jQuery(window).scroll(function () {

        var scroll_picca = $('.main_content').offset().top;
        var headerH = $('#site-header').height();

        if ($(this).scrollTop() > scroll_picca - (headerH / 2)) {
            $("#site-header").addClass("header_change");
        } else {
            $("#site-header").removeClass("header_change");

        }
    });
    // END header change color


    // Cursor shine

    $(function () {
        var containerLive = $('.main_content').length;
        if ($(window).width() > 1199 && containerLive > 0) {
            var mouseX = 0, mouseY = 0;
            var mouseX = 0, mouseY = 0;

            $(window).mousemove(function (e) {
                coordinate(e);
            });

            function coordinate(e) {
                var offset = $('.main_content').offset();
                mouseX = Math.min(e.pageX - offset.left);
                mouseY = Math.min(e.pageY - offset.top);
                if (mouseX < 0) mouseX = 0;
                if (mouseY < 0) mouseY = 0;
            };

            var follower = $("#pointer1");
            var xp = 0, yp = 0;
            var loop = setInterval(function () {

                xp += (mouseX - (xp + 550)) / 1;
                yp += (mouseY - (yp + 550)) / 1;

                follower.css({left: xp, top: yp});

            }, 1);
        } else {
            $("#pointer1").hide();
        }

    });

    // END Cursor shine

    // menu scroll
    $("#site-header .primary-menu a").on("click", function () {
        let href = $(this).attr("href");
        let hrefN = href.split("/");
        console.log(hrefN)
        let headerH = $("#site-header").height();

        $("html, body").animate({
            scrollTop: $(hrefN[1]).offset().top - headerH
        }, {
            duration: 370,   // по умолчанию «400»
            easing: "linear" // по умолчанию «swing»
        });

        return false;
    });
    // END menu scroll

    /* parallax
    jQuery(window).scroll(function () {
        var element1 = $(".parallax_element_1");
        var element2 = $(".parallax_element_2");
        var element3 = $(".parallax_element_3");
        var offset_t = $(element1).offset().top - $(window).scrollTop();

        if (offset_t < 0) {
            element1.css({top: -(offset_t - 100)});
            element2.css({top: -(offset_t / 4)});
            element3.css({bottom: offset_t / 10});
        } else {
            element1.css({top: 0});
            element2.css({top: 0});
            element3.css({bottom: 0});
        }
    });
    */// END parallax

    // Slick slider - Our Team (mobile profile toggle with 3 dots)
    if ($('.team_content_slider').length && typeof $.fn.slick === 'function') {
        $('.team_content_slider').slick({
            infinite: true,
            autoplay: false,
            arrows: false,
            slidesToShow: 1,
            centerMode: false,
            variableWidth: false,
            slidesToScroll: 1,
            centerPadding: '0',
            dots: true,
            initialSlide: 0,
            adaptiveHeight: true,
        });
    }
    // END Slick slider - Our Team

    // Slick slider - Portfolio
    if ($('.portfolio_content_slider').length && typeof $.fn.slick === 'function') {
        $('.portfolio_content_slider').slick({
            infinite: true,
            autoplay: false,
            arrows: false,
            slidesToShow: 1,
            centerMode: true,
            variableWidth: true,
            slidesToScroll: 1,
            centerPadding: '0',
            dots: true,
            initialSlide: 0,
        });
    }
    // END Slick slider - Portfolio

});