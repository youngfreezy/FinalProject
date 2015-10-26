angular.module('MyApp')
    .controller('MainCtrl', function($scope, Recipes, $alert, $http, $location, RecipeBox) {

        $scope.genres = ['Mexican', 'Italian', 'Chinese', 'Korean',
            'American', 'Comfort Food', 'New American', 'Dessert', 'Fruit', 'Vegetarian',
            'Indian', 'West African', 'Japanese', 'Gluten-Free', 'Quick', 'Pizza', 'Romantic', 'Spicy', 'Bland',
            'Pescatarian', 'Seafood', 'Lobster', 'Pan-Asian', 'Indonesian', 'Vietnamese', 'Hipster', 'Habanero'
        ];

        $scope.dietaryRestrictions = ["Vegan", "Pescatarian", "Peanut Allergy", "Wheat Allergy", "Shellfish", "Kosher", "Gluten-Free", "Dairy Free", "Egg-Free", "Vegan", "Low Carbs", "Low Sugar"];

        $scope.userRecipes = [];
        // console.log($scope.userRecipes);

        // postRecipesInStreamWithLikesAndComments: function (recipe) {
        //     return $http.post('/api/stream', recipe).success(function(data) {
        //       o.stream.push(data);
        //     });

        //   },

        // $scope.postRecipetoStream = function() {
        //   //already doing this in the api/add route.
        // },

        $scope.saveDoneRecipe = function(value, recipe) {
            if (value) {
                Recipes.saveDoneRecipe(recipe).then(function() {
                    console.log('saved done user recipes');
                }, function(err) {
                    console.log('error occured', err);
                });
                return;
            }

            Recipes.saveUnDoneRecipe(recipe).then(function() {
                console.log('saved undone user recipes');
            }, function(err) {
                console.log('error occured', err);
            });
        };

        $scope.deleteRecipe = function(recipe) {
            Recipes.deleteRecipe(recipe).then(function() {
                // console.log("This is the response from the delete", response);
                //why this? we are just going to call the function
                //that got the recipes initially, which talks to the backend
                //and gets the current state of the world. since we deleted, it
                //will automatically update it. this sets the $scope.recipes to be what we want.
                //the above $scope.userRecipes
                RecipeBox.recipeCount = $scope.userRecipes.length;
                $scope.getUserRecipes();

                console.log("deleted recipe");
            }, function(err) {
                console.log("error occured when deleting", err);
            });
        };

        $scope.deleteAllUserRecipes = function() {
            Recipes.deleteAllRecipes().then(function(response) {
                // RecipeBox.recipeCount = 0;
                // $scope.userRecipes = null;

                $scope.userRecipes = response.data.recipeBox;
                RecipeBox.recipeCount = response.data.recipeBox.length;

                //console.log('$scope.userRecipes', $scope.userRecipes);
                //console.log('RecipeBox.recipeCount', RecipeBox.recipeCount);
                // console.log(response.data.);
                // console.log($scope.currentUser);

                //  $scope.userRecipes = response;
                // //probably better to store everything in RecipeBox service. 
                // // there could be a reset function.  
                // RecipeBox.recipeCount = $scope.userRecipes.length;
                // // $scope.$apply();
                // // console.
            }, function(err) {
                console.log("error occured when deleting", err);
            });
        };
        // $scope.save = function(checked) {
        //   localStorage.setItem('CONFIG', $scope.CONFIG);
        // };
window.$location = $location;
        $scope.addRecipe = function(recipe) {
            if ($scope.currentUser === undefined) {
                $location.path('/login');
                return;
            }
            Recipes.getIndividualRecipe(recipe.id).then(function(response) {
                // console.log(response);
                Recipes.save(response)
                    .then(function(response) {

                        $scope.getUserRecipes();
                        // if (response.data.recipeBox) {

                        //   $scope.userRecipes = response.data.recipeBox;

                        //   console.log("This is the user recipebox", $scope.userRecipes);
                        //   //ideal case would be recipeBox would live in the service
                        //   RecipeBox.recipeCount = $scope.userRecipes.length;
                        // }
                        // console.log(response);
                        $alert({
                            content: response.data.recipeBox ? 'recipe has been added.' : 'This recipe is already in your recipe box',
                            animation: 'fadeZoomFadeDown',
                            type: 'material',
                            duration: 1
                        });
                    })
                    .catch(function(response) {

                        $alert({

                            // #3: generally, all three items aren't updating in real time

                            content: response.data.message,
                            animation: 'fadeZoomFadeDown',
                            type: 'material',
                            duration: 3
                        });
                    });
                // console.log($rootScope.recipePropsIWant);
                // console.log($scope.individualRecipe);
            });
        };

        $scope.searchRecipes = function() {

            Recipes.getRecipes($scope.query.name).then(function(response) {
                $scope.recipes = response;
                // console.log($scope.recipes);
            });

        };



        $scope.getGenreRecipes = function(genre) {
            Recipes.getRecipesByGenre(genre).then(function(response) {
                $scope.recipes = response;
                // console.log(response);
            });
        };

        $scope.handleEnterKey = function($event) {

            if ($event.keyCode === 13) {
                $scope.searchRecipes();
            }
        };

        $scope.getIndividualRecipe = function(recipeId) {
            Recipes.getIndividualRecipes(recipeId).then(function(response) {
                $scope.individualRecipe = response;
                // $rootScope.recipePropsIWant = response;
                // console.log($rootScope.recipePropsIWant);
                // console.log($scope.individualRecipe);
            });
        };

        $scope.getUserRecipes = function() {
            Recipes.getUserRecipes().then(function(response) {
                $scope.userRecipes = response;
                //probably better to store everything in RecipeBox service. 
                // there could be a reset function.  
                RecipeBox.recipeCount = $scope.userRecipes.length;
                // $scope.$apply();
                // console.log('recipes to display', $scope.userRecipes);
            });
        };

        var randGenre = $scope.genres[Math.floor(Math.random() * $scope.genres.length)];
        var init = function(randGenre) {
            Recipes.getQuickRecipes(randGenre).then(function(response) {

                $scope.quickRecipes = response;
                // console.log('quick recipes',$scope.quickRecipes);
            });

        };

        // for testing: $http.get('/api/add').then(function(response){console.log(response)});
        init(randGenre);
        $scope.getUserRecipes();
    })
    .directive('streamPreview', function() {

        return {
            controller: 'StreamCtrl',
            template: [
                'Name: {{lasthourRecipes.userName}}',
                '<ul>',
                '<li class="animate-repeat" ng-repeat="recipe in lasthourRecipes | orderBy:\'createdAt\':true">',
                '{{recipe.userName}}  Added: {{recipe.name}}',
                '</li>',
                '</ul>'
            ].join('')
        };
    })
    .directive('recipeBoxPreview', function() {
        return {
            template: [
                'Your Recipe Box: ',
                '<ul>',
                '<li class="animate-repeat" ng-repeat="recipe in userRecipes | orderBy:\'createdAt\':true">',
                '{{recipe.name}}',
                '<a href="{{recipe.recipeUrl}}" target="_blank">Recipe Link</a>',
                '</li>',
                '</ul>'
            ].join('')
        };
    });