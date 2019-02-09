var blogSettings = {};

function goDiscovery() {
  try{
    var cb = document.getElementById('discoverybtn'); 
      cb.dispatchEvent(new MouseEvent('click', {
        view: window
      }));
  } catch(e){ window.location.assign('/discover');}
};

var resetGridMasonFunction = function(t) {
        var e = t("html"),
            i = t("body"),
            n = "ontouchstart" in window;
        n && i.removeClass("no-touch").addClass("touch"), i.removeClass("no-js");
        var o = "",
            r = t(".krown-id-grid");
        if (0 < t(".krown-id-grid").length) {
            i.append('<div id="responsive-test"><div id="p780"></div><div id="p580"></div><div>');
            var s = t("#p780"),
                a = t("#p580");
            t(".krown-id-grid").imagesLoaded(function() {
                r.each(function() {
                    var e = "#" + t(this).attr("id");
                    if (t(".krown-tabs").children(".contents").children("div").css("display", "block"), t(this).hasClass("carousel")) {
                        var i = t(this),
                            n = t(this).find(".carousel-holder"),
                            o = t(this).find(".krown-id-item"),
                            r = t(this).find(".btn-next"),
                            h = t(this).find(".btn-prev"),
                            c = "block" == a.css("display") ? 2 : "block" == s.css("display") ? 3 : parseInt(n.data("visible"));
                        i.width(), parseInt(o.eq(0).css("marginLeft"));
                        var l = !0;
                        n.css("position", "absolute"), o.css("left", 0), i.data({
                            items: o,
                            visNo: n.data("visible"),
                            visWidth: i.width() + 2 * parseInt(o.eq(0).css("marginLeft")),
                            page: 0,
                            pages: Math.ceil(o.length / c) - 1
                        }), (i = new Hammer(i[0])).on("swipeleft", function(t) {
                            r.trigger("click")
                        }), i.on("swiperight", function(t) {
                            h.trigger("click")
                        }), r.on("click", function(e) {
                            var i = t(this).closest(".carousel"),
                                n = i.data("items"),
                                o = i.data("page"),
                                s = i.data("pages"),
                                a = i.data("visNo"),
                                c = i.data("visWidth");
                            if (l && o + 1 <= s) {
                                l = !1, i.data("page", ++o), o + 1 <= s ? r.removeClass("disabled") : r.addClass("disabled"), 0 <= o - 1 ? h.removeClass("disabled") : h.addClass("disabled");
                                var d = 0,
                                    u = (o - 1) * a;
                                t.grep(n, function(t, e) {
                                    e >= u ? n.eq(e).stop().delay(50 * d++).animate({
                                        left: -c * o
                                    }, 200, "easeInQuint") : n.eq(e).stop().animate({
                                        left: -c * o
                                    }, 0)
                                }), setTimeout(function() {
                                    l = !0
                                }, 100 * a + 200)
                            }
                            e.preventDefault()
                        }), h.on("click", function(e) {
                            var i = t(this).closest(".carousel"),
                                n = i.data("items"),
                                o = i.data("page"),
                                s = i.data("pages"),
                                a = i.data("visNo"),
                                c = i.data("visWidth");
                            if (l && 0 <= o - 1) {
                                l = !1, i.data("page", --o), o + 1 <= s ? r.removeClass("disabled") : r.addClass("disabled"), 0 <= o - 1 ? h.removeClass("disabled") : h.addClass("disabled");
                                var d = (o + 2) * a - 1,
                                    u = d + 1;
                                t.grep(n, function(t, e) {
                                    e < u ? n.eq(e).stop().delay(50 * d--).animate({
                                        left: -c * o
                                    }, 200, "easeInQuint") : n.eq(e).stop().animate({
                                        left: -c * o
                                    }, 0)
                                }), setTimeout(function() {
                                    l = !0
                                }, 100 * a + 200)
                            }
                            e.preventDefault()
                        }).addClass("disabled")
                    } else t(this).imagesLoaded(function() {
                        t(e).isotope({
                            itemSelector: ".krown-id-item",
                            layoutMode: "masonry"
                        })
                    });
                    setTimeout(function() {
                        t(".krown-tabs").children(".contents").children("div:nth-child(1n+2)").css("display", "none")
                    }, t(this).hasClass("carousel") ? 100 : 1e3)
                })
            });
            var h = t(window).width();
            t(window).on("resize", function() {
                h != t(window).width() && (h = t(window).width(), r.each(function() {
                    if (t(this).hasClass("carousel")) {
                        var e = t(this).find(".carousel-holder"),
                            i = t(this).find(".krown-id-item"),
                            n = 0,
                            o = (n = t(this).closest(".krown-tabs")).children(".contents").children("div");
                        o.each(function() {
                            t(this).data("display", t(this).css("display")).css("display", "block")
                        }), e.css("position", "absolute"), e.parent().css("height", e.height()), n = "block" == a.css("display") ? 2 : "block" == s.css("display") ? 3 : parseInt(e.data("visible")), t(this).data({
                            items: i,
                            visNo: n,
                            visWidth: t(this).width() + 2 * parseInt(i.eq(0).css("marginLeft")),
                            page: 0,
                            pages: Math.ceil(i.length / n) - 1
                        }), i.css("left", 0), t(this).find(".btn-prev").addClass("disabled"), t(this).find(".btn-next").removeClass("disabled"), o.each(function() {
                            t(this).css("display", t(this).data("display"))
                        })
                    } else n = t(this).closest(".krown-tabs"), o = n.children(".contents").children("div"), o.each(function() {
                        "yes" != t(this).data("lock") && (t(this).data("lock", "yes"), t(this).data("display", t(this).css("display")).css("display", "block"))
                    }), setTimeout(function() {
                        o.each(function() {
                            t(this).css("display", t(this).data("display")).data("lock", "no")
                        })
                    }, 1e3)
                }))
            })
        }
        if (i.hasClass("single-ignition_product")) {
            var c = t("#project-sidebar");
            c.find(".product-wrapper, .id-product-proposed-end, .btn-container").wrapAll('<div class="panel clearfix">'), c.find(".id-widget.ignitiondeck").removeClass("ignitiondeck"), c.find("#project-p-author").appendTo(c.find(".separator")), c.find(".poweredbyID").appendTo(c), c.find(".main-btn").addClass("krown-button medium color"), c.find(".id-progress-raised, .id-product-funding, .id-product-total, .id-product-pledges, .id-product-days, .id-product-days-to-go").wrapAll('<div class="rholder">'), c.find(".id-progress-raised, .id-product-funding").wrapAll('<div class="rpdata">'), c.find(".id-product-total, .id-product-pledges").wrapAll('<div class="rpdata">'), c.find(".id-product-days, .id-product-days-to-go").wrapAll('<div class="rpdata">'), c.find(".product-wrapper").addClass("clearfix"), t(".id-level-desc:empty").remove(), t(".ignitiondeck.idstretch").prev().addClass("idst"), t(".id-widget .progress-percentage, .idstretch-percentage").each(function() {
                var e = parseFloat(t(this).text().replace(",", ""));
            }), c.find(".id-widget .krown-pie").clone().prependTo(c.find(".rtitle")), c.find(".rtitle").find(".krown-pie").removeClass("large").addClass("small");
            var l = t("#page-title"),
                d = c.find(".btn-container"),
                u = 0 < d.find("a").length,
                p = 90,
                f = !1,
                m = !0;
            i.append('<div id="responsive-test"><div id="p780"></div><div id="p580"></div><div>'), s = t("#p780"), a = t("#p580"), u || (c.css("paddingBottom", "0"), p = -10), c.find(".rtitle").click(function() {
                if (m)
                    if (m = !1, f) t(this).removeClass("opened"), d.css("display", "none"), c.stop().animate({
                        height: 100
                    }, {
                        duration: 250,
                        easing: "easeInQuad",
                        step: function(t) {
                            l.css("paddingTop", t - 10)
                        },
                        complete: function() {
                            m = !0
                        }
                    }), f = !1;
                    else {
                        t(this).addClass("opened"), c.css("height", "auto");
                        var e = c.outerHeight();
                        c.css("height", 100), c.stop().animate({
                            height: e
                        }, {
                            duration: 350,
                            easing: "easeInQuad",
                            step: function(t) {
                                l.css("paddingTop", t - 10)
                            },
                            complete: function() {
                                m = !0, d.css({
                                    top: c.outerHeight() - 225,
                                    display: "block"
                                })
                            }
                        }), f = !0
                    }
            }), t(window).resize(function() {
                "block" == s.css("display") || "block" == a.css("display") ? (u || (c.css("paddingBottom", "0"), p = -10), f ? (c.css("height", "auto"), l.css("paddingTop", c.height() + p), d.css("top", c.height() - 125), d.css("display", "block")) : (c.css("height", 100), l.css("paddingTop", 90), d.css("display", "none"))) : (l.css("paddingTop", 0), c.css("height", "auto"), d.css("display", "block")), m = !0
            })
        }
        if (i.hasClass("archive") || (t(".backer_data .id-backer-links").insertAfter(".backer_title h3"), t(".backer_info .backer_title > p").appendTo(".backer_info")), 0 < t(".dashboardmenu").length) {
            var g = t(".dashboardmenu").find("li");
            o = '<div class="tabs-select"><select>';
            g.each(function() {
                o += "<option>" + t(this).find("a").text() + "</option>"
            }), o += "</select></div>", t(".dashboardmenu").append(o).find(".tabs-select").find("select").change(function() {
                document.location.href = g.eq(t(this).find("option:selected").index()).find("a").prop("href")
            }), t("#edit-profile").find(".form-row:nth-of-type(1), .form-row:nth-of-type(4), .form-row:nth-of-type(6), .form-row:nth-of-type(8), .form-row:nth-of-type(10)").addClass("first")
        }
        0 < t(".insert-map").length && t(".insert-map").each(function() {
            var e, i = t(this),
                o = [{
                    featureType: "all",
                    elementType: "all",
                    stylers: [{
                        saturation: -100
                    }]
                }];
            e = {
                zoom: i.data("zoom"),
                center: new google.maps.LatLng(i.data("map-lat"), i.data("map-long")),
                streetViewControl: !1,
                scrollwheel: !1,
                panControl: !0,
                mapTypeControl: !1,
                overviewMapControl: !1,
                zoomControl: !1,
                draggable: !n,
                zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.LARGE
                },
                mapTypeControlOptions: {
                    mapTypeIds: [google.maps.MapTypeId.ROADMAP, "krownMap"]
                }
            }, e = new google.maps.Map(document.getElementById(i.attr("id")), e), "d-true" == i.data("greyscale") && (o = new google.maps.StyledMapType(o, {
                name: "Grayscale"
            }), e.mapTypes.set("krownMap", o), e.setMapTypeId("krownMap")), "d-true" == i.data("marker") && (o = new google.maps.LatLng(i.data("map-lat"), i.data("map-long")), new google.maps.Marker({
                position: o,
                map: e,
                icon: i.data("marker-img")
            })), setTimeout(function() {
                i.animate({
                    opacity: 1
                }, 400).parent().addClass("remove-preloader")
            }, 2e3)
        }), t("p:empty").remove(), 0 < (i = t(".project-header").find(".video-container").children("iframe")).length && 0 < i.attr("src").indexOf("youtube") && (q = 0 < i.attr("src").indexOf("?") ? i.attr("src") + "&wmode=opaque" : i.attr("src") + "?wmode=opaque", i.attr("src", q)), t("#content").fitVids(), t(".touch #header #searchform").on("click.search", function(e) {
            t(this).addClass("hover").off("click.search"), e.preventDefault()
        }), t(".krown-accordion").each(function() {
            var e = !!t(this).hasClass("toggle"),
                i = t(this).children("section"),
                n = "-1" == t(this).data("opened") ? null : i.eq(parseInt(t(this).data("opened")));
            null != n && (n.addClass("opened"), n.children("div").slideDown(0)), t(this).children("section").children("h5").click(function() {
                var i = t(this).parent();
                e || null == n || (n.removeClass("opened"), n.children("div").stop().slideUp(300)), i.hasClass("opened") && e ? (i.removeClass("opened"), i.children("div").stop().slideUp(300)) : i.hasClass("opened") || (n = i, i.addClass("opened"), i.children("div").stop().slideDown(300))
            })
        }), t(".krown-form").each(function() {
            function e(t) {
                t.removeClass("contact-error-border"), h.fadeOut()
            }
            var i = t(this).find("form"),
                n = t(this).find(".name"),
                o = t(this).find(".email"),
                r = t(this).find(".subject"),
                s = t(this).find(".message"),
                a = t(this).find(".success-message"),
                h = t(this).find(".error-message");
            n.focus(function() {
                e(t(this))
            }), o.focus(function() {
                e(t(this))
            }), r.focus(function() {
                e(t(this))
            }), s.focus(function() {
                e(t(this))
            }), i.submit(function(e) {
                function c(t) {
                    t.val(t.data("value")), t.addClass("contact-error-border"), h.fadeIn()
                }
                var l = !0;
                (3 > n.val().length || n.val() == n.data("value")) && (c(n), l = !1), "" != o.val() && o.val() != o.data("value") && /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(o.val()) || (c(o), l = !1), (5 > s.val().length || s.val() == s.data("value")) && (c(s), l = !1), t(this).hasClass("full") && (3 > r.val().length || r.val() == r.data("value")) && (c(r), l = !1), l && (i.fadeOut(), t.ajax({
                    type: i.prop("method"),
                    url: i.prop("action"),
                    data: i.serialize(),
                    success: function() {
                        a.fadeIn()
                    }
                })), e.preventDefault()
            })
        }), t("img.alignleft, img.alignright, img.aligncenter").parent("a").each(function() {
            t(this).attr("class", "fancybox fancybox-thumb " + t(this).children("img").attr("class"))
        }), (0 < t(".fancybox").length || 0 < t('div[id*="attachment"]').length) && (t('.fancybox:not(.inline), div[id*="attachment"] > a').fancybox({
            padding: 0,
            margin: 50,
            aspectRatio: !0,
            scrolling: "no",
            mouseWheel: !1,
            openMethod: "zoomIn",
            closeMethod: "zoomOut",
            nextEasing: "easeInQuad",
            prevEasing: "easeInQuad"
        }).append("<span></span>"), t(".fancybox.inline").fancybox({
            padding: 0,
            maxWidth: 250,
            maxHeight: 300,
            fitToView: !1,
            width: "250px",
            height: "350px",
            autoSize: !1,
            closeClick: !1,
            openEffect: "none",
            closeEffect: "none"
        })), 0 < t(".krown-pie").length && !e.hasClass("ie8") && (t(".krown-pie").each(function() {
            var e = t(this).hasClass("large") ? 274 : 122;
            t(this).find(".holder").append('<div class="pie-holder"><canvas class="pie-canvas" width="' + e + '" height="' + e + '"></canvas></div>')
        }), t(".krown-pie").each(function() {
            var e, i = t(this).find(".value"),
                n = t(this).find(".pie-canvas")[0],
                o = t(this).data("color"),
                r = t(this).hasClass("large") ? new ProgressCircle({
                    canvas: n,
                    minRadius: 115,
                    arcWidth: 18,
                    centerX: 136,
                    centerY: 136
                }) : new ProgressCircle({
                    canvas: n,
                    minRadius: 52,
                    arcWidth: 6,
                    centerX: 62,
                    centerY: 60
                }),
                s = 0;
            r.addEntry({
                fillColor: o,
                progressListener: function() {
                    return s
                }
            }), "0" != parseFloat(i.data("percent")) && function(t, n) {
                s = 0, clearInterval(e), r.stop();
                var o = 0,
                    a = n / t;
                r.start(5), e = setInterval(function() {
                    s += .0025, o = Math.round(100 * s * a), s >= t / 100 && (r.stop(), clearInterval(e), s = 0), i.html(o + "<sup>%</sup>")
                }, 5)
            }(Math.min(parseFloat(i.data("percent")), 100), parseFloat(i.text()))
        })), t(".krown-tabs").each(function() {
            var e = t(this).children(".titles").children("li"),
                i = t(this).children(".contents").children("div"),
                n = e.eq(0),
                o = i.eq(0),
                r = t(this).hasClass("fade") ? "fade" : "tab";
            if (n.addClass("opened"), o.stop().slideDown(0), e.find("a").prop("href", "#").off("click"), e.click(function(e) {
                    n.removeClass("opened"), (n = t(this)).addClass("opened"), "fade" == r ? (o.stop().fadeOut(250), (o = i.eq(t(this).index())).stop().delay(250).fadeIn(300)) : (o.stop().slideUp(250), (o = i.eq(t(this).index())).stop().delay(250).slideDown(300)), h && a.val(t(this).text()), e.preventDefault()
                }), t(this).hasClass("responsive-on")) {
                var s = '<div class="tabs-select"><select>';
                e.each(function() {
                    s += "<option>" + t(this).find("h5").text() + "</option>"
                }), s += "</select></div>", t(this).children(".titles").append(s).find(".tabs-select").find("select").change(function() {
                    e.eq(t(this).find("option:selected").index()).trigger("click")
                })
            }
            var a = t(this).find(".tabs-select").find("select"),
                h = !!t(this).hasClass("responsive-on")
        }), t(".krown-twitter.rotenabled").each(function() {
            var e = t(this).children("ul").children("li"),
                i = 0;
            setInterval(function() {
                e.eq(i).fadeOut(250), ++i == e.length && (i = 0), e.eq(i).delay(260).fadeIn(300)
            }, 6e3)
        }), t(".flexslider.mini").each(function() {
            var e = t(this);
            1 < e.find("li").length ? t(this).fitVids().flexslider({
                animation: "slide",
                easing: "easeInQuad",
                animationSpeed: 300,
                slideshow: !0,
                directionNav: !0,
                controlNav: !1,
                keyboard: !1,
                start: function(t) {
                    t.container && t.container.delay(131).animate({
                        opacity: 1
                    }, 300)
                }
            }) : e.removeClass("flexslider")
        }), t(".rev_slider_wrapper").find("video").data("no-mejs", "true"), 0 < t("#content").find("audio, video").length && (t("#content").find("video").attr({
            width: "100%",
            height: "100%",
            style: "width:100%;height:100%"
        }), t("#content").find("audio, video").each(function() {

        })), t(window).on("scroll.menu", function() {
            500 > t(this).scrollTop() || t(this).scrollTop()
        }), t(window).trigger("scroll")
};

function doResetGrid() {
    setTimeout(function() {
        resetGridMasonFunction($);
    }, 144);
}

Template.splashPage.onRendered(function() {
  $(document).ready(function() {
    if (localStorage.getItem('doShowLock')==='true'||localStorage.getItem('doShowLock')===true) {
      setTimeout(function() {
        localStorage.setItem('doShowLock', false);
        lock.show();
      }, 1597);
    };
    $(window).resize(function() {
      $('.holder').css('height', '');
    });
  });
});


Template.editor.events({
  // Pressing Ctrl+Enter should submit the form.
  'keydown textarea': function(event, t) {
      if (event.keyCode == 13 && (event.metaKey || event.ctrlKey)) {
          $(event.currentTarget).parents('form:first').submit();
      }
  },
});

Template.signin.events({
  // Pressing Ctrl+Enter should submit the form.
  'click .login': function() {
		lock.show();
	}
});

Template.splashPage.events({
  // Pressing Ctrl+Enter should submit the form.
  'click .login': function() {
    if (window.location.href.indexOf('/projects')>-1||window.location.href.indexOf('/profile')>-1) {
      localStorage.setItem('doShowLock', true);
      window.location.assign('/');
    } else {
      localStorage.removeItem('redirectURL');
      lock.show();      
    }
  },

  'click .create': function() {
    localStorage.setItem('redirectURL', '/create');
    lock.show();
  },
  'click .goDiscover': function() {
      localStorage.removeItem('redirectURL');
      goDiscovery();
  },
  'click #sendMsg': function() {
    /** get message and subject / email, and send email */
    var o = {
      name: $('#msg_name').val(),
      email: $('#msg_email').val(),
      subject: $('#msg_subject').val(),
      message: $('#message').val()
    };
    if (!o.name||!o.email||!o.subject||!o.message) return vex.dialog.alert('please fill out all fields of the contact form to proceed');
    Meteor.call('splashMessage', o);
    $('#contact_us_form')[0].reset()
    $('#sendmessage').show();
  }
});

Template.splashPage.helpers({
  projects: function() {
    return Projects.find({
        archived: false
    }, {limit: 16}).fetch().map(function(i) {
      return {
        slug: i.slug,
        title: i.title,
        ownerId: i.ownerId,
        banner: i.banner,
        purpose: i.purpose,
        genre: i.genre, 
        funded: i.funded||0,
        category: i.category,
        logline: i.logline,
        ownerName: i.ownerName,
        cast: i.cast,
        crew: i.crew
      }
    });
  },
  ifProjs: function() {
    return Projects.find({
        archived: false
    }).count();
  },
  hotLN: function() {
    return Projects.find({
        archived: false
    }).count() > 20;
  },
  blogs: function() {
    // get blogs
    return Blogs.find({}, { sort: { created: -1 }, limit: 16 });
  }
})

Template.newBlog.events({
  'change #banner_file': function(e, template) {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      var reader = new FileReader();
      var files = e.target.files;
      var file = files[0];
      if (file.type.indexOf("image")==-1) {
        vex.dialog.alert('Invalid File, you can only upload a static image for your banner picture');
        return;
      };
      reader.onload = function(readerEvt) {
          blogSettings.banner = readerEvt.target.result;
          /** set file.name to span of inner el */
          $('#banner_file_name').text(file.name);
          $('#hidden_banner_name').show();
        }; 
      reader.readAsDataURL(file);
    }
  },
  'change #image_file': function(e, template) {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      var reader = new FileReader();
      var files = e.target.files;
      var file = files[0];
      if (file.type.indexOf("image")==-1) {
        vex.dialog.alert('Invalid File, you can only upload a static image for your main picture');
        return;
      };
      reader.onload = function(readerEvt) {
          blogSettings.image = readerEvt.target.result;
          /** set file.name to span of inner el */
          $('#image_file_name').text(file.name);
          $('#hidden_image_name').show();
        }; 
      reader.readAsDataURL(file);
    }
  },
  'click #create_article': function(e) {
    e.preventDefault();
    /**
        image file
        summernote html & text
        title.trim()
        category:selected
        tags.split(',').trim()
      */
    var options = {};
    options.htmlText = $('#summernote').summernote('code').replace(/(<script.*?<\/script>)/g, '');
    options.plainText = $("#summernote").summernote('code')
        .replace(/<\/p>/gi, " ")
        .replace(/<br\/?>/gi, " ")
        .replace(/<\/?[^>]+(>|$)/g, "")
        .replace(/&nbsp;|<br>/g, " ")
        .trim();

    if (options.plainText&&options.plainText==='Enter or paste writing here. Use the menu above to format text and insert images from a valid URL.') {
      vex.dialog.alert('you did not enter your article\'s writing');
      return;
    }
    options.title = $('#title').val().trim();
    if (!options.title) {
      vex.dialog.alert('please enter a title');
      return;
    };
    options.teaser = $('#excerpt').val();
    if (!options.teaser) {
      vex.dialog.alert('please enter a short teaser');
      return;
    };
    options.summary = $('#summary').val();
    if (!options.summary) {
      vex.dialog.alert('please enter a summary');
      return;
    };
    var ts = $('#tags').val();
    try {
      ts = ts.trim();
    } catch(e) {};
    if (!ts) {
      vex.dialog.alert('please include at least one meaningful tag');
      return;
    };
    options.tags = ts.split(',').map(function(t) { return t.toLowerCase().trim(); });
    options.category = $('#category').find(":selected").text();
    if (options.category.indexOf('Category')>-1) {
      vex.dialog.alert('please select a category');
      return;
    }
    options._image = blogSettings.image;
    options._banner = blogSettings.banner;

    Meteor.call('createBlog', options);

    $('#title').val('');
    $('#excerpt').val('');
    $('#summary').val('');
    $('#tags').val('');
    $('#category').val('Select Category');
    $('.note-editable').html('<p><span class="large">Enter or paste writing here.</span><br>Use the menu above to format text and insert images from a valid URL.</p><p>&nbsp;</p>');
    delete blogSettings['image'];
    delete blogSettings['banner'];
  }
});

Template.newBlog.onRendered(function() {
  blogSettings = {};
  blogSettings.banner = {};
  $(document).ready(function() {
    $('#summernote').summernote({
      toolbar: [
        // [groupName, [list of button]]
        ['style', ['clear', 'fontname', 'strikethrough', 'superscript', 'subscript', 'fontsize', 'color']],
        ['para', ['ul', 'ol', 'paragraph', 'style']],
        ['height', ['height']],
        ['misc', ['undo', 'redo']],
        ['insert', ['picture', 'table', 'hr']]
      ],
      height: 300,
      minHeight: null,
      maxHeight: null,
      focus: false,
      tooltip: false,
      callbacks: {
        onInit: function() {
          $('.note-editable').html('<p><span class="large">Enter or paste writing here.</span><br>Use the menu above to format text and insert images from a valid URL.</p><p>&nbsp;</p>');
          $('.note-toolbar').css('z-index', '0');
        }
      }
    });
  });
});

Template.blog.helpers({
  shareData: function() {
      ShareIt.configure({
          sites: {
              'facebook': {
                  'appId': '1790348544595983'
              }
          }
      });

      var backupURL = 'https://opensourcehollywood.org/blog/'+this._id;
      return {
        title: this.title,
        author: 'Open Source Hollywood',
        excerpt: this.teaser,
        summary: this.summary,
        description: this.plainText,
        thumbnail: this.image,
        image: this.image,
        url: backupURL
      }
  },
  moment: function() {
    var d = this.created || new Date;
    return moment(d).format('MMMM Do, YYYY');
  },
  _tags: function() {
    return this.tags.join(', ');
  },
  _htmlText: function() {
    var was = this;
    setTimeout(function() {
      $('#htmlText').html(was.htmlText);
    }, 1000);
  }
})

Template.blog.onRendered(function() {
   setTimeout(function() {
      $('.fb-share').html('<li class="fa fa-facebook"></li>');
      $('.tw-share').html('<li class="fa fa-twitter"></li>');
      $('.pinterest-share').html('<li class="fa fa-pinterest"></li>');
      $('.googleplus-share').html('<li class="fa fa-google-plus"></li>');
   }, 133);


    var disqus_config = function () {
      this.page.url = window.location.href;  // Replace PAGE_URL with your page's canonical URL variable
      this.page.identifier = this.data._id; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
    };
    (function() { // DON'T EDIT BELOW THIS LINE
      var d = document, s = d.createElement('script');
      s.src = 'https://open-source-hollywood-1.disqus.com/embed.js';
      s.setAttribute('data-timestamp', +new Date());
      (d.head || d.body).appendChild(s);
    })();
 });

Template.bloglist.helpers({
    foo: function() {
    console.log(this)

  },
  moment: function() {
    var d = this.created || new Date;
    return moment(d).format('MMMM Do, YYYY');
  }
})