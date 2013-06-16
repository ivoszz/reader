'use strict';

angular.module('readerApp')
  .controller('MainCtrl', function ($scope, $http, $timeout, $filter) {

    function storyInCollection(story) {
      for (var i = 0; i < $scope.stories.length; i++) {
        if ($scope.stories[i].id === story.id) {
          return true;
        }
      }
      return false;
    }

    function addStories(stories) {
      var changed = false;
      angular.forEach(stories, function(story, key) {
        if (!storyInCollection(story)) {
          $scope.stories.push(story);
          changed = true;
        }
      });
      if (changed) {
        $scope.stories = $filter('orderBy')($scope.stories, 'date');
      }
    }

    // refreshInterval in seconds
    $scope.refreshInterval = 60;
    $scope.stories = [];

    $scope.feeds = [{
      url: 'http://dailyjs.com/atom.xml'
    }];

    $scope.fetchFeed = function(feed) {
      feed.items = [];

      var apiUrl = 'http://query.yahooapis.com/v1/public/yql?' +
        'q=select%20*%20from%20xml%20where%20url%3D\'' +
        encodeURIComponent(feed.url) +
        '\'%20and%20itemPath%3D\'feed.entry\'' +
        '&format=json&diagnostics=true&callback=JSON_CALLBACK';

      $http.jsonp(apiUrl)
        // function(data, status, headers, config)
        .success(function(data) {
          if (data.query.results) {
            feed.items = data.query.results.entry;
          }
          addStories(feed.items);
        })
        // function(data, status, headers, config)
        .error(function(data) {
          console.error('Error fetching feed:', data);
        });
      $timeout(
        function() { $scope.fetchFeed(feed); },
        $scope.refreshInterval * 1000
      );
    };

    $scope.addFeed = function(feed) {
      var newFeed;
      if (feed.$valid) {
        // Copy feed instance and reset the URL in the form
        newFeed = angular.copy(feed);
        $scope.feeds.push(newFeed);
        $scope.fetchFeed(newFeed);
        $scope.newFeed.url = '';
      }
    };

    $scope.deleteFeed = function(feed) {
      $scope.feeds.splice($scope.feeds.indexOf(feed), 1);
    };

    $scope.fetchFeed($scope.feeds[0]);
  });
