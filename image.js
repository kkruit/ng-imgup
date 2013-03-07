/*global console, angular, FileReader, document */
'use strict';
/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

angular.module('pathfinder.directives').
  directive('pfImageUpload', ['$parse', function ($parse) {
    return {
      restrict: 'E',
      require: 'ngModel',
      replace: true,
      template:   '<div class="clearfix">\n' +
              '<div class="view span2">\n' +
              '<img pf-src="dispImg" class="img-rounded" />\n' +
                '<div class="btn-group btn-group-vertical" style="display:none;">\n' +
                  '<button class="btn"><i class="icon-edit"></i></button>\n' +
                '</div>\n' +
              '</div>\n' +
              '<div class="edit" style="display:none;">\n' +
                '<input type="file" />\n' +
              '</div>\n' +
            '</div>',
      link: function (scope, elm, attrs, ngModel) {
        if (ngModel === null) {
          return false;
        }
        var isEmpty = function (value) {
          return (angular.isUndefined(value) || value === '' || value === null);
        },
          file = null,
          children = elm.children(),
          imgData = $parse(attrs.ngModel),
          reader = new FileReader(),
          input = angular.element(children[1].children[0]), // image file input
          edit = angular.element(children[1]), // edit box
          view = angular.element(children[0]), // view box
          img = angular.element(children[0].children[0]), // image in view/preview
          editIcon = angular.element(children[0].children[1].children[0]), // edit icon
          maxWidth = 250,
          maxHeight = 250,
          listener = function (evt) {
            ngModel.$setViewValue(undefined);
            file = evt.target.files[0];
            if (!file.type.match('image.*')) {
              return false;
            }
            reader.readAsDataURL(file);
          },
          doApply = function () {
            scope.$apply(function () {
              imgData.assign(scope, ngModel.$viewValue);
              scope.dispImg = ngModel.$viewValue;
              return scope.dispImg;
            });
          };
        function getImageSize(width, height) {
          var ret = {width: width, height: height};
          if (maxWidth / width < maxHeight / height) {
            if (width > maxWidth) {
              ret.height *= maxWidth / width;
              ret.width = maxWidth;
            } else {
              return false;
            }
          } else {
            if (height > maxHeight) {
              ret.width *= maxHeight / height;
              ret.height = maxHeight;
            } else {
              return false;
            }
          }
          return ret;
        }
        reader.onload = function (e) {
          var img = document.createElement("img");
          img.onload = function () {
            var canvas = document.createElement("canvas"),
              reSize = getImageSize(img.width, img.height),
              ctx;
            if (reSize) {
              canvas.width = reSize.width;
              canvas.height = reSize.height;
              ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, reSize.width, reSize.height);
              scope.dispImg = canvas.toDataURL(file.type);
              ngModel.$setViewValue(scope.dispImg);
            } else {
              scope.dispImg = e.target.result;
              ngModel.$setViewValue(scope.dispImg);
            }
            doApply();
          };
          img.src = e.target.result;
        };
        scope.$watch(attrs.ngModel, function () {ngModel.$render(); });
        editIcon.bind("click", function () {
          ngModel.$setViewValue('');
          input.val('');
          doApply();
        });
        input.bind('change', listener);
        ngModel.$render = function () {
          scope.dispImg = ngModel.$viewValue;
          if (isEmpty(ngModel.$viewValue)) {
            view.children().last().hide();
            edit.show();
          } else {
            edit.hide();
            view.children().last().show();
          }
          return ngModel.$viewValue;
        };
      }
    };
  }])
  .directive('pfSrc', ['$parse', function ($parse) {
    // Runs during compile
    return {
      restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
      link: function ($scope, iElm, iAttrs, controller) {
        var updateSrc = function () {
          var src = $parse(iAttrs.pfSrc)($scope);
          if (!src) {
            src = "data:image/png;base64,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";
          }
          iElm.attr('src', src);
        };
        $scope.$watch(iAttrs.pfSrc, updateSrc);
        updateSrc();
      }
    };
  }]);

