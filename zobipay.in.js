(function() {
    'use strict';
    var appController = function($scope, $uibModal, $rootScope, $http, API, store, ProgressIndicator, $window, $location, socialLoginService, $state) {
        $scope.animationsEnabled = true;
        $rootScope.isLogin = false;
        $scope.LoginButton = false;
        $scope.LoginToggle = true;
        $scope.RegisterToggle = false;
        $scope.recharge = true;
        var domain;

        function extractDomain(url) {

            if (url.indexOf("://") > -1) {
                domain = url.split('/')[2];
            } else {
                domain = url.split('/')[0];
            }
            domain = domain.split(':')[0];
        };
        extractDomain(window.location.href);

        $scope.isActive = function(viewLocation) {
            return viewLocation === $location.path();
        };

        $scope.admin = "zobipayb2c";
        // $scope.admin = "demoisu";
        $scope.LoginRegistermodal = function() {
            
            var login_registerModalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'loginregister.html',
                controller: 'loginRegisterController',
                backdrop: 'static',
                keyboard: false
            });
            login_registerModalInstance.result.then(function(loginData) {
                $scope.Login(loginData);
            });
        };

        $scope.Login = function(data) {
            ProgressIndicator.startProgress();
            if (data.provider === 'google' || data.provider === 'facebook') {
                var loginObj = JSON.stringify({
                    userAuthToken: data.token,
                    name: data.name,
                    emailId: data.email,
                    authType: data.provider,
                    userSocialId: data.uid,
                    mobileNumber: data.phone,
                    adminUserName: $scope.admin
                });
                $http({
                    url: API + "socialauth.json",
                    method: "POST",
                    skipAuthorization: true,
                    data: loginObj,
                    contentType: "application/json",

                }).then(
                    function(successResponse) {
                        console.log(successResponse);
                        $rootScope.token = successResponse.data.token;
                        store.set('B2Cjwt', $rootScope.token);
                        getUserDetails();
                    },
                    function(errorResponse) {
                        ProgressIndicator.resetProgress();
                        console.log(errorResponse);
                    })
            } else {
                var loginObj = JSON.stringify({
                    username: data.UserId,
                    password: data.PassWord
                });
                $http({
                    url: API + "logintoken.json",
                    method: "POST",
                    skipAuthorization: true,
                    data: loginObj,
                    contentType: "application/json",

                }).then(
                    function(successResponse) {
                        console.log(successResponse);
                        $rootScope.token = successResponse.data.token;
                        store.set('B2Cjwt', $rootScope.token);
                        getUserDetails();
                        // var date = jwtHelper.getTokenExpirationDate($rootScope.token);
                        // console.log(date);
                        // console.log($rootScope.token);
                    },
                    function(errorResponse) {
                        ProgressIndicator.resetProgress();
                        console.log(errorResponse);
                    }
                );
            }
        };

        function getUserDetails() {
            var parameters = {};
            $http({
                url: API + 'user/dashboard.json',
                method: "GET",
                crossDomain: true,
                skipAuthorization: false,
                params: parameters,
                contentType: "application/json;",

            }).then(
                function(successResponse) {
                    $scope.LoginButton = true;
                    $rootScope.isLogin = true;
                    ProgressIndicator.completeProgress();
                    console.log(successResponse);
                    store.set('B2Cuserdata', successResponse.data.userInfo);
                    $rootScope.userName = successResponse.data.userInfo.userName;
                    $scope.WalletBalance();
                },
                function(errorResponse) {
                    $scope.LoginButton = false;
                    $rootScope.isLogin = false;
                    ProgressIndicator.completeProgress();
                    console.log(errorResponse);
                }
            );
        };

        $scope.WalletBalance = function() {
            var parameters = {};
            $http.get(API + 'user/getuserbalance.json', {
                params: parameters
            }).then(function(successresponse) {
                $rootScope.balance = successresponse.data;
            }, function(errorresponse) {
                console.log(errorresponse);
            });
        };
        $scope.WalletBalance();
        $scope.Logout = function() {
            store.remove('B2Cjwt');
            store.remove('B2Cuserdata');
            socialLoginService.logout();
            // var url = window.location.href;
            // $window.localStorage.clear();
            // document.location.href = 'https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=' + 'https://' + domain;
            $state.go('home', {}, { reload: true });
            $window.location.reload(true);
        };
        $scope.LoginStatus = function() {
            var token = store.get('B2Cjwt');
            var userInfo = store.get('B2Cuserdata');
            if (token && userInfo) {
                $scope.LoginButton = true;
                $rootScope.isLogin = true;
                $rootScope.userName = userInfo.userName;
            } else {
                $scope.LoginButton = false;
                $rootScope.isLogin = false;
            }
        };
        $scope.LoginStatus();
        $scope.$on("GoToLogin", function(event, data) {
            $scope.LoginRegistermodal();
        });

        $rootScope.$on('event:social-sign-out-success', function(event, logoutStatus) {
            console.log(logoutStatus);
        });



        // Operator List
        $scope.UtilityOperator_list = ["MTNL DELHI LANDLINE", "BSNL LANDLINE", "RELIANCE ENERGY (Mumbai)", "MSEDC LIMITED",
            "TORRENT POWER", "MAHANGER GAS LIMITED", "Tata AIG Life", "ICICI Pru Life", "BSES Rajdhani", "BSES Yamuna", "North Delhi Power Limited", "Brihan Mumbai Electric Supply", "Rajasthan Vidyut Vitran Nigam Limited", "Southern power Distribution Company Ltd"
        ];

        $scope.DthOperator_list = ["BIGTV DTH", "AIRTEL DTH", "TATASKY DTH", "SUN DIRECT DTH", "VIDEOCON DTH", "DISH TV DTH", "TATASKY B2B DTH"];

        $scope.DataCardOperator_list = ["VODAFONE DATACARD", "AIRTEL DATACARD", "TATA PHOTON PLUS DATACARD", "RELIANCE DATACARD", "RELIANCE BROADBAND DATACARD",
            "MTS DATACARD", "BSNL DATACARD", "MTNL MUMBAI DATACARD", "IDEA DATACARD", "TATAINDICOM DATACARD", "AIRCEL DATACARD"
        ];

        $scope.SpecialOperator_list = ["AIRCEL STV", "AIRTEL STV", "BSNL STV", "IDEA STV", "RELIANCE STV", "TATA DOCOMO  STV", "TELENOR STV", "VODAFONE STV", "T24(Special) STV", "BSNL VALIDITY", "MTNL VALIDITY", "VIRGIN GSM SPECIAL", "VIDEOCON SPECIAL"];

        $scope.PostPaidOperator_list = ["AIRCEL POSTPAID", "BSNL POSTPAID", "IDEA POSTPAID", "RELIANCE POSTPAID", "TATA DOCOMO POSTPAID", "VODAFONE POSTPAID", "AIRTEL POSTPAID", "RELIANCE CDMA POSTPAID", "TATA INDICOM POSTPAID", "LOOP POSTPAID", "BSNL LANDLINE", "AIRTEL BROADBAND (DSL)", "AIRTEL LANDLINE", "IDEA LANDLINE", "MTS POSTPAID"];

        $scope.TopupOperator_list = ["AIRCEL", "AIRTEL", "BSNL", "IDEA", "LOOP", "MTNL DELHI", "MTNL MUMBAI", "MTS", "RELIANCE CDMA",
            "RELIANCE GSM", "TATA DOCOMO", "TELENOR", "VIDEOCON", "VIRGIN CDMA", "VIRGIN GSM", "VODAFONE", "TATAINDICOM", "T24(Flexi)"
        ];

        $scope.CompanyDetails = {
            brandname: 'Zobipay',
            promo1: 'Fast Recharge',
            promo2: 'Excited Offers',
            promo3: 'Double Benefits',
            promo1content: 'The quick and easy solution to all your mobile, pre-paid data card and DTH recharges lies here. Our B2C online portal offers only the very best through the latest software and technology.',
            promo2content: 'Get extra offers for B2C Recharge Software that make possible the recharges of the Mobile, DTH, Data Card and Bill Payment of the Mobile, Data Card, Utility etc. Stay Connected always.',
            promo3content: 'B2C Online Application get access for all operators Recharges and Bill Payment ALONG WITH Admin/User Management, API Management and Wallet Management Functionality',
            address1: '3rd Floor, Capital Tower, Fraser Road, Patna, Bihar - 800001',
            mail: 'help@zobipay.com',
            phoneno1: '09905188889',
            phoneno2: '01724650282',
            phoneno3: '01724650281',
            ContentHeading: 'Smart Payments for Smart People',
            ContentSubHeading: '',
        };



        // $rootScope.$on('$stateChangeStart',
        //     function(event, currentRoute, previousRoute) {
        //         var Current_token = store.get('jwt');
        //         if (!Current_token) {
        //              $state.go(currentRoute.name, {}, { reload: true }, { location: 'replace' });
        //              event.preventDefault()
        //         }
        //         else{
        //              $state.go(currentRoute.name);
        //             // event.preventDefault();
        //         }
        //     });

    };


    // Login Modal Controller
    var loginRegisterController = function($scope, $rootScope, $uibModalInstance, ProgressIndicator, $http, API, $state) {
        $scope.UserLoginModel = {};
        $scope.UserSocialLoginDetails = {};
        $scope.UserLoginModel = {
            UserId: '',
            PassWord: ''
        };
        $scope.FogotpassModel = {};
        $scope.FogotpassModel = {
            Email: ''
        };

        // $scope.SocialLogin = function(login_provider) {
        //     if (login_provider == 'google') {
        //         $uibModalInstance.close(login_provider);
        //     } else if (login_provider == 'facebook') {
        //         $uibModalInstance.close(login_provider);
        //     }
        // };

        $rootScope.$on('event:social-sign-in-success', function(event, userDetails) {
            console.log(userDetails);
            $scope.UserSocialLoginDetails = userDetails;
            if (userDetails.provider === "facebook") {
                FB.getLoginStatus(function(response) {
                    if (response.status === 'connected') {
                        $scope.UserSocialLoginDetails.token = response.authResponse.accessToken;
                        console.log($scope.UserSocialLoginDetails.token);
                        CheckUserExist();

                    }
                });
            } else {
                CheckUserExist();

                // $scope.UserSocialLoginDetails = userDetails;
            }
        });

        $scope.hideSocial_loginButton = false;

        var CheckUserExist = function() {
            // $scope.admin = "demoisu";
            $scope.admin = "zobipayb2c";
            var usernamevalidationobj = JSON.stringify({
                'userName': $scope.UserSocialLoginDetails.email + $scope.admin,

            });
            console.log(usernamevalidationobj);
            $http({
                method: 'POST',
                url: API + 'api/isusernameexist.json',
                contentType: 'application/json',
                data: usernamevalidationobj,
            }).then(
                function(success) {
                    if (success.data.status) {
                        $uibModalInstance.close($scope.UserSocialLoginDetails);
                    } else {
                        $scope.hideSocial_loginButton = true;
                    }

                },
                function(error) {
                    $uibModalInstance.close($scope.UserSocialLoginDetails);
                });
        };

        $scope.NewUser = function() {
            $uibModalInstance.close($scope.UserSocialLoginDetails);
        };

        $scope.login = function() {
            $uibModalInstance.close($scope.UserLoginModel);
        };

        $scope.ForgotPass = function() {
            $uibModalInstance.close($scope.FogotpassModel);
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
            $state.go('home', {}, { reload: true });
        };
    };
    appController.$inject = ['$scope', '$uibModal', '$rootScope', '$http', 'API', 'store', 'ProgressIndicator', '$window', '$location', 'socialLoginService', '$state'];
    loginRegisterController.$inject = ['$scope', '$rootScope', '$uibModalInstance', 'ProgressIndicator', '$http', 'API', '$state'];
    angular.module('App').controller('appController', appController).controller('loginRegisterController', loginRegisterController);
}());
