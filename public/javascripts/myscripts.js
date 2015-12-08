var app = angular.module('app', ['ui.router']);

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
        
        $stateProvider
            .state('home', {
                url: '/',
            })
        
            .state('stocks', {
                url: '/stocks',
                templateUrl: '/stocks.html',
                controller: 'DataCtrl',
                resolve: {
                    postPromise: ['stocks', function (stocks) {
                        return stocks.listStock();
                    }]
                }
            })
        
        $urlRouterProvider.otherwise('home');
    }
]);

app.factory('stocks', ['$http', function($http) {
    var o = {
        stocks: []
    };
    
    o.getStock = function(stockName) {
        $.getJSON('https://www.quandl.com/api/v3/datasets/WIKI/'+stockName+'.json?api_key=PKtdZ-7LH8AuwUhHdozR&start_date=2015-01-01')
            .success(function(data) {
            $http.put('/getStock/' + stockName, data).success(function(data) {
                if(data.name) {
                    o.stocks.push(data);
                }
                window.location.href = "#/stocks";
            });
        })
    }
    
    o.listStock = function() {
        return $http.get('/listStock/').success(function(data) {
            angular.copy(data, o.stocks);
        })
    }
    
    o.delete = function(name) {
        return $http.delete('/delete/' + name)
    }
    
    return o;
}])

app.controller('MainCtrl', [
    '$scope',
    '$state',
    'stocks',
    function($scope, $state, stocks) {
        
        $scope.searchStock = function() {
            $.getJSON("https://www.quandl.com/api/v3/datasets.json?database_code=WIKI&query=" + $scope.stockInput + "&api_key=PKtdZ-7LH8AuwUhHdozR")
                .success(function(data) {
                    if(data.datasets.length > 0) {
                        $scope.result = data.datasets[0].dataset_code;
                        stocks.getStock($scope.result);
                        $scope.$apply();
                        window.location.href = "#/results";
                        $scope.stockInput = '';
                        $scope.result = '';
                    } else {
                        $scope.error = 'No stocks found called "' + $scope.stockInput + '"';
                        $scope.$apply();
                    }
                });
        }
}]);

app.controller('DataCtrl', [
    '$scope',
    '$state',
    'stocks',
    function($scope, $state, stocks) {
        //$scope.$apply();
        $scope.stocks = stocks.stocks;
        
        $scope.deleteStock = function(name) {
            stocks.delete(name);
            $state.go($state.current, {}, {reload: true});
        }
        
        var chartData = [];
        
        for(var i = 0; i < stocks.stocks.length; i++) {
            var stockData = {
                type: "spline", //change type to bar, line, area, pie, etc
                name: stocks.stocks[i].name,
                showInLegend: true,        
                dataPoints: []
                    }
            for(var j = stocks.stocks[i].data.length - 1; j >= 0; j--) {
                var theDate = stocks.stocks[i].data[j].date.split('-');
                stockData.dataPoints.push({
                    x: new Date(parseInt(theDate[0]), parseInt(theDate[1]), parseInt(theDate[2])),
                    y: stocks.stocks[i].data[j].open
                })
            }
            chartData.push(stockData);
        }
        
        var chart = new CanvasJS.Chart("chartContainer",
                                       {
            animationEnabled: true,
            data: chartData,
            legend: {
                cursor: "pointer",
                itemclick: function (e) {
                    if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                        e.dataSeries.visible = false;
                    } else {
                        e.dataSeries.visible = true;
                    }
                    chart.render();
                }
            }
        });
        
        chart.render();
    }
])