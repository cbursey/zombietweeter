var zombieApp = angular.module('zombieApp', ['ngResource']);

zombieApp.controller('mainController', ['$scope', '$resource',
    function ($scope, $resource) {

        window.twttr = (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0],
            t = window.twttr || {};
            if (d.getElementById(id)) return t;
            js = d.createElement(s);
            js.id = id;
            js.src = "https://platform.twitter.com/widgets.js";
            fjs.parentNode.insertBefore(js, fjs);

            t._e = [];
            t.ready = function(f) {
                t._e.push(f);
            };
            return t;
        }(document, "script", "twitter-wjs"));

        $scope.selectedTime = "PM";
        $scope.timeOptions = ["AM", "PM"];

        $scope.inputHashtag = "";
        $scope.inputFreq = 10; //tweets per second
        $scope.inputRuntime = 30; // length of episode
        $scope.inputStart = "201712121430"; 
        $scope.inputEnd = "201712121500";
        $scope.embedURL = "";

        var getStartDate = function() {

        }

        $scope.testDates = function(){
            console.log($scope.inputStart);
            console.log($scope.inputEnd);
        }

        var TweetResource = $resource('/fetchTweets', null, {
            query: {method: 'POST', isArray: true, cancellable: true}
        });

        var EmbedResource = $resource('/fetchEmbed:url');

        $scope.embed = function() {
            var embedHTML = EmbedResource.get({url: $scope.embedURL}, function(){
                var interface = document.getElementById("interface");
                var centeredHTML = embedHTML.html.substring(33, embedHTML.html.length - 1);
                centeredHTML = "<blockquote class=\"twitter-tweet tw-align-center\"" + centeredHTML;
                var newTweet = document.createElement("div");
                newTweet.innerHTML += centeredHTML;
               // console.log(centeredHTML);
                interface.appendChild(newTweet);
                twttr.widgets.load(document.getElementById(interface));
            });
        }; 

        $scope.fetchData = function() {
            console.log($scope.selectedTime);
            var startDate = $scope.inputStart; //TODO: format as YYYYMMDDhhmm (UTC)
            var endDate = $scope.inputEnd; //YYYYMMDDhhmm (UTC)
            var num = ($scope.inputRuntime * 60) / $scope.inputRuntime; //number of tweets to fetch

            //TODO: DELETE the following block, only for testing
            $scope.inputHashtag = "dog";
            startDate = "201712121430";
            endDate = "201712121500";
            num = 10;
            //END deleting


            var body = {
                hashtag: $scope.inputHashtag,
                fromDate: startDate,
                toDate: endDate,
                count: num,
            };
            var tweets = TweetResource.save({}, body, function(){
                console.log(tweets);
                $scope.embedID = tweets.results[0].id_str;
                console.log($scope.embedID);
                $scope.embed();

            });
        };
    }
]);