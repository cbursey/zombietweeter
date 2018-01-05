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

        $scope.feedStarted = false;
        $scope.inputHashtag = "";
        $scope.inputDate = new Date();
        var today = new Date();      
        $scope.inputStartTime = new Date(today.getFullYear(), today.getMonth(), 
                                    today.getDate(), today.getHours() - 1, today.getMinutes());
        $scope.inputEndTime = new Date(today.getFullYear(), today.getMonth(), 
                                    today.getDate(), today.getHours(), today.getMinutes()); 
        $scope.errorMessage = "";
        $scope.timerDate = "";
        $scope.timerTime = "";

        var startDate = new Date();
        var endDate = new Date();
        var utcStartString = "";
        var utcEndString = "";
        var tweetQueue = [];

        var processInputs = function() {
            if ($scope.inputHashtag === "") {
                $scope.errorMessage = "Please enter a hashtag to search.";
                return false;
            }
            if (isNaN($scope.inputDate.getTime())) {
                $scope.errorMessage = "Please enter a valid date.";
                return false;
            }
            if (isNaN($scope.inputStartTime.getTime())) {
                $scope.errorMessage = "Please enter a valid start time.";
                return false;
            }
            if (isNaN($scope.inputEndTime.getTime())) {
                $scope.errorMessage = "Please enter a valid end time.";
                return false;
            }
            if ($scope.inputEndTime.getTime() <= $scope.inputStartTime.getTime()) {
                $scope.errorMessage = "Start time must be before end time.";
                return false;
            } 
            //input is correct, now formatting dates.
            startDate = new Date(
                $scope.inputDate.getFullYear(),
                $scope.inputDate.getMonth(),
                $scope.inputDate.getDate(),
                $scope.inputStartTime.getHours(),
                $scope.inputStartTime.getMinutes());
            endDate = new Date(
                $scope.inputDate.getFullYear(),
                $scope.inputDate.getMonth(),
                $scope.inputDate.getDate(),
                $scope.inputEndTime.getHours(),
                $scope.inputEndTime.getMinutes());

            //YYYYMMDDhhmm (UTC), formatted for twitter API

            var utcStartMonth = (startDate.getUTCMonth() + 1).toString();
            var utcEndMonth = (endDate.getUTCMonth() + 1).toString();
            utcStartMonth = utcStartMonth.length === 1 ? ("0" + utcStartMonth) : utcStartMonth;
            utcEndMonth = utcEndMonth.length === 1 ? ("0" + utcEndMonth) : utcEndMonth;

            var utcStartDay = startDate.getUTCDate().toString();
            var utcEndDay = endDate.getUTCDate().toString();
            utcStartDay = utcStartDay.length === 1 ? ("0" + utcStartDay) : utcStartDay;
            utcEndDay = utcEndDay.length === 1 ? ("0" + utcEndDay) : utcEndDay;

            var utcStartHr = startDate.getUTCHours().toString();
            var utcEndHr = endDate.getUTCHours().toString();
            utcStartHr = utcStartHr.length === 1 ? ("0" + utcStartHr) : utcStartHr;
            utcEndHr = utcEndHr.length === 1 ? ("0" + utcEndHr) : utcEndHr;

            var utcStartMin = startDate.getUTCMinutes().toString();
            var utcEndMin = endDate.getUTCMinutes().toString();
            utcStartMin = utcStartMin.length === 1 ? ("0" + utcStartMin) : utcStartMin;
            utcEndMin = utcEndMin.length === 1 ? ("0" + utcEndMin) : utcEndMin;

            utcStartString = startDate.getUTCFullYear().toString() +
                            utcStartMonth + utcStartDay +
                            utcStartHr + utcStartMin;
            utcEndString = endDate.getUTCFullYear().toString() +
                            utcEndMonth + utcEndDay +
                            utcEndHr + utcEndMin;
            $scope.errorMessage = "";
            $scope.inputHashtag = "#" + $scope.inputHashtag;
            return true;
        };

        var tweetTimer = function(){
            console.log('tweetQueue dates:');
            for (var i = 0; i < tweetQueue.length; i++){
                console.log(tweetQueue[i]);
            }
            var embedIndex = tweetQueue.length - 1;
            var displayDate = startDate;
            var month = displayDate.getMonth() + 1;             
            $scope.timerDate = 
                month + "/" + 
                displayDate.getDate() + "/" + 
                displayDate.getFullYear();
            $scope.feedStarted = true;
            var timer = setInterval(function(){
                var meridian = "AM";
                var hours = displayDate.getHours();
                var minutes = displayDate.getMinutes();
                var seconds = displayDate.getSeconds();

                var utcHours = displayDate.getUTCHours();
                var utcMinutes = displayDate.getUTCMinutes();
                var utcSeconds = displayDate.getUTCSeconds();

                minutes = minutes < 10 ? "0" + minutes : minutes;
                seconds = seconds < 10 ? "0" + seconds : seconds;

                utcHours = utcHours < 10 ? "0" + utcHours : utcHours;
                utcMinutes = utcMinutes < 10 ? "0" + utcMinutes : utcMinutes;
                utcSeconds = utcSeconds < 10 ? "0" + utcSeconds : utcSeconds;

                var currUTC = utcHours + ":" + utcMinutes + ":" + utcSeconds;
                if (hours > 12){
                    hours = hours - 12;
                    meridian = "PM";
                }
                $scope.timerTime = 
                    hours + ":" +
                    minutes + ":" +
                    seconds + " " + 
                    meridian;
                $scope.$apply();
                //finds the most popular tweet in a given second
                var secondGroup = [];
                while (embedIndex >= 0 && currUTC === tweetQueue[embedIndex].date){
                    secondGroup.push(tweetQueue[embedIndex]);
                    embedIndex--;
                }
                console.log("embed index:", embedIndex);
                if (secondGroup.length > 0){ embed(secondGroup) };
                displayDate.setSeconds(displayDate.getSeconds() + 1);
                if (embedIndex < 0 || displayDate.getTime() >= endDate.getTime()) { 
                    clearInterval(timer); 
                }
            }, 1000);
        };
        $scope.testDates = function(){
            if (processInputs()){
                console.log('UTC Start:', utcStartString);
                console.log('UTC End:', utcEndString);
                tweetTimer();
            }
        };

        var TweetResource = $resource('/fetchTweets', null, {
            query: {method: 'POST', isArray: true, cancellable: true}
        });

        var EmbedResource = $resource('/fetchEmbed:id');

        //looks for most popular tweet generated in one second, embeds to page.
        var lastTweet = "";
        var embed = function(secondGroup) {
            var mostPopular = secondGroup[0].id;
            var mostFavs = secondGroup[0].favorite_count;
            for (var i = 0; i < secondGroup.length; i++){
                if (secondGroup[i].favorite_count > mostFavs){
                    mostPopular = secondGroup[i].id;
                    mostFavs = secondGroup[i].favorite_count;
                }
            }
            var embedHTML = EmbedResource.get({id: mostPopular}, function(){
                var interface = document.getElementById("interface");
                var centeredHTML = embedHTML.html.substring(33, embedHTML.html.length - 1);
                centeredHTML = "<blockquote class=\"twitter-tweet tw-align-center\"" + centeredHTML;
                var newTweet = document.createElement("div");
                newTweet.innerHTML += centeredHTML;
                if (lastTweet === ""){
                    interface.appendChild(newTweet);
                } else {
                    interface.insertBefore(newTweet, lastTweet);
                }
                lastTweet = newTweet;
                twttr.widgets.load(document.getElementById(interface));
            });
        }; 
        $scope.fetchData = function() {
            if (!processInputs()){ return; }
            var body = {
                hashtag: $scope.inputHashtag,
                fromDate: utcStartString,
                toDate: utcEndString,
            };
            var next = true;
            var tweetObjs = [];
            var request = function(reqBody) {
                var tweets = TweetResource.save({}, reqBody, function(){
                    console.log(tweets);
                    for (var i = 0; i < tweets.results.length; i++){
                        var createdDate = tweets.results[i].created_at.substring(11, 19);
                        var tweetObj = {date: createdDate, 
                                        id: tweets.results[i].id_str,
                                        favs: tweets.results[i].favorite_count};
                        tweetQueue.push(tweetObj);
                    }
                    if (tweets.next){
                        body = {
                            hashtag: $scope.inputHashtag,
                            fromDate: utcStartString,
                            toDate: utcEndString,
                            next: tweets.next
                        };
                        request(body);
                    } else {
                        tweetTimer();
                    }
                }, function(err){
                	tweetTimer();
                    console.error(err);
                });
                return;
            }
            request(body);
        };
    }
]);