﻿/*!
 * This file is part of App Builder
 * For licenses information see App Builder help
 * ©2018 App Builder - https://www.davidesperalta.com
 */

window.App = {};

window.App.Utils = (function () {

  var
    lastSound = 0;

  return {

    strLen: function (text) {
      return text.length;
    },

    trimStr: function (text) {
      return text.trim();
    },

    strSearch: function (text, query) {
      return text.search(query);
    },

    splitStr: function (text, separator) {
      return text.split(separator);
    },

    subStr: function (text, start, count) {
      return text.substr(start, count);
    },

    strReplace: function (text, from, to) {
      return text.replace(from, to);
    },

    strReplaceAll: function (text, from, to) {
      return text.split(from).join(to);
    },

    playSound: function (mp3Url, oggUrl) {
      if (lastSound === 0) {
        lastSound = new Audio();
      }
      if (lastSound.canPlayType('audio/mpeg')) {
        lastSound.src = mp3Url;
        lastSound.type = 'audio/mpeg';
      } else {
        lastSound.src = oggUrl;
        lastSound.type = 'audio/ogg';
      }
      lastSound.play();
    },

    stopSound: function () {
      lastSound.pause();
      lastSound.currentTime = 0.0;
    },

    sleep: function (ms) {
      var
        start = new Date().getTime();
      for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > ms){
          break;
        }
      }
    }
  };
})();

window.App.Modal = (function () {

  var
    stack = [],
    current = 0;

  return {

    insert: function (name) {
      current = stack.length;
      stack[current] = {};
      stack[current].name = name;
      stack[current].instance = null;
      return stack[current];
    },

    getCurrent: function () {
      if (stack[current]) {
        return stack[current].instance;
      } else {
        return null;
      }
    },
    
    removeCurrent: function () {
      stack.splice(current, 1);
      current = current - 1;
      current = (current < 0) ? 0 : current;
    },

    closeAll: function () {
      for (var i = stack.length-1; i >= 0; i--) {
        stack[i].instance.dismiss();
      }
      stack = [];
      current = 0;
    }
  };
})();

window.App.Debugger = (function () {

  return {

    exists: function () {
      return (typeof window.external === 'object')
       && ('hello' in window.external);
    },

    log: function (text, aType, lineNum) {
      if (window.App.Debugger.exists()) {
        window.external.log('' + text, aType || 'info', lineNum || 0);
      } else {
        console.log(text);
      }
    },

    watch: function (varName, newValue, oldValue) {
      if (window.App.Debugger.exists()) {
        if (angular.isArray(newValue)) {
          window.external.watch('', varName, newValue.toString(), 'array');
        } else if (angular.isObject(newValue)) {
          angular.forEach(newValue, function (value, key) {
            if (!angular.isFunction (value)) {
              try {
                window.external.watch(varName, key, value.toString(), typeof value);
              } 
              catch(exception) {}
            }
          });
        } else if (angular.isString(newValue) || angular.isNumber(newValue)) {
          window.external.watch('', varName, newValue.toString(), typeof newValue);
        }
      }
    }
  };
})();

window.App.Module = angular.module
(
  'AppModule',
  [
    'ngRoute',
    'ngTouch',
    'ngAnimate',
    'ngSanitize',
    'blockUI',
    'chart.js',
    'ngOnload',
    'ui.bootstrap',
    'angular-canvas-gauge',
    'com.2fdevs.videogular',
    'com.2fdevs.videogular.plugins.controls',
    'AppCtrls'
  ]
);

window.App.Module.run(function () {
  window.FastClick.attach(document.body);
});

window.App.Module.directive('ngImageLoad',
[
  '$parse',

  function ($parse) {
    return {
      restrict: 'A',
      link: function ($scope, el, attrs) {
        el.bind('load', function (event) {
          var 
            fn = $parse(attrs.ngImageLoad);
          fn($scope, {$event: event});
        });
      }
    };
  }
]);

window.App.Module.directive('ngImageError',
[
  '$parse',

  function ($parse) {
    return {
      restrict: 'A',
      link: function ($scope, el, attrs) {
        el.bind('error', function (event) {
          var 
            fn = $parse(attrs.ngImageError);
          fn($scope, {$event: event});
        });
      }
    };
  }
]);

window.App.Module.directive('ngContextMenu',
[
  '$parse',

  function ($parse) {
    return {
      restrict: 'A',
      link: function ($scope, el, attrs) {
        el.bind('contextmenu', function (event) {
          var
            fn = $parse(attrs.ngContextMenu);
          fn($scope, {$event: event});
        });
      }
    };
  }
]);

window.App.Module.directive('bindFile',
[
  function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function ($scope, el, attrs, ngModel) {
        el.bind('change', function (event) {
          ngModel.$setViewValue(event.target.files[0]);
          $scope.$apply();
        });

        $scope.$watch(function () {
          return ngModel.$viewValue;
        }, function (value) {
          if (!value) {
            el.val('');
          }
        });
      }
    };
  }
]);

window.App.Module.config
([
  '$compileProvider',

  function ($compileProvider) {
    $compileProvider.debugInfoEnabled(window.App.Debugger.exists());
    $compileProvider.imgSrcSanitizationWhitelist
     (/^\s*(https?|blob|ftp|mailto|file|tel|app|data:image|moz-extension|chrome-extension|ms-appdata|ms-appx-web):/);
  }
]);

window.App.Module.config
([
  '$httpProvider',

  function ($httpProvider) {
    if (!$httpProvider.defaults.headers.get) {
      $httpProvider.defaults.headers.get = {};
    }
    if (!$httpProvider.defaults.headers.post) {
      $httpProvider.defaults.headers.post = {};
    }
    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
    $httpProvider.defaults.headers.post['Content-Type'] = undefined;
    $httpProvider.defaults.transformRequest.unshift(function (data) {
      var
        frmData = new FormData();
      angular.forEach(data, function (value, key) {
        frmData.append(key, value);
      });
      return frmData;
    });
}]);

window.App.Module.config
([
  '$provide',

  function ($provide) {
    $provide.decorator('$exceptionHandler',
    ['$injector',
      function ($injector) {
        return function (exception, cause) {
          var
            $rs = $injector.get('$rootScope');

          if (!angular.isUndefined(cause)) {
            exception.message += ' (caused by "'+cause+'")';
          }

          $rs.App.LastError = exception.message;
          $rs.OnAppError();
          $rs.App.LastError = '';

          if (window.App.Debugger.exists()) {
            throw exception;
          } else {
            if (window.console) {
              window.console.error(exception);
            }
          }
        };
      }
    ]);
  }
]);

window.App.Module.config
([
  'blockUIConfig',

  function (blockUIConfig) {
    blockUIConfig.delay = 0;
    blockUIConfig.autoBlock = false;
    blockUIConfig.resetOnException = true;
    blockUIConfig.message = 'Please wait';
    blockUIConfig.autoInjectBodyBlock = false;
    blockUIConfig.blockBrowserNavigation = true;
  }
]);

window.App.Module.config
([
  '$routeProvider',

  function ($routeProvider) {
    $routeProvider.otherwise({redirectTo: "/Main"})
    .when("/Main", {controller: "MainCtrl", templateUrl: "app/views/Main.html"})
    .when("/InfoViewer", {controller: "InfoViewerCtrl", templateUrl: "app/views/InfoViewer.html"})
    .when("/DialogCalendar", {controller: "DialogCalendarCtrl", templateUrl: "app/views/DialogCalendar.html"})
    .when("/DialogWVC", {controller: "DialogWVCCtrl", templateUrl: "app/views/DialogWVC.html"})
    .when("/DialogFAQ", {controller: "DialogFAQCtrl", templateUrl: "app/views/DialogFAQ.html"})
    .when("/Settings", {controller: "SettingsCtrl", templateUrl: "app/views/Settings.html"})
    .when("/CampusMap", {controller: "CampusMapCtrl", templateUrl: "app/views/CampusMap.html"})
    .when("/CampusMapZoomable", {controller: "CampusMapZoomableCtrl", templateUrl: "app/views/CampusMapZoomable.html"})
    .when("/FeedbackPage", {controller: "FeedbackPageCtrl", templateUrl: "app/views/FeedbackPage.html"})
    .when("/SocialMedia", {controller: "SocialMediaCtrl", templateUrl: "app/views/SocialMedia.html"})
    .when("/Calendar", {controller: "CalendarCtrl", templateUrl: "app/views/Calendar.html"})
    .when("/FAQView", {controller: "FAQViewCtrl", templateUrl: "app/views/FAQView.html"})
    .when("/WVCSiteView", {controller: "WVCSiteViewCtrl", templateUrl: "app/views/WVCSiteView.html"})
    .when("/Feedback", {controller: "FeedbackCtrl", templateUrl: "app/views/Feedback.html"});
  }
]);

window.App.Module.service
(
  'AppEventsService',

  ['$rootScope',

  function ($rootScope) {

    function setAppHideEvent() {
      window.document.addEventListener('visibilitychange', function (event) {
        if (window.document.hidden) {
          window.App.Event = event;
          $rootScope.OnAppHide();
          $rootScope.$apply();
        }
      }, false);
    }
    
    function setAppShowEvent() {
      window.document.addEventListener('visibilitychange', function (event) {
        if (!window.document.hidden) {
          window.App.Event = event;
          $rootScope.OnAppShow();
          $rootScope.$apply();
        }
      }, false);
    }    

    function setAppOnlineEvent() {
      window.addEventListener('online', function (event) {
        window.App.Event = event;
        $rootScope.OnAppOnline();
      }, false);
    }

    function setAppOfflineEvent() {
      window.addEventListener('offline', function (event) {
        window.App.Event = event;
        $rootScope.OnAppOffline();
      }, false);
    }

    function setAppResizeEvent() {
      window.addEventListener('resize', function (event) {
        window.App.Event = event;
        $rootScope.OnAppResize();
      }, false);
    }

    function setAppPauseEvent() {
      if (!window.App.Cordova) {
        document.addEventListener('pause', function (event) {
          window.App.Event = event;
          $rootScope.OnAppPause();
          $rootScope.$apply();
        }, false);
      }
    }

    function setAppReadyEvent() {
      if (window.App.Cordova) {
        angular.element(window.document).ready(function (event) {
          window.App.Event = event;
          $rootScope.OnAppReady();
        });
      } else {
        document.addEventListener('deviceready', function (event) {
          window.App.Event = event;
          $rootScope.OnAppReady();
        }, false);
      }
    }

    function setAppResumeEvent() {
      if (!window.App.Cordova) {
        document.addEventListener('resume', function (event) {
          window.App.Event = event;
          $rootScope.OnAppResume();
          $rootScope.$apply();
        }, false);
      }
    }

    function setAppBackButtonEvent() {
      if (!window.App.Cordova) {
        document.addEventListener('backbutton', function (event) {
          window.App.Event = event;
          $rootScope.OnAppBackButton();
        }, false);
      }
    }

    function setAppMenuButtonEvent() {
      if (!window.App.Cordova) {
        document.addEventListener('deviceready', function (event) {
          // http://stackoverflow.com/q/30309354
          navigator.app.overrideButton('menubutton', true);
          document.addEventListener('menubutton', function (event) {
            window.App.Event = event;
            $rootScope.OnAppMenuButton();
          }, false);
        }, false);
      }
    }

    function setAppOrientationEvent() {
      window.addEventListener('orientationchange', function (event) {
        window.App.Event = event;
        $rootScope.OnAppOrientation();
      }, false);
    }

    function setAppVolumeUpEvent() {
      if (!window.App.Cordova) {
        document.addEventListener('volumeupbutton', function (event) {
          window.App.Event = event;
          $rootScope.OnAppVolumeUpButton();
        }, false);
      }
    }

    function setAppVolumeDownEvent() {
      if (!window.App.Cordova) {
        document.addEventListener('volumedownbutton', function (event) {
          window.App.Event = event;
          $rootScope.OnAppVolumeDownButton();
        }, false);
      }
    }

    function setAppKeyUpEvent() {
      document.addEventListener('keyup', function (event) {
        window.App.Event = event;
        $rootScope.OnAppKeyUp();
      }, false);
    }

    function setAppKeyDownEvent() {
      document.addEventListener('keydown', function (event) {
        window.App.Event = event;
        $rootScope.OnAppKeyDown();
      }, false);
    }

    function setAppMouseUpEvent() {
      document.addEventListener('mouseup', function (event) {
        window.App.Event = event;
        $rootScope.OnAppMouseUp();
      }, false);
    }

    function setAppMouseDownEvent() {
      document.addEventListener('mousedown', function (event) {
        window.App.Event = event;
        $rootScope.OnAppMouseDown();
      }, false);
    }

    function setAppViewChangeEvent() {
      angular.element(window.document).ready(function (event) {
        $rootScope.$on('$locationChangeStart', function (event, next, current) {
          window.App.Event = event;
          $rootScope.App.NextView = next.substring(next.lastIndexOf('/') + 1);
          $rootScope.App.PrevView = current.substring(current.lastIndexOf('/') + 1);
          $rootScope.OnAppViewChange();
        });
      });
    }
    
    function setAppWebExtMsgEvent() {
      if (window.chrome) {
        window.chrome.runtime.onMessage.addListener(function (message, sender, responseFunc) {
          $rootScope.App.WebExtMessage = message;
          $rootScope.OnAppWebExtensionMsg();
        });
      }    
    }    

    return {
      init : function () {
        //setAppHideEvent();
        //setAppShowEvent();
        setAppReadyEvent();
        //setAppPauseEvent();
        //setAppKeyUpEvent();
        //setAppResumeEvent();
        //setAppResizeEvent();
        //setAppOnlineEvent();
        //setAppKeyDownEvent();
        //setAppMouseUpEvent();
        //setAppOfflineEvent();
        //setAppVolumeUpEvent();
        //setAppMouseDownEvent();
        //setAppVolumeDownEvent();
        //setAppBackButtonEvent();
        //setAppMenuButtonEvent();
        //setAppViewChangeEvent();
        //setAppOrientationEvent();
        //setAppWebExtMsgEvent();
      }
    };
  }
]);

window.App.Module.service
(
  'AppGlobalsService',

  ['$rootScope', '$filter',

  function ($rootScope, $filter) {

    var setGlobals = function () {    
      $rootScope.App = {};
      var s = function (name, method) {
        Object.defineProperty($rootScope.App, name, { get: method });
      };      
      s('Online', function () { return navigator.onLine; });
      s('WeekDay', function () { return new Date().getDay(); });
      s('Event', function () { return window.App.Event || ''; });
      s('OuterWidth', function () { return window.outerWidth; });
      s('InnerWidth', function () { return window.innerWidth; });
      s('InnerHeight', function () { return window.innerHeight; });
      s('OuterHeight', function () { return window.outerHeight; });
      s('Timestamp', function () { return new Date().getTime(); });
      s('Day', function () { return $filter('date')(new Date(), 'dd'); });
      s('Hour', function () { return $filter('date')(new Date(), 'hh'); });
      s('Week', function () { return $filter('date')(new Date(), 'ww'); });
      s('Month', function () { return $filter('date')(new Date(), 'MM'); });
      s('Year', function () { return $filter('date')(new Date(), 'yyyy'); });
      s('Hour24', function () { return $filter('date')(new Date(), 'HH'); });
      s('Minutes', function () { return $filter('date')(new Date(), 'mm'); });
      s('Seconds', function () { return $filter('date')(new Date(), 'ss'); });
      s('DayShort', function () { return $filter('date')(new Date(), 'd'); });
      s('WeekShort', function () { return $filter('date')(new Date(), 'w'); });
      s('HourShort', function () { return $filter('date')(new Date(), 'h'); });
      s('YearShort', function () { return $filter('date')(new Date(), 'yy'); });
      s('MonthShort', function () { return $filter('date')(new Date(), 'M'); });
      s('Hour24Short', function () { return $filter('date')(new Date(), 'H'); });
      s('Fullscreen', function () { return window.BigScreen.element !== null; });
      s('MinutesShort', function () { return $filter('date')(new Date(), 'm'); });
      s('SecondsShort', function () { return $filter('date')(new Date(), 's'); });
      s('Milliseconds', function () { return $filter('date')(new Date(), 'sss'); });
      s('Cordova', function () {  return angular.isUndefined(window.App.Cordova) ? 'true' : 'false'; });
      s('Orientation', function () { return window.innerWidth >= window.innerHeight ? 'landscape' : 'portrait'; });
      s('ActiveControl', function () { return (window.document.activeElement !== null) ? window.document.activeElement.id : ''; });

      
$rootScope.App.DialogView = "";
$rootScope.App.IdleIsIdling = "false";
$rootScope.App.IdleIsRunning = "false";
$rootScope.App.ID = "com.WVCtribe";
$rootScope.App.Name = "WVC App";
$rootScope.App.ShortName = "WVCtribeApp";
$rootScope.App.Version = "1.0.0";
$rootScope.App.Description = "WVC App for WVC services";
$rootScope.App.AuthorName = "Cameron";
$rootScope.App.AuthorEmail = "";
$rootScope.App.AuthorUrl = "";
$rootScope.App.LanguageCode = "en";
$rootScope.App.TextDirection = "ltr";
$rootScope.App.BuildNumber = 0;
$rootScope.App.Scaled = "scaled";
$rootScope.App.Theme = "Default";
$rootScope.App.Themes = ["Default"];
if ($rootScope.App.Themes.indexOf("Default") == -1) { $rootScope.App.Themes.push("Default"); }
    };

    return {
      init : function () {
        setGlobals();
      }
    };
  }
]);

window.App.Module.service
(
  'AppControlsService',

  ['$rootScope', '$http', '$sce',

  function ($rootScope, $http, $sce) {

    var setControlVars = function () {
      

$rootScope.Image11 = {};
$rootScope.Image11.ABRole = 8001;
$rootScope.Image11.Hidden = "";
$rootScope.Image11.Image = "app/images/stars.jpg";
$rootScope.Image11.Class = "";
$rootScope.Image11.Title = "";
$rootScope.Image11.TooltipText = "";
$rootScope.Image11.TooltipPos = "top";
$rootScope.Image11.PopoverText = "";
$rootScope.Image11.PopoverEvent = "mouseenter";
$rootScope.Image11.PopoverTitle = "";
$rootScope.Image11.PopoverPos = "top";

$rootScope.Image8 = {};
$rootScope.Image8.ABRole = 8001;
$rootScope.Image8.Hidden = "";
$rootScope.Image8.Image = "app/images/blank-yourcalendar.png";
$rootScope.Image8.Class = "";
$rootScope.Image8.Title = "Calendars";
$rootScope.Image8.TooltipText = "";
$rootScope.Image8.TooltipPos = "top";
$rootScope.Image8.PopoverText = "";
$rootScope.Image8.PopoverEvent = "mouseenter";
$rootScope.Image8.PopoverTitle = "";
$rootScope.Image8.PopoverPos = "top";

$rootScope.Image4 = {};
$rootScope.Image4.ABRole = 8001;
$rootScope.Image4.Hidden = "";
$rootScope.Image4.Image = "app/images/entrata.png";
$rootScope.Image4.Class = "";
$rootScope.Image4.Title = "Entrata";
$rootScope.Image4.TooltipText = "";
$rootScope.Image4.TooltipPos = "top";
$rootScope.Image4.PopoverText = "";
$rootScope.Image4.PopoverEvent = "mouseenter";
$rootScope.Image4.PopoverTitle = "";
$rootScope.Image4.PopoverPos = "top";

$rootScope.FAQImage = {};
$rootScope.FAQImage.ABRole = 8001;
$rootScope.FAQImage.Hidden = "true";
$rootScope.FAQImage.Image = "app/images/FAQback.png";
$rootScope.FAQImage.Class = "";
$rootScope.FAQImage.Title = "Frequently Asked Questons";
$rootScope.FAQImage.TooltipText = "";
$rootScope.FAQImage.TooltipPos = "top";
$rootScope.FAQImage.PopoverText = "";
$rootScope.FAQImage.PopoverEvent = "mouseenter";
$rootScope.FAQImage.PopoverTitle = "";
$rootScope.FAQImage.PopoverPos = "top";

$rootScope.Map = {};
$rootScope.Map.ABRole = 8001;
$rootScope.Map.Hidden = "";
$rootScope.Map.Image = "app/images/map-icon1.png";
$rootScope.Map.Class = "";
$rootScope.Map.Title = "Campus Map";
$rootScope.Map.TooltipText = "";
$rootScope.Map.TooltipPos = "top";
$rootScope.Map.PopoverText = "";
$rootScope.Map.PopoverEvent = "mouseenter";
$rootScope.Map.PopoverTitle = "";
$rootScope.Map.PopoverPos = "top";

$rootScope.Image14 = {};
$rootScope.Image14.ABRole = 8001;
$rootScope.Image14.Hidden = "";
$rootScope.Image14.Image = "app/images/peopleback.png";
$rootScope.Image14.Class = "";
$rootScope.Image14.Title = "Social Media";
$rootScope.Image14.TooltipText = "";
$rootScope.Image14.TooltipPos = "top";
$rootScope.Image14.PopoverText = "";
$rootScope.Image14.PopoverEvent = "mouseenter";
$rootScope.Image14.PopoverTitle = "";
$rootScope.Image14.PopoverPos = "top";

$rootScope.Image13 = {};
$rootScope.Image13.ABRole = 8001;
$rootScope.Image13.Hidden = "true";
$rootScope.Image13.Image = "app/images/bugback.png";
$rootScope.Image13.Class = "";
$rootScope.Image13.Title = "Submit Feedback";
$rootScope.Image13.TooltipText = "";
$rootScope.Image13.TooltipPos = "top";
$rootScope.Image13.PopoverText = "";
$rootScope.Image13.PopoverEvent = "mouseenter";
$rootScope.Image13.PopoverTitle = "";
$rootScope.Image13.PopoverPos = "top";

$rootScope.Image15 = {};
$rootScope.Image15.ABRole = 8001;
$rootScope.Image15.Hidden = "";
$rootScope.Image15.Image = "app/images/bashback2.png";
$rootScope.Image15.Class = "";
$rootScope.Image15.Title = "89.1 The Bash";
$rootScope.Image15.TooltipText = "";
$rootScope.Image15.TooltipPos = "top";
$rootScope.Image15.PopoverText = "";
$rootScope.Image15.PopoverEvent = "mouseenter";
$rootScope.Image15.PopoverTitle = "";
$rootScope.Image15.PopoverPos = "top";

$rootScope.Music = {};
$rootScope.Music.ABRole = 10001;
$rootScope.Music.Hidden = "true";
$rootScope.Music.Class = "videogular-container ";
$rootScope.Music.Loop = false;
$rootScope.Music.Autoplay = false;
$rootScope.Music.Sources = [];
$rootScope.Music.Sources.push({src: $sce.trustAsResourceUrl("http://ice7.securenetsystems.net/WVJC?"), type: "video/ogg"});
$rootScope.Music.Tracks = [];

$rootScope.Image6 = {};
$rootScope.Image6.ABRole = 8001;
$rootScope.Image6.Hidden = "true";
$rootScope.Image6.Image = "app/images/WVC-RED-CAFE-BACKUP.png";
$rootScope.Image6.Class = "";
$rootScope.Image6.Title = "Red Cafe Menu";
$rootScope.Image6.TooltipText = "";
$rootScope.Image6.TooltipPos = "top";
$rootScope.Image6.PopoverText = "";
$rootScope.Image6.PopoverEvent = "mouseenter";
$rootScope.Image6.PopoverTitle = "";
$rootScope.Image6.PopoverPos = "top";

$rootScope.Image12 = {};
$rootScope.Image12.ABRole = 8001;
$rootScope.Image12.Hidden = "";
$rootScope.Image12.Image = "app/images/logo_WVC.png";
$rootScope.Image12.Class = "";
$rootScope.Image12.Title = "WVC Website";
$rootScope.Image12.TooltipText = "";
$rootScope.Image12.TooltipPos = "top";
$rootScope.Image12.PopoverText = "";
$rootScope.Image12.PopoverEvent = "mouseenter";
$rootScope.Image12.PopoverTitle = "";
$rootScope.Image12.PopoverPos = "top";

$rootScope.Image2 = {};
$rootScope.Image2.ABRole = 8001;
$rootScope.Image2.Hidden = "true";
$rootScope.Image2.Image = "app/images/settings.png";
$rootScope.Image2.Class = "";
$rootScope.Image2.Title = "Social Media";
$rootScope.Image2.TooltipText = "";
$rootScope.Image2.TooltipPos = "top";
$rootScope.Image2.PopoverText = "";
$rootScope.Image2.PopoverEvent = "mouseenter";
$rootScope.Image2.PopoverTitle = "";
$rootScope.Image2.PopoverPos = "top";

$rootScope.HtmlContent2 = {};
$rootScope.HtmlContent2.ABRole = 6001;
$rootScope.HtmlContent2.Hidden = "true";
$rootScope.HtmlContent2.Class = "ios-inertial-scroll ";
$rootScope.HtmlContent2.Title = "";
$rootScope.HtmlContent2.TooltipText = "";
$rootScope.HtmlContent2.TooltipPos = "top";
$rootScope.HtmlContent2.PopoverText = "";
$rootScope.HtmlContent2.PopoverEvent = "mouseenter";
$rootScope.HtmlContent2.PopoverTitle = "";
$rootScope.HtmlContent2.PopoverPos = "top";

$rootScope.MusicCover = {};
$rootScope.MusicCover.ABRole = 8001;
$rootScope.MusicCover.Hidden = "true";
$rootScope.MusicCover.Image = "http://myweb.iecc.edu/wvjc/content/ALBUM.JPG";
$rootScope.MusicCover.Class = "";
$rootScope.MusicCover.Title = "";
$rootScope.MusicCover.TooltipText = "";
$rootScope.MusicCover.TooltipPos = "top";
$rootScope.MusicCover.PopoverText = "";
$rootScope.MusicCover.PopoverEvent = "mouseenter";
$rootScope.MusicCover.PopoverTitle = "";
$rootScope.MusicCover.PopoverPos = "top";

$rootScope.HtmlContent6 = {};
$rootScope.HtmlContent6.ABRole = 6001;
$rootScope.HtmlContent6.Hidden = "true";
$rootScope.HtmlContent6.Class = "ios-inertial-scroll ";
$rootScope.HtmlContent6.Title = "";
$rootScope.HtmlContent6.TooltipText = "";
$rootScope.HtmlContent6.TooltipPos = "top";
$rootScope.HtmlContent6.PopoverText = "";
$rootScope.HtmlContent6.PopoverEvent = "mouseenter";
$rootScope.HtmlContent6.PopoverTitle = "";
$rootScope.HtmlContent6.PopoverPos = "top";

$rootScope.Button2 = {};
$rootScope.Button2.ABRole = 2001;
$rootScope.Button2.Hidden = "true";
$rootScope.Button2.Title = "";
$rootScope.Button2.TabIndex = -1;
$rootScope.Button2.TooltipText = "";
$rootScope.Button2.TooltipPos = "top";
$rootScope.Button2.PopoverText = "";
$rootScope.Button2.PopoverTitle = "";
$rootScope.Button2.PopoverEvent = "mouseenter";
$rootScope.Button2.PopoverPos = "top";
$rootScope.Button2.Badge = "";
$rootScope.Button2.Icon = "";
$rootScope.Button2.Text = "Button2";
$rootScope.Button2.Class = "btn btn-primary btn-md ";
$rootScope.Button2.Disabled = "";

$rootScope.iFrameInfoViewer = {};
$rootScope.iFrameInfoViewer.ABRole = 4001;
$rootScope.iFrameInfoViewer.Hidden = "";
$rootScope.iFrameInfoViewer.Url = "";
$rootScope.iFrameInfoViewer.Class = "ios-iframe-wrapper ";

$rootScope.BackButtonz = {};
$rootScope.BackButtonz.ABRole = 2001;
$rootScope.BackButtonz.Hidden = "";
$rootScope.BackButtonz.Title = "BackButton";
$rootScope.BackButtonz.TabIndex = -1;
$rootScope.BackButtonz.TooltipText = "";
$rootScope.BackButtonz.TooltipPos = "top";
$rootScope.BackButtonz.PopoverText = "";
$rootScope.BackButtonz.PopoverTitle = "";
$rootScope.BackButtonz.PopoverEvent = "mouseenter";
$rootScope.BackButtonz.PopoverPos = "top";
$rootScope.BackButtonz.Badge = "";
$rootScope.BackButtonz.Icon = "";
$rootScope.BackButtonz.Text = "<strong>Back</strong>";
$rootScope.BackButtonz.Class = "btn btn-danger btn-sm ";
$rootScope.BackButtonz.Disabled = "";

$rootScope.Menu2 = {};
$rootScope.Menu2.ABRole = 6003;
$rootScope.Menu2.Hidden = "";
$rootScope.Menu2.Items = [];
$rootScope.Menu2.Items.push("<h4>Athletics<h4/>");
$rootScope.Menu2.Items.push("<h4>Events<h4/>");
$rootScope.Menu2.Items.push("<h4>Important Dates<h4/>");
$rootScope.Menu2.Items.push("<h4>Learning Skills<h4/>");
$rootScope.Menu2.Items.push("<h4>Trio SSS<h4/>");
$rootScope.Menu2.Items.push("<h4>Error with Calendar? (Inactive)<h4/>");
$rootScope.Menu2.Class = "list-group ";

$rootScope.Button1 = {};
$rootScope.Button1.ABRole = 2001;
$rootScope.Button1.Hidden = "";
$rootScope.Button1.Title = "Back Button";
$rootScope.Button1.TabIndex = -1;
$rootScope.Button1.TooltipText = "";
$rootScope.Button1.TooltipPos = "top";
$rootScope.Button1.PopoverText = "";
$rootScope.Button1.PopoverTitle = "";
$rootScope.Button1.PopoverEvent = "mouseenter";
$rootScope.Button1.PopoverPos = "top";
$rootScope.Button1.Badge = "";
$rootScope.Button1.Icon = "";
$rootScope.Button1.Text = "<strong>Go Back</strong>";
$rootScope.Button1.Class = "btn btn-danger btn-md ";
$rootScope.Button1.Disabled = "";

$rootScope.MenuDialogWVC = {};
$rootScope.MenuDialogWVC.ABRole = 6003;
$rootScope.MenuDialogWVC.Hidden = "";
$rootScope.MenuDialogWVC.Items = [];
$rootScope.MenuDialogWVC.Items.push("<h4><span class=\x22fa fa-question\x22></span> FAQ<h4/>");
$rootScope.MenuDialogWVC.Items.push("<h4><span class=\x22fa fa-address-card\x22></span> Important #’s and E-mails<h4/>");
$rootScope.MenuDialogWVC.Items.push("<!--<h4><span class=\x22fa fa-calendar\x22></span> Combined Calendar<h4/>-->");
$rootScope.MenuDialogWVC.Items.push("<h4><span class=\x22fa fa-graduation-cap\x22></span> Degree Programs<h4/>");
$rootScope.MenuDialogWVC.Items.push("<h4><span class=\x22fa fa-etsy\x22></span> Entrata<h4/>");
$rootScope.MenuDialogWVC.Items.push("<!--<<h4><span class=\x22fa fa-bug\x22></span> Submit an Issue/Suggestion<h4/>-->");
$rootScope.MenuDialogWVC.Class = "list-group ";

$rootScope.Backbutton = {};
$rootScope.Backbutton.ABRole = 2001;
$rootScope.Backbutton.Hidden = "";
$rootScope.Backbutton.Title = "Back Button";
$rootScope.Backbutton.TabIndex = -1;
$rootScope.Backbutton.TooltipText = "";
$rootScope.Backbutton.TooltipPos = "top";
$rootScope.Backbutton.PopoverText = "";
$rootScope.Backbutton.PopoverTitle = "";
$rootScope.Backbutton.PopoverEvent = "mouseenter";
$rootScope.Backbutton.PopoverPos = "top";
$rootScope.Backbutton.Badge = "";
$rootScope.Backbutton.Icon = "";
$rootScope.Backbutton.Text = "<strong>Go Back</strong>";
$rootScope.Backbutton.Class = "btn btn-danger btn-md ";
$rootScope.Backbutton.Disabled = "";

$rootScope.MenuFAQ = {};
$rootScope.MenuFAQ.ABRole = 6003;
$rootScope.MenuFAQ.Hidden = "";
$rootScope.MenuFAQ.Items = [];
$rootScope.MenuFAQ.Items.push("<h4>Financial Aid</span><h4/>");
$rootScope.MenuFAQ.Items.push("<h4>Books<h4/>");
$rootScope.MenuFAQ.Items.push("<h4>Courses<h4/>");
$rootScope.MenuFAQ.Items.push("<h4>Other Assistance<h4/>");
$rootScope.MenuFAQ.Class = "list-group ";

$rootScope.Button10 = {};
$rootScope.Button10.ABRole = 2001;
$rootScope.Button10.Hidden = "";
$rootScope.Button10.Title = "Back Button";
$rootScope.Button10.TabIndex = -1;
$rootScope.Button10.TooltipText = "";
$rootScope.Button10.TooltipPos = "top";
$rootScope.Button10.PopoverText = "";
$rootScope.Button10.PopoverTitle = "";
$rootScope.Button10.PopoverEvent = "mouseenter";
$rootScope.Button10.PopoverPos = "top";
$rootScope.Button10.Badge = "";
$rootScope.Button10.Icon = "";
$rootScope.Button10.Text = "<strong>Go Back</strong>";
$rootScope.Button10.Class = "btn btn-danger btn-md ";
$rootScope.Button10.Disabled = "";

$rootScope.Container1 = {};
$rootScope.Container1.ABRole = 1001;
$rootScope.Container1.Hidden = "";
$rootScope.Container1.Title = "";
$rootScope.Container1.TooltipText = "";
$rootScope.Container1.TooltipPos = "top";
$rootScope.Container1.PopoverText = "";
$rootScope.Container1.PopoverTitle = "";
$rootScope.Container1.PopoverEvent = "mouseenter";
$rootScope.Container1.PopoverPos = "top";
$rootScope.Container1.Class = "";

$rootScope.HeaderHtml = {};
$rootScope.HeaderHtml.ABRole = 6001;
$rootScope.HeaderHtml.Hidden = "";
$rootScope.HeaderHtml.Class = "ios-inertial-scroll ";
$rootScope.HeaderHtml.Title = "";
$rootScope.HeaderHtml.TooltipText = "";
$rootScope.HeaderHtml.TooltipPos = "top";
$rootScope.HeaderHtml.PopoverText = "";
$rootScope.HeaderHtml.PopoverEvent = "mouseenter";
$rootScope.HeaderHtml.PopoverTitle = "";
$rootScope.HeaderHtml.PopoverPos = "top";

$rootScope.Variable1Switch = {};
$rootScope.Variable1Switch.ABRole = 8001;
$rootScope.Variable1Switch.Hidden = "";
$rootScope.Variable1Switch.Image = "";
$rootScope.Variable1Switch.Class = "";
$rootScope.Variable1Switch.Title = "";
$rootScope.Variable1Switch.TooltipText = "";
$rootScope.Variable1Switch.TooltipPos = "top";
$rootScope.Variable1Switch.PopoverText = "";
$rootScope.Variable1Switch.PopoverEvent = "mouseenter";
$rootScope.Variable1Switch.PopoverTitle = "";
$rootScope.Variable1Switch.PopoverPos = "top";

$rootScope.ResetAll = {};
$rootScope.ResetAll.ABRole = 2001;
$rootScope.ResetAll.Hidden = "";
$rootScope.ResetAll.Title = "";
$rootScope.ResetAll.TabIndex = -1;
$rootScope.ResetAll.TooltipText = "";
$rootScope.ResetAll.TooltipPos = "top";
$rootScope.ResetAll.PopoverText = "";
$rootScope.ResetAll.PopoverTitle = "";
$rootScope.ResetAll.PopoverEvent = "mouseenter";
$rootScope.ResetAll.PopoverPos = "top";
$rootScope.ResetAll.Badge = "";
$rootScope.ResetAll.Icon = "";
$rootScope.ResetAll.Text = "RESET ALL";
$rootScope.ResetAll.Class = "btn btn-primary btn-md ";
$rootScope.ResetAll.Disabled = "";

$rootScope.Button13 = {};
$rootScope.Button13.ABRole = 2001;
$rootScope.Button13.Hidden = "";
$rootScope.Button13.Title = "";
$rootScope.Button13.TabIndex = -1;
$rootScope.Button13.TooltipText = "";
$rootScope.Button13.TooltipPos = "top";
$rootScope.Button13.PopoverText = "";
$rootScope.Button13.PopoverTitle = "";
$rootScope.Button13.PopoverEvent = "mouseenter";
$rootScope.Button13.PopoverPos = "top";
$rootScope.Button13.Badge = "";
$rootScope.Button13.Icon = "";
$rootScope.Button13.Text = ""+$rootScope.Variable1+"";
$rootScope.Button13.Class = "btn btn-primary btn-md ";
$rootScope.Button13.Disabled = "";

$rootScope.Watcher2 = {};
$rootScope.Watcher2.ABRole = 30003;
$rootScope.Watcher2.Variable = "";

$rootScope.BackFrame = {};
$rootScope.BackFrame.ABRole = 4001;
$rootScope.BackFrame.Hidden = "true";
$rootScope.BackFrame.Url = "app/files/Images/mapinpng.html";
$rootScope.BackFrame.Class = "ios-iframe-wrapper ";

$rootScope.HtmlContent5 = {};
$rootScope.HtmlContent5.ABRole = 6001;
$rootScope.HtmlContent5.Hidden = "true";
$rootScope.HtmlContent5.Class = "ios-inertial-scroll ";
$rootScope.HtmlContent5.Title = "";
$rootScope.HtmlContent5.TooltipText = "";
$rootScope.HtmlContent5.TooltipPos = "top";
$rootScope.HtmlContent5.PopoverText = "";
$rootScope.HtmlContent5.PopoverEvent = "mouseenter";
$rootScope.HtmlContent5.PopoverTitle = "";
$rootScope.HtmlContent5.PopoverPos = "top";

$rootScope.FullMap = {};
$rootScope.FullMap.ABRole = 8001;
$rootScope.FullMap.Hidden = "true";
$rootScope.FullMap.Image = "app/images/MapinJPG.jpg";
$rootScope.FullMap.Class = "";
$rootScope.FullMap.Title = "";
$rootScope.FullMap.TooltipText = "";
$rootScope.FullMap.TooltipPos = "top";
$rootScope.FullMap.PopoverText = "";
$rootScope.FullMap.PopoverEvent = "mouseenter";
$rootScope.FullMap.PopoverTitle = "";
$rootScope.FullMap.PopoverPos = "top";

$rootScope.TourMap = {};
$rootScope.TourMap.ABRole = 8001;
$rootScope.TourMap.Hidden = "";
$rootScope.TourMap.Image = "app/images/smallCMap.jpg";
$rootScope.TourMap.Class = "";
$rootScope.TourMap.Title = "";
$rootScope.TourMap.TooltipText = "";
$rootScope.TourMap.TooltipPos = "top";
$rootScope.TourMap.PopoverText = "";
$rootScope.TourMap.PopoverEvent = "mouseenter";
$rootScope.TourMap.PopoverTitle = "";
$rootScope.TourMap.PopoverPos = "top";

$rootScope.MainPin = {};
$rootScope.MainPin.ABRole = 8001;
$rootScope.MainPin.Hidden = "";
$rootScope.MainPin.Image = "app/images/pinright.png";
$rootScope.MainPin.Class = "";
$rootScope.MainPin.Title = "";
$rootScope.MainPin.TooltipText = "";
$rootScope.MainPin.TooltipPos = "top";
$rootScope.MainPin.PopoverText = "";
$rootScope.MainPin.PopoverEvent = "mouseenter";
$rootScope.MainPin.PopoverTitle = "";
$rootScope.MainPin.PopoverPos = "top";

$rootScope.FieldPin = {};
$rootScope.FieldPin.ABRole = 8001;
$rootScope.FieldPin.Hidden = "";
$rootScope.FieldPin.Image = "app/images/pinright.png";
$rootScope.FieldPin.Class = "";
$rootScope.FieldPin.Title = "";
$rootScope.FieldPin.TooltipText = "";
$rootScope.FieldPin.TooltipPos = "top";
$rootScope.FieldPin.PopoverText = "";
$rootScope.FieldPin.PopoverEvent = "mouseenter";
$rootScope.FieldPin.PopoverTitle = "";
$rootScope.FieldPin.PopoverPos = "top";

$rootScope.PoolPin = {};
$rootScope.PoolPin.ABRole = 8001;
$rootScope.PoolPin.Hidden = "";
$rootScope.PoolPin.Image = "app/images/pinright.png";
$rootScope.PoolPin.Class = "";
$rootScope.PoolPin.Title = "";
$rootScope.PoolPin.TooltipText = "";
$rootScope.PoolPin.TooltipPos = "top";
$rootScope.PoolPin.PopoverText = "";
$rootScope.PoolPin.PopoverEvent = "mouseenter";
$rootScope.PoolPin.PopoverTitle = "";
$rootScope.PoolPin.PopoverPos = "top";

$rootScope.SciencePin = {};
$rootScope.SciencePin.ABRole = 8001;
$rootScope.SciencePin.Hidden = "";
$rootScope.SciencePin.Image = "app/images/pinright.png";
$rootScope.SciencePin.Class = "";
$rootScope.SciencePin.Title = "";
$rootScope.SciencePin.TooltipText = "";
$rootScope.SciencePin.TooltipPos = "top";
$rootScope.SciencePin.PopoverText = "";
$rootScope.SciencePin.PopoverEvent = "mouseenter";
$rootScope.SciencePin.PopoverTitle = "";
$rootScope.SciencePin.PopoverPos = "top";

$rootScope.CafePin = {};
$rootScope.CafePin.ABRole = 8001;
$rootScope.CafePin.Hidden = "";
$rootScope.CafePin.Image = "app/images/pinright.png";
$rootScope.CafePin.Class = "";
$rootScope.CafePin.Title = "";
$rootScope.CafePin.TooltipText = "";
$rootScope.CafePin.TooltipPos = "top";
$rootScope.CafePin.PopoverText = "";
$rootScope.CafePin.PopoverEvent = "mouseenter";
$rootScope.CafePin.PopoverTitle = "";
$rootScope.CafePin.PopoverPos = "top";

$rootScope.BackArrow = {};
$rootScope.BackArrow.ABRole = 8001;
$rootScope.BackArrow.Hidden = "";
$rootScope.BackArrow.Image = "app/images/back-button1.png";
$rootScope.BackArrow.Class = "";
$rootScope.BackArrow.Title = "Back Button";
$rootScope.BackArrow.TooltipText = "";
$rootScope.BackArrow.TooltipPos = "top";
$rootScope.BackArrow.PopoverText = "";
$rootScope.BackArrow.PopoverEvent = "mouseenter";
$rootScope.BackArrow.PopoverTitle = "";
$rootScope.BackArrow.PopoverPos = "top";

$rootScope.MapToggle = {};
$rootScope.MapToggle.ABRole = 8001;
$rootScope.MapToggle.Hidden = "";
$rootScope.MapToggle.Image = "app/images/gear.png";
$rootScope.MapToggle.Class = "";
$rootScope.MapToggle.Title = "";
$rootScope.MapToggle.TooltipText = "";
$rootScope.MapToggle.TooltipPos = "top";
$rootScope.MapToggle.PopoverText = "";
$rootScope.MapToggle.PopoverEvent = "mouseenter";
$rootScope.MapToggle.PopoverTitle = "";
$rootScope.MapToggle.PopoverPos = "top";

$rootScope.HtmlContent3 = {};
$rootScope.HtmlContent3.ABRole = 6001;
$rootScope.HtmlContent3.Hidden = "";
$rootScope.HtmlContent3.Class = "ios-inertial-scroll ";
$rootScope.HtmlContent3.Title = "";
$rootScope.HtmlContent3.TooltipText = "";
$rootScope.HtmlContent3.TooltipPos = "top";
$rootScope.HtmlContent3.PopoverText = "";
$rootScope.HtmlContent3.PopoverEvent = "mouseenter";
$rootScope.HtmlContent3.PopoverTitle = "";
$rootScope.HtmlContent3.PopoverPos = "top";

$rootScope.Button3 = {};
$rootScope.Button3.ABRole = 2001;
$rootScope.Button3.Hidden = "";
$rootScope.Button3.Title = "";
$rootScope.Button3.TabIndex = -1;
$rootScope.Button3.TooltipText = "";
$rootScope.Button3.TooltipPos = "top";
$rootScope.Button3.PopoverText = "";
$rootScope.Button3.PopoverTitle = "";
$rootScope.Button3.PopoverEvent = "mouseenter";
$rootScope.Button3.PopoverPos = "top";
$rootScope.Button3.Badge = "";
$rootScope.Button3.Icon = "";
$rootScope.Button3.Text = "Button3";
$rootScope.Button3.Class = "btn btn-primary btn-md ";
$rootScope.Button3.Disabled = "";

$rootScope.HtmlContent4 = {};
$rootScope.HtmlContent4.ABRole = 6001;
$rootScope.HtmlContent4.Hidden = "";
$rootScope.HtmlContent4.Class = "ios-inertial-scroll ";
$rootScope.HtmlContent4.Title = "";
$rootScope.HtmlContent4.TooltipText = "";
$rootScope.HtmlContent4.TooltipPos = "top";
$rootScope.HtmlContent4.PopoverText = "";
$rootScope.HtmlContent4.PopoverEvent = "mouseenter";
$rootScope.HtmlContent4.PopoverTitle = "";
$rootScope.HtmlContent4.PopoverPos = "top";

$rootScope.FeedbackiFrame = {};
$rootScope.FeedbackiFrame.ABRole = 4001;
$rootScope.FeedbackiFrame.Hidden = "";
$rootScope.FeedbackiFrame.Url = "https://docs.google.com/forms/d/e/1FAIpQLSdahG3-rJTnijYd_7OGyX8r-fu7yH4Hg3JruvV7sqbbILLpRw/viewform?usp=sf_link?device=mobile";
$rootScope.FeedbackiFrame.Class = "ios-iframe-wrapper ";

$rootScope.Home = {};
$rootScope.Home.ABRole = 2001;
$rootScope.Home.Hidden = "";
$rootScope.Home.Title = "";
$rootScope.Home.TabIndex = -1;
$rootScope.Home.TooltipText = "";
$rootScope.Home.TooltipPos = "top";
$rootScope.Home.PopoverText = "";
$rootScope.Home.PopoverTitle = "";
$rootScope.Home.PopoverEvent = "mouseenter";
$rootScope.Home.PopoverPos = "top";
$rootScope.Home.Badge = "";
$rootScope.Home.Icon = "";
$rootScope.Home.Text = "Home";
$rootScope.Home.Class = "btn btn-primary btn-md ";
$rootScope.Home.Disabled = "";

$rootScope.Image16 = {};
$rootScope.Image16.ABRole = 8001;
$rootScope.Image16.Hidden = "";
$rootScope.Image16.Image = "app/images/stars.jpg";
$rootScope.Image16.Class = "";
$rootScope.Image16.Title = "";
$rootScope.Image16.TooltipText = "";
$rootScope.Image16.TooltipPos = "top";
$rootScope.Image16.PopoverText = "";
$rootScope.Image16.PopoverEvent = "mouseenter";
$rootScope.Image16.PopoverTitle = "";
$rootScope.Image16.PopoverPos = "top";

$rootScope.Image17 = {};
$rootScope.Image17.ABRole = 8001;
$rootScope.Image17.Hidden = "";
$rootScope.Image17.Image = "Images\social\Facebook.png";
$rootScope.Image17.Class = "";
$rootScope.Image17.Title = "";
$rootScope.Image17.TooltipText = "";
$rootScope.Image17.TooltipPos = "top";
$rootScope.Image17.PopoverText = "";
$rootScope.Image17.PopoverEvent = "mouseenter";
$rootScope.Image17.PopoverTitle = "";
$rootScope.Image17.PopoverPos = "top";

$rootScope.Image18 = {};
$rootScope.Image18.ABRole = 8001;
$rootScope.Image18.Hidden = "";
$rootScope.Image18.Image = "Images\social\Instagram.png";
$rootScope.Image18.Class = "";
$rootScope.Image18.Title = "";
$rootScope.Image18.TooltipText = "";
$rootScope.Image18.TooltipPos = "top";
$rootScope.Image18.PopoverText = "";
$rootScope.Image18.PopoverEvent = "mouseenter";
$rootScope.Image18.PopoverTitle = "";
$rootScope.Image18.PopoverPos = "top";

$rootScope.Image19 = {};
$rootScope.Image19.ABRole = 8001;
$rootScope.Image19.Hidden = "";
$rootScope.Image19.Image = "Images\social\Twitter.png";
$rootScope.Image19.Class = "";
$rootScope.Image19.Title = "";
$rootScope.Image19.TooltipText = "";
$rootScope.Image19.TooltipPos = "top";
$rootScope.Image19.PopoverText = "";
$rootScope.Image19.PopoverEvent = "mouseenter";
$rootScope.Image19.PopoverTitle = "";
$rootScope.Image19.PopoverPos = "top";

$rootScope.Image1 = {};
$rootScope.Image1.ABRole = 8001;
$rootScope.Image1.Hidden = "";
$rootScope.Image1.Image = "Images\yourcalendar.png";
$rootScope.Image1.Class = "";
$rootScope.Image1.Title = "";
$rootScope.Image1.TooltipText = "";
$rootScope.Image1.TooltipPos = "top";
$rootScope.Image1.PopoverText = "";
$rootScope.Image1.PopoverEvent = "mouseenter";
$rootScope.Image1.PopoverTitle = "";
$rootScope.Image1.PopoverPos = "top";

$rootScope.Image3 = {};
$rootScope.Image3.ABRole = 8001;
$rootScope.Image3.Hidden = "";
$rootScope.Image3.Image = "Images\yourcalendar.png";
$rootScope.Image3.Class = "";
$rootScope.Image3.Title = "";
$rootScope.Image3.TooltipText = "";
$rootScope.Image3.TooltipPos = "top";
$rootScope.Image3.PopoverText = "";
$rootScope.Image3.PopoverEvent = "mouseenter";
$rootScope.Image3.PopoverTitle = "";
$rootScope.Image3.PopoverPos = "top";

$rootScope.Image5 = {};
$rootScope.Image5.ABRole = 8001;
$rootScope.Image5.Hidden = "";
$rootScope.Image5.Image = "Images\yourcalendar.png";
$rootScope.Image5.Class = "";
$rootScope.Image5.Title = "";
$rootScope.Image5.TooltipText = "";
$rootScope.Image5.TooltipPos = "top";
$rootScope.Image5.PopoverText = "";
$rootScope.Image5.PopoverEvent = "mouseenter";
$rootScope.Image5.PopoverTitle = "";
$rootScope.Image5.PopoverPos = "top";

$rootScope.Image7 = {};
$rootScope.Image7.ABRole = 8001;
$rootScope.Image7.Hidden = "";
$rootScope.Image7.Image = "Images\yourcalendar.png";
$rootScope.Image7.Class = "";
$rootScope.Image7.Title = "";
$rootScope.Image7.TooltipText = "";
$rootScope.Image7.TooltipPos = "top";
$rootScope.Image7.PopoverText = "";
$rootScope.Image7.PopoverEvent = "mouseenter";
$rootScope.Image7.PopoverTitle = "";
$rootScope.Image7.PopoverPos = "top";

$rootScope.Image9 = {};
$rootScope.Image9.ABRole = 8001;
$rootScope.Image9.Hidden = "";
$rootScope.Image9.Image = "Images\yourcalendar.png";
$rootScope.Image9.Class = "";
$rootScope.Image9.Title = "";
$rootScope.Image9.TooltipText = "";
$rootScope.Image9.TooltipPos = "top";
$rootScope.Image9.PopoverText = "";
$rootScope.Image9.PopoverEvent = "mouseenter";
$rootScope.Image9.PopoverTitle = "";
$rootScope.Image9.PopoverPos = "top";

$rootScope.Image10 = {};
$rootScope.Image10.ABRole = 8001;
$rootScope.Image10.Hidden = "";
$rootScope.Image10.Image = "Images\yourcalendar.png";
$rootScope.Image10.Class = "";
$rootScope.Image10.Title = "";
$rootScope.Image10.TooltipText = "";
$rootScope.Image10.TooltipPos = "top";
$rootScope.Image10.PopoverText = "";
$rootScope.Image10.PopoverEvent = "mouseenter";
$rootScope.Image10.PopoverTitle = "";
$rootScope.Image10.PopoverPos = "top";

$rootScope.FAQiFrame = {};
$rootScope.FAQiFrame.ABRole = 4001;
$rootScope.FAQiFrame.Hidden = "";
$rootScope.FAQiFrame.Url = "app/files/FAQ/index.html";
$rootScope.FAQiFrame.Class = "ios-iframe-wrapper ";

$rootScope.Button8 = {};
$rootScope.Button8.ABRole = 2001;
$rootScope.Button8.Hidden = "";
$rootScope.Button8.Title = "";
$rootScope.Button8.TabIndex = -1;
$rootScope.Button8.TooltipText = "";
$rootScope.Button8.TooltipPos = "top";
$rootScope.Button8.PopoverText = "";
$rootScope.Button8.PopoverTitle = "";
$rootScope.Button8.PopoverEvent = "mouseenter";
$rootScope.Button8.PopoverPos = "top";
$rootScope.Button8.Badge = "";
$rootScope.Button8.Icon = "";
$rootScope.Button8.Text = "Home";
$rootScope.Button8.Class = "btn btn-primary btn-md ";
$rootScope.Button8.Disabled = "";

$rootScope.Button7 = {};
$rootScope.Button7.ABRole = 2001;
$rootScope.Button7.Hidden = "";
$rootScope.Button7.Title = "";
$rootScope.Button7.TabIndex = -1;
$rootScope.Button7.TooltipText = "";
$rootScope.Button7.TooltipPos = "top";
$rootScope.Button7.PopoverText = "";
$rootScope.Button7.PopoverTitle = "";
$rootScope.Button7.PopoverEvent = "mouseenter";
$rootScope.Button7.PopoverPos = "top";
$rootScope.Button7.Badge = "";
$rootScope.Button7.Icon = "";
$rootScope.Button7.Text = "Back";
$rootScope.Button7.Class = "btn btn-primary btn-md ";
$rootScope.Button7.Disabled = "";

$rootScope.Button9 = {};
$rootScope.Button9.ABRole = 2001;
$rootScope.Button9.Hidden = "";
$rootScope.Button9.Title = "";
$rootScope.Button9.TabIndex = -1;
$rootScope.Button9.TooltipText = "";
$rootScope.Button9.TooltipPos = "top";
$rootScope.Button9.PopoverText = "";
$rootScope.Button9.PopoverTitle = "";
$rootScope.Button9.PopoverEvent = "mouseenter";
$rootScope.Button9.PopoverPos = "top";
$rootScope.Button9.Badge = "";
$rootScope.Button9.Icon = "";
$rootScope.Button9.Text = "Forward";
$rootScope.Button9.Class = "btn btn-primary btn-md ";
$rootScope.Button9.Disabled = "";

$rootScope.WVCSiteiFrame = {};
$rootScope.WVCSiteiFrame.ABRole = 4001;
$rootScope.WVCSiteiFrame.Hidden = "";
$rootScope.WVCSiteiFrame.Url = "https://www.iecc.edu/page.php?page=WVCH";
$rootScope.WVCSiteiFrame.Class = "ios-iframe-wrapper ";

$rootScope.Button5 = {};
$rootScope.Button5.ABRole = 2001;
$rootScope.Button5.Hidden = "";
$rootScope.Button5.Title = "";
$rootScope.Button5.TabIndex = -1;
$rootScope.Button5.TooltipText = "";
$rootScope.Button5.TooltipPos = "top";
$rootScope.Button5.PopoverText = "";
$rootScope.Button5.PopoverTitle = "";
$rootScope.Button5.PopoverEvent = "mouseenter";
$rootScope.Button5.PopoverPos = "top";
$rootScope.Button5.Badge = "";
$rootScope.Button5.Icon = "";
$rootScope.Button5.Text = "Home";
$rootScope.Button5.Class = "btn btn-primary btn-md ";
$rootScope.Button5.Disabled = "";

$rootScope.Button4 = {};
$rootScope.Button4.ABRole = 2001;
$rootScope.Button4.Hidden = "";
$rootScope.Button4.Title = "";
$rootScope.Button4.TabIndex = -1;
$rootScope.Button4.TooltipText = "";
$rootScope.Button4.TooltipPos = "top";
$rootScope.Button4.PopoverText = "";
$rootScope.Button4.PopoverTitle = "";
$rootScope.Button4.PopoverEvent = "mouseenter";
$rootScope.Button4.PopoverPos = "top";
$rootScope.Button4.Badge = "";
$rootScope.Button4.Icon = "";
$rootScope.Button4.Text = "Back";
$rootScope.Button4.Class = "btn btn-primary btn-md ";
$rootScope.Button4.Disabled = "";

$rootScope.Button6 = {};
$rootScope.Button6.ABRole = 2001;
$rootScope.Button6.Hidden = "";
$rootScope.Button6.Title = "";
$rootScope.Button6.TabIndex = -1;
$rootScope.Button6.TooltipText = "";
$rootScope.Button6.TooltipPos = "top";
$rootScope.Button6.PopoverText = "";
$rootScope.Button6.PopoverTitle = "";
$rootScope.Button6.PopoverEvent = "mouseenter";
$rootScope.Button6.PopoverPos = "top";
$rootScope.Button6.Badge = "";
$rootScope.Button6.Icon = "";
$rootScope.Button6.Text = "Forward";
$rootScope.Button6.Class = "btn btn-primary btn-md ";
$rootScope.Button6.Disabled = "";

$rootScope.HtmlContent1 = {};
$rootScope.HtmlContent1.ABRole = 6001;
$rootScope.HtmlContent1.Hidden = "";
$rootScope.HtmlContent1.Class = "ios-inertial-scroll ";
$rootScope.HtmlContent1.Title = "";
$rootScope.HtmlContent1.TooltipText = "";
$rootScope.HtmlContent1.TooltipPos = "top";
$rootScope.HtmlContent1.PopoverText = "";
$rootScope.HtmlContent1.PopoverEvent = "mouseenter";
$rootScope.HtmlContent1.PopoverTitle = "";
$rootScope.HtmlContent1.PopoverPos = "top";
    };

    return {
      init : function () {
        setControlVars();
      }
    };
  }
]);

window.App.Plugins = {};

window.App.Module.service
(
  'AppPluginsService',

  ['$rootScope',

  function ($rootScope) {

    var setupPlugins = function () {
      Object.keys(window.App.Plugins).forEach(function (plugin) {
        if (angular.isFunction (window.App.Plugins[plugin])) {
          plugin = window.App.Plugins[plugin].call();
          if (angular.isFunction (plugin.PluginSetupEvent)) {
            plugin.PluginSetupEvent();
          }
          if (angular.isFunction (plugin.PluginDocumentReadyEvent)) {
            angular.element(window.document).ready(
             plugin.PluginDocumentReadyEvent);
          }
          if (angular.isUndefined(window.App.Cordova) &&
           angular.isFunction (plugin.PluginAppReadyEvent)) {
             document.addEventListener('deviceready',
              plugin.PluginAppReadyEvent, false);
          }
        }
      });
    };

    return {
      init : function () {
        setupPlugins();
      }
    };
  }
]);

window.App.Ctrls = angular.module('AppCtrls', []);

window.App.Ctrls.controller
(
  'AppCtrl',

  ['$scope', '$rootScope', '$location', '$uibModal', '$http', '$sce', '$timeout', '$window', '$document', 'blockUI', '$uibPosition',
    'AppEventsService', 'AppGlobalsService', 'AppControlsService', 'AppPluginsService',

  function ($scope, $rootScope, $location, $uibModal, $http, $sce, $timeout, $window, $document, blockUI, $uibPosition,
   AppEventsService, AppGlobalsService, AppControlsService, AppPluginsService) {

    window.App.Scope = $scope;
    window.App.RootScope = $rootScope;

    AppEventsService.init();
    AppGlobalsService.init();
    AppControlsService.init();
    AppPluginsService.init();

    $scope.showView = function (viewName) {
      window.App.Modal.closeAll();
      $rootScope.App.CurrentView = viewName;      
      $rootScope.App.DialogView = '';
      $location.path(viewName);
    };

    $scope.replaceView = function (viewName) {
      window.App.Modal.closeAll();
      $rootScope.App.DialogView = '';
      $rootScope.App.CurrentView = viewName;            
      $location.path(viewName).replace();
    };

    $scope.showModalView = function (viewName, callback) {
      var
        execCallback = null,
        modal = window.App.Modal.insert(viewName);

      $rootScope.App.DialogView = viewName;

      modal.instance = $uibModal.open
      ({
        size: 'lg',
        scope: $scope,
        keyboard: false,
        animation: false,
        backdrop: 'static',
        windowClass: 'dialogView',
        controller: viewName + 'Ctrl',
        templateUrl: 'app/views/' + viewName + '.html'
      });
      execCallback = function (modalResult) {
        window.App.Modal.removeCurrent();
        if (angular.isFunction (callback)) {
          callback(modalResult);
        }
      };
      modal.instance.result.then(
        function (modalResult){execCallback(modalResult);},
        function (modalResult){execCallback(modalResult);}
      );
    };

    $scope.closeModalView = function (modalResult) {
      var
        modal = window.App.Modal.getCurrent();

      $rootScope.App.DialogView = '';

      if (modal !== null) {
        window.App.Modal.getCurrent().close(modalResult);
      }
    };

    $scope.loadVariables = function (text) {

      var
        setVar = function (name, value) {
          var
            newName = '',
            dotPos = name.indexOf('.');

          if (dotPos !== -1) {
            newName = name.split('.');
            if (newName.length === 2) {
              $rootScope[newName[0].trim()][newName[1].trim()] = value;
            } else if (newName.length === 3) {
              // We support up to 3 levels here
              $rootScope[newName[0].trim()][newName[1].trim()][newName[2].trim()] = value;
            }
          } else {
            $rootScope[name] = value;
          }
        };

      var
        varName = '',
        varValue = '',
        isArray = false,
        text = text || '',
        separatorPos = -1;

      angular.forEach(text.split('\n'), function (value, key) {
        separatorPos = value.indexOf('=');
        if ((value.trim() !== '') && (value.substr(0, 1) !== ';') && (separatorPos !== -1)) {
          varName = value.substr(0, separatorPos).trim();
          if (varName !== '') {
            varValue = value.substr(separatorPos + 1, value.length).trim();
            isArray = varValue.substr(0, 1) === '|';
            if (!isArray) {
              setVar(varName, varValue);
            } else {
              setVar(varName, varValue.substr(1, varValue.length).split('|'));
            }
          }
        }
      });
    };

    $scope.alertBox = function (content, type) {
      var
        aType = type || 'info',
        modal = window.App.Modal.insert('builder/views/alertBox.html');

      modal.instance = $uibModal.open
      ({
        size: 'lg',
        scope: $scope,
        keyboard: true,
        animation: false,
        controller: 'AppDialogsCtrl',
        templateUrl: 'builder/views/alertBox.html',
        resolve: {
          properties: function () {
            return {
              Type: aType,
              Content: content
            };
          }
        }
      });
      modal.instance.result.then(null, function () {
        window.App.Modal.removeCurrent();
      });
    };

    $scope.inputBox = function (header, buttons,
     inputVar, defaultVal, type, callback) {
      var
        execCallback = null,
        aType = type || 'info',
        aButtons = buttons || 'Ok|Cancel',
        modal = window.App.Modal.insert('builder/views/inputBox.html');

      $rootScope[inputVar] = defaultVal;

      modal.instance = $uibModal.open
      ({
        size: 'lg',
        scope: $scope,
        keyboard: false,
        animation: false,
        backdrop: 'static',
        controller: 'AppDialogsCtrl',
        templateUrl: 'builder/views/inputBox.html',
        resolve: {
          properties: function () {
            return {
              Type: aType,
              Header: header,
              Buttons: aButtons.split('|'),
              InputVar: $rootScope.inputVar
            };
          }
        }
      });
      execCallback = function (modalResult) {
        window.App.Modal.removeCurrent();
        if (angular.isFunction (callback)) {
          callback(modalResult, $rootScope[inputVar]);
        }
      };
      modal.instance.result.then(
        function (modalResult){execCallback(modalResult);},
        function (modalResult){execCallback(modalResult);}
      );
    };

    $scope.messageBox = function (header,
     content, buttons, type, callback) {
      var
        execCallback = null,
        aType = type || 'info',
        aButtons = buttons || 'Ok',
        modal = window.App.Modal.insert('builder/views/messageBox.html');

      modal.instance = $uibModal.open
      ({
        size: 'lg',
        scope: $scope,
        keyboard: false,
        animation: false,
        backdrop: 'static',
        controller: 'AppDialogsCtrl',
        templateUrl: 'builder/views/messageBox.html',
        resolve: {
          properties: function () {
            return {
              Type: aType,
              Header: header,
              Content: content,
              Buttons: aButtons.split('|')
            };
          }
        }
      });
      execCallback = function (modalResult) {
        window.App.Modal.removeCurrent();
        if (angular.isFunction (callback)) {
          callback(modalResult);
        }
      };
      modal.instance.result.then(
        function (modalResult){execCallback(modalResult);},
        function (modalResult){execCallback(modalResult);}
      );
    };

    $scope.alert = function (title, text) {
      if (window.App.Cordova || !('notification' in navigator)) {
        window.alert(text);
      } else {
        navigator.notification.alert(
         text, null, title, null);
      }
    };

    $scope.confirm = function (title, text, callback) {
      if (window.App.Cordova || !('notification' in navigator)) {
        callback(window.confirm(text));
      } else {
        navigator.notification.confirm
        (
          text,
          function (btnIndex) {
            callback(btnIndex === 1);
          },
          title,
          null
        );
      }
    };

    $scope.prompt = function (title, text, defaultVal, callback) {
      if (window.App.Cordova || !('notification' in navigator)) {
        var
          result = window.prompt(text, defaultVal);
        callback(result !== null, result);
      } else {
        navigator.notification.prompt(
          text,
          function (result) {
            callback(result.buttonIndex === 1, result.input1);
          },
          title,
          null,
          defaultVal
        );
      }
    };

    $scope.beep = function (times) {
      if (window.App.Cordova || !('notification' in navigator)) {
        window.App.Utils.playSound
        (
          'builder/sounds/beep/beep.mp3',
          'builder/sounds/beep/beep.ogg'
        );
      } else {
        navigator.notification.beep(times);
      }
    };

    $scope.vibrate = function (milliseconds) {
      if (window.App.Cordova || !('notification' in navigator)) {
        var
          body = angular.element(document.body);
        body.addClass('animated shake');
        setTimeout(function () {
          body.removeClass('animated shake');
        }, milliseconds);
      } else {
        navigator.vibrate(milliseconds);
      }
    };

    $scope.setLocalOption = function (key, value) {
      window.localStorage.setItem(key, value);
    };

    $scope.getLocalOption = function (key) {
      return window.localStorage.getItem(key) || '';
    };

    $scope.removeLocalOption = function (key) {
      window.localStorage.removeItem(key);
    };

    $scope.clearLocalOptions = function () {
      window.localStorage.clear();
    };

    $scope.log = function (text, lineNum) {
      window.App.Debugger.log(text, lineNum);
    };

    $window.TriggerAppOrientationEvent = function () {
      $rootScope.OnAppOrientation();
      $rootScope.$apply();
    };

    $scope.idleStart = function (seconds) {

      $scope.idleStop();
      $rootScope.App.IdleIsIdling = false;

      if($rootScope.App._IdleSeconds !== seconds) {
        $rootScope.App._IdleSeconds = seconds;
      }

      $document.on('mousemove mousedown mousewheel keydown scroll touchstart touchmove DOMMouseScroll', $scope._resetIdle);

      $rootScope.App.IdleIsRunning = true;

      $rootScope.App._IdleTimer = setTimeout(function () {
        $rootScope.App.IdleIsIdling = true;
        $rootScope.OnAppIdleStart();
        $scope.$apply();
      }, $rootScope.App._IdleSeconds * 1000);
    };

    $scope._resetIdle = function () {
      if($rootScope.App.IdleIsIdling) {
        $rootScope.OnAppIdleEnd();
        $rootScope.App.IdleIsIdling = false;
        $scope.$apply();
      }
      $scope.idleStart($rootScope.App._IdleSeconds);
    };

    $scope.idleStop = function () {
      $document.off('mousemove mousedown mousewheel keydown scroll touchstart touchmove DOMMouseScroll', $scope._resetIdle);
      clearTimeout($rootScope.App._IdleTimer);
      $rootScope.App.IdleIsRunning = false;
    };

    $scope.trustSrc = function (src) {
      return $sce.trustAsResourceUrl(src);
    };

    $scope.openWindow = function (url, showLocation, target) {
      var
        options = 'location=';

      if (showLocation) {
        options += 'yes';
      } else {
        options += 'no';
      }

      if (window.App.Cordova) {
        options += ', width=500, height=500, resizable=yes, scrollbars=yes';
      }

      return window.open(url, target, options);
    };

    $scope.closeWindow = function (winRef) {
      if (angular.isObject(winRef) && angular.isFunction (winRef.close)) {
        winRef.close();
      }
    };    
    
    $scope.fileDownload = function(url, subdir, fileName,
     privatelly, headers, errorCallback, successCallback) {
     
      if (window.App.Cordova) {
        if (angular.isFunction(errorCallback)) { 
          errorCallback('-1'); 
        }
        return;
      }
      
      var
        ft = new FileTransfer(),
        root = privatelly.toString() === 'true' ? cordova.file.dataDirectory :
         (device.platform.toLowerCase() === 'ios') ?
          cordova.file.documentsDirectory : cordova.file.externalRootDirectory;

      window.resolveLocalFileSystemURL(root, function (dir) {
        dir.getDirectory(subdir, { create: true, exclusive: false }, function (downloadDir) {
          downloadDir.getFile(fileName, { create: true, exclusive: false }, function (file) {
            ft.download(url, file.toURL(), function(entry) { 
              if (angular.isFunction(successCallback)) { successCallback(entry.toURL(), entry); } 
            }, 
            function(error) {
              if (angular.isFunction(errorCallback)) { errorCallback(4, error); }               
            }, 
            false, 
            { "headers": angular.isObject(headers) ? headers : {} });
          }, 
          function(error) {
            if (angular.isFunction(errorCallback)) { 
              errorCallback(3, error); 
            }               
          });
        }, 
        function(error) {
          if (angular.isFunction(errorCallback)) { 
            errorCallback(2, error); 
          }               
        });
      }, 
      function(error) {
        if (angular.isFunction(errorCallback)) { 
          errorCallback(1, error); 
        }               
      });
    };        

   
$scope.BackButton = function()
{

window.App.Debugger.log("Start of BackButton app function", "info", -1);
window.onscroll = function() {scrollFunction()};
function scrollFunction() {
{    document.getElementById("myBtn").style.display = "block";
}
}
function goBack() {
window.history.back();
}

window.App.Debugger.log("End of BackButton app function", "info", -2);
};

}]);

window.App.Ctrls.controller
(
  'AppDialogsCtrl',

  ['$scope', 'properties',

  function ($scope, properties) {
    $scope.Properties = properties;
  }
]);

window.App.Ctrls.controller
(
  'AppEventsCtrl',

  ['$scope', '$rootScope', '$location', '$uibModal', '$http', '$sce', '$timeout', '$window', '$document', 'blockUI', '$uibPosition',

  function ($scope, $rootScope, $location, $uibModal, $http, $sce, $timeout, $window, $document, blockUI, $uibPosition) {

    $rootScope.OnAppHide = function () {
      //__APP_HIDE_EVENT
    };
    
    $rootScope.OnAppShow = function () {
      //__APP_SHOW_EVENT
    };    

    $rootScope.OnAppReady = function () {
      
window.App.Debugger.log("Start of App Ready event", "info", -1);

window.App.Debugger.log("SetVar \x22[Music.playing]\x22 \x220\x22 \x22Number\x22", "info", 1);

$rootScope.Music.playing = 0;

window.App.Debugger.log("OrientationLock \x22portrait-primary\x22", "info", 2);

if ((window.App.Cordova === undefined) && (window.screen.orientation !== undefined)) {
  window.screen.orientation.lock("portrait-primary");
}

window.App.Debugger.log("StatusBarIsVisible \x22StatusBarHide\x22", "info", 3);

$rootScope.StatusBarHide = (window.StatusBar !== undefined) && window.StatusBar.isVisible ? "true" : "false";

window.App.Debugger.log("GetOption \x22FirstRunStorage\x22 \x22[FirstRun]\x22", "info", 4);

$rootScope.FirstRun = $scope.getLocalOption("FirstRunStorage");

window.App.Debugger.log("If \x22[FirstRun]\x22 \x22!=\x22 \x22false\x22", "info", 5);

if ($rootScope.FirstRun !=  "false" ) {

window.App.Debugger.log("SetVar \x22[FirstRun]\x22 \x22false\x22 \x22String\x22", "info", 6);

$rootScope.FirstRun = "false";

window.App.Debugger.log("SetOption \x22FirstRunStorage\x22 \x22[FirstRun]\x22 \x22String\x22", "info", 7);

$scope.setLocalOption("FirstRunStorage", $rootScope.FirstRun);

window.App.Debugger.log("SetVar \x22[FirstRun]\x22 \x22true\x22 \x22String\x22", "info", 8);

$rootScope.FirstRun = "true";

window.App.Debugger.log("SetVar \x22[Variable1]\x22 \x22false\x22 \x22String\x22", "info", 9);

$rootScope.Variable1 = "false";

window.App.Debugger.log("SetOption \x22Variable1Storage\x22 \x22[Variable1]\x22 \x22String\x22", "info", 10);

$scope.setLocalOption("Variable1Storage", $rootScope.Variable1);

window.App.Debugger.log("EndIf", "info", 11);

}

window.App.Debugger.log("If \x22[FirstRun]\x22 \x22==\x22 \x22false\x22", "info", 12);

if ($rootScope.FirstRun ==  "false" ) {

window.App.Debugger.log("GetOption \x22Variable1Storage\x22 \x22[Variable1]\x22", "info", 13);

$rootScope.Variable1 = $scope.getLocalOption("Variable1Storage");

window.App.Debugger.log("EndIf", "info", 14);

}

window.App.Debugger.log("UserAgent \x22[UserAgent]\x22", "info", 15);

var ua = new UAParser(); $rootScope.UserAgent = ua.getResult();

window.App.Debugger.log("IfEx \x22([UserAgent.os.name] == \x22iOS\x22) && ([UserAgent.os.version] < 10)\x22", "info", 16);

if(($rootScope.UserAgent.os.name == "iOS") && ($rootScope.UserAgent.os.version < 10)) {

window.App.Debugger.log("BlockApp", "info", 17);

blockUI.reset(); blockUI.start();

window.App.Debugger.log("BlockedText \x22iOS [UserAgent.os.version] is not supported. Please update to a newer version of iOS.\x22", "info", 18);

blockUI.message("iOS "+$rootScope.UserAgent.os.version+" is not supported. Please update to a newer version of iOS.");

window.App.Debugger.log("EndIf", "info", 19);

}

window.App.Debugger.log("End of App Ready event", "info", -2);

    };

    $rootScope.OnAppPause = function () {
      //__APP_PAUSE_EVENT
    };

    $rootScope.OnAppKeyUp = function () {
      //__APP_KEY_UP_EVENT
    };

    $rootScope.OnAppKeyDown = function () {
      //__APP_KEY_DOWN_EVENT
    };

    $rootScope.OnAppMouseUp = function () {
      //__APP_MOUSE_UP_EVENT
    };

    $rootScope.OnAppMouseDown = function () {
      //__APP_MOUSE_DOWN_EVENT
    };

    $rootScope.OnAppError = function () {
      //__APP_ERROR_EVENT
    };

    $rootScope.OnAppResize = function () {
      //__APP_RESIZE_EVENT
    };

    $rootScope.OnAppResume = function () {
      //__APP_RESUME_EVENT
    };

    $rootScope.OnAppOnline = function () {
      //__APP_ONLINE_EVENT
    };

    $rootScope.OnAppOffline = function () {
      //__APP_OFFLINE_EVENT
    };

    $rootScope.OnAppIdleEnd = function () {
      //__APP_IDLE_END_EVENT
    };

    $rootScope.OnAppIdleStart = function () {
      //__APP_IDLE_START_EVENT
    };

    $rootScope.OnAppBackButton = function () {
      //__APP_BACK_BUTTON_EVENT
    };

    $rootScope.OnAppMenuButton = function () {
      //__APP_MENU_BUTTON_EVENT
    };

    $rootScope.OnAppViewChange = function () {
      //__APP_VIEW_CHANGE_EVENT
    };

    $rootScope.OnAppOrientation = function () {
      //__APP_ORIENTATION_EVENT
    };

    $rootScope.OnAppVolumeUpButton = function () {
      //__APP_VOLUME_UP_EVENT
    };

    $rootScope.OnAppVolumeDownButton = function () {
      //__APP_VOLUME_DOWN_EVENT
    };
    
    $rootScope.OnAppWebExtensionMsg = function () {
      //__APP_WEBEXTENSION_MSG_EVENT
    };    
  }
]);

angular.element(window.document).ready(function () {
  angular.bootstrap(window.document, ['AppModule']);
});

window.App.Ctrls.controller("MainCtrl", ["$scope", "$rootScope", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "blockUI",

function($scope, $rootScope, $sce, $timeout, $interval, $http, $position, blockUI) {

$rootScope.Main = {};
$rootScope.Main.ABView = true;

window.App.Main = {};
window.App.Main.Scope = $scope;
$rootScope.App.CurrentView = "Main";

angular.element(window.document).ready(function(event){
angular.element(document.querySelector("body")).addClass($rootScope.App.Theme.toLowerCase());
});

angular.element(window.document).ready(function(event){
$rootScope.Main.Event = event;

window.App.Debugger.log("Start of Main Show event", "info", -1);

window.App.Debugger.log("StartJS", "info", 1);


n =  new Date();
y = n.getFullYear();
m = n.getMonth() + 1;
d = n.getDate();
document.getElementById("date").innerHTML = d;

window.App.Debugger.log("End of Main Show event", "info", -2);

$rootScope.$apply();
});

$scope.Image8Click = function($event) {
$rootScope.Image8.Event = $event;

window.App.Debugger.log("Start of Image8 Click event", "info", -1);

window.App.Debugger.log("ShowDialog \x22DialogCalendar\x22", "info", 1);

$scope.showModalView("DialogCalendar");

window.App.Debugger.log("End of Image8 Click event", "info", -2);

};

$scope.Image4Click = function($event) {
$rootScope.Image4.Event = $event;

window.App.Debugger.log("Start of Image4 Click event", "info", -1);

window.App.Debugger.log("OpenWindow \x22https://www.iecc.edu/e4/\x22 \x22\x22 \x22_system\x22 \x22\x22", "info", 1);

$scope.openWindow("https://www.iecc.edu/e4/", "", "_system");

window.App.Debugger.log("End of Image4 Click event", "info", -2);

};

$scope.FAQImageClick = function($event) {
$rootScope.FAQImage.Event = $event;

window.App.Debugger.log("Start of FAQImage Click event", "info", -1);

window.App.Debugger.log("OpenWindow \x22app/files/FAQ/index.html\x22 \x22\x22 \x22_self\x22 \x22\x22", "info", 1);

$scope.openWindow("app/files/FAQ/index.html", "", "_self");

window.App.Debugger.log("End of FAQImage Click event", "info", -2);

};

$scope.MapClick = function($event) {
$rootScope.Map.Event = $event;

window.App.Debugger.log("Start of Map Click event", "info", -1);

window.App.Debugger.log("ReplaceView \x22CampusMap\x22", "info", 1);

$scope.replaceView("CampusMap");

window.App.Debugger.log("End of Map Click event", "info", -2);

};

$scope.Image14Click = function($event) {
$rootScope.Image14.Event = $event;

window.App.Debugger.log("Start of Image14 Click event", "info", -1);

window.App.Debugger.log("SetVar \x22[iFrameInfoViewer.Url]\x22 \x22app/files/SocialMedia/index.html\x22 \x22String\x22", "info", 1);

$rootScope.iFrameInfoViewer.Url = "app/files/SocialMedia/index.html";

window.App.Debugger.log("ReplaceView \x22InfoViewer\x22", "info", 2);

$scope.replaceView("InfoViewer");

window.App.Debugger.log("End of Image14 Click event", "info", -2);

};

$scope.Image13Click = function($event) {
$rootScope.Image13.Event = $event;

window.App.Debugger.log("Start of Image13 Click event", "info", -1);

window.App.Debugger.log("OpenWindow \x22https://docs.google.com/forms/d/e/1FAIpQLSdahG3-rJTnijYd_7OGyX8r-fu7yH4Hg3JruvV7sqbbILLpRw/viewform?usp=sf_link\x22 \x22\x22 \x22_system\x22 \x22\x22", "info", 1);

$scope.openWindow("https://docs.google.com/forms/d/e/1FAIpQLSdahG3-rJTnijYd_7OGyX8r-fu7yH4Hg3JruvV7sqbbILLpRw/viewform?usp=sf_link", "", "_system");

window.App.Debugger.log("End of Image13 Click event", "info", -2);

};

$scope.Image15Click = function($event) {
$rootScope.Image15.Event = $event;

window.App.Debugger.log("Start of Image15 Click event", "info", -1);

window.App.Debugger.log("If \x22[Music.playing]\x22 \x22==\x22 \x220\x22", "info", 1);

if ($rootScope.Music.playing == 0) {

window.App.Debugger.log("SetVar \x22[Music.playing]\x22 \x221\x22 \x22Number\x22", "info", 2);

$rootScope.Music.playing = 1;

window.App.Debugger.log("MediaPlay \x22Music\x22", "info", 3);

setTimeout(function(){$rootScope.Music.API.play();},1);

window.App.Debugger.log("Show \x22MusicCover\x22", "info", 4);

$rootScope.MusicCover.Hidden = "";

window.App.Debugger.log("Alert \x22\x22 \x22This is meant to play a live stream of the music on 89.1 The Bash but it isn\x27t fully functional yet. (The displayed album art my be wrong)\x22", "info", 5);

$scope.alert("", "This is meant to play a live stream of the music on 89.1 The Bash but it isn\x27t fully functional yet. (The displayed album art my be wrong)");

window.App.Debugger.log("Else", "info", 6);

} else {

window.App.Debugger.log("SetVar \x22[Music.playing]\x22 \x220\x22 \x22Number\x22", "info", 7);

$rootScope.Music.playing = 0;

window.App.Debugger.log("MediaStop \x22Music\x22", "info", 8);

$rootScope.Music.API.stop();

window.App.Debugger.log("Hide \x22MusicCover\x22", "info", 9);

$rootScope.MusicCover.Hidden = "true";

window.App.Debugger.log("EndIf", "info", 10);

}

window.App.Debugger.log("End of Image15 Click event", "info", -2);

};

$rootScope.Music.onCanPlay = function() {

};

$rootScope.Music.onReady = function(API) {
$rootScope.Music.API = API;

};

$rootScope.Music.onError = function() {
};

$rootScope.Music.onComplete = function() {
};

$rootScope.Music.onUpdate = function() {
};

$scope.Image6Click = function($event) {
$rootScope.Image6.Event = $event;

window.App.Debugger.log("Start of Image6 Click event", "info", -1);

window.App.Debugger.log("FileDownload \x22http://myweb.iecc.edu/wvjc/content/ALBUM.JPG\x22 \x22\x22 \x22hi.jpg\x22 \x22\x22 \x22\x22 \x22\x22 \x22\x22", "info", 1);

$scope.fileDownload("http://myweb.iecc.edu/wvjc/content/ALBUM.JPG", "", "hi.jpg", "", "", (("".length > 0) && angular.isFunction($scope[""])) ? $scope[""] : null, (("".length > 0) && angular.isFunction($scope[""])) ? $scope[""] : null);

window.App.Debugger.log("End of Image6 Click event", "info", -2);

};

$scope.Image12Click = function($event) {
$rootScope.Image12.Event = $event;

window.App.Debugger.log("Start of Image12 Click event", "info", -1);

window.App.Debugger.log("ShowDialog \x22DialogWVC\x22", "info", 1);

$scope.showModalView("DialogWVC");

window.App.Debugger.log("End of Image12 Click event", "info", -2);

};

$scope.Image2Click = function($event) {
$rootScope.Image2.Event = $event;

};

$scope.HtmlContent2Click = function($event) {
$rootScope.HtmlContent2.Event = $event;

window.App.Debugger.log("Start of HtmlContent2 Click event", "info", -1);

window.App.Debugger.log("OpenWindow \x22app/files/CalendarList/index.html\x22 \x22\x22 \x22_self\x22 \x22\x22", "info", 1);

$scope.openWindow("app/files/CalendarList/index.html", "", "_self");

window.App.Debugger.log("End of HtmlContent2 Click event", "info", -2);

};

$scope.MusicCoverClick = function($event) {
$rootScope.MusicCover.Event = $event;

window.App.Debugger.log("Start of MusicCover Click event", "info", -1);

window.App.Debugger.log("If \x22[Music.playing]\x22 \x22==\x22 \x220\x22", "info", 1);

if ($rootScope.Music.playing == 0) {

window.App.Debugger.log("SetVar \x22[Music.playing]\x22 \x221\x22 \x22Number\x22", "info", 2);

$rootScope.Music.playing = 1;

window.App.Debugger.log("MediaPlay \x22Music\x22", "info", 3);

setTimeout(function(){$rootScope.Music.API.play();},1);

window.App.Debugger.log("Show \x22MusicCover\x22", "info", 4);

$rootScope.MusicCover.Hidden = "";

window.App.Debugger.log("Else", "info", 5);

} else {

window.App.Debugger.log("SetVar \x22[Music.playing]\x22 \x220\x22 \x22Number\x22", "info", 6);

$rootScope.Music.playing = 0;

window.App.Debugger.log("MediaStop \x22Music\x22", "info", 7);

$rootScope.Music.API.stop();

window.App.Debugger.log("Hide \x22MusicCover\x22", "info", 8);

$rootScope.MusicCover.Hidden = "true";

window.App.Debugger.log("EndIf", "info", 9);

}

window.App.Debugger.log("End of MusicCover Click event", "info", -2);

};

$scope.Button2Click = function($event) {
$rootScope.Button2.Event = $event;

};

}]);

window.App.Ctrls.controller("InfoViewerCtrl", ["$scope", "$rootScope", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "blockUI",

function($scope, $rootScope, $sce, $timeout, $interval, $http, $position, blockUI) {

$rootScope.InfoViewer = {};
$rootScope.InfoViewer.ABView = true;

window.App.InfoViewer = {};
window.App.InfoViewer.Scope = $scope;

$scope.BackButtonzClick = function($event) {
$rootScope.BackButtonz.Event = $event;

window.App.Debugger.log("Start of BackButtonz Click event", "info", -1);

window.App.Debugger.log("ReplaceView \x22Main\x22", "info", 1);

$scope.replaceView("Main");

window.App.Debugger.log("End of BackButtonz Click event", "info", -2);

};

}]);

window.App.Ctrls.controller("DialogCalendarCtrl", ["$scope", "$rootScope", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "blockUI",

function($scope, $rootScope, $sce, $timeout, $interval, $http, $position, blockUI) {

$rootScope.DialogCalendar = {};
$rootScope.DialogCalendar.ABView = true;

window.App.DialogCalendar = {};
window.App.DialogCalendar.Scope = $scope;

$rootScope.Menu2.ItemClick = function(index) {
  $rootScope.Menu2.ItemIndex = index;

window.App.Debugger.log("Start of Menu2 ItemClick event", "info", -1);

window.App.Debugger.log("If \x22[Menu2.ItemIndex]\x22 \x22==\x22 \x220\x22", "info", 1);

if (""+$rootScope.Menu2.ItemIndex+"" == 0) {

window.App.Debugger.log("SetVar \x22[iFrameInfoViewer.Url]\x22 \x22app/files/ListCalendars/Athletics/index.html\x22 \x22String\x22", "info", 2);

$rootScope.iFrameInfoViewer.Url = "app/files/ListCalendars/Athletics/index.html";

window.App.Debugger.log("ElseIf \x22[Menu2.ItemIndex]\x22 \x22==\x22 \x221\x22", "info", 3);

} else if (""+$rootScope.Menu2.ItemIndex+"" == 1) {

window.App.Debugger.log("SetVar \x22[iFrameInfoViewer.Url]\x22 \x22app/files/ListCalendars/Events/index.html\x22 \x22String\x22", "info", 4);

$rootScope.iFrameInfoViewer.Url = "app/files/ListCalendars/Events/index.html";

window.App.Debugger.log("ElseIf \x22[Menu2.ItemIndex]\x22 \x22==\x22 \x222\x22", "info", 5);

} else if (""+$rootScope.Menu2.ItemIndex+"" == 2) {

window.App.Debugger.log("SetVar \x22[iFrameInfoViewer.Url]\x22 \x22app/files/ListCalendars/ImDates/index.html\x22 \x22String\x22", "info", 6);

$rootScope.iFrameInfoViewer.Url = "app/files/ListCalendars/ImDates/index.html";

window.App.Debugger.log("ElseIf \x22[Menu2.ItemIndex]\x22 \x22==\x22 \x223\x22", "info", 7);

} else if (""+$rootScope.Menu2.ItemIndex+"" == 3) {

window.App.Debugger.log("SetVar \x22[iFrameInfoViewer.Url]\x22 \x22app/files/ListCalendars/LSC/index.html\x22 \x22String\x22", "info", 8);

$rootScope.iFrameInfoViewer.Url = "app/files/ListCalendars/LSC/index.html";

window.App.Debugger.log("ElseIf \x22[Menu2.ItemIndex]\x22 \x22==\x22 \x224\x22", "info", 9);

} else if (""+$rootScope.Menu2.ItemIndex+"" == 4) {

window.App.Debugger.log("SetVar \x22[iFrameInfoViewer.Url]\x22 \x22app/files/ListCalendars/Trio/index.html\x22 \x22String\x22", "info", 10);

$rootScope.iFrameInfoViewer.Url = "app/files/ListCalendars/Trio/index.html";

window.App.Debugger.log("ElseIf \x22[Menu2.ItemIndex]\x22 \x22==\x22 \x225\x22", "info", 11);

} else if (""+$rootScope.Menu2.ItemIndex+"" == 5) {

window.App.Debugger.log("Alert \x22(Inactive)\x22 \x22When this feature is active you will be able to report any errors or issues you have with a specific calendar directly with that calendar\x27s maintainer\x22", "info", 12);

$scope.alert("(Inactive)", "When this feature is active you will be able to report any errors or issues you have with a specific calendar directly with that calendar\x27s maintainer");

window.App.Debugger.log("Exit", "info", 13);

return null;

window.App.Debugger.log("EndIf", "info", 14);

}

window.App.Debugger.log("ReplaceView \x22InfoViewer\x22", "info", 15);

$scope.replaceView("InfoViewer");

window.App.Debugger.log("End of Menu2 ItemClick event", "info", -2);

};

$scope.Button1Click = function($event) {
$rootScope.Button1.Event = $event;

window.App.Debugger.log("Start of Button1 Click event", "info", -1);

window.App.Debugger.log("ReplaceView \x22Main\x22", "info", 1);

$scope.replaceView("Main");

window.App.Debugger.log("End of Button1 Click event", "info", -2);

};

}]);

window.App.Ctrls.controller("DialogWVCCtrl", ["$scope", "$rootScope", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "blockUI",

function($scope, $rootScope, $sce, $timeout, $interval, $http, $position, blockUI) {

$rootScope.DialogWVC = {};
$rootScope.DialogWVC.ABView = true;

window.App.DialogWVC = {};
window.App.DialogWVC.Scope = $scope;

$rootScope.MenuDialogWVC.ItemClick = function(index) {
  $rootScope.MenuDialogWVC.ItemIndex = index;

window.App.Debugger.log("Start of MenuDialogWVC ItemClick event", "info", -1);

window.App.Debugger.log("If \x22[MenuDialogWVC.ItemIndex]\x22 \x22==\x22 \x220\x22", "info", 1);

if (""+$rootScope.MenuDialogWVC.ItemIndex+"" == 0) {

window.App.Debugger.log("ShowDialog \x22DialogFAQ\x22", "info", 2);

$scope.showModalView("DialogFAQ");

window.App.Debugger.log("ElseIf \x22[MenuDialogWVC.ItemIndex]\x22 \x22==\x22 \x221\x22", "info", 3);

} else if (""+$rootScope.MenuDialogWVC.ItemIndex+"" == 1) {

window.App.Debugger.log("SetVar \x22[iFrameInfoViewer.Url]\x22 \x22app/files/ContactInfo/index.html\x22 \x22String\x22", "info", 4);

$rootScope.iFrameInfoViewer.Url = "app/files/ContactInfo/index.html";

window.App.Debugger.log("ReplaceView \x22InfoViewer\x22", "info", 5);

$scope.replaceView("InfoViewer");

window.App.Debugger.log("ElseIf \x22[MenuDialogWVC.ItemIndex]\x22 \x22==\x22 \x223\x22", "info", 6);

} else if (""+$rootScope.MenuDialogWVC.ItemIndex+"" == 3) {

window.App.Debugger.log("OpenWindow \x22https://www.iecc.edu/page.php?page=WVCH_PRGM&acad=list&acadc=wvc\x22 \x22\x22 \x22_system\x22 \x22\x22", "info", 7);

$scope.openWindow("https://www.iecc.edu/page.php?page=WVCH_PRGM&acad=list&acadc=wvc", "", "_system");

window.App.Debugger.log("ElseIf \x22[MenuDialogWVC.ItemIndex]\x22 \x22==\x22 \x224\x22", "info", 8);

} else if (""+$rootScope.MenuDialogWVC.ItemIndex+"" == 4) {

window.App.Debugger.log("OpenWindow \x22https://www.iecc.edu/e4/\x22 \x22\x22 \x22_system\x22 \x22\x22", "info", 9);

$scope.openWindow("https://www.iecc.edu/e4/", "", "_system");

window.App.Debugger.log("ElseIf \x22MenuDialogWVC.ItemIndex]\x22 \x22==\x22 \x225\x22", "info", 10);

} else if ("MenuDialogWVC.ItemIndex]" == 5) {

window.App.Debugger.log("OpenWindow \x22https://docs.google.com/forms/d/e/1FAIpQLSdahG3-rJTnijYd_7OGyX8r-fu7yH4Hg3JruvV7sqbbILLpRw/viewform?usp=sf_link\x22 \x22\x22 \x22_system\x22 \x22\x22", "info", 11);

$scope.openWindow("https://docs.google.com/forms/d/e/1FAIpQLSdahG3-rJTnijYd_7OGyX8r-fu7yH4Hg3JruvV7sqbbILLpRw/viewform?usp=sf_link", "", "_system");

window.App.Debugger.log("EndIf", "info", 12);

}

window.App.Debugger.log("End of MenuDialogWVC ItemClick event", "info", -2);

};

$scope.BackbuttonClick = function($event) {
$rootScope.Backbutton.Event = $event;

window.App.Debugger.log("Start of Backbutton Click event", "info", -1);

window.App.Debugger.log("CloseDialog", "info", 1);

$scope.closeModalView();

window.App.Debugger.log("End of Backbutton Click event", "info", -2);

};

}]);

window.App.Ctrls.controller("DialogFAQCtrl", ["$scope", "$rootScope", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "blockUI",

function($scope, $rootScope, $sce, $timeout, $interval, $http, $position, blockUI) {

$rootScope.DialogFAQ = {};
$rootScope.DialogFAQ.ABView = true;

window.App.DialogFAQ = {};
window.App.DialogFAQ.Scope = $scope;

$rootScope.MenuFAQ.ItemClick = function(index) {
  $rootScope.MenuFAQ.ItemIndex = index;

window.App.Debugger.log("Start of MenuFAQ ItemClick event", "info", -1);

window.App.Debugger.log("If \x22[MenuFAQ.ItemIndex]\x22 \x22==\x22 \x220\x22", "info", 1);

if (""+$rootScope.MenuFAQ.ItemIndex+"" == 0) {

window.App.Debugger.log("SetVar \x22[iFrameInfoViewer.Url]\x22 \x22app/files/FAQ/sections/financialaid/index.html\x22 \x22String\x22", "info", 2);

$rootScope.iFrameInfoViewer.Url = "app/files/FAQ/sections/financialaid/index.html";

window.App.Debugger.log("ElseIf \x22[MenuFAQ.ItemIndex]\x22 \x22==\x22 \x221\x22", "info", 3);

} else if (""+$rootScope.MenuFAQ.ItemIndex+"" == 1) {

window.App.Debugger.log("SetVar \x22[iFrameInfoViewer.Url]\x22 \x22app/files/FAQ/sections/books/index.html\x22 \x22String\x22", "info", 4);

$rootScope.iFrameInfoViewer.Url = "app/files/FAQ/sections/books/index.html";

window.App.Debugger.log("ElseIf \x22[MenuFAQ.ItemIndex]\x22 \x22==\x22 \x222\x22", "info", 5);

} else if (""+$rootScope.MenuFAQ.ItemIndex+"" == 2) {

window.App.Debugger.log("SetVar \x22[iFrameInfoViewer.Url]\x22 \x22app/files/FAQ/sections/courses/index.html\x22 \x22String\x22", "info", 6);

$rootScope.iFrameInfoViewer.Url = "app/files/FAQ/sections/courses/index.html";

window.App.Debugger.log("ElseIf \x22[MenuFAQ.ItemIndex]\x22 \x22==\x22 \x223\x22", "info", 7);

} else if (""+$rootScope.MenuFAQ.ItemIndex+"" == 3) {

window.App.Debugger.log("SetVar \x22[iFrameInfoViewer.Url]\x22 \x22app/files/FAQ/sections/otherstuff/index.html\x22 \x22String\x22", "info", 8);

$rootScope.iFrameInfoViewer.Url = "app/files/FAQ/sections/otherstuff/index.html";

window.App.Debugger.log("EndIf", "info", 9);

}

window.App.Debugger.log("ReplaceView \x22InfoViewer\x22", "info", 10);

$scope.replaceView("InfoViewer");

window.App.Debugger.log("End of MenuFAQ ItemClick event", "info", -2);

};

$scope.Button10Click = function($event) {
$rootScope.Button10.Event = $event;

window.App.Debugger.log("Start of Button10 Click event", "info", -1);

window.App.Debugger.log("CloseDialog", "info", 1);

$scope.closeModalView();

window.App.Debugger.log("End of Button10 Click event", "info", -2);

};

}]);

window.App.Ctrls.controller("SettingsCtrl", ["$scope", "$rootScope", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "blockUI",

function($scope, $rootScope, $sce, $timeout, $interval, $http, $position, blockUI) {

$rootScope.Settings = {};
$rootScope.Settings.ABView = true;

window.App.Settings = {};
window.App.Settings.Scope = $scope;

angular.element(window.document).ready(function(event){
$rootScope.Settings.Event = event;

window.App.Debugger.log("Start of Settings Show event", "info", -1);

window.App.Debugger.log("If \x22[Variable1]\x22 \x22==\x22 \x22false\x22", "info", 1);

if ($rootScope.Variable1 ==  "false" ) {

window.App.Debugger.log("SetAttribute \x22Variable1Switch\x22 \x22src\x22 \x22app/files/images/vectors/offswitch.svg\x22", "info", 2);

document.getElementById("Variable1Switch").setAttribute("src", "app/files/images/vectors/offswitch.svg");

window.App.Debugger.log("Exit", "info", 3);

return null;

window.App.Debugger.log("EndIf", "info", 4);

}

window.App.Debugger.log("If \x22[Variable1]\x22 \x22==\x22 \x22true\x22", "info", 5);

if ($rootScope.Variable1 ==  "true" ) {

window.App.Debugger.log("SetAttribute \x22Variable1Switch\x22 \x22src\x22 \x22app/files/images/vectors/onswitch.svg\x22", "info", 6);

document.getElementById("Variable1Switch").setAttribute("src", "app/files/images/vectors/onswitch.svg");

window.App.Debugger.log("EndIf", "info", 7);

}

window.App.Debugger.log("WatcherStart \x22Watcher2\x22", "info", 8);

if (!angular.isUndefined($rootScope.Watcher2.WatchStop)) { $rootScope.Watcher2.WatchStop(); } $rootScope.Watcher2.WatchStart();

window.App.Debugger.log("WatcherVariable \x22Watcher2\x22 \x22[Variable1]\x22", "info", 9);

if (!angular.isUndefined($rootScope.Watcher2.WatchStop)) { $rootScope.Watcher2.WatchStop(); } $rootScope.Watcher2.Variable = "Variable1"; $rootScope.Watcher2.WatchStart();

window.App.Debugger.log("End of Settings Show event", "info", -2);

$rootScope.$apply();
});

$scope.Variable1SwitchClick = function($event) {
$rootScope.Variable1Switch.Event = $event;

window.App.Debugger.log("Start of Variable1Switch Click event", "info", -1);

window.App.Debugger.log("If \x22[Variable1]\x22 \x22==\x22 \x22false\x22", "info", 1);

if ($rootScope.Variable1 ==  "false" ) {

window.App.Debugger.log("SetVar \x22[Variable1]\x22 \x22true\x22 \x22String\x22", "info", 2);

$rootScope.Variable1 = "true";

window.App.Debugger.log("SetAttribute \x22Variable1Switch\x22 \x22src\x22 \x22app/files/images/vectors/onswitch.svg\x22", "info", 3);

document.getElementById("Variable1Switch").setAttribute("src", "app/files/images/vectors/onswitch.svg");

window.App.Debugger.log("Exit", "info", 4);

return null;

window.App.Debugger.log("EndIf", "info", 5);

}

window.App.Debugger.log("If \x22[Variable1]\x22 \x22==\x22 \x22true\x22", "info", 6);

if ($rootScope.Variable1 ==  "true" ) {

window.App.Debugger.log("SetVar \x22[Variable1]\x22 \x22false\x22 \x22String\x22", "info", 7);

$rootScope.Variable1 = "false";

window.App.Debugger.log("SetAttribute \x22Variable1Switch\x22 \x22src\x22 \x22app/files/images/vectors/offswitch.svg\x22", "info", 8);

document.getElementById("Variable1Switch").setAttribute("src", "app/files/images/vectors/offswitch.svg");

window.App.Debugger.log("EndIf", "info", 9);

}

window.App.Debugger.log("End of Variable1Switch Click event", "info", -2);

};

$scope.ResetAllClick = function($event) {
$rootScope.ResetAll.Event = $event;

window.App.Debugger.log("Start of ResetAll Click event", "info", -1);

window.App.Debugger.log("ClearOptions", "info", 1);

$scope.clearLocalOptions();

window.App.Debugger.log("BlockApp", "info", 2);

blockUI.reset(); blockUI.start();

window.App.Debugger.log("Alert \x22Close\x22 \x22App Reset. Please Close and reopen the app.\x22", "info", 3);

$scope.alert("Close", "App Reset. Please Close and reopen the app.");

window.App.Debugger.log("End of ResetAll Click event", "info", -2);

};

$scope.Button13Click = function($event) {
$rootScope.Button13.Event = $event;

window.App.Debugger.log("Start of Button13 Click event", "info", -1);

window.App.Debugger.log("If \x22[Variable1]\x22 \x22==\x22 \x22false\x22", "info", 1);

if ($rootScope.Variable1 ==  "false" ) {

window.App.Debugger.log("SetVar \x22[Variable1]\x22 \x22true\x22 \x22String\x22", "info", 2);

$rootScope.Variable1 = "true";

window.App.Debugger.log("Exit", "info", 3);

return null;

window.App.Debugger.log("EndIf", "info", 4);

}

window.App.Debugger.log("If \x22[Variable1]\x22 \x22==\x22 \x22true\x22", "info", 5);

if ($rootScope.Variable1 ==  "true" ) {

window.App.Debugger.log("SetVar \x22[Variable1]\x22 \x22false\x22 \x22String\x22", "info", 6);

$rootScope.Variable1 = "false";

window.App.Debugger.log("EndIf", "info", 7);

}

window.App.Debugger.log("End of Button13 Click event", "info", -2);

};

$rootScope.Watcher2.WatchStart = function(){

$rootScope.Watcher2.WatchStop = $rootScope.$watch($rootScope.Watcher2.Variable, function(newValue, oldValue){
  $rootScope.Watcher2.NewValue = newValue;
  $rootScope.Watcher2.OldValue = oldValue;

window.App.Debugger.log("Start of Watcher2 Change event", "info", -1);

window.App.Debugger.log("If \x22[Variable1]\x22 \x22==\x22 \x22false\x22", "info", 1);

if ($rootScope.Variable1 ==  "false" ) {

window.App.Debugger.log("SetAttribute \x22Variable1Switch\x22 \x22src\x22 \x22app/files/images/vectors/offswitch.svg\x22", "info", 2);

document.getElementById("Variable1Switch").setAttribute("src", "app/files/images/vectors/offswitch.svg");

window.App.Debugger.log("Exit", "info", 3);

return null;

window.App.Debugger.log("EndIf", "info", 4);

}

window.App.Debugger.log("If \x22[Variable1]\x22 \x22==\x22 \x22true\x22", "info", 5);

if ($rootScope.Variable1 ==  "true" ) {

window.App.Debugger.log("SetAttribute \x22Variable1Switch\x22 \x22src\x22 \x22app/files/images/vectors/onswitch.svg\x22", "info", 6);

document.getElementById("Variable1Switch").setAttribute("src", "app/files/images/vectors/onswitch.svg");

window.App.Debugger.log("EndIf", "info", 7);

}

window.App.Debugger.log("End of Watcher2 Change event", "info", -2);
  });};

}]);

window.App.Ctrls.controller("CampusMapCtrl", ["$scope", "$rootScope", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "blockUI",

function($scope, $rootScope, $sce, $timeout, $interval, $http, $position, blockUI) {

$rootScope.CampusMap = {};
$rootScope.CampusMap.ABView = true;

window.App.CampusMap = {};
window.App.CampusMap.Scope = $scope;

angular.element(window.document).ready(function(event){
$rootScope.CampusMap.Event = event;

window.App.Debugger.log("Start of CampusMap Show event", "info", -1);

window.App.Debugger.log("OrientationLock \x22portrait-primary\x22", "info", 1);

if ((window.App.Cordova === undefined) && (window.screen.orientation !== undefined)) {
  window.screen.orientation.lock("portrait-primary");
}

window.App.Debugger.log("End of CampusMap Show event", "info", -2);

$rootScope.$apply();
});

$scope.MainPinClick = function($event) {
$rootScope.MainPin.Event = $event;

window.App.Debugger.log("Start of MainPin Click event", "info", -1);

window.App.Debugger.log("OpenWindow \x22https://www.youtube.com/watch?v=J43D27kabgM\x22 \x22\x22 \x22_system\x22 \x22\x22", "info", 1);

$scope.openWindow("https://www.youtube.com/watch?v=J43D27kabgM", "", "_system");

window.App.Debugger.log("End of MainPin Click event", "info", -2);

};

$scope.FieldPinClick = function($event) {
$rootScope.FieldPin.Event = $event;

window.App.Debugger.log("Start of FieldPin Click event", "info", -1);

window.App.Debugger.log("OpenWindow \x22https://www.youtube.com/watch?v=8eUd4Ktf0Jo\x22 \x22\x22 \x22_system\x22 \x22\x22", "info", 1);

$scope.openWindow("https://www.youtube.com/watch?v=8eUd4Ktf0Jo", "", "_system");

window.App.Debugger.log("End of FieldPin Click event", "info", -2);

};

$scope.PoolPinClick = function($event) {
$rootScope.PoolPin.Event = $event;

window.App.Debugger.log("Start of PoolPin Click event", "info", -1);

window.App.Debugger.log("OpenWindow \x22https://www.youtube.com/watch?v=xN3q6LOovuc\x22 \x22\x22 \x22_system\x22 \x22\x22", "info", 1);

$scope.openWindow("https://www.youtube.com/watch?v=xN3q6LOovuc", "", "_system");

window.App.Debugger.log("End of PoolPin Click event", "info", -2);

};

$scope.SciencePinClick = function($event) {
$rootScope.SciencePin.Event = $event;

window.App.Debugger.log("Start of SciencePin Click event", "info", -1);

window.App.Debugger.log("OpenWindow \x22https://youtu.be/QHZJVDzFRks\x22 \x22\x22 \x22_system\x22 \x22\x22", "info", 1);

$scope.openWindow("https://youtu.be/QHZJVDzFRks", "", "_system");

window.App.Debugger.log("End of SciencePin Click event", "info", -2);

};

$scope.CafePinClick = function($event) {
$rootScope.CafePin.Event = $event;

window.App.Debugger.log("Start of CafePin Click event", "info", -1);

window.App.Debugger.log("OpenWindow \x22https://www.youtube.com/watch?v=zv30oNZoUIw\x22 \x22\x22 \x22_system\x22 \x22\x22", "info", 1);

$scope.openWindow("https://www.youtube.com/watch?v=zv30oNZoUIw", "", "_system");

window.App.Debugger.log("End of CafePin Click event", "info", -2);

};

$scope.BackArrowClick = function($event) {
$rootScope.BackArrow.Event = $event;

window.App.Debugger.log("Start of BackArrow Click event", "info", -1);

window.App.Debugger.log("ReplaceView \x22Main\x22", "info", 1);

$scope.replaceView("Main");

window.App.Debugger.log("End of BackArrow Click event", "info", -2);

};

$scope.MapToggleClick = function($event) {
$rootScope.MapToggle.Event = $event;

window.App.Debugger.log("Start of MapToggle Click event", "info", -1);

window.App.Debugger.log("OpenWindow \x22app/files/Images/MapinJPG.jpg\x22 \x22\x22 \x22_system\x22 \x22\x22", "info", 1);

$scope.openWindow("app/files/Images/MapinJPG.jpg", "", "_system");

window.App.Debugger.log("End of MapToggle Click event", "info", -2);

};

}]);

window.App.Ctrls.controller("CampusMapZoomableCtrl", ["$scope", "$rootScope", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "blockUI",

function($scope, $rootScope, $sce, $timeout, $interval, $http, $position, blockUI) {

$rootScope.CampusMapZoomable = {};
$rootScope.CampusMapZoomable.ABView = true;

window.App.CampusMapZoomable = {};
window.App.CampusMapZoomable.Scope = $scope;

}]);

window.App.Ctrls.controller("FeedbackPageCtrl", ["$scope", "$rootScope", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "blockUI",

function($scope, $rootScope, $sce, $timeout, $interval, $http, $position, blockUI) {

$rootScope.FeedbackPage = {};
$rootScope.FeedbackPage.ABView = true;

window.App.FeedbackPage = {};
window.App.FeedbackPage.Scope = $scope;

$scope.HomeClick = function($event) {
$rootScope.Home.Event = $event;

window.App.Debugger.log("Start of Home Click event", "info", -1);

window.App.Debugger.log("ShowView \x22Main\x22", "info", 1);

$scope.showView("Main");

window.App.Debugger.log("End of Home Click event", "info", -2);

};

}]);

window.App.Ctrls.controller("SocialMediaCtrl", ["$scope", "$rootScope", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "blockUI",

function($scope, $rootScope, $sce, $timeout, $interval, $http, $position, blockUI) {

$rootScope.SocialMedia = {};
$rootScope.SocialMedia.ABView = true;

window.App.SocialMedia = {};
window.App.SocialMedia.Scope = $scope;

$scope.Image17Click = function($event) {
$rootScope.Image17.Event = $event;

};

$scope.Image18Click = function($event) {
$rootScope.Image18.Event = $event;

};

$scope.Image19Click = function($event) {
$rootScope.Image19.Event = $event;

};

}]);

window.App.Ctrls.controller("CalendarCtrl", ["$scope", "$rootScope", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "blockUI",

function($scope, $rootScope, $sce, $timeout, $interval, $http, $position, blockUI) {

$rootScope.Calendar = {};
$rootScope.Calendar.ABView = true;

window.App.Calendar = {};
window.App.Calendar.Scope = $scope;

$scope.Image1Click = function($event) {
$rootScope.Image1.Event = $event;

window.App.Debugger.log("Start of Image1 Click event", "info", -1);

window.App.Debugger.log("OpenWindow \x22app/files/Calendars/index.html\x22 \x22\x22 \x22_system\x22 \x22\x22", "info", 1);

$scope.openWindow("app/files/Calendars/index.html", "", "_system");

window.App.Debugger.log("End of Image1 Click event", "info", -2);

};

$scope.Image3Click = function($event) {
$rootScope.Image3.Event = $event;

window.App.Debugger.log("Start of Image3 Click event", "info", -1);

window.App.Debugger.log("ReplaceView \x22Calendar\x22", "info", 1);

$scope.replaceView("Calendar");

window.App.Debugger.log("End of Image3 Click event", "info", -2);

};

$scope.Image5Click = function($event) {
$rootScope.Image5.Event = $event;

window.App.Debugger.log("Start of Image5 Click event", "info", -1);

window.App.Debugger.log("ReplaceView \x22Calendar\x22", "info", 1);

$scope.replaceView("Calendar");

window.App.Debugger.log("End of Image5 Click event", "info", -2);

};

$scope.Image7Click = function($event) {
$rootScope.Image7.Event = $event;

window.App.Debugger.log("Start of Image7 Click event", "info", -1);

window.App.Debugger.log("ReplaceView \x22Calendar\x22", "info", 1);

$scope.replaceView("Calendar");

window.App.Debugger.log("End of Image7 Click event", "info", -2);

};

$scope.Image9Click = function($event) {
$rootScope.Image9.Event = $event;

window.App.Debugger.log("Start of Image9 Click event", "info", -1);

window.App.Debugger.log("ReplaceView \x22Calendar\x22", "info", 1);

$scope.replaceView("Calendar");

window.App.Debugger.log("End of Image9 Click event", "info", -2);

};

$scope.Image10Click = function($event) {
$rootScope.Image10.Event = $event;

window.App.Debugger.log("Start of Image10 Click event", "info", -1);

window.App.Debugger.log("ReplaceView \x22Calendar\x22", "info", 1);

$scope.replaceView("Calendar");

window.App.Debugger.log("End of Image10 Click event", "info", -2);

};

}]);

window.App.Ctrls.controller("FAQViewCtrl", ["$scope", "$rootScope", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "blockUI",

function($scope, $rootScope, $sce, $timeout, $interval, $http, $position, blockUI) {

$rootScope.FAQView = {};
$rootScope.FAQView.ABView = true;

window.App.FAQView = {};
window.App.FAQView.Scope = $scope;

$scope.Button8Click = function($event) {
$rootScope.Button8.Event = $event;

window.App.Debugger.log("Start of Button8 Click event", "info", -1);

window.App.Debugger.log("ShowView \x22Main\x22", "info", 1);

$scope.showView("Main");

window.App.Debugger.log("End of Button8 Click event", "info", -2);

};

$scope.Button7Click = function($event) {
$rootScope.Button7.Event = $event;

window.App.Debugger.log("Start of Button7 Click event", "info", -1);

window.App.Debugger.log("HistoryBack", "info", 1);

window.history.back();

window.App.Debugger.log("End of Button7 Click event", "info", -2);

};

$scope.Button9Click = function($event) {
$rootScope.Button9.Event = $event;

window.App.Debugger.log("Start of Button9 Click event", "info", -1);

window.App.Debugger.log("HistoryForward", "info", 1);

window.history.forward();

window.App.Debugger.log("End of Button9 Click event", "info", -2);

};

}]);

window.App.Ctrls.controller("WVCSiteViewCtrl", ["$scope", "$rootScope", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "blockUI",

function($scope, $rootScope, $sce, $timeout, $interval, $http, $position, blockUI) {

$rootScope.WVCSiteView = {};
$rootScope.WVCSiteView.ABView = true;

window.App.WVCSiteView = {};
window.App.WVCSiteView.Scope = $scope;

$scope.Button5Click = function($event) {
$rootScope.Button5.Event = $event;

window.App.Debugger.log("Start of Button5 Click event", "info", -1);

window.App.Debugger.log("ShowView \x22Main\x22", "info", 1);

$scope.showView("Main");

window.App.Debugger.log("End of Button5 Click event", "info", -2);

};

$scope.Button4Click = function($event) {
$rootScope.Button4.Event = $event;

window.App.Debugger.log("Start of Button4 Click event", "info", -1);

window.App.Debugger.log("HistoryBack", "info", 1);

window.history.back();

window.App.Debugger.log("End of Button4 Click event", "info", -2);

};

$scope.Button6Click = function($event) {
$rootScope.Button6.Event = $event;

window.App.Debugger.log("Start of Button6 Click event", "info", -1);

window.App.Debugger.log("HistoryForward", "info", 1);

window.history.forward();

window.App.Debugger.log("End of Button6 Click event", "info", -2);

};

}]);

window.App.Ctrls.controller("FeedbackCtrl", ["$scope", "$rootScope", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "blockUI",

function($scope, $rootScope, $sce, $timeout, $interval, $http, $position, blockUI) {

$rootScope.Feedback = {};
$rootScope.Feedback.ABView = true;

window.App.Feedback = {};
window.App.Feedback.Scope = $scope;

}]);
