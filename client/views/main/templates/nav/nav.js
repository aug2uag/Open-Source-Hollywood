document.title = "O.S.H.";

Template.nav.onRendered(function() {
  $('.login').mouseenter();
});

Template.nav.helpers({
  finishedLoading: function() {
    return Session.get('connectReady');
  }
})

Template.nav.events({
  'focus .search-query': function() {
    $('.search-query').keyup(function(){
      var text = $('.search-query').val();
      Session.set('query', text)
    })
  },
  'submit #searchForm': function(){
    Router.go('search');
  },
  'click #signout': function() {
    Meteor.logout();
    Meteor.logoutOtherClients();
    window.location = '/';
    document.title = "O.S.H.";
  },
  'click #profile': function() {
    document.title = 'Profile';
  },
  'click #settings': function() {
    document.title = 'Settings';
  },
  'click .login': function() {
    lock.show();
  },
  'click .menu__item': function() {
    $('.burger').click();
  }

});

Template.user_options.events({
  'click .close_burger': function() {
    $('.burger--close').click()
  }
});

Template.user_options.helpers({
  avatar: function() {
    return Meteor.user().avatar;
  },
  who: function() {
    return Meteor.user().firstName + ' ' + Meteor.user().lastName
  },
  specialties: function() {
    return Meteor.user().iam || Meteor.user().interests || [];
  }
});

Template.user_options.onRendered(function() {
  var Menu = (function() {
    var burger = document.querySelector('.burger');
    var menu = document.querySelector('.menu');
    var menuList = document.querySelector('.menu__list');
    var brand = document.querySelector('.menu__brand');
    var menuItems = document.querySelectorAll('.menu__item');
    
    var active = false;
    
    var toggleMenu = function() {
      if (!active) {
        menu.classList.add('menu--active');
        menuList.classList.add('menu__list--active');
        brand.classList.add('menu__brand--active');
        burger.classList.add('burger--close');
        for (var i = 0, ii = menuItems.length; i < ii; i++) {
          menuItems[i].classList.add('menu__item--active');
        }
        
        active = true;
      } else {
        menu.classList.remove('menu--active');
        menuList.classList.remove('menu__list--active');
        brand.classList.remove('menu__brand--active');
        burger.classList.remove('burger--close');
        for (var i = 0, ii = menuItems.length; i < ii; i++) {
          menuItems[i].classList.remove('menu__item--active');
        }
        
        active = false;
      }
    };
    
    var bindActions = function() {
      burger.addEventListener('click', toggleMenu, false);
    };
    
    var init = function() {
      bindActions();
    };
    
    return {
      init: init
    };
    
  }());
  
  Menu.init();
});

$(window).resize(function() {
  var path = $(this);
  var contW = path.width();
  if(contW >= 751){
    document.getElementsByClassName("sidebar-toggle")[0].style.left="200px";
  }else{
    document.getElementsByClassName("sidebar-toggle")[0].style.left="-200px";
  }
});

$(document).ready(function() {
  $(window).error(function(e){
    e.preventDefault();
  });
});
